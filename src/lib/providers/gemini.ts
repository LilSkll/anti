import type { LLMProvider, ChatMessage, ChatOptions } from "./types";

interface GeminiCandidate {
  content?: { parts?: { text?: string }[] };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
}

export class GeminiProvider implements LLMProvider {
  id = "gemini";
  constructor(
    private apiKey: string,
    private model: string
  ) {}

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
    // Превращаем стандартный chat-формат в формат Gemini generateContent.
    // system-сообщение уходит в systemInstruction, остальное — в contents.
    const systemParts = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: opts.temperature ?? 0.2,
        maxOutputTokens: opts.maxTokens,
        responseMimeType: "application/json",
      },
    };
    if (systemParts) {
      body.systemInstruction = { parts: [{ text: systemParts }] };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: opts.signal,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const j = (await res.json()) as GeminiResponse;
        detail = j.error?.message ?? "";
      } catch {
        /* ignore */
      }
      throw new Error(`Gemini ${res.status}: ${detail || res.statusText}`);
    }

    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      const reason = data.promptFeedback?.blockReason;
      throw new Error(
        reason
          ? `Gemini заблокировал запрос: ${reason}`
          : "Gemini вернул пустой ответ."
      );
    }
    return text;
  }
}
