import { getProvider, type ChatMessage } from "@/lib/providers";
import { safeJsonParse, clamp01to100 } from "@/lib/utils";
import { buildMetricsPrompt } from "@/lib/prompts/text";
import { buildMarkersPrompt } from "@/lib/prompts/markers";
import { buildDiscoursePrompt } from "@/lib/prompts/discourse";
import { buildSemioticPrompt } from "@/lib/prompts/semiotic";
import { buildComparisonPrompt } from "@/lib/prompts/comparison";
import { trimForLLM } from "@/lib/textTrim";
import {
  computeStatFeatures,
  computeStatVerdict,
  type StatFeatures,
} from "@/lib/statFeatures";
import type {
  TextMetrics,
  Marker,
  DiscourseResult,
  SemioticResult,
  ComparisonMetrics,
  SemioticNode,
  HybridAuthorship,
} from "@/types/analysis";

export interface AnalysisInfo {
  /** Сообщение об автообрезке (null если не было) */
  trimNotice?: string | null;
}

async function callJson<T>(
  system: string,
  user: string,
  signal?: AbortSignal
): Promise<T> {
  const provider = getProvider();
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
  const raw = await provider.chat(messages, { temperature: 0.2, signal });
  const parsed = safeJsonParse<T>(raw);
  if (parsed.error) {
    const err = new Error(parsed.error);
    (err as Error & { raw?: string }).raw = raw;
    throw err;
  }
  return parsed.data as T;
}

// ---------------------------------------------------------------------------
// Анализ метрик
// ---------------------------------------------------------------------------

function normalizeMetrics(m: Partial<TextMetrics> | undefined): TextMetrics {
  const src = m ?? {};
  return {
    humanProbability: clamp01to100(src.humanProbability),
    aiProbability: clamp01to100(src.aiProbability),
    formality: clamp01to100(src.formality),
    emotionality: clamp01to100(src.emotionality),
    repetitiveness: clamp01to100(src.repetitiveness),
    cohesion: clamp01to100(src.cohesion),
    coherence: clamp01to100(src.coherence),
    terminologyDensity: clamp01to100(src.terminologyDensity),
    argumentationDensity: clamp01to100(src.argumentationDensity),
  };
}

export async function analyzeMetrics(
  text: string,
  signal?: AbortSignal
): Promise<TextMetrics> {
  const trimmed = trimForLLM(text);
  const { system, user } = buildMetricsPrompt(trimmed.text);
  const data = await callJson<Partial<TextMetrics>>(system, user, signal);
  return normalizeMetrics(data);
}

// ---------------------------------------------------------------------------
// Гибридная оценка авторства: LLM-метрики + локальные стат-признаки
// ---------------------------------------------------------------------------

/**
 * Объединяет мнение LLM и объективные статистические признаки текста
 * в единую оценку авторства с доверительным интервалом.
 *
 * Веса: LLM = 0.6, статистика = 0.4.
 * Если стат-признаки ненадёжны (короткий текст), вес LLM возрастает.
 */
export function computeHybridAuthorship(
  text: string,
  llmMetrics: TextMetrics
): HybridAuthorship {
  const features = computeStatFeatures(text);
  const statVerdict = computeStatVerdict(features);

  const llmAi = llmMetrics.aiProbability;
  const statAi = statVerdict.statAiProbability;

  // Адаптивный вес: для короткого текста доверяем статистике меньше
  const statWeight = features.wordCount < 40 ? 0.25 : 0.4;
  const llmWeight = 1 - statWeight;

  const aiProbability = Math.round(llmAi * llmWeight + statAi * statWeight);
  const humanProbability = 100 - aiProbability;

  // Погрешность: тем больше, чем сильнее расходятся LLM и стат-оценка
  const disagreement = Math.abs(llmAi - statAi);
  const baseMargin = statVerdict.confidence === "high" ? 8 : statVerdict.confidence === "medium" ? 14 : 22;
  const margin = Math.min(35, baseMargin + Math.round(disagreement / 3));

  return {
    aiProbability,
    humanProbability,
    llmAiProbability: llmAi,
    statAiProbability: statAi,
    margin,
    confidence: statVerdict.confidence,
    statReasons: statVerdict.reasons,
  };
}

// ---------------------------------------------------------------------------
// Анализ маркеров
// ---------------------------------------------------------------------------

