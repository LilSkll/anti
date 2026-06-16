import { useMemo } from "react";
import { Activity, Info, Scale, AlertTriangle } from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { MiniBar } from "@/components/ui/ScoreGauge";
import type { HybridAuthorship } from "@/types/analysis";
import type { StatFeatures } from "@/lib/statFeatures";
import { STAT_FEATURE_META } from "@/lib/statFeatures";
import { cn } from "@/lib/utils";

interface AuthorshipPanelProps {
  authorship: HybridAuthorship;
  features: StatFeatures;
}

const CONFIDENCE_META = {
  low: { label: "низкая", tone: "rose" as const, desc: "результат ненадёжен" },
  medium: { label: "средняя", tone: "amber" as const, desc: "ориентировочно" },
  high: { label: "высокая", tone: "emerald" as const, desc: "достаточно сигналов" },
};

export function AuthorshipPanel({ authorship, features }: AuthorshipPanelProps) {
  const conf = CONFIDENCE_META[authorship.confidence];

  const verdictText = useMemo(() => {
    const a = authorship.aiProbability;
    if (a >= 70) return "Преобладают признаки машинной генерации";
    if (a >= 50) return "Смешанный тип, лёгкий уклон в сторону ИИ";
    if (a >= 30) return "Смешанный тип, лёгкий уклон в сторону человека";
    return "Преобладают признаки естественной речи";
  }, [authorship.aiProbability]);

  return (
    <div className="space-y-4">
      {/* Гибридный вердикт */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-accent-cyan" />
            <h3 className="text-sm font-semibold text-slate-200">
              Гибридная оценка авторства
            </h3>
          </div>
          <Badge tone={conf.tone}>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                conf.tone === "emerald" && "bg-accent-emerald",
                conf.tone === "amber" && "bg-accent-amber",
                conf.tone === "rose" && "bg-accent-rose"
              )}
            />
            уверенность: {conf.label}
          </Badge>
        </div>

        {/* Главная оценка */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400">
                ИИ
              </span>
              <span className="font-mono text-3xl font-bold text-accent-cyan">
                {authorship.aiProbability}%
              </span>
            </div>
            <div className="mt-1 font-mono text-xs text-slate-500">
              ±{authorship.margin}%
            </div>
            <div className="mt-3">
              <MiniBar value={authorship.aiProbability} tone="cyan" />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400">
                Человек
              </span>
              <span className="font-mono text-3xl font-bold text-accent-emerald">
                {authorship.humanProbability}%
              </span>
            </div>
            <div className="mt-1 font-mono text-xs text-slate-500">
              ±{authorship.margin}%
            </div>
            <div className="mt-3">
              <MiniBar value={authorship.humanProbability} tone="emerald" />
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm font-medium text-slate-200">{verdictText}</p>

        {/* Разложение на источники */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/5 bg-white/[0.01] p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Мнение LLM
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-slate-200">
              {authorship.llmAiProbability}%
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.01] p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Статистика
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-slate-200">
              {authorship.statAiProbability}%
            </div>
          </div>
        </div>
      </Card>

      {/* Статистические признаки */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent-violet" />
            <h3 className="text-sm font-semibold text-slate-200">
              Статистические признаки
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {features.wordCount} слов · {features.sentenceCount} предл.
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {STAT_FEATURE_META.map((meta) => {
            const value = features[meta.key] as number;
            const interp = meta.interpretation(value);
            const isAiSignal =
              interp.includes("ИИ") || interp.includes("монотонно");
            const isHumanSignal =
              interp.includes("человек") || interp.includes("рвано");
            return (
              <div
                key={meta.key}
                className="rounded-lg border border-white/5 bg-white/[0.01] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-slate-300">
                      {meta.label}
                    </div>
                    <div className="mt-0.5 text-[10px] leading-tight text-slate-500">
                      {meta.description}
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-slate-100">
                    {value}
                    {meta.unit ?? ""}
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isAiSignal &&
                        "bg-accent-cyan/10 text-accent-cyan",
                      isHumanSignal &&
                        "bg-accent-emerald/10 text-accent-emerald",
                      !isAiSignal &&
                        !isHumanSignal &&
                        "bg-white/5 text-slate-400"
                    )}
                  >
                    {interp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Обоснования статистики */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-accent-sky" />
          <h3 className="text-sm font-semibold text-slate-200">
            Почему такая оценка?
          </h3>
        </div>
        <ul className="space-y-2">
          {authorship.statReasons.map((reason, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm leading-relaxed text-slate-300"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-sky" />
              {reason}
            </li>
          ))}
        </ul>
      </Card>

      {/* Дисклеймер */}
      <div className="flex items-start gap-2.5 rounded-xl border border-accent-amber/20 bg-accent-amber/[0.04] p-3.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber" />
        <p className="text-xs leading-relaxed text-slate-400">
          <strong className="text-accent-amber">Оговорка о достоверности.</strong>{" "}
          Автоматическое определение авторства ИИ не является доказательством.
          Оценка носит вероятностный характер и объединяет эвристическую модель
          (статистика) с интерпретацией LLM. Для юридически значимых выводов
          требуется экспертный лингвистический анализ.
        </p>
      </div>
    </div>
  );
}
