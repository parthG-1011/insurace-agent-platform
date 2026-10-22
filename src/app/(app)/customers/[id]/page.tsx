import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { CustomerFacts } from "@/components/customer-facts";
import { Phone, Users } from "@/components/icons";
import { Button, EmptyState, Surface } from "@/components/primitives";
import { Badge, PageHeader } from "@/components/ui";
import { requireAgent } from "@/lib/auth/current";
import { getCustomerForAgent, listActiveProducts, listEmailsForProposals, listProposalsForCustomer, toProfile } from "@/lib/data/queries";
import { getAppUrl } from "@/lib/env";
import { formatCover, formatDate, formatINR, formatTerm } from "@/lib/format";
import { ageOn, evaluateProducts } from "@/lib/insurance/eligibility";
import { CATEGORY_LABEL } from "@/lib/insurance/types";
import { formatPhone } from "@/lib/phone";
import { selectPlanAction } from "./actions";
import { ProposalCard } from "./proposal-card";

const VEHICLE_LABEL = { car: "Car", two_wheeler: "Two-wheeler", none: "None" };

export default async function CustomerPage({ params }: PageProps<"/customers/[id]">) {
  const agent = await requireAgent();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const customer = await getCustomerForAgent(agent.id, id);
  if (!customer) notFound();

  const today = new Date();
  const [allProducts, proposalRows] = await Promise.all([listActiveProducts(), listProposalsForCustomer(agent.id, customer.id)]);
  const emails = await listEmailsForProposals(proposalRows.map((r) => r.proposal.id));
  const { eligible, ineligible } = evaluateProducts(toProfile(customer), allProducts, today);
  const selected = new Set(proposalRows.map((r) => r.proposal.productId));
  const appUrl = getAppUrl();

  const facts: [string, string][] = [
    ["Mobile", formatPhone(customer.phone)],
    ["Email", customer.email],
    ["Age", `${ageOn(customer.dob, today)} (${formatDate(customer.dob)})`],
    ["City", customer.city],
    ["Annual income", formatINR(customer.annualIncome)],
    ["Dependants", String(customer.dependants)],
    ["Tobacco", customer.smoker ? "Smoker" : "Non-smoker"],
    ["Pre-existing condition", customer.preExistingCondition ? "Yes" : "No"],
    [
      "Vehicle",
      customer.vehicleType === "none"
        ? "None"
        : `${VEHICLE_LABEL[customer.vehicleType]}, ${customer.vehicleRegYear}, ${formatINR(customer.vehicleValue ?? 0)}`,
    ],
  ];

  const firstName = customer.name.split(" ")[0];
  /* `wa.me` wants the bare international number; `tel:` wants a dialable one.
     Both read from the customer's existing phone — no new data, no new action,
     just the two conversations an agent starts from this screen surfaced as
     one click each. */
  const waNumber = customer.phone.replace(/\D/g, "");
  const telNumber = `+${waNumber}`;

  return (
    <>
      <PageHeader
        title={customer.name}
        description={`Customer since ${formatDate(customer.createdAt)}`}
        actions={
          <>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9.5 items-center gap-2 rounded-control bg-success px-3.5 text-sm font-medium text-white transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
            <a
              href={`tel:${telNumber}`}
              className="inline-flex h-9.5 items-center gap-2 rounded-control border border-line-strong bg-surface px-3.5 text-sm font-medium text-fg transition-colors hover:bg-overlay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          </>
        }
      />

      <CustomerFacts facts={facts} monetary={["Annual income", "Vehicle"]} />

      {proposalRows.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-fg">Selected plans</h2>
          {proposalRows.map(({ proposal, product }) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              product={product}
              customer={customer}
              agentName={agent.name}
              appUrl={appUrl}
              email={emails.find((e) => e.proposalId === proposal.id)}
            />
          ))}
        </section>
      )}

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-lg font-semibold text-fg">Plans {firstName} qualifies for</h2>
          <p className="text-sm text-fg-muted">{eligible.length} eligible · premiums include 18% GST</p>
        </div>

        {eligible.length === 0 ? (
          <Surface>
            <EmptyState
              icon={<Users />}
              title="No plans available for this customer"
              description="Nothing in the current catalogue matches their profile. Check the details above, or look at the plans that were excluded and why."
            />
          </Surface>
        ) : (
          <>
            {/* Six columns do not survive 375px without a scroll bar, so below
                `md` each quote becomes a block instead. */}
            <Surface className="overflow-hidden">
              <table className="hidden w-full text-sm md:table">
                <thead className="sticky top-0 z-10 bg-raised text-left text-xs text-fg-muted">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">Plan</th>
                    <th className="px-5 py-2.5 font-medium">Category</th>
                    <th className="px-5 py-2.5 font-medium">Cover</th>
                    <th className="px-5 py-2.5 font-medium">Term</th>
                    <th className="px-5 py-2.5 text-right font-medium">Premium / yr</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {eligible.map((q) => (
                    <tr key={q.product.id} className="border-b border-line last:border-b-0 hover:bg-overlay">
                      <td className="px-5 py-3">
                        <p className="font-medium text-fg">{q.product.name}</p>
                        <p className="text-xs text-fg-muted">{q.product.insurer}</p>
                      </td>
                      <td className="px-5 py-3 text-fg-muted">{CATEGORY_LABEL[q.product.category]}</td>
                      <td className="amount px-5 py-3 text-fg">{formatCover(q.sumInsured)}</td>
                      <td className="px-5 py-3 text-fg-muted">{formatTerm(q.termYears)}</td>
                      <td className="amount px-5 py-3 text-right font-semibold text-fg">{formatINR(q.totalPremium)}</td>
                      <td className="px-5 py-3 text-right">
                        {selected.has(q.product.id) ? (
                          <Badge tone="emerald">Selected</Badge>
                        ) : (
                          <ActionButton action={selectPlanAction.bind(null, customer.id, q.product.id)} pendingLabel="Selecting…">
                            Select plan
                          </ActionButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Phone: same six facts per quote, stacked and labelled. */}
              <ul className="md:hidden">
                {eligible.map((q) => (
                  <li key={q.product.id} className="border-b border-line p-4 last:border-b-0 hover:bg-overlay">
                    <p className="text-sm font-medium text-fg">{q.product.name}</p>
                    <p className="text-xs text-fg-muted">{q.product.insurer}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <dt className="text-fg-subtle">Category</dt>
                        <dd className="mt-0.5 text-fg">{CATEGORY_LABEL[q.product.category]}</dd>
                      </div>
                      <div>
                        <dt className="text-fg-subtle">Term</dt>
                        <dd className="mt-0.5 text-fg">{formatTerm(q.termYears)}</dd>
                      </div>
                      <div>
                        <dt className="text-fg-subtle">Cover</dt>
                        <dd className="amount mt-0.5 text-fg">{formatCover(q.sumInsured)}</dd>
                      </div>
                      <div className="text-right">
                        <dt className="text-fg-subtle">Premium / yr</dt>
                        <dd className="amount mt-0.5 font-semibold text-fg">{formatINR(q.totalPremium)}</dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex justify-end">
                      {selected.has(q.product.id) ? (
                        <Badge tone="emerald">Selected</Badge>
                      ) : (
                        <ActionButton
                          action={selectPlanAction.bind(null, customer.id, q.product.id)}
                          pendingLabel="Selecting…"
                          size="sm"
                        >
                          Select plan
                        </ActionButton>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Surface>
          </>
        )}

        {ineligible.length > 0 && (
          <details className="group mt-4 rounded-card border border-line bg-surface px-5 py-3 text-sm">
            <summary className="cursor-pointer list-none font-medium text-fg-muted marker:hidden hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
              {ineligible.length} plans not available for this customer
            </summary>
            <ul className="mt-3 divide-y divide-line">
              {ineligible.map(({ product, reasons }) => (
                <li key={product.id} className="flex justify-between gap-4 py-2">
                  <span>
                    {product.name} <span className="text-fg-subtle">· {CATEGORY_LABEL[product.category]}</span>
                  </span>
                  <span className="text-right text-fg-muted">{reasons.join(" · ")}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </>
  );
}

/* Matches the glyph `WhatsAppButton` already uses in `action-button.tsx`, so the
   contact action in the header and the share action in a proposal card read as
   the same button. */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2S21.8 6.6 21.8 12 17.4 21.8 12 21.8zM12 .1C5.4.1.1 5.4.1 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 11.9-5.3 11.9-11.9S18.6.1 12 .1z" />
    </svg>
  );
}