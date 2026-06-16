import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Server,
  Lock,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, Button, Badge } from "@/components/ui/Card";
import {
  useSettingsStore,
  PROVIDERS,
} from "@/store/settingsStore";
import type { ProviderId } from "@/types/analysis";
import { cn } from "@/lib/utils";

const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

export function Settings() {
  const navigate = useNavigate();
  const provider = useSettingsStore((s) => s.provider);
  const model = useSettingsStore((s) => s.model);
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const envKeys = useSettingsStore((s) => s.envKeys);
  const setProvider = useSettingsStore((s) => s.setProvider);
  const setModel = useSettingsStore((s) => s.setModel);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const clearApiKey = useSettingsStore((s) => s.clearApiKey);

  const [draftKeys, setDraftKeys] = useState<Record<string, string>>(
    () => Object.fromEntries(PROVIDER_IDS.map((p) => [p, apiKeys[p] ?? ""]))
  );
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const activeConfig = PROVIDERS[provider];
  const activeEnvKey = envKeys[provider];
  const activeLocalKey = apiKeys[provider];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionTitle
        title="Настройки API"
        subtitle="Провайдеры, модели и ключи — env-переменные или ручной ввод"
        icon={<SettingsIcon className="h-5 w-5" />}
      />

      {/* Выбор провайдера */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Активный провайдер
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PROVIDER_IDS.map((p) => {
            const cfg = PROVIDERS[p];
            const active = provider === p;
            const hasEnv = Boolean(envKeys[p]);
            const hasLocal = Boolean(apiKeys[p]);
            const configured = hasEnv || hasLocal;
            return (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  active
                    ? "border-accent-cyan/50 bg-accent-cyan/[0.06] shadow-glow"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-100">
                    {cfg.label}
                  </span>
                  {active && (
                    <Badge tone="cyan">
                      <Check className="h-3 w-3" />
                      выбран
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      configured ? "bg-accent-emerald" : "bg-slate-600"
                    )}
                  />
                  <span className="text-xs text-slate-400">
                    {hasEnv ? "ключ из env" : hasLocal ? "ключ задан" : "ключ не задан"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Ключ активного провайдера */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Ключ API — {activeConfig.label}
          </h3>
          {activeLocalKey && !activeEnvKey && (
            <Button
              variant="ghost"
              className="px-3 py-1.5 text-xs"
              onClick={() => {
                clearApiKey(provider);
                setDraftKeys((d) => ({ ...d, [provider]: "" }));
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить
            </Button>
          )}
        </div>
        <p className="mb-3 text-xs text-slate-500">{activeConfig.hint}</p>

        {/* Env key banner */}
        {activeEnvKey && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.06] px-4 py-3">
            <Server className="h-4 w-4 shrink-0 text-accent-cyan" />
            <div>
              <div className="text-xs font-medium text-accent-cyan">
                Ключ из environment variable
              </div>
              <div className="text-[11px] text-slate-400">
                Предустановлен через Vercel / .env.local ·{" "}
                <code className="font-mono text-slate-300">
                  VITE_{provider.toUpperCase()}_API_KEY
                </code>
                · удалять нельзя
              </div>
            </div>
            <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-500" />
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type={visible[provider] ? "text" : "password"}
              value={activeEnvKey ? "••••••••••••••••••••••" : draftKeys[provider]}
              onChange={(e) => {
                if (activeEnvKey) return; // env-ключ нельзя редактировать
                setDraftKeys((d) => ({
                  ...d,
                  [provider]: e.target.value,
                }));
              }}
              placeholder={
                activeEnvKey
                  ? "Ключ предустановлен из env"
                  : `Вставьте ключ ${activeConfig.label}`
              }
              className="input-base pl-9 pr-10 font-mono disabled:opacity-60"
              autoComplete="off"
              spellCheck={false}
              disabled={!!activeEnvKey}
            />
            <button
              type="button"
              onClick={() =>
                setVisible((v) => ({ ...v, [provider]: !v[provider] }))
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label="Показать/скрыть"
            >
              {visible[provider] ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {!activeEnvKey && (
            <Button
              onClick={() => setApiKey(provider, draftKeys[provider].trim())}
              disabled={!draftKeys[provider].trim()}
            >
              <Check className="h-4 w-4" />
              Сохранить
            </Button>
          )}
        </div>
      </Card>

      {/* Выбор модели */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-200">
          Модель — {activeConfig.label}
        </h3>
        <div className="flex flex-wrap gap-2">
          {activeConfig.models.map((m) => {
            const active = model === m;
            return (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 font-mono text-xs transition",
                  active
                    ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan"
                    : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]"
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Privacy note */}
      <Card className="flex items-start gap-3 border-accent-emerald/20 bg-accent-emerald/[0.04]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-emerald" />
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Конфиденциальность
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Ключи из env-переменных встроены в сборку и доступны на всех устройствах.
            Локальные ключи хранятся в <code>localStorage</code> браузера.
            Текст запроса отправляется напрямую выбранному провайдеру LLM по HTTPS.
            Никакой промежуточный сервер не используется.
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => navigate("/analyze")}>
          Перейти к анализу
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
