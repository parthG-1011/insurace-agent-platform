import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cx } from "./ui";

/**
 * The shared design system. Every screen is built from these on top of the
 * tokens in `src/app/globals.css` — no screen should reach for a raw colour
 * literal or invent its own card/button look.
 */

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger";
export type ButtonSize = "sm" | "md";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover",
  secondary: "border border-line-strong bg-surface text-fg hover:bg-overlay",
  ghost: "text-fg-muted hover:bg-overlay hover:text-fg",
  accent: "bg-accent text-white hover:brightness-95",
  danger: "bg-danger text-white hover:brightness-95",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9.5 px-3.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        focusRing,
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

const controlBase = cx(
  "block w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-sm text-fg",
  "placeholder:text-fg-subtle",
  focusRing,
  "focus:border-primary",
  "aria-[invalid=true]:border-danger",
);

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(controlBase, className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(controlBase, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-overlay text-fg-muted border-line",
  primary: "bg-primary-soft text-primary border-primary/25",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning border-warning/25",
  danger: "bg-danger/10 text-danger border-danger/25",
  info: "bg-info/10 text-info border-info/25",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-xs font-medium",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Subtle borders instead of heavy shadows — the story brief is explicit. */
export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-card border border-line bg-surface", className)}>{children}</div>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      {icon ? <div className="text-fg-subtle [&>svg]:h-7 [&>svg]:w-7">{icon}</div> : null}
      <div className="space-y-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        {description ? <p className="mx-auto max-w-sm text-sm text-fg-muted">{description}</p> : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

/** The single deliberate motion in the product: one subtle pulse, not a cascade. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx("animate-pulse rounded-control bg-overlay", className)} />;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-card border border-danger/30 bg-danger/5 px-6 py-10 text-center"
    >
      <p className="text-sm font-medium text-danger">{title}</p>
      {description ? <p className="max-w-sm text-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cx("h-4 w-4 animate-spin text-current", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} opacity={0.25} />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}