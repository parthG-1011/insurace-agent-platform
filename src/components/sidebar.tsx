"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { cx, Logo } from "./ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers/new", label: "New customer" },
  { href: "/customers", label: "Customers" },
  { href: "/products", label: "Products" },
  { href: "/emails", label: "Email log" },
];

export function Sidebar({ agentName, agentEmail }: { agentName: string; agentEmail: string }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href === "/customers" && /^\/customers\/\d+/.test(pathname));

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-6">
      <Logo className="px-2" />
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              "rounded-lg px-3 py-2 text-sm font-medium",
              isActive(item.href) ? "bg-accent-tint text-accent-ink" : "text-ink-muted hover:bg-elevated hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-line px-2 pt-4">
        <p className="truncate text-sm font-medium text-ink">{agentName}</p>
        <p className="truncate text-xs text-ink-muted">{agentEmail}</p>
        <form action={logoutAction}>
          <button type="submit" className="mt-3 text-sm font-medium text-ink-muted hover:text-ink">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
