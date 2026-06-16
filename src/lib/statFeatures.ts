// ===========================================================================
// Локальные статистические признаки текста.
// Считаются полностью в браузере, без запросов к LLM.
//
// Мотивация: оценка авторства (человек/ИИ) от LLM — это субъективная эвристика.
// Статистические признаки дают объективную опору: ИИ-тексты статистически
// отличаются более равномерной длиной предложений (низкий burstiness),
// выше долей служебных слов и более однообразным словарём (низкий TTR).
// ===========================================================================

// Набор русских стоп-слов (местоимения, предлоги, союзы, частицы).
// Высокая доля стоп-слов — типичный сигнал машинного дискурса.
const STOP_WORDS = new Set<string>([
  // местоимения
  "я", "ты", "он", "она", "оно", "мы", "вы", "они",
  "меня", "тебя", "его", "её", "их", "нам", "вам", "им",
  "нас", "тот", "этот", "эта", "эти", "то", "это", "такой", "такая",
  "который", "которая", "которые", "кто", "что", "чей", "свой",
  // предлоги
  "в", "во", "на", "по", "к", "ко", "с", "со", "от", "до", "из",
  "без", "для", "при", "над", "под", "о", "об", "обо", "за", "про",
  "через", "между", "перед", "у",
  // союзы и частицы
  "и", "а", "но", "или", "что", "чтобы", "как", "так", "если", "когда",
  "где", "куда", "откуда", "потому", "поэтому", "же", "ли", "бы",
  "не", "ни", "даже", "тоже", "также", "только", "уж", "вот", "ну",
  // глаголы-связки и модальные
  "есть", "был", "была", "было", "были", "будет", "быть",
  "может", "можно", "нужно", "надо", "должен", "является",
]);

const SENTENCE_DELIMITERS = /[.!?…]+/;

export interface StatFeatures {
  /** Число символов */
  chars: number;
  /** Число слов */
  wordCount: number;
  /** Число предложений */
  sentenceCount: number;
  /** Средняя длина предложения в словах */
  avgSentenceLength: number;
  /** Средняя длина слова в символах */
  avgWordLength: number;
  /**
   * Burstiness — вариативность длины предложений.
   * Высокий = человек (рваный ритм), низкий = ИИ (монотонность).
   * Возвращаем коэффициент вариации (std/mean) в процентах 0–100.
   */
  burstiness: number;
  /**
   * Type-Token Ratio (TTR) — уникальность словаря.
   * uniqueWords / totalWords. Высокий = богатый словарь (человек).
   */
  ttr: number;
  /**
   * Доля стоп-слов среди всех слов, %.
   * Высокая доля — сигнал ИИ (гиперкорректность, обилие связок).
   */
  stopWordRatio: number;
  /**
   * Доля длинных слов (≥9 символов), %.
   * Высокая — терминологичность / книжность.
   */
  longWordRatio: number;
  /**
   * Proxy perplexity — средняя частотность слова (1/rank по упрощённой Zipf).
   * ИИ-тексты чаще состоят из высокочастотных слов → низкая «сюрпризность».
   * Здесь: доля редких слов как индикатор нетривиальности.
   */
  rareWordRatio: number;
  /**
   * Повторяемость биграмм (пар подряд идущих слов).
   * Высокая повторяемость одинаковых пар — сигнал ИИ.
   */
  bigramRepetition: number;
}

// ---------------------------------------------------------------------------
// Утилиты токенизации
// ---------------------------------------------------------------------------

