import type { Marker } from "@/types/analysis";
import { MARKER_CATEGORIES, MARKER_CATEGORY_MAP } from "@/lib/metrics";
import { cn } from "@/lib/utils";

interface MarkerLegendProps {
  markers?: Marker[];
  variant?: "legend" | "table";
}

export function MarkerLegend({ markers, variant = "legend" }: MarkerLegendProps) {
  if (variant === "table") {
    if (!markers || markers.length === 0) {
      return (
        <p className="text-sm text-slate-500">
          Маркеры не выделены. Запустите анализ маркеров.
        </p>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="py-2 pr-3 font-medium">Фрагмент</th>
              <th className="py-2 pr-3 font-medium">Категория</th>
              <th className="py-2 pr-3 font-medium">Метка</th>
              <th className="py-2 font-medium">Пояснение</th>
            </tr>
          </thead>
          <tbody>
            {markers.map((m, i) => {
              const cat = MARKER_CATEGORY_MAP[m.type];
              return (
                <tr
                  key={i}
                  className="border-b border-white/5 align-top last:border-0"
                >
                  <td className="py-2 pr-3">
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-xs text-slate-100"
                      style={{ backgroundColor: cat?.bg }}
                    >
                      {m.text}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <span className={cn("text-xs font-medium", cat?.text)}>
                      {cat?.label}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-xs text-slate-300">
                    {m.label}
                  </td>
                  <td className="py-2 text-xs text-slate-400">{m.comment}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {MARKER_CATEGORIES.map((cat) => {
        const count = markers?.filter((m) => m.type === cat.type).length ?? 0;
        return (
          <div
            key={cat.type}
            className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] p-2.5"
          >
            <span
              className="mt-0.5 h-3 w-3 shrink-0 rounded"
              style={{
                backgroundColor: `rgba(${cat.rgb}, 0.8)`,
                boxShadow: `0 0 0 1px rgba(${cat.rgb}, 0.4)`,
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium", cat.text)}>
                  {cat.label}
                </span>
                {count > 0 && (
                  <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                    {count}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                {cat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
