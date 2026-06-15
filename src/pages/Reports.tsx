import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  FileDown,
  FileType2,
  Trash2,
  History,
  FileSearch,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, Button, Badge, EmptyState } from "@/components/ui/Card";
import { MiniBar } from "@/components/ui/ScoreGauge";
import { useAnalysisStore } from "@/store/analysisStore";
import { exportBundleToPdf } from "@/lib/export/pdf";
import { exportBundleToDocx } from "@/lib/export/docx";
import { formatDate, truncate } from "@/lib/utils";
import type { AnalysisBundle } from "@/types/analysis";

export function Reports() {
  const history = useAnalysisStore((s) => s.history);
  const removeHistory = useAnalysisStore((s) => s.removeHistory);
  const clearHistory = useAnalysisStore((s) => s.clearHistory);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function hasData(b: AnalysisBundle): boolean {
    return Boolean(b.metrics || b.discourse || b.semiotic || b.comparison);
  }

  async function handleDocx(b: AnalysisBundle) {
    if (!hasData(b)) {
      setErr("В этом анализе нет данных для отчёта.");
      return;
    }
    setErr(null);
    setBusy(b.id + ":docx");
    try {
      await exportBundleToDocx(b);
    } catch (e) {
      setErr((e as Error).message || "Ошибка экспорта DOCX.");
    } finally {
      setBusy(null);
    }
  }

  function handlePdf(b: AnalysisBundle) {
    if (!hasData(b)) {
      setErr("В этом анализе нет данных для отчёта.");
      return;
    }
    setErr(null);
    setBusy(b.id + ":pdf");
    try {
      exportBundleToPdf(b);
    } catch (e) {
      setErr((e as Error).message || "Ошибка экспорта PDF.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionTitle
        title="Отчёты"
        subtitle="История анализов и экспорт научных документов"
        icon={<FileText className="h-5 w-5" />}
        right={
          history.length > 0 && (
            <Button
              variant="ghost"
              className="px-3 py-1.5 text-xs"
              onClick={() => {
                if (confirm("Очистить всю историю анализов?")) clearHistory();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Очистить
            </Button>
          )
        }
      />

      <Card className="border-accent-cyan/20 bg-accent-cyan/[0.04]">
        <div className="flex items-start gap-3">
          <FileType2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-cyan" />
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Структура научного отчёта
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Каждый отчёт содержит описание текста, результаты метрик,
              дискурс-анализ, выявленные особенности, признаки ИИ- и
              человеческого дискурса и выводы. Доступен экспорт в PDF и DOCX.
            </p>
          </div>
        </div>
      </Card>

      {err && (
        <div className="flex items-start gap-2 rounded-xl border border-accent-rose/30 bg-accent-rose/10 p-3 text-sm text-accent-rose">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{err}</div>
        </div>
      )}

      {history.length === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="История пуста"
          description="Выполните анализ текста или сравнение — результаты появятся здесь и будут готовы к экспорту."
          action={
            <Link to="/analyze" className="btn-primary">
              <FileSearch className="h-4 w-4" />
              Перейти к анализу
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {history.map((b) => {
            const ready = hasData(b);
            return (
              <Card key={b.id} className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-100">
                        {truncate(b.title, 80)}
                      </h3>
                      {ready ? (
                        <Badge tone="emerald">
                          <CheckCircle2 className="h-3 w-3" />
                          готов к отчёту
                        </Badge>
                      ) : (
                        <Badge tone="amber">нет данных</Badge>
                      )}
                      {b.comparison && <Badge tone="violet">сравнение</Badge>}
                      {b.semiotic && <Badge tone="cyan">семиотика</Badge>}
                    </div>

                    <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(b.createdAt)}
                      </span>
                      <span>{b.sourceText.length} симв.</span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                      {truncate(b.sourceText, 200)}
                    </p>

                    {b.metrics && (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <MiniBar
                          value={b.metrics.humanProbability}
                          tone="emerald"
                          label="Человек"
                        />
                        <MiniBar
                          value={b.metrics.aiProbability}
                          tone="cyan"
                          label="ИИ"
                        />
                        <MiniBar
                          value={b.metrics.formality}
                          tone="violet"
                          label="Формальность"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <Button
                      onClick={() => handlePdf(b)}
                      disabled={!ready || busy === b.id + ":pdf"}
                      className="text-xs"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      {busy === b.id + ":pdf" ? "…" : "PDF"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDocx(b)}
                      disabled={!ready || busy === b.id + ":docx"}
                      className="text-xs"
                    >
                      <FileType2 className="h-3.5 w-3.5" />
                      {busy === b.id + ":docx" ? "…" : "DOCX"}
                    </Button>
                    <button
                      onClick={() => removeHistory(b.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-accent-rose/30 hover:text-accent-rose"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Удалить
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
