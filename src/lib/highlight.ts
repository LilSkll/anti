import type { Marker } from "@/types/analysis";
import { MARKER_CATEGORY_MAP } from "@/lib/metrics";

export interface HighlightSpan {
  text: string;
  marker?: Marker;
}

/**
 * Разбивает исходный текст на фрагменты, подсвечивая вхождения маркеров.
 * Использует поиск слева направо без перекрытий, чтобы корректно обработать
 * повторяющиеся строки. Регистр сохраняется дословно.
 */
export function buildHighlightSpans(source: string, markers: Marker[]): HighlightSpan[] {
  const trimmed = markers.filter((m) => m.text && m.text.length >= 2);
  if (trimmed.length === 0) return [{ text: source }];

  // Каждое вхождение: {start, end, marker}
  interface Occ {
    start: number;
    end: number;
    marker: Marker;
  }
  const occs: Occ[] = [];

  for (const marker of trimmed) {
    const needle = marker.text;
    if (!needle) continue;
    let from = 0;
    // ограничиваем количество вхождений одного маркера
    let count = 0;
    while (count < 5) {
      const idx = source.indexOf(needle, from);
      if (idx === -1) break;
      occs.push({ start: idx, end: idx + needle.length, marker });
      from = idx + needle.length;
      count++;
    }
  }

  if (occs.length === 0) {
    // модель дала маркеры, не дословно совпадающие с текстом — fallback
    return [{ text: source }];
  }

  // сортируем по позиции, разрешаем конфликты: ближний и более длинный побеждает
  occs.sort((a, b) => a.start - b.start || b.end - a.end);

  const spans: HighlightSpan[] = [];
  let cursor = 0;
  for (const occ of occs) {
    if (occ.start < cursor) continue; // перекрытие — пропускаем
    if (occ.start > cursor) {
      spans.push({ text: source.slice(cursor, occ.start) });
    }
    spans.push({ text: source.slice(occ.start, occ.end), marker: occ.marker });
    cursor = occ.end;
  }
  if (cursor < source.length) {
    spans.push({ text: source.slice(cursor) });
  }
  return spans;
}

export function markerBg(marker: Marker): string {
  return MARKER_CATEGORY_MAP[marker.type]?.bg ?? "rgba(148,163,184,0.18)";
}
