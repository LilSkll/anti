import type { LLMProvider } from "./types";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import {
  settingsApi,
  getApiKey,
  isProviderConfigured,
  hasAnyConfiguredKey,
} from "@/store/settingsStore";
import type { ProviderId } from "@/types/analysis";

export type { LLMProvider, ChatMessage, ChatOptions } from "./types";

export class NotConfiguredError extends Error {
  constructor() {
    super(
      "API-ключи не заданы. Администратор должен добавить VITE_*_API_KEY в переменные окружения Vercel."
    );
    this.name = "NotConfiguredError";
  }
}

/** Создать провайдера по текущим настройкам */
export function getProvider(): LLMProvider {
  const { provider, model } = settingsApi.getState();
  const key = getApiKey(provider);
  if (!key) throw new NotConfiguredError();

  switch (provider as ProviderId) {
    case "openai":
      return new OpenAIProvider(key, model);
    case "gemini":
      return new GeminiProvider(key, model);
    case "groq":
      return new GroqProvider(key, model);
    default:
      throw new Error(`Неизвестный провайдер: ${provider}`);
  }
}

export { isProviderConfigured, hasAnyConfiguredKey };
export { OpenAIProvider, GeminiProvider, GroqProvider };
