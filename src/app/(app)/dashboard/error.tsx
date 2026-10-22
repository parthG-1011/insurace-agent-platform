"use client";

import { AlertCircle } from "@/components/icons";
import { Button, ErrorState } from "@/components/primitives";

/**
 * Dashboard error boundary. Next hands us the caught error and a `reset` that
 * re-runs the segment's server render — the message names the problem and
 * offers the retry. No stack trace, no apology: `error.message` is only shown
 * when it says something more useful than Next's generic fallback.
 */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const detail =
    error.message && error.message !== "An error occurred in the Server Components render." && error.message !== "An error occurred in the Client Components render."
      ? error.message
      : "We couldn't load your numbers and recent proposals. Your data is safe — nothing was changed.";

  return (
    <div className="py-10">
      <ErrorState
        title="We couldn't load the dashboard"
        description={detail}
        action={
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={reset}>
              Try again
            </Button>
            <a
              href="/dashboard"
              className="text-sm font-medium text-fg-muted hover:text-fg"
            >
              Reload
            </a>
          </div>
        }
      />
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-fg-subtle">
        <AlertCircle className="h-3.5 w-3.5" />
        If this keeps happening, check your connection and reload the page.
      </p>
    </div>
  );
}