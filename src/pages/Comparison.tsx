import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  GitCompareArrows,
  Play,
  Loader2,
  AlertTriangle,
  Settings as SettingsIcon,
  Scale,
  ArrowLeftRight,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, Button, Badge, EmptyState } from "@/components/ui/Card";
import { ComparisonBar } from "@/components/charts/ComparisonBar";
import { MiniBar } from "@/components/ui/ScoreGauge";
import { analyzeComparison } from "@/lib/analyze";
import { useSettingsStore } from "@/store/settingsStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { deriveTitle } from "@/lib/utils";
import type { ComparisonMetrics } from "@/types/analysis";

type Phase = "idle" | "running" | "done" | "error";

const SIM_FIELDS: Array<{
  key: keyof Pick<
    ComparisonMetrics,
    | "discourseSimilarity"
    | "terminologySimilarity"
    | "syntaxSimilarity"
    | "strategySimilarity"
  >;
  label: string;
  tone: "cyan" | "violet" | "emerald" | "amber";
}> = [
  { key: "discourseSimilarity", label: "Сходство дискурса", tone: "cyan" },
  {
    key: "terminologySimilarity",
    label: "Сходство терминологии",
    tone: "violet",
  },
  { key: "syntaxSimilarity", label: "Сходство синтаксиса", tone: "emerald" },
  {
    key: "strategySimilarity",
    label: "Сходство стратегий",
    tone: "amber",
  },
];

export function Comparison() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonMetrics | null>(null);

  const hasKey = useSettingsStore((s) => Boolean(s.apiKeys[s.provider]));
  const resetCurrent = useAnalysisStore((s) => s.resetCurrent);
  const updateCurrent = useAnalysisStore((s) => s.updateCurrent);
  const commitCurrent = useAnalysisStore((s) => s.commitCurrent);

  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    if (!textA.trim() || !textB.trim()) return;
    if (!hasKey) {
      setError("Не задан API-ключ. Откройте «Настройки API».");
      setPhase("error");
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setPhase("running");
    setError(null);
    setResult(null);

    resetCurrent({
      sourceText: textA,
      secondText: textB,
      title: `Сравнение: ${deriveTitle(textA, 24)} ↔ ${deriveTitle(textB, 24)}`,
    });

    try {
      const r = await analyzeComparison(textA, textB, ctrl.signal);
      setResult(r);
      updateCurrent({ comparison: r });
      commitCurrent();
      setPhase("done");
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError((e as Error).message || "Ошибка сравнения.");
      setPhase("error");
    }
  }

  const running = phase === "running";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle
        title="Сравнение текстов"
        subtitle="Попарное сопоставление дискурса, терминологии, синтаксиса и стратегий"
        icon={<GitCompareArrows className="h-5 w-5" />}
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-cyan" />
              Текст A
            </label>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              placeholder="Первый текст…"
              className="input-base min-h-[120px] resize-y leading-relaxed"
            />
            <div className="mt-1 text-right text-xs text-slate-500">
              {textA.length} симв.
            </div>
          </div>
          <div>
            <label className="label-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-violet" />
              Текст B
            </label>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              placeholder="Второй текст…"
              className="input-base min-h-[120px] resize-y leading-relaxed"
            />
            <div className="mt-1 text-right text-xs text-slate-500">
              {textB.length} симв.
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={run}
            disabled={running || !textA.trim() || !textB.trim()}
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? "Сравнение…" : "Сравнить тексты"}
          </Button>
          {!hasKey && (
            <Link to="/settings" className="btn-ghost">
              <SettingsIcon className="h-4 w-4" />
              Настроить API
            </Link>
          )}
        </div>

        {running && (
          <div className="mt-4 flex items-center gap-2 text-sm text-accent-cyan">
            <Loader2 className="h-4 w-4 animate-spin" />
            Сопоставление текстов…
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-accent-rose/30 bg-accent-rose/10 p-3 text-sm text-accent-rose">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{error}</div>
          </div>
        )}
      </Card>

      {phase === "idle" && (
        <EmptyState
          icon={<GitCompareArrows className="h-6 w-6" />}
          title="Сравнительные графики"
          description="Вставьте два текста, чтобы получить метрики сходства по дискурсу, терминологии, синтаксису и коммуникативным стратегиям."
        />
      )}

      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Similarity cards */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4 text-accent-emerald" />
              <h3 className="text-sm font-semibold text-slate-200">
                Метрики сходства
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SIM_FIELDS.map((f) => (
                <div
                  key={f.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{f.label}</span>
                    <span className="font-mono text-lg font-bold text-slate-100">
                      {result[f.key]}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <MiniBar value={result[f.key]} tone={f.tone} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison bar chart */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-accent-cyan" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Сравнение метрик
                </h3>
              </div>
              <div className="flex gap-2">
                <Badge tone="cyan">Текст A</Badge>
                <Badge tone="violet">Текст B</Badge>
              </div>
            </div>
            <ComparisonBar
              metricsA={result.metricsA}
              metricsB={result.metricsB}
              labelA="Текст A"
              labelB="Текст B"
            />
          </Card>

          {/* Authorship comparison */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-slate-200">
                Текст A — авторство
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-accent-emerald/20 bg-accent-emerald/[0.06] p-3">
                  <div className="text-xs text-slate-400">Человек</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-accent-emerald">
                    {result.metricsA.humanProbability}%
                  </div>
                </div>
                <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.06] p-3">
                  <div className="text-xs text-slate-400">ИИ</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-accent-cyan">
                    {result.metricsA.aiProbability}%
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-slate-200">
                Текст B — авторство
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-accent-emerald/20 bg-accent-emerald/[0.06] p-3">
                  <div className="text-xs text-slate-400">Человек</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-accent-emerald">
                    {result.metricsB.humanProbability}%
                  </div>
                </div>
                <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.06] p-3">
                  <div className="text-xs text-slate-400">ИИ</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-accent-cyan">
                    {result.metricsB.aiProbability}%
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Summary */}
          {result.summary && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-slate-200">
                Резюме сравнения
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                {result.summary}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
