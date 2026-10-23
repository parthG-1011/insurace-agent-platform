import type { ReactNode } from "react";

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: cx(buttonBase, "bg-accent text-white shadow-sm hover:bg-accent-hover"),
  secondary: cx(buttonBase, "border border-line bg-elevated text-ink hover:bg-line-soft"),
  whatsapp: cx(buttonBase, "bg-success text-white shadow-sm hover:bg-success/90"),
  ghost: cx(buttonBase, "text-ink-muted hover:bg-elevated hover:text-ink"),
};

export const inputStyles =
  "block w-full rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-ink-strong">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-danger-ink">{error}</p> : hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-xl border border-line bg-surface shadow-sm shadow-black/30", className)}>{children}</div>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

const tones = {
  slate: "bg-neutral-tint text-ink-muted ring-line",
  blue: "bg-accent-tint text-accent-ink ring-accent/30",
  amber: "bg-warning-tint text-warning-ink ring-warning/30",
  emerald: "bg-success-tint text-success-ink ring-success/30",
  violet: "bg-accent-tint text-accent-ink ring-accent/30",
  red: "bg-danger-tint text-danger-ink ring-danger/30",
};

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: keyof typeof tones }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>
      {children}
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cx("flex items-center gap-2", className)}>
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white">A</div>
      <span className="text-lg font-semibold tracking-tight">AgentDesk</span>
    </div>
  );
}
