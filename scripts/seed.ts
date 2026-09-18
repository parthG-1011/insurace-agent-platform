/**
 * Resets the database to a known demo state. DESTRUCTIVE: truncates all tables.
 * Usage: npm run db:seed
 */
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { closeDb, db } from "@/lib/db";
import { agents, customers, emailLog, products, proposals } from "@/lib/db/schema";
import { CATALOGUE } from "@/lib/insurance/catalogue";
import { quoteProduct } from "@/lib/insurance/eligibility";
import { makePolicyNumber, newPublicToken } from "@/lib/tokens";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

export const DEMO_PASSWORD = "Demo@1234";

type NewCustomer = Omit<typeof customers.$inferInsert, "agentId">;

const DEMO_CUSTOMERS: NewCustomer[] = [
  {
    name: "Rahul Verma", phone: "919812300001", email: "rahul.verma@example.com", dob: "1997-03-14", gender: "male",
    city: "Pune", annualIncome: 1_200_000, smoker: false, preExistingCondition: false, dependants: 1,
    vehicleType: "car", vehicleRegYear: 2022, vehicleValue: 900_000,
  },
  {
    name: "Sunita Rao", phone: "919812300002", email: "sunita.rao@example.com", dob: "1965-05-02", gender: "female",
    city: "Bengaluru", annualIncome: 600_000, smoker: false, preExistingCondition: true, dependants: 1,
    vehicleType: "none", vehicleRegYear: null, vehicleValue: null,
  },
  {
    name: "Arjun Mehta", phone: "919812300003", email: "arjun.mehta@example.com", dob: "1991-07-21", gender: "male",
    city: "Ahmedabad", annualIncome: 1_800_000, smoker: true, preExistingCondition: false, dependants: 2,
    vehicleType: "two_wheeler", vehicleRegYear: 2019, vehicleValue: 120_000,
  },
  {
    name: "Priya Nair", phone: "919812300004", email: "priya.nair@example.com", dob: "1984-11-09", gender: "female",
    city: "Kochi", annualIncome: 900_000, smoker: false, preExistingCondition: false, dependants: 3,
    vehicleType: "car", vehicleRegYear: 2014, vehicleValue: 700_000,
  },
  {
    name: "Imran Sheikh", phone: "919812300005", email: "imran.sheikh@example.com", dob: "2002-01-30", gender: "male",
    city: "Lucknow", annualIncome: 240_000, smoker: false, preExistingCondition: false, dependants: 0,
    vehicleType: "none", vehicleRegYear: null, vehicleValue: null,
  },
  {
    name: "Kavita Joshi", phone: "919812300006", email: "kavita.joshi@example.com", dob: "1988-04-17", gender: "female",
    city: "Jaipur", annualIncome: 1_500_000, smoker: false, preExistingCondition: false, dependants: 2,
    vehicleType: "none", vehicleRegYear: null, vehicleValue: null,
  },
];

async function main() {
  const d = db();
  await d.execute(sql`TRUNCATE email_log, payment_events, proposals, customers, products, agents RESTART IDENTITY CASCADE`);

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const [demo, second] = await d
    .insert(agents)
    .values([
      { name: "Asha Kulkarni", email: "demo@agentdesk.in", phone: "919812399999", passwordHash },
      { name: "Vikram Singh", email: "agent2@agentdesk.in", phone: "919812388888", passwordHash },
    ])
    .returning();

  const productRows = await d.insert(products).values(CATALOGUE).returning();

  const customerRows = await d
    .insert(customers)
    .values([
      ...DEMO_CUSTOMERS.map((c) => ({ ...c, agentId: demo.id })),
      {
        agentId: second.id, name: "Meera Iyer", phone: "919812300007", email: "meera.iyer@example.com", dob: "1979-12-01",
        gender: "female" as const, city: "Chennai", annualIncome: 2_000_000, dependants: 2,
      },
    ])
    .returning();

  // Kavita already bought Family Health Shield, so the dashboard shows a completed sale.
  const kavita = customerRows.find((c) => c.name === "Kavita Joshi")!;
  const health = productRows.find((p) => p.code === "HEALTH-FAMILY")!;
  const quote = quoteProduct(kavita, health, new Date());
  const paidAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const [paid] = await d
    .insert(proposals)
    .values({
      agentId: demo.id, customerId: kavita.id, productId: health.id,
      sumInsured: quote.sumInsured, termYears: quote.termYears,
      basePremium: quote.basePremium, gst: quote.gst, totalPremium: quote.totalPremium,
      publicToken: newPublicToken(), status: "policy_active", paidAt, policyStartDate: paidAt.toISOString().slice(0, 10),
    })
    .returning();
  await d
    .update(proposals)
    .set({ policyNumber: makePolicyNumber(paid.id, paidAt) })
    .where(sql`${proposals.id} = ${paid.id}`);
  await d.insert(emailLog).values({
    proposalId: paid.id, to: kavita.email, subject: `Your ${health.name} policy has started`,
    html: "<p>Seed data: no email was actually sent for this record.</p>", status: "skipped", error: "Seed data",
  });

  // Rahul has a quote that has been shared but not paid yet.
  const rahul = customerRows.find((c) => c.name === "Rahul Verma")!;
  const term = productRows.find((p) => p.code === "TERM-SECURE")!;
  const q2 = quoteProduct(rahul, term, new Date());
  await d.insert(proposals).values({
    agentId: demo.id, customerId: rahul.id, productId: term.id,
    sumInsured: q2.sumInsured, termYears: q2.termYears,
    basePremium: q2.basePremium, gst: q2.gst, totalPremium: q2.totalPremium,
    publicToken: newPublicToken(), status: "shared",
  });

  console.log(`Seeded ${productRows.length} products, ${customerRows.length} customers.`);
  console.log(`Login: demo@agentdesk.in / ${DEMO_PASSWORD}  (second agent: agent2@agentdesk.in)`);
}

main()
  .then(closeDb)
  .catch(async (err) => {
    console.error(err);
    await closeDb();
    process.exit(1);
  });
