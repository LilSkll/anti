import type { ProviderId, ProviderConfig } from "@/types/analysis";

// ---------------------------------------------------------------------------
// Конфиги провайдеров
// ---------------------------------------------------------------------------
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
// Ключи берутся ТОЛЬКО из env-переменных Vite (задаются в Vercel / .env.local).
// Никакого ручного ввода в UI.
// ---------------------------------------------------------------------------
const ENV_KEY_MAP: Record<ProviderId, string> = {
  openai: "VITE_OPENAI_API_KEY",
  gemini: "VITE_GEMINI_API_KEY",
  groq: "VITE_GROQ_API_KEY",
};

/** Ключи, встроенные при сборке. Read-only. */
export const ENV_KEYS: Partial<Record<ProviderId, string>> = {};
for (const [p, envVar] of Object.entries(ENV_KEY_MAP)) {
  const val = import.meta.env[envVar as keyof ImportMetaEnv] as string | undefined;
  if (val) ENV_KEYS[p as ProviderId] = val;
}

/** Список провайдеров, для которых задан env-ключ */
export const CONFIGURED_PROVIDERS: ProviderId[] = (
  Object.keys(ENV_KEYS) as ProviderId[]
).filter((p) => Boolean(ENV_KEYS[p]));

/** Выбрать провайдера по умолчанию: из env, иначе первый доступный */
function pickDefaultProvider(): ProviderId {
  const fromEnv = import.meta.env.VITE_DEFAULT_PROVIDER as string | undefined;
  if (fromEnv && fromEnv in PROVIDERS && ENV_KEYS[fromEnv as ProviderId]) {
    return fromEnv as ProviderId;
  }
  return CONFIGURED_PROVIDERS[0] ?? "groq";
}

const DEFAULT_PROVIDER = pickDefaultProvider();

function pickDefaultModel(provider: ProviderId): string {
  const fromEnv = import.meta.env.VITE_DEFAULT_MODEL as string | undefined;
  const cfg = PROVIDERS[provider];
  if (fromEnv && cfg.models.includes(fromEnv)) return fromEnv;
  return cfg.defaultModel;
}

/** Получить рабочий ключ для провайдера (только из env) */
export function getApiKey(provider: ProviderId): string | undefined {
  return ENV_KEYS[provider];
}

/** Доступен ли провайдер (есть env-ключ) */
export function isProviderConfigured(provider: ProviderId): boolean {
  return Boolean(ENV_KEYS[provider]);
}

/** Хотя бы один провайдер настроен */
export function hasAnyConfiguredKey(): boolean {
  return CONFIGURED_PROVIDERS.length > 0;
}

// ---------------------------------------------------------------------------
// UI-настройки: выбранный провайдер и модель (только среди доступных).
// Эти настройки сохраняются в localStorage, но не критичны.
// ---------------------------------------------------------------------------
const STORAGE_KEY = "alda-ui-settings";

interface UISettings {
  provider: ProviderId;
  model: string;
}

function loadUISettings(): UISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UISettings>;
      const provider =
        parsed.provider && ENV_KEYS[parsed.provider as ProviderId]
          ? (parsed.provider as ProviderId)
          : DEFAULT_PROVIDER;
      const model =
        parsed.model && PROVIDERS[provider].models.includes(parsed.model)
          ? parsed.model
          : pickDefaultModel(provider);
      return { provider, model };
    }
  } catch {
    /* ignore */
  }
  return {
    provider: DEFAULT_PROVIDER,
    model: pickDefaultModel(DEFAULT_PROVIDER),
  };
}

let uiSettings: UISettings = loadUISettings();

const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uiSettings));
  } catch {
    /* ignore */
  }
}

export const settingsApi = {
  getState: () => uiSettings,
  setProvider: (p: ProviderId) => {
    if (!ENV_KEYS[p]) return; // нельзя выбрать провайдера без ключа
    uiSettings = {
      provider: p,
      model: pickDefaultModel(p),
    };
    persist();
    notify();
  },
  setModel: (m: string) => {
    if (!PROVIDERS[uiSettings.provider].models.includes(m)) return;
    uiSettings = { ...uiSettings, model: m };
    persist();
    notify();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
