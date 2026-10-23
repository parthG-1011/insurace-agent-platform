import Link from "next/link";
import { StatusBadge } from "@/components/status";
import { buttonStyles, Card, inputStyles, PageHeader } from "@/components/ui";
import { requireAgent } from "@/lib/auth/current";
import { listCustomersForAgent } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { formatPhone } from "@/lib/phone";

export default async function CustomersPage({ searchParams }: PageProps<"/customers">) {
  const agent = await requireAgent();
  const { q } = await searchParams;
  const search = typeof q === "string" ? q : "";
  const rows = await listCustomersForAgent(agent.id, search);

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone you've spoken to, and where they are in the journey."
        actions={<Link href="/customers/new" className={buttonStyles.primary}>+ New customer</Link>}
      />
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={search} placeholder="Search by name, phone or email" className={`${inputStyles} max-w-sm`} />
        <button className={buttonStyles.secondary}>Search</button>
      </form>
      <Card>
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-muted">
            {search ? "No customers match your search." : "No customers yet."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Phone</th>
                <th className="px-5 py-2.5 font-medium">City</th>
                <th className="px-5 py-2.5 font-medium">Latest proposal</th>
                <th className="px-5 py-2.5 font-medium">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map(({ customer, latest }) => (
                <tr key={customer.id} className="hover:bg-elevated">
                  <td className="px-5 py-3">
                    <Link href={`/customers/${customer.id}`} className="font-medium text-accent-ink hover:text-accent-hover hover:underline">
                      {customer.name}
                    </Link>
                    <p className="text-xs text-ink-muted">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-ink-strong">{formatPhone(customer.phone)}</td>
                  <td className="px-5 py-3 text-ink-strong">{customer.city}</td>
                  <td className="px-5 py-3">
                    {latest ? (
                      <div className="flex items-center gap-2">
                        <StatusBadge status={latest.status} />
                        <span className="text-ink-muted">{latest.productName}</span>
                      </div>
                    ) : (
                      <span className="text-ink-faint">No plan selected</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
