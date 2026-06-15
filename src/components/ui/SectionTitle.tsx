import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  icon,
  right,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 ring-1 ring-white/10 text-accent-cyan">
            {icon}
          </span>
        )}
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
