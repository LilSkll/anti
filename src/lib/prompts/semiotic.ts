import { SYSTEM_BASE, userWrap } from "./base";
import type { SemioticResult } from "@/types/analysis";

export function buildSemioticPrompt(text: string): {
  system: string;
  user: string;
} {
  const user = `${userWrap(text)}

Проведи семиотический анализ текста. Выдели ключевые знаковые структуры.

Верни JSON строго такой структуры:
{
  "nodes": [
    {
      "id": "n1",
      "label": "название концепта/знака (1–3 слова)",
      "type": "concept | sign | field | link",
      "weight": <1-10>
    }
  ],
  "edges": [
    {
      "source": "n1",
      "target": "n2",
      "label": "тип связи (напр.: входит в, ассоциируется, противопоставлено, метафорически связано)",
      "weight": <1-10>
    }
  ],
  "summary": "краткое резюме семиотической структуры текста (2–4 предложения)"
}

Требования:
- От 6 до 12 узлов (nodes).
- type узла: "concept" — ключевой концепт; "sign" — центральный знак; "field" — семантическое поле (шире); "link" — связующее понятие.
- weight: важность узла/связи в тексте (1–10), ключевые концепты — 8–10.
- id узлов — уникальные строки вида "n1", "n2", ...
- Все source/target в edges обязаны существовать среди nodes.
- От 5 до 15 связей (edges).
- summary — на русском, научным языком.`;
  return { system: SYSTEM_BASE, user };
}

export type { SemioticResult };
