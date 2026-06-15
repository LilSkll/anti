import { METRIC_DESCRIPTORS } from "@/lib/metrics";
import { MiniBar } from "@/components/ui/ScoreGauge";
import type { TextMetrics } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metricKey: keyof TextMetrics;
  value: number;
  compact?: boolean;
}

export function MetricCard({ metricKey, value, compact }: MetricCardProps) {
  const desc = METRIC_DESCRIPTORS.find((m) => m.key === metricKey);
  if (!desc) return null;

  const tone = desc.positive
    ? "emerald"
    : metricKey === "aiProbability" || metricKey === "repetitiveness"
      ? "amber"
      : "cyan";

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]",
        compact && "p-3"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {desc.short}
          </div>
          {!compact && (
            <div className="mt-0.5 text-xs leading-snug text-slate-500">
              {desc.label}
            </div>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 font-mono text-xl font-bold",
            tone === "emerald" && "text-accent-emerald",
            tone === "amber" && "text-accent-amber",
            tone === "cyan" && "text-accent-cyan"
          )}
        >
          {Math.round(value)}
        </span>
      </div>
      <div className={cn("mt-3", compact && "mt-2")}>
        <MiniBar value={value} tone={tone as "emerald" | "amber" | "cyan"} />
      </div>
    </div>
  );
}
