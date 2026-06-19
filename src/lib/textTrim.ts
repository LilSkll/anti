// ===========================================================================
// Безопасное ограничение длины текста перед отправкой в LLM.
//
// Проблема: провайдеры (особенно Groq Free Tier) имеют лимиты на токены
// в минуту (TPM) и на размер запроса. Большой .docx легко даёт 40k+ токенов
// и падает с 413. Здесь — обрезка по границам предложений, чтобы не разорвать
// посреди слова или фразы.
// ===========================================================================

/** Максимальное число символов исходного текста для одного LLM-запроса. */
export const MAX_TEXT_CHARS = 24000;

/** Максимальное число слов (примерный потолок ~6000 слов ≈ 8–12k токенов). */
export const MAX_TEXT_WORDS = 6000;

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
export function trimForLLM(input: string): TrimResult {
  const originalChars = input.length;
  const originalWords = countWordsLocal(input);

  // Если текст уже в пределах лимита — возвращаем как есть
  if (originalChars <= MAX_TEXT_CHARS && originalWords <= MAX_TEXT_WORDS) {
    return {
      text: input,
      trimmed: false,
      originalChars,
      originalWords,
      finalChars: originalChars,
      finalWords: originalWords,
    };
  }

  const sentences = splitIntoSentences(input);
  let result = "";
  let resultWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWordsLocal(sentence);

    // Проверяем лимит символов
    if ((result + sentence).length > MAX_TEXT_CHARS) {
      break;
    }
    // Проверяем лимит слов
    if (resultWords + sentenceWords > MAX_TEXT_WORDS) {
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
      if (chars + w.length + 1 > MAX_TEXT_CHARS || wc + 1 > MAX_TEXT_WORDS) {
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
  };
}

/** Человекочитаемое сообщение об обрезке */
export function describeTrim(t: TrimResult): string | null {
  if (!t.trimmed) return null;
  return `Текст был слишком длинным для одного запроса к LLM (${t.originalWords} слов / ${t.originalChars.toLocaleString("ru-RU")} симв.) и автоматически обрезан до ${t.finalWords} слов / ${t.finalChars.toLocaleString("ru-RU")} симв. по границам предложений. Анализ выполнен по первой части текста.`;
}
