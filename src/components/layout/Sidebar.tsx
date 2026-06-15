import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  FileSearch,
  GitCompareArrows,
  Share2,
  FileText,
  Settings,
  Languages,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  desc: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Главная", icon: Home, desc: "Обзор платформы" },
  {
    to: "/analyze",
    label: "Анализ текста",
    icon: FileSearch,
    desc: "Метрики и маркеры",
  },
  {
    to: "/compare",
    label: "Сравнение текстов",
    icon: GitCompareArrows,
    desc: "Попарное сопоставление",
  },
  {
    to: "/semiotic",
    label: "Семиотический анализ",
    icon: Share2,
    desc: "Графовая карта концептов",
  },
  {
    to: "/reports",
    label: "Отчёты",
    icon: FileText,
    desc: "Научные документы и экспорт",
  },
  {
    to: "/settings",
    label: "Настройки API",
    icon: Settings,
    desc: "Ключи и провайдеры",
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-ink-950/70 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 border-r border-white/10 bg-ink-950/80 backdrop-blur-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="flex items-center justify-between gap-3 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-cyan/30 to-accent-violet/30 ring-1 ring-white/10">
                <Languages className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold text-slate-100">
                  Discourse<span className="text-accent-cyan">AI</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Linguistic Analyzer
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 lg:hidden"
              aria-label="Закрыть меню"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition",
                    active
                      ? "bg-white/[0.06] ring-1 ring-white/10"
                      : "hover:bg-white/[0.04]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1 transition",
                      active
                        ? "bg-gradient-to-br from-accent-cyan/25 to-accent-violet/25 ring-accent-cyan/30 text-accent-cyan"
                        : "bg-white/[0.03] ring-white/10 text-slate-400 group-hover:text-slate-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        active ? "text-slate-100" : "text-slate-300"
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {item.desc}
                    </span>
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse-soft" />
                Клиентский анализ
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                Все вычисления выполняются в браузере. API-ключи хранятся
                локально и не передаются на сервер.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
