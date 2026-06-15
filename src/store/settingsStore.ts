import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProviderId, ProviderConfig, Settings } from "@/types/analysis";

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
    defaultModel: "gpt-4o-mini",
    hint: "Ключ вида sk-... · https://platform.openai.com/api-keys",
  },
  gemini: {
    id: "gemini",
    label: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    defaultModel: "gemini-2.0-flash",
    hint: "AIza... · https://aistudio.google.com/app/apikey",
  },
  groq: {
    id: "groq",
    label: "GroqCloud",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "openai/gpt-oss-120b",
    ],
    defaultModel: "llama-3.3-70b-versatile",
    hint: "gsk_... · https://console.groq.com/keys",
  },
};

interface SettingsState extends Settings {
  setProvider: (p: ProviderId) => void;
  setModel: (m: string) => void;
  setApiKey: (p: ProviderId, key: string) => void;
  clearApiKey: (p: ProviderId) => void;
  isConfigured: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      provider: "openai",
      model: PROVIDERS.openai.defaultModel,
      apiKeys: {},

      setProvider: (p) =>
        set({
          provider: p,
          model: PROVIDERS[p].defaultModel,
        }),
      setModel: (m) => set({ model: m }),
      setApiKey: (p, key) =>
        set((s) => ({ apiKeys: { ...s.apiKeys, [p]: key } })),
      clearApiKey: (p) =>
        set((s) => {
          const next = { ...s.apiKeys };
          delete next[p];
          return { apiKeys: next };
        }),
      isConfigured: () => {
        const { provider, apiKeys } = get();
        return Boolean(apiKeys[provider]);
      },
    }),
    { name: "alda-settings" }
  )
);