function tokenizeWords(text: string): string[] {
  // Кириллица + латиница, дефис внутри слова
  const matches = text.toLowerCase().match(/[a-zа-яё]+(?:-[a-zа-яё]+)?/gi);
  return matches ?? [];
}

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_DELIMITERS)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance =
    arr.reduce((acc, x) => acc + (x - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

// Упрощённый словарь высокочастотной русской лексики (≈ топ-200).
// Если слова нет в нём — считаем редким.
const COMMON_WORDS = new Set<string>([
  ...Array.from(STOP_WORDS),
  "год", "время", "человек", "дело", "жизнь", "день", "рука", "лицо",
  "глаз", "место", "страна", "мир", "сторона", "вопрос", "работа",
  "слово", "случай", "дом", "город", "вода", "сила", "конец", "начало",
  "большой", "новый", "хороший", "старый", "высокий", "маленький",
  "российский", "русский", "первый", "последний", "главный", "важный",
  "быть", "мочь", "сказать", "знать", "делать", "видеть", "хотеть",
  "идти", "стоять", "думать", "жить", "давать", "смотреть", "считать",
  "один", "два", "три", "раз", "очень", "более", "больше", "каждый",
  "любой", "многие", "несколько", "много", "мало", "ещё", "уже", "всегда",
]);

// ---------------------------------------------------------------------------
// Главная функция
// ---------------------------------------------------------------------------

export function computeStatFeatures(text: string): StatFeatures {
  const words = tokenizeWords(text);
  const sentences = splitSentences(text);
  const chars = text.length;

  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);

  // длины предложений в словах
  const sentenceLengths = sentences
    .map((s) => tokenizeWords(s).length)
    .filter((n) => n > 0);
  const avgSentenceLength = sentenceLengths.length
    ? mean(sentenceLengths)
    : 0;

  const avgWordLength = wordCount
    ? mean(words.map((w) => w.length))
    : 0;

  // Burstiness: коэффициент вариации длин предложений (%).
  const bMean = mean(sentenceLengths.length ? sentenceLengths : [0]);
  const bStd = stdDev(sentenceLengths);
  const burstiness = bMean > 0 ? Math.min(100, (bStd / bMean) * 100) : 0;

  // TTR — уникальность словаря
  const uniqueWords = new Set(words);
  const ttr = wordCount ? (uniqueWords.size / wordCount) * 100 : 0;

  // Доля стоп-слов
  let stopCount = 0;
  for (const w of words) if (STOP_WORDS.has(w)) stopCount++;
  const stopWordRatio = wordCount ? (stopCount / wordCount) * 100 : 0;

  // Доля длинных слов (≥9 символов)
  let longCount = 0;
  for (const w of words) if (w.length >= 9) longCount++;
  const longWordRatio = wordCount ? (longCount / wordCount) * 100 : 0;

  // Доля редких слов (не входят в COMMON_WORDS)
  let rareCount = 0;
  for (const w of words) if (!COMMON_WORDS.has(w)) rareCount++;
  const rareWordRatio = wordCount ? (rareCount / wordCount) * 100 : 0;

  // Повторяемость биграмм
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(words[i] + " " + words[i + 1]);
  }
  const bigramCounts = new Map<string, number>();
  for (const bg of bigrams) {
    bigramCounts.set(bg, (bigramCounts.get(bg) ?? 0) + 1);
  }
  let repeatedBigrams = 0;
  for (const c of bigramCounts.values()) if (c > 1) repeatedBigrams += c - 1;
  const bigramRepetition = bigrams.length
    ? (repeatedBigrams / bigrams.length) * 100
    : 0;

  return {
    chars,
    wordCount,
    sentenceCount,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    burstiness: Math.round(burstiness),
    ttr: Math.round(ttr),
    stopWordRatio: Math.round(stopWordRatio),
    longWordRatio: Math.round(longWordRatio),
    rareWordRatio: Math.round(rareWordRatio),
    bigramRepetition: Math.round(bigramRepetition),
  };
}

// ---------------------------------------------------------------------------
// Гибридная оценка авторства на основе стат-признаков
// ---------------------------------------------------------------------------

export interface StatVerdict {
  /** Оценка вероятности ИИ по статистике (0–100) */
  statAiProbability: number;
  /** Доверительный интервал оценки */
  confidence: "low" | "medium" | "high";
  /** Человекочитаемые обоснования */
  reasons: string[];
}

/**
 * Эвристическая модель: по стат-признакам оцениваем «машинность» текста.
 * Это НЕ детектор с обученной моделью, а взвешенная эвристика,
 * основанная на исследованиях отличий LLM-генерации (равномерность,
 * гиперкорректность, обилие связок, однообразный синтаксис).
 */
