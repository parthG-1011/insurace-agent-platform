import Link from "next/link";
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
        <Card className="px-5 py-10 text-center text-sm text-slate-500">No emails yet. They appear here once a customer pays.</Card>
      ) : (
        <div className="space-y-3">
          {rows.map(({ email, customerName, customerId, productName }) => (
            <Card key={email.id}>
              <details>
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{email.subject}</p>
                    <p className="text-slate-500">
                      To {email.to} ·{" "}
                      <Link href={`/customers/${customerId}`} className="text-blue-700 hover:underline">
                        {customerName}
                      </Link>{" "}
                      · {productName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {email.error && <span className="max-w-xs truncate text-xs text-slate-500">{email.error}</span>}
                    <Badge tone={TONE[email.status]}>{email.status}</Badge>
                    <span className="text-xs text-slate-500">{formatDateTime(email.createdAt)}</span>
                  </div>
                </summary>
                <iframe
                  title={email.subject}
                  srcDoc={email.html}
                  sandbox=""
                  className="h-[560px] w-full border-t border-slate-100"
                />
              </details>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
