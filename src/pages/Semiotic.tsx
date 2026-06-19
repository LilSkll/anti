import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Share2,
  Play,
  Loader2,
  AlertTriangle,
  Network,
  Tag,
  Settings as SettingsIcon,
  Lightbulb,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, Button, Badge, EmptyState } from "@/components/ui/Card";
import { TextEditor } from "@/components/ui/TextEditor";
import { SemioticGraph } from "@/components/semiotic/SemioticGraph";
import { analyzeSemiotic } from "@/lib/analyze";
import { hasAnyConfiguredKey } from "@/store/settingsStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { deriveTitle, cn } from "@/lib/utils";
import type { SemioticResult, SemioticNodeType } from "@/types/analysis";

type Phase = "idle" | "running" | "done" | "error";

const TYPE_META: Record<SemioticNodeType, { label: string; rgb: string }> = {
  concept: { label: "Ключевые концепты", rgb: "34, 211, 238" },
  sign: { label: "Центральные знаки", rgb: "129, 140, 248" },
  field: { label: "Семантические поля", rgb: "52, 211, 153" },
  link: { label: "Концептуальные связи", rgb: "251, 191, 36" },
};

export function Semiotic() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SemioticResult | null>(null);

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
    setResult(null);

    resetCurrent({ sourceText: text, title: deriveTitle(text) });

    try {
      const r = await analyzeSemiotic(text, ctrl.signal);
      setResult(r);
      updateCurrent({ semiotic: r });
      commitCurrent();
      setPhase("done");
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError((e as Error).message || "Ошибка семиотического анализа.");
      setPhase("error");
    }
  }

  const running = phase === "running";

  const typeCounts = result
    ? (Object.keys(TYPE_META) as SemioticNodeType[]).map((t) => ({
        type: t,
        count: result.nodes.filter((n) => n.type === t).length,
      }))
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionTitle
        title="Семиотический анализ"
        subtitle="Графовая карта ключевых концептов, знаков и семантических полей"
        icon={<Share2 className="h-5 w-5" />}
        right={
          result && (
            <Badge tone="violet">
              <Network className="h-3 w-3" />
              {result.nodes.length} узлов · {result.edges.length} связей
            </Badge>
          )
        }
      />

      <Card>
        <TextEditor
          value={text}
          onChange={setText}
          minHeight={220}
          placeholder="Вставьте текст или загрузите документ — будут выделены ключевые концепты, знаки и семантические поля…"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={run} disabled={running || !text.trim()}>
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? "Анализ…" : "Построить граф"}
          </Button>
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
            Построение семиотической карты…
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
          icon={<Share2 className="h-6 w-6" />}
          title="Интерактивная графовая карта"
          description="После анализа здесь появится семиотический граф: узлы можно перетаскивать, масштабировать и изучать связи между концептами."
        />
      )}

      {result && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-200">
              Семиотическая карта
            </h3>
            <SemioticGraph data={result} />

            <div className="mt-4 flex flex-wrap gap-2">
              {typeCounts.map(({ type, count }) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                  style={{
                    borderColor: `rgba(${TYPE_META[type].rgb}, 0.4)`,
                    backgroundColor: `rgba(${TYPE_META[type].rgb}, 0.1)`,
                    color: `rgb(${TYPE_META[type].rgb})`,
                  }}
                >
                  <Tag className="h-3 w-3" />
                  {TYPE_META[type].label}: {count}
                </span>
              ))}
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="mb-3 flex items-center gap-2">
                <Network className="h-4 w-4 text-accent-cyan" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Ключевые узлы
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.nodes
                  .slice()
                  .sort((a, b) => b.weight - a.weight)
                  .map((n) => (
                    <span
                      key={n.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
                      )}
                      style={{
                        borderColor: `rgba(${TYPE_META[n.type].rgb}, 0.4)`,
                        backgroundColor: `rgba(${TYPE_META[n.type].rgb}, 0.08)`,
                        color: "#e2e8f0",
                      }}
                      title={`Вес: ${n.weight}`}
                    >
                      {n.label}
                      <span className="font-mono text-[10px] text-slate-400">
                        {n.weight}
                      </span>
                    </span>
                  ))}
              </div>
            </Card>

            <Card className="flex flex-col">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent-amber" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Резюме
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {result.summary}
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
