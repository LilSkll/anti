import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileSearch,
  Play,
  Loader2,
  AlertTriangle,
  Tags,
  MessageSquareText,
  Target,
  RefreshCw,
  Save,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, Button, Badge, EmptyState } from "@/components/ui/Card";
import { TextEditor } from "@/components/ui/TextEditor";
import { MetricCard } from "@/components/analysis/MetricCard";
import { HighlightedText } from "@/components/analysis/HighlightedText";
import { MarkerLegend } from "@/components/analysis/MarkerLegend";
import { RadarMetrics } from "@/components/charts/RadarMetrics";
import {
  analyzeMetrics,
  analyzeMarkers,
  analyzeDiscourse,
  computeHybridAuthorship,
  computeStatFeatures,
} from "@/lib/analyze";
import { trimForLLM, describeTrim } from "@/lib/textTrim";
import {
  hasAnyConfiguredKey,
  settingsApi,
} from "@/store/settingsStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { deriveTitle } from "@/lib/utils";
import type {
  TextMetrics,
  Marker,
  DiscourseResult,
  HybridAuthorship,
} from "@/types/analysis";
import { DiscoursePanel } from "@/components/analysis/DiscoursePanel";
import { AuthorshipPanel } from "@/components/analysis/AuthorshipPanel";
import type { StatFeatures } from "@/lib/statFeatures";

type Phase = "idle" | "running" | "done" | "error";

const SAMPLE = `В современном мире искусственный интеллект играет важную роль. Технологии стремительно развиваются, открывая новые горизонты. Важно отметить, что данный вопрос требует глубокого анализа. Таким образом, можно сделать вывод о значимости рассматриваемой темы.`;

