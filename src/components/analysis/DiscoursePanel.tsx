import {
  Target,
  Users,
  Speech,
  Compass,
  Gauge,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import type { DiscourseResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface DiscoursePanelProps {
  discourse: DiscourseResult;
}

const FIELDS: Array<{
  key: keyof DiscourseResult;
  label: string;
  icon: typeof Target;
  tone: string;
}> = [
  {
    key: "communicativeGoal",
    label: "Коммуникативная цель",
    icon: Target,
    tone: "text-accent-cyan",
  },
  {
    key: "discourseType",
    label: "Тип дискурса",
    icon: BookOpen,
    tone: "text-accent-violet",
  },
  {
    key: "speechStrategy",
    label: "Речевая стратегия",
    icon: Compass,
    tone: "text-accent-emerald",
  },
  {
    key: "speechTactic",
    label: "Речевая тактика",
    icon: Speech,
    tone: "text-accent-amber",
  },
  {
    key: "targetAudience",
    label: "Предполагаемая аудитория",
    icon: Users,
    tone: "text-accent-sky",
  },
  {
    key: "modality",
    label: "Модальность",
    icon: Gauge,
    tone: "text-accent-rose",
  },
  {
    key: "register",
    label: "Регистр общения",
    icon: BookOpen,
    tone: "text-accent-cyan",
  },
];

export function DiscoursePanel({ discourse }: DiscoursePanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const Icon = f.icon;
          const value = discourse[f.key] as string;
          return (
            <div
              key={f.key}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", f.tone)} />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {f.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                {value || "—"}
              </p>
            </div>
          );
        })}
      </div>

      {discourse.notes.length > 0 && (
        <div className="rounded-xl border border-accent-violet/20 bg-accent-violet/[0.05] p-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent-violet" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent-violet">
              Дополнительные наблюдения
            </span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {discourse.notes.map((n, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm leading-relaxed text-slate-300"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-violet" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
