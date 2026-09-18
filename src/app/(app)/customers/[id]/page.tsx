import { notFound } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { Badge, Card, PageHeader } from "@/components/ui";
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

  return (
    <>
      <PageHeader title={customer.name} description={`Customer since ${formatDate(customer.createdAt)}`} />

      <Card className="grid grid-cols-3 gap-x-8 gap-y-4 p-5 text-sm">
        {facts.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 font-medium">{value}</p>
          </div>
        ))}
      </Card>

      {proposalRows.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Selected plans</h2>
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
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Plans {customer.name.split(" ")[0]} qualifies for</h2>
          <p className="text-sm text-slate-500">{eligible.length} eligible · premiums include 18% GST</p>
        </div>
        <Card>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">Plan</th>
                <th className="px-5 py-2.5 font-medium">Category</th>
                <th className="px-5 py-2.5 font-medium">Cover</th>
                <th className="px-5 py-2.5 font-medium">Term</th>
                <th className="px-5 py-2.5 text-right font-medium">Premium / yr</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eligible.map((q) => (
                <tr key={q.product.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium">{q.product.name}</p>
                    <p className="text-xs text-slate-500">{q.product.insurer}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{CATEGORY_LABEL[q.product.category]}</td>
                  <td className="px-5 py-3 tabular-nums">{formatCover(q.sumInsured)}</td>
                  <td className="px-5 py-3 text-slate-600">{formatTerm(q.termYears)}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatINR(q.totalPremium)}</td>
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
        </Card>

        {ineligible.length > 0 && (
          <details className="mt-4 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm">
            <summary className="cursor-pointer font-medium text-slate-600">
              {ineligible.length} plans not available for this customer
            </summary>
            <ul className="mt-3 divide-y divide-slate-100">
              {ineligible.map(({ product, reasons }) => (
                <li key={product.id} className="flex justify-between gap-4 py-2">
                  <span>
                    {product.name} <span className="text-slate-400">· {CATEGORY_LABEL[product.category]}</span>
                  </span>
                  <span className="text-right text-slate-500">{reasons.join(" · ")}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </>
  );
}
