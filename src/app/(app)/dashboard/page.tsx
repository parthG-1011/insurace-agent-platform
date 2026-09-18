import Link from "next/link";
import { StatusBadge } from "@/components/status";
import { buttonStyles, Card, PageHeader } from "@/components/ui";
import { requireAgent } from "@/lib/auth/current";
import { getDashboard } from "@/lib/data/queries";
import { formatDateTime, formatINR } from "@/lib/format";

export default async function DashboardPage() {
  const agent = await requireAgent();
  const d = await getDashboard(agent.id);
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
