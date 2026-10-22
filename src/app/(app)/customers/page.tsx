import Link from "next/link";
import { StatusBadge } from "@/components/status";
import { buttonStyles, Card, inputStyles, PageHeader } from "@/components/ui";
import { requireAgent } from "@/lib/auth/current";
import { customerStatusFilterOptions, listCustomersForAgent, parseCustomerStatusFilter } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { formatPhone } from "@/lib/phone";

export default async function CustomersPage({ searchParams }: PageProps<"/customers">) {
  const agent = await requireAgent();
  const { q, status: rawStatus } = await searchParams;
  const search = typeof q === "string" ? q : "";
  const statusFilter = parseCustomerStatusFilter(rawStatus);
  const rows = await listCustomersForAgent(agent.id, search, statusFilter);

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone you've spoken to, and where they are in the journey."
        actions={<Link href="/customers/new" className={buttonStyles.primary}>+ New customer</Link>}
      />
      <form method="get" action="/customers" className="mb-4 flex flex-wrap items-end gap-2">
        <div className="flex-1">
          <input name="q" defaultValue={search} placeholder="Search by name, phone or email" className={`${inputStyles} max-w-sm`} />
        </div>
        <select name="status" defaultValue={statusFilter ?? ""} className={`${inputStyles} w-auto max-w-56`} aria-label="Filter by latest proposal status">
          {customerStatusFilterOptions().map((o) => (
            <option key={o.value || "all"} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button className={buttonStyles.secondary}>Search</button>
      </form>
      <Card>
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            {statusFilter || search ? (
              <>
                <p>No customers match your filters.</p>
                <Link href="/customers" className="mt-2 inline-block font-medium text-blue-700 hover:underline">Clear filters</Link>
              </>
            ) : (
              <p>No customers yet.</p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Phone</th>
                <th className="px-5 py-2.5 font-medium">City</th>
                <th className="px-5 py-2.5 font-medium">Latest proposal</th>
                <th className="px-5 py-2.5 font-medium">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ customer, latest }) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/customers/${customer.id}`} className="font-medium text-blue-700 hover:underline">
                      {customer.name}
                    </Link>
                    <p className="text-xs text-slate-500">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-slate-700">{formatPhone(customer.phone)}</td>
                  <td className="px-5 py-3 text-slate-700">{customer.city}</td>
                  <td className="px-5 py-3">
                    {latest ? (
                      <div className="flex items-center gap-2">
                        <StatusBadge status={latest.status} />
                        <span className="text-slate-600">{latest.productName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">No plan selected</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
