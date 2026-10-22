import Link from "next/link";
import { Inbox } from "@/components/icons";
import { Button, EmptyState, Surface } from "@/components/primitives";
import { StatusBadge } from "@/components/status";
import { formatDateTime, formatINR } from "@/lib/format";
import type { getDashboard } from "@/lib/data/queries";

type Recent = Awaited<ReturnType<typeof getDashboard>>["recent"];

/**
 * Recent activity, extracted verbatim from the dashboard page: same five
 * columns in the same order, same rows, same customer links.
 *
 * From `md` up it is a table with a sticky header on `bg-raised`. Below `md` the
 * five columns cannot survive 375px without a horizontal scroll bar, so each
 * proposal becomes a stacked block instead — a phone gets the same data, laid
 * out to the width it actually has.
 */
export function ActivityTable({ recent }: { recent: Recent }) {
  if (recent.length === 0) {
    return (
      <Surface className="mt-6 overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-fg">Recent activity</h2>
        </div>
        <EmptyState
          icon={<Inbox />}
          title="No proposals yet. Add your first customer."
          description="A proposal appears here as soon as you share a plan with a customer, so you can follow it through payment and activation."
          action={
            <Link href="/customers/new">
              <Button variant="primary">New customer</Button>
            </Link>
          }
        />
      </Surface>
    );
  }

  return (
    <Surface className="mt-6 overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold text-fg">Recent activity</h2>
        <p className="text-xs text-fg-subtle">Latest {recent.length} proposals</p>
      </div>

      {/* Desktop and tablet: the same five columns, hairline rows. */}
      <table className="hidden w-full text-sm md:table">
        <thead className="sticky top-0 z-10 bg-raised text-left text-xs text-fg-muted">
          <tr>
            <th className="px-5 py-2.5 font-medium">Customer</th>
            <th className="px-5 py-2.5 font-medium">Plan</th>
            <th className="px-5 py-2.5 font-medium">Premium</th>
            <th className="px-5 py-2.5 font-medium">Status</th>
            <th className="px-5 py-2.5 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((r) => (
            <tr key={r.proposal.id} className="border-b border-line last:border-b-0 hover:bg-overlay">
              <td className="px-5 py-3">
                <Link
                  href={`/customers/${r.proposal.customerId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {r.customerName}
                </Link>
              </td>
              <td className="px-5 py-3 text-fg-muted">{r.productName}</td>
              <td className="amount px-5 py-3 text-fg">{formatINR(r.proposal.totalPremium)}</td>
              <td className="px-5 py-3">
                <StatusBadge status={r.proposal.status} />
              </td>
              <td className="px-5 py-3 text-fg-subtle">{formatDateTime(r.proposal.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phone: one block per proposal rather than a scrolling table. */}
      <ul className="md:hidden">
        {recent.map((r) => (
          <li key={r.proposal.id} className="border-b border-line last:border-b-0 hover:bg-overlay">
            <Link
              href={`/customers/${r.proposal.customerId}`}
              className="block px-4 py-3.5 focus-visible:bg-overlay"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-primary">{r.customerName}</span>
                  <span className="mt-0.5 block truncate text-xs text-fg-muted">{r.productName}</span>
                </span>
                <span className="amount shrink-0 text-sm font-medium text-fg">
                  {formatINR(r.proposal.totalPremium)}
                </span>
              </span>
              <span className="mt-2.5 flex items-center justify-between gap-3">
                <StatusBadge status={r.proposal.status} />
                <span className="text-xs text-fg-subtle">{formatDateTime(r.proposal.updatedAt)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Surface>
  );
}