export function computeStatVerdict(features: StatFeatures): StatVerdict {
  const reasons: string[] = [];
  let score = 50; // стартуем с нейтральной оценки
  let evidenceCount = 0;

  // 1. Burstiness — главный сигнал. Низкая вариативность длин предложений.
  if (features.wordCount >= 40) {
    if (features.burstiness < 25) {
      score += 12;
      reasons.push(
        `Низкая вариативность длины предложений (burstiness ${features.burstiness}%): монотонный ритм, типичный для ИИ.`
      );
      evidenceCount++;
    } else if (features.burstiness > 55) {
      score -= 10;
      reasons.push(
        `Высокая вариативность длины предложений (burstiness ${features.burstiness}%): рваный ритм, характерный для человека.`
      );
      evidenceCount++;
    }
  }

  // 2. Доля стоп-слов — ИИ склонен к гиперкорректности с обилием связок.
  if (features.stopWordRatio > 52) {
    score += 8;
    reasons.push(
      `Повышенная доля служебных слов (${features.stopWordRatio}%): формальная связность «как в учебнике».`
    );
    evidenceCount++;
  } else if (features.stopWordRatio < 38) {
    score -= 6;
    reasons.push(
      `Низкая доля служебных слов (${features.stopWordRatio}%): лексическая плотность выше типичной для ИИ.`
    );
    evidenceCount++;
  }

  // 3. TTR — однообразие словаря.
  if (features.wordCount >= 60) {
    if (features.ttr < 40) {
      score += 9;
      reasons.push(
        `Низкое разнообразие лексики (TTR ${features.ttr}%): повторяющийся словарь.`
      );
      evidenceCount++;
    } else if (features.ttr > 62) {
      score -= 8;
      reasons.push(
        `Высокое разнообразие лексики (TTR ${features.ttr}%): богатый словарь, типичный для человека.`
      );
      evidenceCount++;
    }
  }

  // 4. Повторяемость биграмм
  if (features.bigramRepetition > 25) {
    score += 7;
    reasons.push(
      `Частая повторяемость одинаковых словосочетаний (${features.bigramRepetition}%): шаблонность.`
    );
    evidenceCount++;
  }

  // 5. Доля редких слов — нетривиальность
  if (features.rareWordRatio < 30) {
    score += 4;
    reasons.push(
      `Преобладание общеупотребительной лексики (редких слов всего ${features.rareWordRatio}%): «безопасный» словарь ИИ.`
    );
    evidenceCount++;
  } else if (features.rareWordRatio > 55) {
    score -= 5;
    reasons.push(
      `Высокая доля редкой лексики (${features.rareWordRatio}%): нетривиальный выбор слов.`
    );
    evidenceCount++;
  }

  // Краткий текст — снижаем уверенность
  const tooShort = features.wordCount < 40;

  // Клипим итог
  const statAiProbability = Math.max(2, Math.min(98, Math.round(score)));

  const confidence: StatVerdict["confidence"] = tooShort
    ? "low"
    : evidenceCount >= 4
      ? "high"
      : evidenceCount >= 2
        ? "medium"
        : "low";

  if (reasons.length === 0) {
    reasons.push(
      "Статистические признаки нейтральны: текст не показывает явных маркеров машинной генерации."
    );
  }

  if (tooShort) {
    reasons.push(
      `Внимание: текст короткий (${features.wordCount} слов) — оценка статистически ненадёжна.`
    );
  }

  return { statAiProbability, confidence, reasons };
}

// ---------------------------------------------------------------------------
// Метаданные для UI
// ---------------------------------------------------------------------------

export interface StatFeatureMeta {
  key: keyof StatFeatures;
  label: string;
  description: string;
  /** human-friendy: что значит значение (для tooltip) */
  interpretation: (v: number) => string;
  unit?: string;
}

export const STAT_FEATURE_META: StatFeatureMeta[] = [
  {
    key: "burstiness",
    label: "Burstiness (вариативность)",
    description: "Разброс длин предложений. Высокий — рваный ритм человека.",
    interpretation: (v) =>
      v < 25 ? "низкая — монотонно (ИИ)" : v > 55 ? "высокая — рвано (человек)" : "умеренная",
  },
  {
    key: "ttr",
    label: "TTR (разнообразие лексики)",
    description: "Доля уникальных слов. Высокая — богатый словарь.",
    interpretation: (v) =>
      v < 40 ? "однообразно (ИИ)" : v > 62 ? "богато (человек)" : "средне",
    unit: "%",
  },
  {
    key: "stopWordRatio",
    label: "Доля стоп-слов",
    description: "Служебные слова. Высокая доля — гиперкорректность.",
    interpretation: (v) =>
      v > 52 ? "высокая (ИИ)" : v < 38 ? "низкая (человек)" : "норма",
    unit: "%",
  },
  {
    key: "bigramRepetition",
    label: "Повторяемость биграмм",
    description: "Повторы пар слов. Высокая — шаблонность.",
    interpretation: (v) =>
      v > 25 ? "высокая (ИИ)" : v > 10 ? "умеренная" : "низкая",
    unit: "%",
  },
  {
    key: "rareWordRatio",
    label: "Доля редкой лексики",
    description: "Нетривиальный выбор слов. Высокая — человек.",
    interpretation: (v) =>
      v > 55 ? "высокая (человек)" : v < 30 ? "низкая (ИИ)" : "средняя",
    unit: "%",
  },
  {
    key: "avgSentenceLength",
    label: "Средняя длина предложения",
    description: "В словах. Очень ровная длина — сигнал ИИ.",
    interpretation: (v) =>
      v < 8 ? "короткие" : v > 20 ? "длинные" : "средние",
    unit: " слов",
  },
  {
    key: "avgWordLength",
    label: "Средняя длина слова",
    description: "В символах. ИИ-тексты склонны к более длинным словам.",
    interpretation: (v) =>
      v > 7 ? "длинные слова (книжность)" : v < 4.5 ? "короткие" : "норма",
    unit: " симв.",
  },
  {
    key: "longWordRatio",
    label: "Доля длинных слов",
    description: "Слова ≥9 символов. Высокая — терминологичность.",
    interpretation: (v) =>
      v > 25 ? "высокая (терминологично)" : "норма",
    unit: "%",
  },
];
