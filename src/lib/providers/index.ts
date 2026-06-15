import type { LLMProvider } from "./types";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import { useSettingsStore } from "@/store/settingsStore";
import type { ProviderId } from "@/types/analysis";

export type { LLMProvider, ChatMessage, ChatOptions } from "./types";

export class NotConfiguredError extends Error {
  constructor(provider: string) {
    super(
      `Не задан API-ключ для провайдера «${provider}». Откройте раздел «Настройки API».`
    );
    this.name = "NotConfiguredError";
  }
}

/** Создать провайдера по текущим настройкам */
export function getProvider(): LLMProvider {
  const { provider, model, apiKeys } = useSettingsStore.getState();
  const key = apiKeys[provider];
  if (!key) throw new NotConfiguredError(provider);

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

export { OpenAIProvider, GeminiProvider, GroqProvider };
