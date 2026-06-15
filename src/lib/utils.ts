import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Ограничить значение в диапазоне 0–100 */
export function clamp01to100(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Короткий id */
export function uid(prefix = ""): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

/** Безопасный JSON-парсинг: вырезает ```json ограждения и возвращает {data|error} */
export function safeJsonParse<T = unknown>(raw: string): { data?: T; error?: string } {
  if (!raw) return { error: "Пустой ответ модели." };
  let text = raw.trim();
  // снять markdown-ограждение
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  // найти первый объект/массив
  const start = text.search(/[{[]/);
  if (start > 0) text = text.slice(start);
  const endMatch = text.match(/[}\]]\s*$/);
  if (!endMatch) {
    const lastObj = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
    if (lastObj > 0) text = text.slice(0, lastObj + 1);
  }
  try {
    return { data: JSON.parse(text) as T };
  } catch (e) {
    return { error: `Не удалось разобрать JSON: ${(e as Error).message}` };
  }
}

/** Превратить текст в заголовок-название (первые слова) */
export function deriveTitle(text: string, max = 56): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "Без названия";
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

/** Обрезать текст для превью */
export function truncate(text: string, max = 240): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

/** Человекочитаемая дата */
export function formatDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}
