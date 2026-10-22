import Link from "next/link";
import { EmptyState } from "@/components/primitives";
import { Inbox } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-md rounded-card border border-line bg-surface">
        <EmptyState
          icon={<Inbox />}
          title="This page does not exist"
          description="The link may be out of date, or the customer, proposal or plan it pointed at has been removed."
          action={
            <Link
              href="/dashboard"
              className="inline-flex h-9.5 items-center justify-center rounded-control bg-primary px-3.5 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Back to dashboard
            </Link>
          }
        />
      </div>
    </main>
  );
}