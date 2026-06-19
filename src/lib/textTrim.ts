// ===========================================================================
// Безопасное ограничение длины текста перед отправкой в LLM.
//
// Проблема: провайдеры (особенно Groq Free Tier) имеют лимиты на токены
// в минуту (TPM) и на размер запроса. Большой .docx легко даёт 40k+ токенов
// и падает с 413. Здесь — обрезка по границам предложений, чтобы не разорвать
// посреди слова или фразы.
//
// Лимиты зависят от провайдера: Groq free tier очень жёсткий (6k–12k TPM),
// поэтому обрезаем агрессивно. OpenAI и Gemini позволяют большие запросы.
// ===========================================================================

import type { ProviderId } from "@/types/analysis";

/**
 * Лимиты по провайдеру. Рассчитаны с запасом, чтобы промпт + текст + ответ
// не превысили TPM-лимит. Цифры консервативные — берём половину от известного
// лимита для надёжности (заодно оставляем место под system-prompt).
 */
const PROVIDER_LIMITS: Record<
  ProviderId,
  { maxChars: number; maxWords: number }
> = {
  // Groq free: llama-3.3-70b = 12k TPM, llama-3.1-8b = 6k TPM.
  // Берём минимум — 4k слов / ~12k символов (≈ 5k токенов), чтобы пройти
  // даже на 8b-модели с учётом системного промпта.
  groq: { maxChars: 12000, maxWords: 1800 },
  // OpenAI: 128k context, TPM высокие на free/paid. Берём щедрый лимит.
  openai: { maxChars: 48000, maxWords: 12000 },
  // Gemini: 1M TPM на free tier. Берём щедрый лимит.
  gemini: { maxChars: 48000, maxWords: 12000 },
};

/** Дефолтные лимиты (если провайдер не указан) — безопасные, как у Groq. */
export const MAX_TEXT_CHARS = 12000;
export const MAX_TEXT_WORDS = 1800;

export interface TrimResult {
  /** Обрезанный текст */
  text: string;
  /** Был ли текст укорочен */
  trimmed: boolean;
  /** Исходное число символов */
  originalChars: number;
  /** Исходное число слов */
  originalWords: number;
  /** Сколько символов осталось после обрезки */
  finalChars: number;
  /** Сколько слов осталось после обрезки */
  finalWords: number;
  /** Провайдер, под который обрезали */
  provider: ProviderId;
}

function countWordsLocal(text: string): number {
  const m = text.trim().match(/[a-zа-яё0-9]+(?:[-'][a-zа-яё0-9]+)?/gi);
  return m ? m.length : 0;
}

/**
 * Разбивает текст на предложения, не разрывая слов.
 * Сохраняет пунктуацию и пробелы.
 */
function splitIntoSentences(text: string): string[] {
  // Сохраняем разделители, чтобы восстановить текст потом
  const parts = text.match(/[^.!?…]+[.!?…]*/g);
  if (!parts) return text ? [text] : [];
  return parts.map((s) => s).filter((s) => s.trim().length > 0);
}

/**
 * Обрезает текст до лимита, по границам предложений.
 * Если одно предложение длиннее лимита — режем по словам.
 */
export function trimForLLM(
  input: string,
  provider: ProviderId = "groq"
): TrimResult {
  const limits = PROVIDER_LIMITS[provider] ?? {
    maxChars: MAX_TEXT_CHARS,
    maxWords: MAX_TEXT_WORDS,
  };
  const { maxChars, maxWords } = limits;

  const originalChars = input.length;
  const originalWords = countWordsLocal(input);

  // Если текст уже в пределах лимита — возвращаем как есть
  if (originalChars <= maxChars && originalWords <= maxWords) {
    return {
      text: input,
      trimmed: false,
      originalChars,
      originalWords,
      finalChars: originalChars,
      finalWords: originalWords,
      provider,
    };
  }

  const sentences = splitIntoSentences(input);
  let result = "";
  let resultWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWordsLocal(sentence);

    // Проверяем лимит символов
    if ((result + sentence).length > maxChars) {
      break;
    }
    // Проверяем лимит слов
    if (resultWords + sentenceWords > maxWords) {
      break;
    }

    result += sentence;
    resultWords += sentenceWords;
  }

  // Если не смогли взять ни одно предложение (одно гигантское) — режем по словам
  if (!result && sentences.length > 0) {
    const first = sentences[0];
    const words = first.split(/\s+/);
    const kept: string[] = [];
    let chars = 0;
    let wc = 0;
    for (const w of words) {
      if (chars + w.length + 1 > maxChars || wc + 1 > maxWords) {
        break;
      }
      kept.push(w);
      chars += w.length + 1;
      wc++;
    }
    result = kept.join(" ");
    resultWords = wc;
  }

  result = result.trim();

  return {
    text: result,
    trimmed: true,
    originalChars,
    originalWords,
    finalChars: result.length,
    finalWords: resultWords,
    provider,
  };
}

/** Человекочитаемое сообщение об обрезке */
export function describeTrim(t: TrimResult): string | null {
  if (!t.trimmed) return null;
  return `Текст был слишком длинным для лимитов провайдера «${t.provider}» (${t.originalWords} слов / ${t.originalChars.toLocaleString("ru-RU")} симв.) и автоматически обрезан до ${t.finalWords} слов / ${t.finalChars.toLocaleString("ru-RU")} симв. по границам предложений. Анализ выполнен по первой части текста.`;
}
