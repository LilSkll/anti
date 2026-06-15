import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, ...props }: CardProps) {
  return (
    <div
      className={cn("card p-5", glow && "shadow-glow", className)}
      {...props}
    />
  );
}

interface BadgeProps {
  children: React.ReactNode;
  tone?: "cyan" | "violet" | "emerald" | "amber" | "rose" | "sky" | "slate";
  className?: string;
}

const TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  cyan: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
  violet: "border-accent-violet/30 bg-accent-violet/10 text-accent-violet",
  emerald:
    "border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald",
  amber: "border-accent-amber/30 bg-accent-amber/10 text-accent-amber",
  rose: "border-accent-rose/30 bg-accent-rose/10 text-accent-rose",
  sky: "border-accent-sky/30 bg-accent-sky/10 text-accent-sky",
  slate: "border-white/10 bg-white/[0.04] text-slate-300",
};

export function Badge({ children, tone = "slate", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Loader({ label = "Анализ выполняется…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <span className="relative flex h-5 w-5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan/40" />
        <span className="relative inline-flex h-5 w-5 rounded-full border-2 border-accent-cyan/60 border-t-transparent animate-spin" />
      </span>
      {label}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        variant === "primary" ? "btn-primary" : "btn-ghost",
        className
      )}
      {...props}
    />
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent-cyan/15 to-accent-violet/15 text-accent-cyan ring-1 ring-white/10">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-slate-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
