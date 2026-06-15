import type { LLMProvider, ChatMessage, ChatOptions } from "./types";

interface OpenAIChoice {
  message?: { content?: string };
}

interface OpenAIResponse {
  choices?: OpenAIChoice[];
  error?: { message?: string };
}

export class OpenAIProvider implements LLMProvider {
  id = "openai";
  constructor(
    private apiKey: string,
    private model: string
  ) {}

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      signal: opts.signal,
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const j = (await res.json()) as OpenAIResponse;
        detail = j.error?.message ?? "";
      } catch {
        /* ignore */
      }
      throw new Error(
        `OpenAI ${res.status}: ${detail || res.statusText}`
      );
    }

    const data = (await res.json()) as OpenAIResponse;
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("OpenAI вернул пустой ответ.");
    return text;
  }
}