function normalizeMarkers(arr: unknown): Marker[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => ({
      text: String(x.text ?? "").trim(),
      type: (String(x.type ?? "cliche") as Marker["type"]) ?? "cliche",
      label: String(x.label ?? "").trim(),
      comment: String(x.comment ?? "").trim(),
    }))
    .filter((m) => m.text.length > 0)
    .slice(0, 30);
}

export async function analyzeMarkers(
  text: string,
  signal?: AbortSignal
): Promise<Marker[]> {
  const trimmed = trimForLLM(text);
  const { system, user } = buildMarkersPrompt(trimmed.text);
  const data = await callJson<{ markers?: unknown }>(system, user, signal);
  return normalizeMarkers(data?.markers);
}

// ---------------------------------------------------------------------------
// Дискурс-анализ
// ---------------------------------------------------------------------------

function str(value: unknown): string {
  return String(value ?? "").trim();
}

export async function analyzeDiscourse(
  text: string,
  signal?: AbortSignal
): Promise<DiscourseResult> {
  const trimmed = trimForLLM(text);
  const { system, user } = buildDiscoursePrompt(trimmed.text);
  const data = await callJson<Partial<DiscourseResult>>(system, user, signal);
  const notesValue = (data as { notes?: unknown }).notes;
  const notes = Array.isArray(notesValue)
    ? notesValue.map(str).filter(Boolean)
    : typeof notesValue === "string" && notesValue
      ? [str(notesValue)]
      : [];
  return {
    communicativeGoal: str(data.communicativeGoal),
    discourseType: str(data.discourseType),
    speechStrategy: str(data.speechStrategy),
    speechTactic: str(data.speechTactic),
    targetAudience: str(data.targetAudience),
    modality: str(data.modality),
    register: str(data.register),
    notes,
  };
}

// ---------------------------------------------------------------------------
// Семиотический анализ
// ---------------------------------------------------------------------------

function normalizeNodes(arr: unknown): SemioticNode[] {
  if (!Array.isArray(arr)) return [];
  const seen = new Set<string>();
  const out: SemioticNode[] = [];
  for (const raw of arr) {
    if (!raw || typeof raw !== "object") continue;
    const x = raw as Record<string, unknown>;
    const id = str(x.id) || `n${out.length + 1}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const label = str(x.label) || id;
    const typeVal = str(x.type);
    const type = ["concept", "sign", "field", "link"].includes(typeVal)
      ? (typeVal as SemioticNode["type"])
      : "concept";
    const weight = Math.max(1, Math.min(10, Math.round(Number(x.weight) || 5)));
    out.push({ id, label, type, weight });
  }
  return out;
}

export async function analyzeSemiotic(
  text: string,
  signal?: AbortSignal
): Promise<SemioticResult> {
  const trimmed = trimForLLM(text);
  const { system, user } = buildSemioticPrompt(trimmed.text);
  const data = await callJson<Partial<SemioticResult>>(system, user, signal);
  const nodes = normalizeNodes(data?.nodes);
  const ids = new Set(nodes.map((n) => n.id));
  const edges = Array.isArray(data?.edges)
    ? (data!.edges as unknown[])
        .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
        .map((e) => ({
          source: str(e.source),
          target: str(e.target),
          label: str(e.label) || "связано с",
          weight: Math.max(1, Math.min(10, Math.round(Number(e.weight) || 5))),
        }))
        .filter((e) => ids.has(e.source) && ids.has(e.target))
        .slice(0, 40)
    : [];
  return {
    nodes,
    edges,
    summary: str(data?.summary) || "Семиотическая структура построена автоматически.",
  };
}

// ---------------------------------------------------------------------------
// Сравнение текстов
// ---------------------------------------------------------------------------

export async function analyzeComparison(
  textA: string,
  textB: string,
  signal?: AbortSignal
): Promise<ComparisonMetrics> {
  const tA = trimForLLM(textA);
  const tB = trimForLLM(textB);
  const { system, user } = buildComparisonPrompt(tA.text, tB.text);
  const data = await callJson<Partial<ComparisonMetrics>>(system, user, signal);
  return {
    discourseSimilarity: clamp01to100(data?.discourseSimilarity),
    terminologySimilarity: clamp01to100(data?.terminologySimilarity),
    syntaxSimilarity: clamp01to100(data?.syntaxSimilarity),
    strategySimilarity: clamp01to100(data?.strategySimilarity),
    metricsA: normalizeMetrics(data?.metricsA),
    metricsB: normalizeMetrics(data?.metricsB),
    summary: str(data?.summary),
  };
}

// Ре-экспорт для UI
export { computeStatFeatures };
export type { StatFeatures };
