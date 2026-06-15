export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  /** Желаемая температура */
  temperature?: number;
  /** Подсказка по токенам ответа (если поддерживается) */
  maxTokens?: number;
  /** Сигнал отмены */
  signal?: AbortSignal;
}

export interface LLMProvider {
  id: string;
  /** Выполнить чат-запрос, вернуть текст ассистента */
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<string>;
}
