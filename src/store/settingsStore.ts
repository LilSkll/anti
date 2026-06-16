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

// ---------------------------------------------------------------------------
// Маппинг providerId → имя env-переменной
// ---------------------------------------------------------------------------
const ENV_KEY_MAP: Record<ProviderId, string> = {
  openai: "VITE_OPENAI_API_KEY",
  gemini: "VITE_GEMINI_API_KEY",
  groq: "VITE_GROQ_API_KEY",
};

/** Ключи, вшитые при сборке через VITE_* переменные. Не перезаписываются пользователем. */
const ENV_KEYS: Partial<Record<ProviderId, string>> = {};
for (const [p, envVar] of Object.entries(ENV_KEY_MAP)) {
  const val = import.meta.env[envVar as keyof ImportMetaEnv] as string | undefined;
  if (val) ENV_KEYS[p as ProviderId] = val;
}

/** Предустановленный провайдер и модель из env */
const ENV_PROVIDER = (() => {
  const p = import.meta.env.VITE_DEFAULT_PROVIDER as string | undefined;
  if (p && p in PROVIDERS) return p as ProviderId;
  // Если есть ключи в env — выбираем первого провайдера с ключом
  for (const pid of Object.keys(ENV_KEYS) as ProviderId[]) {
    if (ENV_KEYS[pid]) return pid;
  }
  return undefined;
})();

interface SettingsState extends Settings {
  /** Ключи из env — нельзя удалить */
  envKeys: Partial<Record<ProviderId, string>>;
  setProvider: (p: ProviderId) => void;
  setModel: (m: string) => void;
  setApiKey: (p: ProviderId, key: string) => void;
  clearApiKey: (p: ProviderId) => void;
  /** Получить рабочий ключ: сначала localStorage, потом env */
  getEffectiveKey: (p: ProviderId) => string | undefined;
  /** Проверить, что хотя бы один провайдер имеет ключ (localStorage или env) */
  isConfigured: () => boolean;
  /** Источник ключа: 'env' | 'local' | undefined */
  keySource: (p: ProviderId) => "env" | "local" | undefined;
}

function defaultProviderAndModel(): { provider: ProviderId; model: string } {
  if (ENV_PROVIDER) {
    const cfg = PROVIDERS[ENV_PROVIDER];
    const m = import.meta.env.VITE_DEFAULT_MODEL as string | undefined;
    return {
      provider: ENV_PROVIDER,
      model: m && cfg.models.includes(m) ? m : cfg.defaultModel,
    };
  }
  return { provider: "groq", model: PROVIDERS.groq.defaultModel };
}

const defaults = defaultProviderAndModel();

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      provider: defaults.provider,
      model: defaults.model,
      apiKeys: {},
      envKeys: { ...ENV_KEYS },

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
          // Не даём удалить env-ключ
          if (ENV_KEYS[p]) return s;
          const next = { ...s.apiKeys };
          delete next[p];
          return { apiKeys: next };
        }),

      getEffectiveKey: (p) => {
        const { apiKeys } = get();
        return apiKeys[p] || ENV_KEYS[p];
      },

      isConfigured: () => {
        const { provider, apiKeys } = get();
        return Boolean(apiKeys[provider] || ENV_KEYS[provider]);
      },

      keySource: (p) => {
        const { apiKeys } = get();
        if (apiKeys[p]) return "local";
        if (ENV_KEYS[p]) return "env";
        return undefined;
      },
    }),
    { name: "alda-settings" }
  )
);

/** Быстрый доступ к ключам для провайдеров (без React) */
export function getEffectiveApiKey(p: ProviderId): string | undefined {
  return useSettingsStore.getState().getEffectiveKey(p);
}
