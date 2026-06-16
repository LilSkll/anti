// ===========================================================================
// Общие типы для AI Linguistic Discourse Analyzer
// ===========================================================================

export type ProviderId = "openai" | "gemini" | "groq";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  models: string[];
  defaultModel: string;
  hint: string;
}

export interface Settings {
  provider: ProviderId;
  model: string;
  apiKeys: Partial<Record<ProviderId, string>>;
}

// ---------------------------------------------------------------------------
// 1. Количественные метрики текста
// ---------------------------------------------------------------------------

export interface TextMetrics {
  /** Вероятность, что текст написан человеком, 0–100 */
  humanProbability: number;
  /** Вероятность, что текст написан ИИ, 0–100 */
  aiProbability: number;
  /** Уровень формальности, 0–100 */
  formality: number;
  /** Уровень эмоциональности, 0–100 */
  emotionality: number;
  /** Уровень повторяемости конструкций, 0–100 */
  repetitiveness: number;
  /** Когезия текста, 0–100 */
  cohesion: number;
  /** Когерентность текста, 0–100 */
  coherence: number;
  /** Насыщенность терминологией, 0–100 */
  terminologyDensity: number;
  /** Плотность аргументации, 0–100 */
  argumentationDensity: number;
}

/**
 * Гибридная оценка авторства: объединяет мнение LLM и локальные
 * статистические признаки (burstiness, TTR, стоп-слова и др.).
 */
export interface HybridAuthorship {
  /** Финальная вероятность ИИ (взвешенная), 0–100 */
  aiProbability: number;
  /** Финальная вероятность человека, 0–100 */
  humanProbability: number;
  /** Оценка только по LLM */
  llmAiProbability: number;
  /** Оценка только по статистическим признакам */
  statAiProbability: number;
  /** Доверительный интервал ± (в пунктах процента) */
  margin: number;
  /** Уровень доверия к оценке */
  confidence: "low" | "medium" | "high";
  /** Человекочитаемые обоснования статистических признаков */
  statReasons: string[];
}

export interface MetricDescriptor {
  key: keyof TextMetrics;
  label: string;
  short: string;
  description: string;
  /** true — чем больше, тем «лучше» для человеческого дискурса */
  positive?: boolean;
}

// ---------------------------------------------------------------------------
// 2. Языковые маркеры (подсветка)
// ---------------------------------------------------------------------------

export type MarkerType =
  | "template"
  | "cliche"
  | "repeated_syntax"
  | "neutral"
  | "ai_discourse"
  | "human_discourse";

export interface Marker {
  /** Точное словосочетание/фрагмент из текста (для подсветки) */
  text: string;
  type: MarkerType;
  /** Человекочитаемая метка */
  label: string;
  /** Краткое лингвистическое пояснение */
  comment: string;
}

// ---------------------------------------------------------------------------
// 3. Дискурс-анализ
// ---------------------------------------------------------------------------

export interface DiscourseResult {
  communicativeGoal: string;
  discourseType: string;
  speechStrategy: string;
  speechTactic: string;
  targetAudience: string;
  modality: string;
  register: string;
  /** Доп. наблюдения в виде абзацев */
  notes: string[];
}

// ---------------------------------------------------------------------------
// 4. Семиотический анализ (графовая карта)
// ---------------------------------------------------------------------------

export type SemioticNodeType =
  | "concept" // ключевой концепт
  | "sign" // центральный знак
  | "field" // семантическое поле
  | "link"; // концептуальная связь-узел

export interface SemioticNode {
  id: string;
  label: string;
  type: SemioticNodeType;
  weight: number; // 1–10
}

export interface SemioticEdge {
  source: string;
  target: string;
  label: string;
  weight: number; // 1–10
}

export interface SemioticResult {
  nodes: SemioticNode[];
  edges: SemioticEdge[];
  summary: string;
}

// ---------------------------------------------------------------------------
// 5. Сравнение текстов
// ---------------------------------------------------------------------------

export interface ComparisonMetrics {
  /** Сходство дискурса, 0–100 */
  discourseSimilarity: number;
  /** Сходство терминологии, 0–100 */
  terminologySimilarity: number;
  /** Сходство синтаксических моделей, 0–100 */
  syntaxSimilarity: number;
  /** Сходство коммуникативных стратегий, 0–100 */
  strategySimilarity: number;
  /** Метрики первого текста */
  metricsA: TextMetrics;
  /** Метрики второго текста */
  metricsB: TextMetrics;
  /** Текстовое резюме сравнения */
  summary: string;
}

// ---------------------------------------------------------------------------
// 6. Полный результат анализа (для отчётов и истории)
// ---------------------------------------------------------------------------

export interface AnalysisBundle {
  id: string;
  createdAt: number;
  title: string;
  sourceText: string;
  metrics?: TextMetrics;
  authorship?: HybridAuthorship;
  markers?: Marker[];
  discourse?: DiscourseResult;
  semiotic?: SemioticResult;
  comparison?: ComparisonMetrics;
  secondText?: string;
}

// ---------------------------------------------------------------------------
// 7. Ошибка выполнения
// ---------------------------------------------------------------------------

export interface AnalysisError {
  message: string;
  raw?: string;
}
