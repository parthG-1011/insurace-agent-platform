import Link from "next/link";
import { Inbox } from "@/components/icons";
import { EmptyState } from "@/components/primitives";
import { Badge, Card, PageHeader } from "@/components/ui";
import { requireAgent } from "@/lib/auth/current";
import { listEmailsForAgent } from "@/lib/data/queries";
import { formatDateTime } from "@/lib/format";

const TONE = { sent: "emerald", failed: "red", skipped: "amber" } as const;

export default async function EmailsPage() {
  const agent = await requireAgent();
  const rows = await listEmailsForAgent(agent.id);
  return (
    <>
      <PageHeader
        title="Email log"
        description="Every policy confirmation email the platform has tried to send, with the provider's result."
      />
      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Inbox />}
            title="No emails yet"
            description="They appear here once a customer pays and the platform sends their policy confirmation."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map(({ email, customerName, customerId, productName }) => (
            <Card key={email.id} className="overflow-hidden">
              <details className="group">
                {/* Stacked below `sm`: the old three-column row squeezed a subject, an
                    address, an error and a timestamp into one line on a phone. */}
                <summary className="flex cursor-pointer list-none flex-col gap-2 px-5 py-4 text-sm transition-colors hover:bg-overlay focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">{email.subject}</p>
                    <p className="truncate text-fg-muted">
                      To {email.to} ·{" "}
                      <Link href={`/customers/${customerId}`} className="text-primary hover:underline">
                        {customerName}
                      </Link>{" "}
                      · {productName}
                    </p>
                    {email.error && (
                      <p className="mt-1 truncate text-xs text-danger">{email.error}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                    <Badge tone={TONE[email.status]}>
                      {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-fg-muted">{formatDateTime(email.createdAt)}</span>
                  </div>
                </summary>
                {/* `sandbox=""` is the security control for provider-supplied HTML —
                    do not widen it. Only the wrapper's styling changes. */}
                <iframe
                  title={email.subject}
                  srcDoc={email.html}
                  sandbox=""
                  className="h-[560px] w-full border-t border-line bg-canvas"
                />
              </details>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}