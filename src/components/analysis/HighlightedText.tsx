import { useMemo } from "react";
import type { Marker } from "@/types/analysis";
import {
  buildHighlightSpans,
  markerBg,
} from "@/lib/highlight";
import { MARKER_CATEGORY_MAP } from "@/lib/metrics";
import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  source: string;
  markers: Marker[];
  /** Минимальная длина маркера для подсветки */
  className?: string;
}

export function HighlightedText({
  source,
  markers,
  className,
}: HighlightedTextProps) {
  const spans = useMemo(
    () => buildHighlightSpans(source, markers),
    [source, markers]
  );

  return (
    <div
      className={cn(
        "max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-ink-950/40 p-4 text-sm leading-relaxed text-slate-300",
        className
      )}
    >
      {spans.map((span, i) =>
        span.marker ? (
          <mark
            key={i}
            title={span.marker.comment}
            className={cn(
              "rounded px-0.5 py-0.5 text-slate-100 ring-1 ring-inset transition hover:brightness-125",
              MARKER_CATEGORY_MAP[span.marker.type]?.text
            )}
            style={{
              backgroundColor: markerBg(span.marker),
              boxShadow: `inset 0 0 0 1px rgba(${MARKER_CATEGORY_MAP[span.marker.type]?.rgb}, 0.25)`,
            }}
          >
            {span.text}
          </mark>
        ) : (
          <span key={i}>{span.text}</span>
        )
      )}
    </div>
  );
}
