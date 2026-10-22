import Link from "next/link";
import { ActionButton, WhatsAppButton } from "@/components/action-button";
import { StatusBadge } from "@/components/status";
import { Badge, buttonStyles, Card, PageHeader } from "@/components/ui";
import { requireAgent } from "@/lib/auth/current";
import { getDashboard, FOLLOW_UP_ACTION, followUpDays, followUpTone, listFollowUps, type FollowUpStatus, type FollowUpTone } from "@/lib/data/queries";
import { getAppUrl } from "@/lib/env";
import { formatDateTime, formatINR } from "@/lib/format";
import { paymentMessage, proposalMessage, whatsappLink } from "@/lib/whatsapp";
import { markSharedAction, refreshPaymentStatusAction } from "../customers/[id]/actions";

const TONE_BADGE: Record<FollowUpTone, "blue" | "amber" | "red"> = { fresh: "blue", waiting: "amber", stale: "red" };

const WAITING_SINCE = { quoted: "quoted", shared: "shared", payment_pending: "payment link sent" } as const;

const waitLabel = (days: number, since: string) =>
  days === 0 ? `Today · ${since}` : `${days} ${days === 1 ? "day" : "days"} since ${since}`;

export default async function DashboardPage() {
  const agent = await requireAgent();
  const [d, followUps] = await Promise.all([getDashboard(agent.id), listFollowUps(agent.id)]);
  const appUrl = getAppUrl();
  const today = new Date();
  const stats = [
    { label: "Customers", value: d.customers },
    { label: "Open quotes", value: d.quoted },
    { label: "Awaiting payment", value: d.paymentPending },
    { label: "Active policies", value: d.active },
  ];

  return (
    <>
      <PageHeader
        title={`Hello, ${agent.name.split(" ")[0]}`}
        description="Here's where your customers are in the journey."
        actions={
          <Link href="/customers/new" className={buttonStyles.primary}>
            + New customer
          </Link>
        }
      />

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Needs your attention</h2>
        {followUps.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Nothing waiting. Every proposal you've sent is paid.</p>
        ) : (
          <Card>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Plan</th>
                  <th className="px-5 py-2.5 font-medium">Premium</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Waiting</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUps.map((f) => {
                  const status = f.proposal.status as FollowUpStatus;
                  const days = followUpDays(f.proposal.updatedAt, today);
                  const profileHref = `/customers/${f.customerId}`;
                  const ctx = {
                    customerName: f.customerName,
                    productName: f.productName,
                    insurer: f.productInsurer,
                    sumInsured: f.proposal.sumInsured,
                    termYears: f.proposal.termYears,
                    totalPremium: f.proposal.totalPremium,
                    agentName: agent.name,
                  };
                  return (
                    <tr key={f.proposal.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <Link href={profileHref} className="font-medium text-blue-700 hover:underline">
                          {f.customerName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{f.productName}</td>
                      <td className="px-5 py-3 tabular-nums">{formatINR(f.proposal.totalPremium)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={f.proposal.status} />
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={TONE_BADGE[followUpTone(days)]}>{waitLabel(days, WAITING_SINCE[status])}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {status === "quoted" ? (
                          <WhatsAppButton
                            href={whatsappLink(
                              f.customerPhone,
                              proposalMessage({ ...ctx, pdfUrl: `${appUrl}/q/${f.proposal.publicToken}` }),
                            )}
                            onShare={markSharedAction.bind(null, f.proposal.id)}
                          >
                            {FOLLOW_UP_ACTION.quoted}
                          </WhatsAppButton>
                        ) : status === "shared" && f.proposal.razorpayLinkUrl ? (
                          <WhatsAppButton
                            href={whatsappLink(
                              f.customerPhone,
                              paymentMessage({
                                ...ctx,
                                paymentUrl: f.proposal.razorpayLinkUrl,
                                customerEmail: f.customerEmail,
                              }),
                            )}
                          >
                            {FOLLOW_UP_ACTION.shared}
                          </WhatsAppButton>
                        ) : status === "payment_pending" ? (
                          <ActionButton action={refreshPaymentStatusAction.bind(null, f.proposal.id)} pendingLabel="Checking…">
                            {FOLLOW_UP_ACTION.payment_pending}
                          </ActionButton>
                        ) : (
                          <Link href={profileHref} className={buttonStyles.secondary}>
                            Create payment link
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Recent activity</h2>
        </div>
        {d.recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            No proposals yet. <Link href="/customers/new" className="font-medium text-blue-700 hover:underline">Add your first customer</Link>.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">Customer</th>
                <th className="px-5 py-2.5 font-medium">Plan</th>
                <th className="px-5 py-2.5 font-medium">Premium</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.recent.map((r) => (
                <tr key={r.proposal.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/customers/${r.proposal.customerId}`} className="font-medium text-blue-700 hover:underline">
                      {r.customerName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{r.productName}</td>
                  <td className="px-5 py-3 tabular-nums">{formatINR(r.proposal.totalPremium)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.proposal.status} /></td>
                  <td className="px-5 py-3 text-slate-500">{formatDateTime(r.proposal.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
