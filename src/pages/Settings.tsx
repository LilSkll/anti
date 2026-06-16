import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Check,
  ArrowRight,
  Server,
  Cpu,
  Info,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, Button, Badge } from "@/components/ui/Card";
import {
  PROVIDERS,
  CONFIGURED_PROVIDERS,
  isProviderConfigured,
  settingsApi,
} from "@/store/settingsStore";
import { useSettings } from "@/store/useSettings";
import type { ProviderId } from "@/types/analysis";
import { cn } from "@/lib/utils";

const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

export function Settings() {
  const navigate = useNavigate();
  const { provider, model } = useSettings();
  const activeConfig = PROVIDERS[provider];

  const setProvider = (p: ProviderId) => settingsApi.setProvider(p);
  const setModel = (m: string) => settingsApi.setModel(m);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionTitle
        title="Настройки"
        subtitle="Провайдер и модель LLM. Ключи предустановлены на сервере"
        icon={<SettingsIcon className="h-5 w-5" />}
      />

      {/* Глобальный статус */}
      <Card
        className={cn(
          "flex items-start gap-3",
          CONFIGURED_PROVIDERS.length > 0
            ? "border-accent-emerald/20 bg-accent-emerald/[0.04]"
            : "border-accent-rose/30 bg-accent-rose/[0.05]"
        )}
      >
        <Server
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            CONFIGURED_PROVIDERS.length > 0
              ? "text-accent-emerald"
              : "text-accent-rose"
          )}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-100">
            {CONFIGURED_PROVIDERS.length > 0
              ? "Подключено провайдеров: " + CONFIGURED_PROVIDERS.length
              : "Провайдеры не настроены"}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {CONFIGURED_PROVIDERS.length > 0
              ? "API-ключи встроены в сборку через переменные окружения Vercel и работают на всех устройствах. Вам не нужно ничего вводить вручную."
              : "Администратору нужно добавить переменные окружения (например, VITE_GROQ_API_KEY) в настройках проекта на Vercel."}
          </p>
          {CONFIGURED_PROVIDERS.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {CONFIGURED_PROVIDERS.map((p) => (
                <Badge key={p} tone="emerald">
                  <Check className="h-3 w-3" />
                  {PROVIDERS[p].label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Выбор провайдера */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Активный провайдер
          </h3>
          <span className="text-xs text-slate-500">
            доступны только с заданными ключами
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PROVIDER_IDS.map((p) => {
            const cfg = PROVIDERS[p];
            const active = provider === p;
            const configured = isProviderConfigured(p);
            return (
              <button
                key={p}
                onClick={() => configured && setProvider(p)}
                disabled={!configured}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  !configured && "cursor-not-allowed opacity-40",
                  active
                    ? "border-accent-cyan/50 bg-accent-cyan/[0.06] shadow-glow"
                    : configured
                      ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                      : "border-white/5 bg-white/[0.01]"
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
                    {configured ? "ключ подключён" : "ключ не задан"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Выбор модели */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-accent-cyan" />
            <h3 className="text-sm font-semibold text-slate-200">
              Модель — {activeConfig.label}
            </h3>
          </div>
        </div>
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

      {/* Инфо-блок о том, как это работает */}
      <Card className="flex items-start gap-3 border-accent-violet/20 bg-accent-violet/[0.04]">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-violet" />
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Как это работает?
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            API-ключи добавляются администратором в{" "}
            <strong>переменные окружения</strong> проекта на Vercel
            (VITE_GROQ_API_KEY, VITE_OPENAI_API_KEY, VITE_GEMINI_API_KEY).
            Они встраиваются в сборку и доступны всем пользователям сразу —
            без ручного ввода. Пользователь может только переключать доступные
            провайдеры и модели.
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
