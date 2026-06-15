import { SYSTEM_BASE } from "./base";
import type { ComparisonMetrics, TextMetrics } from "@/types/analysis";

export function buildComparisonPrompt(textA: string, textB: string): {
  system: string;
  user: string;
} {
  const user = `Сравни два текста с точки зрения лингвистики и дискурса.

ТЕКСТ A:
"""
${textA}
"""

ТЕКСТ B:
"""
${textB}
"""

Шаг 1. Для КАЖДОГО текста определи метрики (целые числа 0–100): humanProbability, aiProbability, formality, emotionality, repetitiveness, cohesion, coherence, terminologyDensity, argumentationDensity.

Шаг 2. Оцени сходство текстов по четырём измерениям (целые числа 0–100, где 100 — полное сходство):
- discourseSimilarity
- terminologySimilarity
- syntaxSimilarity
- strategySimilarity

Шаг 3. Дай краткое резюме сравнения (2–4 предложения).

Верни JSON строго такой структуры:
{
  "discourseSimilarity": <0-100>,
  "terminologySimilarity": <0-100>,
  "syntaxSimilarity": <0-100>,
  "strategySimilarity": <0-100>,
  "metricsA": { "humanProbability": 0, "aiProbability": 0, "formality": 0, "emotionality": 0, "repetitiveness": 0, "cohesion": 0, "coherence": 0, "terminologyDensity": 0, "argumentationDensity": 0 },
  "metricsB": { "humanProbability": 0, "aiProbability": 0, "formality": 0, "emotionality": 0, "repetitiveness": 0, "cohesion": 0, "coherence": 0, "terminologyDensity": 0, "argumentationDensity": 0 },
  "summary": "..."
}`;
  return { system: SYSTEM_BASE, user };
}

export type { ComparisonMetrics, TextMetrics };
