import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  value: number; // 0–100
  label?: string;
  size?: number;
  /** цвет дуги */
  tone?: "cyan" | "violet" | "emerald" | "amber" | "rose";
}

const TONE_RGB: Record<NonNullable<ScoreGaugeProps["tone"]>, string> = {
  cyan: "34, 211, 238",
  violet: "129, 140, 248",
  emerald: "52, 211, 153",
  amber: "251, 191, 36",
  rose: "251, 113, 133",
};

export function ScoreGauge({
  value,
  label,
  size = 120,
  tone = "cyan",
}: ScoreGaugeProps) {
  const v = Math.max(0, Math.min(100, value));
  const stroke = Math.max(6, size * 0.08);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const rgb = TONE_RGB[tone];

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`rgb(${rgb})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.6s ease",
            filter: `drop-shadow(0 0 6px rgba(${rgb},0.6))`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-2xl font-bold text-slate-100">
          {Math.round(v)}
        </span>
        {label && (
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

interface MiniBarProps {
  value: number;
  tone?: ScoreGaugeProps["tone"];
  label?: string;
  showValue?: boolean;
}

export function MiniBar({
  value,
  tone = "cyan",
  label,
  showValue = true,
}: MiniBarProps) {
  const v = Math.max(0, Math.min(100, value));
  const rgb = TONE_RGB[tone];
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-400">{label}</span>
          {showValue && (
            <span className="font-mono text-slate-300">{Math.round(v)}</span>
          )}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full")}
          style={{
            width: `${v}%`,
            background: `linear-gradient(90deg, rgba(${rgb},0.6), rgba(${rgb},1))`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
