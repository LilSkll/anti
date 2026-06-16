import { useState } from "react";
import { Menu, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useSettings } from "@/store/useSettings";
import {
  CONFIGURED_PROVIDERS,
  PROVIDERS,
} from "@/store/settingsStore";

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { provider } = useSettings();
  const ready = CONFIGURED_PROVIDERS.length > 0;
  const providerLabel = PROVIDERS[provider]?.label ?? provider;

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 lg:hidden"
              aria-label="Открыть меню"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
              <span>
                Платформа для исследования языковой коммуникации человека и ИИ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={
                  "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:inline-flex " +
                  (ready
                    ? "border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald"
                    : "border-accent-rose/30 bg-accent-rose/10 text-accent-rose")
                }
              >
                {ready ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {ready ? `${providerLabel} · готово` : "API не настроен"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-500">
          <p>
            AI Linguistic Discourse Analyzer · MVP · анализ выполняется локально
            в браузере
          </p>
          <p className="mt-1.5">
            Разработчик:{" "}
            <span className="text-slate-300">Драгунов П. М.</span> · Кафедра
            иностранных языков{" "}
            <span className="text-slate-300">РУДН</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