export function TextAnalysis() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [trimNotice, setTrimNotice] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<TextMetrics | null>(null);
  const [authorship, setAuthorship] = useState<HybridAuthorship | null>(null);
  const [statFeatures, setStatFeatures] = useState<StatFeatures | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [discourse, setDiscourse] = useState<DiscourseResult | null>(null);

  const hasKey = hasAnyConfiguredKey();
  const resetCurrent = useAnalysisStore((s) => s.resetCurrent);
  const updateCurrent = useAnalysisStore((s) => s.updateCurrent);
  const commitCurrent = useAnalysisStore((s) => s.commitCurrent);

  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    if (!text.trim()) return;
    if (!hasKey) {
      setError("API-ключи не заданы. Администратор должен добавить VITE_*_API_KEY в переменные окружения Vercel.");
      setPhase("error");
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setPhase("running");
    setError(null);
    setMetrics(null);
    setAuthorship(null);
    setStatFeatures(null);
    setMarkers([]);
    setDiscourse(null);

    // Проверяем, нужно ли обрезать текст для LLM
    const trimInfo = trimForLLM(text, settingsApi.getState().provider);
    setTrimNotice(describeTrim(trimInfo));

    resetCurrent({ sourceText: text, title: deriveTitle(text) });

    try {
      setProgress("Расчёт лингвистических метрик…");
      const m = await analyzeMetrics(text, ctrl.signal);
      setMetrics(m);

      // Гибридная оценка: объединяем LLM-метрики и локальные стат-признаки
      const features = computeStatFeatures(text);
      const hybrid = computeHybridAuthorship(text, m);
      setStatFeatures(features);
      setAuthorship(hybrid);
      updateCurrent({ metrics: m, authorship: hybrid });

      setProgress("Выделение языковых маркеров…");
      const mk = await analyzeMarkers(text, ctrl.signal);
      setMarkers(mk);
      updateCurrent({ markers: mk });

      setProgress("Дискурс-анализ…");
      const d = await analyzeDiscourse(text, ctrl.signal);
      setDiscourse(d);
      updateCurrent({ discourse: d });

      commitCurrent();
      setPhase("done");
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError((e as Error).message || "Неизвестная ошибка анализа.");
      setPhase("error");
    } finally {
      setProgress("");
    }
  }

  function reset() {
    abortRef.current?.abort();
    setPhase("idle");
    setMetrics(null);
    setAuthorship(null);
    setStatFeatures(null);
    setTrimNotice(null);
    setMarkers([]);
    setDiscourse(null);
    setError(null);
  }

  const running = phase === "running";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle
        title="Анализ текста"
        subtitle="Лингвистические метрики, маркеры и дискурс-анализ"
        icon={<FileSearch className="h-5 w-5" />}
        right={
          metrics && (
            <Badge tone="emerald">
              <BarChart3 className="h-3 w-3" />
              Анализ завершён
            </Badge>
          )
        }
      />

      {/* Input */}
      <Card>
        <div className="mb-3 flex items-center justify-end">
          <button
            onClick={() => setText(SAMPLE)}
            className="text-xs text-slate-400 underline-offset-2 transition hover:text-accent-cyan hover:underline"
          >
            Вставить пример
          </button>
        </div>
        <TextEditor
          value={text}
          onChange={setText}
          minHeight={260}
          placeholder="Вставьте текст для анализа или загрузите документ .docx / .txt…"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={run} disabled={running || !text.trim()}>
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? "Анализ…" : "Запустить анализ"}
          </Button>
          {metrics && (
            <Button variant="ghost" onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Сбросить
            </Button>
          )}
          {!hasKey && (
            <Link to="/settings" className="btn-ghost">
              <SettingsIcon className="h-4 w-4" />
              Как настроить?
            </Link>
          )}
        </div>

        {running && (
          <div className="mt-4 flex items-center gap-2 text-sm text-accent-cyan">
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-accent-rose/30 bg-accent-rose/10 p-3 text-sm text-accent-rose">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{error}</div>
          </div>
        )}
      </Card>

      {/* Предупреждение об автообрезке */}
      {trimNotice && (
        <div className="flex items-start gap-2.5 rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-3.5 text-sm text-slate-300 animate-fade-in">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber" />
          <div>
            <span className="font-medium text-accent-amber">
              Текст автоматически сокращён
            </span>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
              {trimNotice}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {phase === "idle" && (
        <EmptyState
          icon={<FileSearch className="h-6 w-6" />}
          title="Результаты появятся здесь"
          description="Вставьте текст и нажмите «Запустить анализ». Будут рассчитаны 9 метрик, выделены языковые маркеры и построен дискурс-анализ."
        />
      )}

      {metrics && (
        <div className="space-y-6 animate-fade-in">
          {/* Профиль метрик */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                Профиль метрик
              </h3>
              <span className="text-xs text-slate-500">радар · 0–100</span>
            </div>
            <div className="h-72 w-full">
              <RadarMetrics metrics={metrics} />
            </div>
          </Card>

          {/* Гибридная оценка авторства + статистика */}
          {authorship && statFeatures && (
            <AuthorshipPanel
              authorship={authorship}
              features={statFeatures}
            />
          )}

          {/* Metric cards */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-200">
              Количественные метрики
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {(
                [
                  "formality",
                  "emotionality",
                  "repetitiveness",
                  "cohesion",
                  "coherence",
                  "terminologyDensity",
                  "argumentationDensity",
                ] as const
              ).map((k) => (
                <MetricCard key={k} metricKey={k} value={metrics[k]} />
              ))}
            </div>
          </div>

          {/* Markers */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tags className="h-4 w-4 text-accent-amber" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Языковые маркеры
                </h3>
                <Badge tone="slate">{markers.length}</Badge>
              </div>
            </div>

            <HighlightedText source={text} markers={markers} />

            <div className="mt-4">
              <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                Легенда
              </div>
              <MarkerLegend markers={markers} variant="legend" />
            </div>

            {markers.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                  Таблица маркеров
                </div>
                <MarkerLegend markers={markers} variant="table" />
              </div>
            )}
          </Card>

          {/* Discourse */}
          {discourse && (
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-accent-violet" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Дискурс-анализ
                </h3>
              </div>
              <DiscoursePanel discourse={discourse} />
            </Card>
          )}

          {/* Save / report */}
          <Card className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-5 w-5 text-accent-emerald" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Анализ сохранён в истории
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Сформируйте научный отчёт или сравните этот текст с другим.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/compare" className="btn-ghost">
                Сравнить
              </Link>
              <Link to="/reports" className="btn-primary">
                <Save className="h-4 w-4" />
                К отчёту
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
