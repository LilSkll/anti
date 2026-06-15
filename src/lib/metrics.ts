import type { MetricDescriptor, MarkerType } from "@/types/analysis";

// ===========================================================================
// Описатели метрик (label / описание / цвет) — единый источник правды
// ===========================================================================

export const METRIC_DESCRIPTORS: MetricDescriptor[] = [
  {
    key: "humanProbability",
    label: "Вероятность авторства человека",
    short: "Человек",
    description:
      "Оценка вероятности того, что текст создан человеком по совокупности маркеров естественного дискурса.",
    positive: true,
  },
  {
    key: "aiProbability",
    label: "Вероятность авторства ИИ",
    short: "ИИ",
    description:
      "Оценка вероятности того, что текст сгенерирован нейросетью по маркерам машинного дискурса.",
  },
  {
    key: "formality",
    label: "Уровень формальности",
    short: "Формальность",
    description:
      "Степень соблюдения официально-делового регистра, нейтральности и стандартизации лексики.",
  },
  {
    key: "emotionality",
    label: "Уровень эмоциональности",
    short: "Эмоциональность",
    description:
      "Выраженность оценочной, экспрессивной и аффективной лексики в тексте.",
    positive: true,
  },
  {
    key: "repetitiveness",
    label: "Повторяемость конструкций",
    short: "Повторы",
    description:
      "Частота повторов одних и тех же синтаксических шаблонов и конструкций.",
  },
  {
    key: "cohesion",
    label: "Когезия",
    short: "Когезия",
    description:
      "Лексико-грамматическая связность: средства связи предложений внутри текста.",
    positive: true,
  },
  {
    key: "coherence",
    label: "Когерентность",
    short: "Когерентность",
    description:
      "Смысловая цельность: логическая и тематическая связность текста.",
    positive: true,
  },
  {
    key: "terminologyDensity",
    label: "Терминологическая насыщенность",
    short: "Терминология",
    description:
      "Плотность специальной и терминологической лексики относительно общего объёма.",
    positive: true,
  },
  {
    key: "argumentationDensity",
    label: "Плотность аргументации",
    short: "Аргументация",
    description:
      "Насыщенность текста аргументативными структурами, доводами и обоснованиями.",
    positive: true,
  },
];

export const METRIC_KEYS = METRIC_DESCRIPTORS.map((m) => m.key);

// ===========================================================================
// Категории маркеров (цвет, заголовок, описание) — для подсветки и легенды
// ===========================================================================

export interface MarkerCategory {
  type: MarkerType;
  label: string;
  description: string;
  /** Tailwind-цвет текста */
  text: string;
  /** inline-стиль фона подсветки (rgba) */
  bg: string;
  /** rgb-триплет для диаграмм */
  rgb: string;
}

export const MARKER_CATEGORIES: MarkerCategory[] = [
  {
    type: "template",
    label: "Шаблонные конструкции",
    description: "Жёсткие синтаксические каркасы, типичные для машинной генерации.",
    text: "text-accent-amber",
    bg: "rgba(251, 191, 36, 0.18)",
    rgb: "251, 191, 36",
  },
  {
    type: "cliche",
    label: "Клише",
    description: "Стереотипные обороты и устойчивые формулы, потерявшие выразительность.",
    text: "text-accent-rose",
    bg: "rgba(251, 113, 133, 0.18)",
    rgb: "251, 113, 133",
  },
  {
    type: "repeated_syntax",
    label: "Повторяющиеся синтаксис",
    description: "Однотипные синтаксические модели, повторяющиеся в смежных предложениях.",
    text: "text-accent-violet",
    bg: "rgba(129, 140, 248, 0.20)",
    rgb: "129, 140, 248",
  },
  {
    type: "neutral",
    label: "Чрезмерно нейтральные формулировки",
    description: "Сглаженные, обезличенные выражения без позиции говорящего.",
    text: "text-accent-sky",
    bg: "rgba(56, 189, 248, 0.18)",
    rgb: "56, 189, 248",
  },
  {
    type: "ai_discourse",
    label: "Признаки машинного дискурса",
    description: "Совокупность маркеров, характерных для текстов нейросетей.",
    text: "text-accent-cyan",
    bg: "rgba(34, 211, 238, 0.20)",
    rgb: "34, 211, 238",
  },
  {
    type: "human_discourse",
    label: "Признаки человеческого дискурса",
    description: "Маркеры естественной речи: экспрессия, нетривиальные метафоры, позиция.",
    text: "text-accent-emerald",
    bg: "rgba(52, 211, 153, 0.20)",
    rgb: "52, 211, 153",
  },
];

export const MARKER_CATEGORY_MAP: Record<MarkerType, MarkerCategory> =
  MARKER_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.type] = cat;
      return acc;
    },
    {} as Record<MarkerType, MarkerCategory>
  );
