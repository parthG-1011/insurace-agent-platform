"use client";

import Link from "next/link";
import { AlertCircle } from "@/components/icons";
import { Button, ErrorState } from "@/components/primitives";

/**
 * Customer detail error boundary. `reset` re-runs the segment's server render,
 * so retrying is one tap and costs the customer nothing — no data was changed
 * by a failed read.
 */
export default function CustomerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const generic =
    "An error occurred in the Server Components render." === error.message ||
    "An error occurred in the Client Components render." === error.message;
  const detail = error.message && !generic
    ? error.message
    : "We couldn't load this customer's details, plans and proposals. Nothing was changed.";

  return (
    <div className="py-10">
      <ErrorState
        title="We couldn't load this customer"
        description={detail}
        action={
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={reset}>
              Try again
            </Button>
            <Link href="/customers" className="text-sm font-medium text-fg-muted hover:text-fg">
              Back to customers
            </Link>
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