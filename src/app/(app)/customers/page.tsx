import Link from "next/link";
import { Plus, Search, Users, X } from "@/components/icons";
import { Button, EmptyState, Input, Surface } from "@/components/primitives";
import { StatusBadge } from "@/components/status";
import { buttonStyles, PageHeader } from "@/components/ui";
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
        actions={
          <Link href="/customers/new" className={buttonStyles.primary}>
            <Plus className="h-4 w-4" />
            New customer
          </Link>
        }
      />

      <form className="mb-4 flex max-w-lg gap-2" role="search">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            name="q"
            defaultValue={search}
            placeholder="Search by name, phone or email"
            aria-label="Search customers"
            className="pl-9"
          />
          {/* A submitted query needs a way out that does not need selecting and
              deleting the text first. This is a submit button carrying `q=""`,
              and the submitter's entry lands last in the FormData, so the
              server action sees the empty value rather than the text in the
              field — it submits this same form, exactly as specified. */}
          {search ? (
            <button
              type="submit"
              name="q"
              value=""
              aria-label="Clear search"
              title="Clear search"
              className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-control text-fg-subtle hover:bg-overlay hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {rows.length === 0 ? (
        <Surface>
          {search ? (
            /* With a query this is a dead end the agent can undo, so it says so
               and offers the undo — not an invitation to create a duplicate. */
            <EmptyState
              icon={<Users />}
              title="No customers match your search."
              description={`Nothing matches “${search}”. Check the spelling, or try part of a phone number.`}
              action={
                <Link
                  href="/customers"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Clear search
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={<Users />}
              title="No customers yet."
              description="Add the first person you've spoken to. Saving their details shows you which plans they qualify for and what each premium is."
              action={
                <Link href="/customers/new">
                  <Button variant="primary">
                    <Plus className="h-4 w-4" />
                    New customer
                  </Button>
                </Link>
              }
            />
          )}
        </Surface>
      ) : (
        <Surface className="overflow-hidden">
          {/* Desktop and tablet: the same five columns, hairline rows, sticky
              header. Below `md` they cannot survive 375px without a scroll bar,
              so the same rows stack instead. */}
          <table className="hidden w-full text-sm md:table">
            <thead className="sticky top-0 z-10 bg-raised text-left text-xs text-fg-muted">
              <tr>
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Phone</th>
                <th className="px-5 py-2.5 font-medium">City</th>
                <th className="px-5 py-2.5 font-medium">Latest proposal</th>
                <th className="px-5 py-2.5 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ customer, latest }) => (
                <tr key={customer.id} className="border-b border-line last:border-b-0 hover:bg-overlay">
                  <td className="px-5 py-3">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {customer.name}
                    </Link>
                    <p className="text-xs text-fg-muted">{customer.email}</p>
                  </td>
                  <td className="amount px-5 py-3 text-fg">{formatPhone(customer.phone)}</td>
                  <td className="px-5 py-3 text-fg">{customer.city}</td>
                  <td className="px-5 py-3">
                    {latest ? (
                      <span className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={latest.status} />
                        <span className="text-fg-muted">{latest.productName}</span>
                      </span>
                    ) : (
                      <span className="text-fg-subtle">No plan selected</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-fg-muted">{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phone: one block per customer, same data, same link target. */}
          <ul className="md:hidden">
            {rows.map(({ customer, latest }) => (
              <li key={customer.id} className="border-b border-line last:border-b-0 hover:bg-overlay">
                <Link
                  href={`/customers/${customer.id}`}
                  className="block px-4 py-3.5 focus-visible:bg-overlay"
                >
                  <span className="block text-sm font-medium text-primary">{customer.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-fg-muted">{customer.email}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
                    <span className="amount">{formatPhone(customer.phone)}</span>
                    <span>{customer.city}</span>
                    <span className="text-fg-subtle">Added {formatDate(customer.createdAt)}</span>
                  </span>
                  {latest ? (
                    <span className="mt-2.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={latest.status} />
                      <span className="text-xs text-fg-muted">{latest.productName}</span>
                    </span>
                  ) : (
                    <span className="mt-2.5 block text-xs text-fg-subtle">No plan selected</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </>
  );
}