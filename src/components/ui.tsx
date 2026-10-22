import type { ReactNode } from "react";

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

/*
 * Back-compat layer. These exports are imported by every existing screen and
 * are the migration surface for the subcards that follow: the new system lives
 * in `primitives.tsx`, and each screen moves onto it as it is redesigned. Until
 * then every name below must keep working exactly as it did, now expressed on
 * the tokens in `src/app/globals.css`.
 */

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-control px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const buttonStyles = {
  primary: cx(buttonBase, "bg-primary text-primary-fg hover:bg-primary-hover"),
  secondary: cx(buttonBase, "border border-line-strong bg-surface text-fg hover:bg-overlay"),
  whatsapp: cx(buttonBase, "bg-success text-white hover:brightness-95"),
  ghost: cx(buttonBase, "text-fg-muted hover:bg-overlay hover:text-fg"),
};

export const inputStyles =
  "block w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/**
 * The error and hint ids are the anchor for a form's accessibility wiring: a
 * field passes `aria-describedby={error ? `${name}-error` : `${name}-hint`}` to
 * its control, so the reason a value was rejected is announced on focus rather
 * than only being visible next to it. Only one of the two is ever rendered, so
 * the describedby target always exists.
 */
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
      <label htmlFor={name} className="block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-card border border-line bg-surface", className)}>{children}</div>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/*
 * The legacy tone keys are kept exactly as callers pass them today (several
 * screens pass `blue` / `emerald`); only the colours move onto the tokens.
 */
const tones = {
  slate: "bg-overlay text-fg-muted border-line",
  blue: "bg-primary-soft text-primary border-primary/25",
  amber: "bg-warning/10 text-warning border-warning/25",
  emerald: "bg-success/10 text-success border-success/25",
  violet: "bg-info/10 text-info border-info/25",
  red: "bg-danger/10 text-danger border-danger/25",
};

export function Badge({ children, tone = "slate", className }: { children: ReactNode; tone?: keyof typeof tones; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cx("flex items-center gap-2", className)}>
      <div className="grid h-8 w-8 place-items-center rounded-control bg-primary text-sm font-bold text-primary-fg">
        A
      </div>
      {/* Colour is inherited on purpose: the auth panel renders this on navy and
          overrides it, while the light canvas picks up `text-fg` from body. */}
      <span className="text-lg font-semibold tracking-tight">AgentDesk</span>
    </div>
  );
}