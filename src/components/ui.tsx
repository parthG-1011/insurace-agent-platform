import type { ReactNode } from "react";

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: cx(buttonBase, "bg-blue-700 text-white shadow-sm hover:bg-blue-800"),
  secondary: cx(buttonBase, "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"),
  whatsapp: cx(buttonBase, "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"),
  ghost: cx(buttonBase, "text-slate-600 hover:bg-slate-100 hover:text-slate-900"),
};

export const inputStyles =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20";

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
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>{children}</div>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

const tones = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  red: "bg-red-50 text-red-700 ring-red-200",
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
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-700 text-sm font-bold text-white">A</div>
      <span className="text-lg font-semibold tracking-tight">AgentDesk</span>
    </div>
  );
}
