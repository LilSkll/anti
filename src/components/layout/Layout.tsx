import { useState } from "react";
import { Menu, Github, Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useSettingsStore } from "@/store/settingsStore";

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const provider = useSettingsStore((s) => s.provider);
  const hasKey = useSettingsStore((s) => Boolean(s.apiKeys[s.provider]));

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
                  (hasKey
                    ? "border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald"
                    : "border-accent-amber/30 bg-accent-amber/10 text-accent-amber")
                }
              >
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full " +
                    (hasKey ? "bg-accent-emerald" : "bg-accent-amber")
                  }
                />
                {hasKey ? `${provider} подключён` : "API-ключ не задан"}
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:text-slate-200"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-500">
          AI Linguistic Discourse Analyzer · MVP · анализ выполняется локально
          в браузере
        </footer>
      </div>
    </div>
  );
}
