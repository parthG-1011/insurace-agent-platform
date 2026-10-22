import { and, asc, count, desc, eq, exists, ilike, inArray, notExists, or, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { agents, customers, emailLog, products, proposals, type Customer, type ProposalStatus } from "@/lib/db/schema";
import { STATUS_LABEL, STATUS_STEPS } from "@/lib/insurance/status";
import type { CustomerProfile } from "@/lib/insurance/types";

export const toProfile = (c: Customer): CustomerProfile => ({
  dob: c.dob,
  annualIncome: c.annualIncome,
  smoker: c.smoker,
  preExistingCondition: c.preExistingCondition,
  dependants: c.dependants,
  vehicleType: c.vehicleType,
  vehicleRegYear: c.vehicleRegYear,
  vehicleValue: c.vehicleValue,
});

export const NO_PLAN_FILTER = "none";

/** Parsed form of the ?status= search param: All | a real status | the no-plan bucket. */
export type CustomerStatusFilter = ProposalStatus | typeof NO_PLAN_FILTER;

/** Validates a raw ?status= value. Unknown/array/empty input falls back to "All" (null). */
export const parseCustomerStatusFilter = (raw?: string | string[] | null): CustomerStatusFilter | null => {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (v === NO_PLAN_FILTER) return NO_PLAN_FILTER;
  return STATUS_STEPS.some((s) => s.status === v) ? (v as ProposalStatus) : null;
};

/** Ordered options for the <select>: "All", "No plan selected", then one per STATUS_STEPS entry. */
export const customerStatusFilterOptions = (): { value: string; label: string }[] => [
  { value: "", label: "All" },
  { value: NO_PLAN_FILTER, label: "No plan selected" },
  ...STATUS_STEPS.map((s) => ({ value: s.status, label: STATUS_LABEL[s.status] })),
];

export const listActiveProducts = () =>
  db().select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.id));

export async function getCustomerForAgent(agentId: number, customerId: number) {
  const [row] = await db()
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.agentId, agentId)))
    .limit(1);
  return row ?? null;
}

export async function listCustomersForAgent(agentId: number, search?: string, status?: CustomerStatusFilter | null) {
  const term = search?.trim();
  // "latest" is max(updatedAt) per customer, matching the orderBy(desc(proposals.updatedAt))
  // used for the latest-proposal Map below, so a badge can never contradict the filter.
  let statusCondition: SQL | undefined;
  if (status === NO_PLAN_FILTER) {
    statusCondition = notExists(db().select({ one: sql`1` }).from(proposals).where(eq(proposals.customerId, customers.id)));
  } else if (status) {
    const latest = alias(proposals, "latest");
    statusCondition = exists(
      db()
        .select({ one: sql`1` })
        .from(latest)
        .where(
          and(
            eq(latest.customerId, customers.id),
            eq(latest.status, status),
            eq(
              latest.updatedAt,
              sql`(select max(${proposals.updatedAt}) from ${proposals} where ${proposals.customerId} = ${customers.id})`,
            ),
          ),
        ),
    );
  }
  const rows = await db()
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.agentId, agentId),
        term ? or(ilike(customers.name, `%${term}%`), ilike(customers.phone, `%${term.replace(/\D/g, "") || term}%`), ilike(customers.email, `%${term}%`)) : undefined,
        statusCondition,
      ),
    )
    .orderBy(desc(customers.createdAt));
  if (!rows.length) return [];

  const props = await db()
    .select({ customerId: proposals.customerId, status: proposals.status, productName: products.name, updatedAt: proposals.updatedAt })
    .from(proposals)
    .innerJoin(products, eq(proposals.productId, products.id))
    .where(inArray(proposals.customerId, rows.map((r) => r.id)))
    .orderBy(desc(proposals.updatedAt));
  const latest = new Map<number, (typeof props)[number]>();
  for (const p of props) if (!latest.has(p.customerId)) latest.set(p.customerId, p);
  return rows.map((customer) => ({ customer, latest: latest.get(customer.id) ?? null }));
}

export const listProposalsForCustomer = (agentId: number, customerId: number) =>
  db()
    .select({ proposal: proposals, product: products })
    .from(proposals)
    .innerJoin(products, eq(proposals.productId, products.id))
    .where(and(eq(proposals.agentId, agentId), eq(proposals.customerId, customerId)))
    .orderBy(desc(proposals.createdAt));

const bundleQuery = () =>
  db()
    .select({
      proposal: proposals,
      customer: customers,
      product: products,
      agent: { id: agents.id, name: agents.name, email: agents.email, phone: agents.phone },
    })
    .from(proposals)
    .innerJoin(customers, eq(proposals.customerId, customers.id))
    .innerJoin(products, eq(proposals.productId, products.id))
    .innerJoin(agents, eq(proposals.agentId, agents.id));

export type ProposalBundle = NonNullable<Awaited<ReturnType<typeof getProposalBundleById>>>;

export async function getProposalBundleById(proposalId: number) {
  const [row] = await bundleQuery().where(eq(proposals.id, proposalId)).limit(1);
  return row ?? null;
}

export async function getProposalBundleByToken(token: string) {
  const [row] = await bundleQuery().where(eq(proposals.publicToken, token)).limit(1);
  return row ?? null;
}

export async function getProposalBundleForAgent(agentId: number, proposalId: number) {
  const row = await getProposalBundleById(proposalId);
  return row && row.proposal.agentId === agentId ? row : null;
}

export const listEmailsForProposals = (proposalIds: number[]) =>
  proposalIds.length
    ? db().select().from(emailLog).where(inArray(emailLog.proposalId, proposalIds)).orderBy(desc(emailLog.createdAt))
    : Promise.resolve([]);

export const listEmailsForAgent = (agentId: number) =>
  db()
    .select({ email: emailLog, customerName: customers.name, customerId: customers.id, productName: products.name })
    .from(emailLog)
    .innerJoin(proposals, eq(emailLog.proposalId, proposals.id))
    .innerJoin(customers, eq(proposals.customerId, customers.id))
    .innerJoin(products, eq(proposals.productId, products.id))
    .where(eq(proposals.agentId, agentId))
    .orderBy(desc(emailLog.createdAt))
    .limit(100);

export async function getDashboard(agentId: number) {
  const [[customerCount], statusCounts, recent] = await Promise.all([
    db().select({ n: count() }).from(customers).where(eq(customers.agentId, agentId)),
    db()
      .select({ status: proposals.status, n: count() })
      .from(proposals)
      .where(eq(proposals.agentId, agentId))
      .groupBy(proposals.status),
    db()
      .select({ proposal: proposals, customerName: customers.name, productName: products.name })
      .from(proposals)
      .innerJoin(customers, eq(proposals.customerId, customers.id))
      .innerJoin(products, eq(proposals.productId, products.id))
      .where(eq(proposals.agentId, agentId))
      .orderBy(desc(proposals.updatedAt))
      .limit(8),
  ]);
  const byStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s.n])) as Partial<Record<string, number>>;
  return {
    customers: customerCount.n,
    quoted: (byStatus.quoted ?? 0) + (byStatus.shared ?? 0),
    paymentPending: byStatus.payment_pending ?? 0,
    active: (byStatus.policy_active ?? 0) + (byStatus.paid ?? 0),
    recent,
  };
}
