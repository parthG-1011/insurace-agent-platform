"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type SVGProps } from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/primitives";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, LogOut, Mail, Menu, Plus, Shield, Users, X } from "@/components/icons";
import { cx, Logo } from "./ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers/new", label: "New customer" },
  { href: "/customers", label: "Customers" },
  { href: "/products", label: "Products" },
  { href: "/emails", label: "Email log" },
];

/* Icons sit beside the labels above rather than inside NAV, so the navigation
   table itself stays exactly as it was before the redesign. */
const NAV_ICON: Record<string, (props: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  "/dashboard": LayoutDashboard,
  "/customers/new": Plus,
  "/customers": Users,
  "/products": Shield,
  "/emails": Mail,
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sidebar({
  agentName,
  agentEmail,
  variant,
}: {
  agentName: string;
  agentEmail: string;
  /* `bar` is the phone-width top bar (own row above the content), `column` is
     the desktop sidebar. The layout mounts each; only one is ever visible. */
  variant: "bar" | "column";
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href === "/customers" && /^\/customers\/\d+/.test(pathname));

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Escape closes the drawer and hands focus back to the trigger that opened it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Move focus into the drawer on open and keep Tab inside it while it is open.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // The page behind a full-height drawer must not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const nav = (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = isActive(item.href);
        const Icon = NAV_ICON[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex items-center gap-2.5 rounded-control border-l-2 py-2 pl-3 pr-2 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary-soft text-primary"
                : "border-transparent text-fg-muted hover:bg-overlay hover:text-fg",
            )}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const identity = (
    <>
      <p className="truncate text-sm font-medium text-fg">{agentName}</p>
      <p className="truncate text-xs text-fg-muted">{agentEmail}</p>
      <form action={logoutAction} className="mt-2">
        <Button type="submit" variant="ghost" size="sm" className="w-full justify-start px-2">
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </Button>
      </form>
    </>
  );

  return (
    <>
      {variant === "bar" ? (
        <div className="sticky top-0 z-30 flex h-14 w-full items-center gap-2 border-b border-line bg-surface px-3 lg:hidden">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="app-navigation-drawer"
          className={cx(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-fg-muted transition-colors",
            "hover:bg-overlay hover:text-fg",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          )}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <Logo className="[&>div]:h-7 [&>div]:w-7 [&>div]:text-xs [&>span]:text-base" />
          <ThemeToggle className="ml-auto" />
        </div>
      ) : null}

      {variant === "column" ? (
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
          <Logo className="px-1" />
          <div className="mt-7 flex-1">{nav}</div>
          <div className="border-t border-line pt-3">
            {identity}
            <div className="mt-2">
              <ThemeToggle />
            </div>
          </div>
        </aside>
      ) : null}

      {open ? (
        <>
          {/* A fixed black scrim, not `bg-fg/40`: `fg` flips to a near-white in
              dark mode, which would *lighten* the page behind the drawer and
              invert the modal hierarchy. Black dims in both themes. */}
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={close} aria-hidden />
          <div
            ref={panelRef}
            id="app-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-line bg-surface lg:hidden"
          >
            <div className="flex items-start justify-between gap-2 px-4 py-4">
              <Logo className="px-0" />
              <button
                type="button"
                onClick={() => {
                  close();
                  triggerRef.current?.focus();
                }}
                aria-label="Close navigation"
                className={cx(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-fg-muted transition-colors",
                  "hover:bg-overlay hover:text-fg",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                )}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3">{nav}</div>
            <div className="border-t border-line px-4 py-3">{identity}</div>
          </div>
        </>
      ) : null}
    </>
  );
}