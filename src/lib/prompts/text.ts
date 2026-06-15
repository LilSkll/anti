import { SYSTEM_BASE, userWrap } from "./base";

export interface MetricsPromptSchema {
  humanProbability: number;
  aiProbability: number;
  formality: number;
  emotionality: number;
  repetitiveness: number;
  cohesion: number;
  coherence: number;
  terminologyDensity: number;
  argumentationDensity: number;
}

export function buildMetricsPrompt(text: string): { system: string; user: string } {
  const user = `${userWrap(text)}

Определи количественные лингвистические метрики. Каждая метрика — целое число 0–100.
Учитывай, что humanProbability + aiProbability в сумме должны давать около 100 (но это не жёсткое ограничение, если есть смешанный стиль).

Верни JSON строго такой структуры:
{
  "humanProbability": <0-100> ,
  "aiProbability": <0-100>,
  "formality": <0-100>,
  "emotionality": <0-100>,
  "repetitiveness": <0-100>,
  "cohesion": <0-100>,
  "coherence": <0-100>,
  "terminologyDensity": <0-100>,
  "argumentationDensity": <0-100>
}

Определения:
- humanProbability — вероятность, что текст написал человек (естественные маркеры, нетривиальность, личная позиция, экспрессия).
- aiProbability — вероятность генерации нейросетью (шаблонность, сглаженность, повторы, гиперкорректность).
- formality — степень официальности регистра.
- emotionality — доля экспрессивной и оценочной лексики.
- repetitiveness — насколько повторяются одни и те же синтаксические конструкции.
- cohesion — лексико-грамматическая связность (местоимения, союзы, повторы-связки).
- coherence — смысловая цельность и логическая связность.
- terminologyDensity — насыщенность терминологией.
- argumentationDensity — плотность аргументативных структур.`;
  return { system: SYSTEM_BASE, user };
}
