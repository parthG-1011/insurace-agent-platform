"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "./icons";
import { cx } from "./ui";

/** Shared with the blocking script in src/app/layout.tsx — one key, one contract. */
const THEME_KEY = "agentdesk-theme";

type Theme = "light" | "dark";

function readTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  // The boot script has already set the class by the time this runs; read the
  // document rather than storage so the toggle matches what is actually painted.
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex h-9 w-9 items-center justify-center rounded-control border border-line",
        "bg-surface text-fg-muted transition-colors hover:bg-overlay hover:text-fg",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}