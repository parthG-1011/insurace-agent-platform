"use client";

import { useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/app/(app)/customers/[id]/actions";
import { Button, type ButtonVariant, type ButtonSize } from "./primitives";
import { cx } from "./ui";

export function ActionButton({
  action,
  children,
  pendingLabel = "Working…",
  variant = "secondary",
  size = "md",
  className,
}: {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={pending}
      aria-busy={pending}
      className={className}
      onClick={() =>
        startTransition(async () => {
          const result = await action();
          if (!result.ok) toast.error(result.error);
          else if (result.message) toast.success(result.message);
        })
      }
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}

/* The anchor below cannot be a `<Button>` (it has to be a real link for
   right-click, middle-click and the browser status bar), so the two anchor
   treatments are composed from the same tokens as the button variants. */
const controlBase = cx(
  "inline-flex h-9.5 items-center justify-center gap-2 rounded-control px-3.5 text-sm font-medium transition-colors",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
);

const whatsappLink = cx(controlBase, "bg-success text-white hover:brightness-95");
const ghostButton = cx(controlBase, "text-fg-muted hover:bg-overlay hover:text-fg");

/** Opens WhatsApp synchronously (so popup blockers allow it), then records the share. */
export function WhatsAppButton({
  href,
  onShare,
  children,
}: {
  href: string;
  onShare?: () => Promise<ActionResult>;
  children: ReactNode;
}) {
  const [, startTransition] = useTransition();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={whatsappLink}
      onClick={() => onShare && startTransition(async () => void (await onShare()))}
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}

export function CopyButton({ value, label = "Copy link" }: { value: string; label?: string }) {
  return (
    <button
      type="button"
      className={ghostButton}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard");
      }}
    >
      {label}
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2S21.8 6.6 21.8 12 17.4 21.8 12 21.8zM12 .1C5.4.1.1 5.4.1 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 11.9-5.3 11.9-11.9S18.6.1 12 .1z" />
    </svg>
  );
}
