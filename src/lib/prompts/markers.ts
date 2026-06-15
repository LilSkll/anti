import { SYSTEM_BASE, userWrap } from "./base";
import type { Marker, MarkerType } from "@/types/analysis";

export interface MarkersPromptSchema {
  markers: Array<{
    text: string;
    type: MarkerType;
    label: string;
    comment: string;
  }>;
}

export function buildMarkersPrompt(text: string): { system: string; user: string } {
  const user = `${userWrap(text)}

Выдели в тексте языковые маркеры. Для каждого маркера укажи:
- "text": ТОЧНАЯ подстрока из исходного текста (для подсветки). Бери конкретные слова/фразы, а не целые предложения. Длина 2–8 слов.
- "type": одна из категорий:
    "template"            — шаблонные конструкции (типичны для LLM);
    "cliche"              — речевые клише и штампы;
    "repeated_syntax"     — повторяющиеся синтаксические модели;
    "neutral"             — чрезмерно нейтральные, обезличенные формулировки;
    "ai_discourse"        — комплексные признаки машинного дискурса;
    "human_discourse"     — признаки человеческого дискурса (экспрессия, метафора, позиция).
- "label": короткая метка (1–4 слова).
- "comment": лингвистическое пояснение (1 предложение).

Найди от 4 до 14 маркеров, выбирая наиболее показательные.

Верни JSON строго такой структуры:
{
  "markers": [
    { "text": "...", "type": "cliche", "label": "...", "comment": "..." }
  ]
}

ВАЖНО: поле "text" обязано быть дословной подстрокой исходного текста, иначе подсветка не сработает.`;
  return { system: SYSTEM_BASE, user };
}

export type { Marker };
