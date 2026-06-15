import { Link } from "react-router-dom";
import {
  FileSearch,
  GitCompareArrows,
  Share2,
  FileText,
  ArrowRight,
  Brain,
  Languages,
  ShieldCheck,
  Sparkles,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useSettingsStore } from "@/store/settingsStore";
import { useAnalysisStore } from "@/store/analysisStore";

const MODULES = [
  {
    to: "/analyze",
    icon: FileSearch,
    title: "Анализ текста",
    desc: "Количественные метрики: формальность, эмоциональность, когезия, когерентность, терминология, аргументация и вероятности авторства.",
    tone: "from-accent-cyan/20 to-accent-sky/10",
  },
  {
    to: "/compare",
    icon: GitCompareArrows,
    title: "Сравнение текстов",
    desc: "Попарное сопоставление дискурса, терминологии, синтаксиса и коммуникативных стратегий с сравнительными графиками.",
    tone: "from-accent-violet/20 to-accent-cyan/10",
  },
  {
    to: "/semiotic",
    icon: Share2,
    title: "Семиотический анализ",
    desc: "Ключевые концепты, центральные знаки и семантические поля в виде интерактивной графовой карты связей.",
    tone: "from-accent-emerald/20 to-accent-cyan/10",
  },
  {
    to: "/reports",
    icon: FileText,
    title: "Научные отчёты",
    desc: "Автоматическое формирование структурированного научного отчёта с экспортом в PDF и DOCX.",
    tone: "from-accent-amber/20 to-accent-rose/10",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Дискурс-анализ",
    text: "Коммуникативная цель, тип дискурса, речевая стратегия и тактика, предполагаемая аудитория.",
  },
  {
    icon: Languages,
    title: "Языковые маркеры",
    text: "Подсветка шаблонных конструкций, клише, повторов и признаков машинного / человеческого дискурса.",
  },
  {
    icon: Activity,
    title: "Визуализация",
    text: "Радар-диаграммы, кольцевые метрики, сравнительные бары и графовая карта концептов.",
  },
  {
    icon: ShieldCheck,
    title: "Приватность",
    text: "Все вычисления в браузере. API-ключи хранятся локально и не покидают ваше устройство.",
  },
];

export function Home() {
  const hasKey = useSettingsStore((s) => Boolean(s.apiKeys[s.provider]));
  const historyCount = useAnalysisStore((s) => s.history.length);

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-hero-grid [background-size:48px_48px]">
        <div className="absolute inset-0 bg-grid-glow" />
        <div className="relative px-6 py-14 sm:px-12 sm:py-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill">
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
              MVP · Лингвистическая платформа
            </span>
            <span className="pill">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse-soft" />
              100% клиентский анализ
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
            AI Linguistic{" "}
            <span className="text-gradient">Discourse Analyzer</span>
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
            Платформа для исследования языковой коммуникации человека и
            искусственного интеллекта на основе методов лингвистики,
            дискурс-анализа и семиотики.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={hasKey ? "/analyze" : "/settings"} className="btn-primary">
              {hasKey ? "Начать анализ" : "Подключить API"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/compare" className="btn-ghost">
              <GitCompareArrows className="h-4 w-4" />
              Сравнить тексты
            </Link>
          </div>

          {/* stats */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Метрик анализа", value: "9" },
              { label: "Типов маркеров", value: "6" },
              { label: "Провайдеров LLM", value: "3" },
              { label: "Анализов в истории", value: String(historyCount) },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="font-mono text-2xl font-bold text-gradient">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">
              Модули анализа
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Четыре независимых направления лингвистического исследования
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.to} to={m.to} className="group block">
                <Card className="relative h-full overflow-hidden transition group-hover:border-white/20 group-hover:bg-white/[0.05]">
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${m.tone} blur-2xl`}
                  />
                  <div className="relative flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] text-accent-cyan ring-1 ring-white/10">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-slate-100">
                          {m.title}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-accent-cyan" />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-100">
            Научная достоверность
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Методологическая база — лингвистика, прагматика и семиотика
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="h-full">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-cyan/10 text-accent-cyan ring-1 ring-accent-cyan/20">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-100">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {f.text}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      {!hasKey && (
        <section>
          <Card className="flex flex-col items-start gap-4 bg-gradient-to-r from-accent-cyan/[0.06] to-accent-violet/[0.06] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Подключите LLM-провайдера
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                OpenAI, Google Gemini или GroqCloud. Ключ хранится только в
                вашем браузере.
              </p>
            </div>
            <Link to="/settings" className="btn-primary">
              Открыть настройки
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </section>
      )}
    </div>
  );
}
