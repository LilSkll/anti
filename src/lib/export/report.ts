import type { AnalysisBundle } from "@/types/analysis";
import { METRIC_DESCRIPTORS, MARKER_CATEGORIES } from "@/lib/metrics";
import { formatDate } from "@/lib/utils";

/** Собрать текстовые секции научного отчёта из бандла анализа */
export function buildReportSections(b: AnalysisBundle): {
  title: string;
  meta: string;
  intro: string;
  metricsRows: [string, string][];
  aiMarkers: string[];
  humanMarkers: string[];
  discourseRows: [string, string][];
  conclusion: string;
} {
  const m = b.metrics;
  const metricsRows: [string, string][] = m
    ? METRIC_DESCRIPTORS.map((d) => [d.label, String(m[d.key])])
    : [];

  const markers = b.markers ?? [];
  const aiMarkers = markers
    .filter(
      (mk) =>
        mk.type === "ai_discourse" ||
        mk.type === "template" ||
        mk.type === "cliche" ||
        mk.type === "neutral"
    )
    .map((mk) => `${mk.text} — ${mk.comment}`);

  const humanMarkers = markers
    .filter((mk) => mk.type === "human_discourse")
    .map((mk) => `${mk.text} — ${mk.comment}`);

  const discourseRows: [string, string][] = b.discourse
    ? [
        ["Коммуникативная цель", b.discourse.communicativeGoal],
        ["Тип дискурса", b.discourse.discourseType],
        ["Речевая стратегия", b.discourse.speechStrategy],
        ["Речевая тактика", b.discourse.speechTactic],
        ["Аудитория", b.discourse.targetAudience],
        ["Модальность", b.discourse.modality],
        ["Регистр", b.discourse.register],
      ]
    : [];

  const verdict = m
    ? m.humanProbability >= m.aiProbability
      ? "Текст с большей вероятностью создан человеком."
      : "Текст с большей вероятностью сгенерирован искусственным интеллектом."
    : "Данные анализа отсутствуют.";

  const intro = `Объект исследования: текст объёмом ${b.sourceText.length} символов.
Дата анализа: ${formatDate(b.createdAt)}.
${m ? `Предварительная оценка авторства: человек — ${m.humanProbability}%, ИИ — ${m.aiProbability}%.` : ""}`;

  const markerUsage = MARKER_CATEGORIES.map(
    (c) =>
      `${c.label}: ${markers.filter((mk) => mk.type === c.type).length}`
  ).join("; ");

  const conclusion = `${verdict}
Выявлено маркеров по категориям — ${markerUsage}.
${
  b.discourse?.notes.length
    ? "Дополнительные наблюдения: " + b.discourse.notes.join(" ")
    : ""
}`;

  return {
    title: b.title,
    meta: `AI Linguistic Discourse Analyzer · ${formatDate(b.createdAt)}`,
    intro,
    metricsRows,
    aiMarkers,
    humanMarkers,
    discourseRows,
    conclusion,
  };
}
