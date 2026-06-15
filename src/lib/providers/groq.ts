import type { LLMProvider, ChatMessage, ChatOptions } from "./types";

interface GroqChoice {
  message?: { content?: string };
}

interface GroqResponse {
  choices?: GroqChoice[];
  error?: { message?: string };
}

/**
 * GroqCloud — OpenAI-совместимый API.
 * Поддерживает response_format для строгого JSON.
 */
export class GroqProvider implements LLMProvider {
  id = "groq";
  constructor(
    private apiKey: string,
    private model: string
  ) {}

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens,
    };
    // Не все модели Groq поддерживают json_object — включаем мягко
    body.response_format = { type: "json_object" };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      signal: opts.signal,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const j = (await res.json()) as GroqResponse;
        detail = j.error?.message ?? "";
      } catch {
        /* ignore */
      }
      throw new Error(`Groq ${res.status}: ${detail || res.statusText}`);
    }

    const data = (await res.json()) as GroqResponse;
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("Groq вернул пустой ответ.");
    return text;
  }
}
