"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAgent } from "@/lib/auth/current";
import { getCustomerForAgent, getProposalBundleForAgent, toProfile } from "@/lib/data/queries";
import { db } from "@/lib/db";
import { products, proposals } from "@/lib/db/schema";
import { getAppUrl } from "@/lib/env";
import { checkEligibility, quoteProduct } from "@/lib/insurance/eligibility";
import { createPaymentLink, razorpayConfigured } from "@/lib/payments/razorpay";
import { reconcileProposal } from "@/lib/policy/activate";
import { newPublicToken, proposalReference } from "@/lib/tokens";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const fail = (err: unknown): ActionResult => ({ ok: false, error: err instanceof Error ? err.message : "Something went wrong" });

export async function selectPlanAction(customerId: number, productId: number): Promise<ActionResult> {
  const agent = await requireAgent();
  const customer = await getCustomerForAgent(agent.id, customerId);
  if (!customer) return { ok: false, error: "Customer not found" };
  const [product] = await db().select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product?.isActive) return { ok: false, error: "Product not available" };

  const today = new Date();
  const reasons = checkEligibility(toProfile(customer), product.eligibility, today);
  if (reasons.length) return { ok: false, error: reasons.join("; ") };

  const [existing] = await db()
    .select({ id: proposals.id })
    .from(proposals)
    .where(and(eq(proposals.customerId, customer.id), eq(proposals.productId, product.id)))
    .limit(1);
  if (existing) return { ok: true, message: "This plan is already selected" };

  // Price is always recomputed server-side, never taken from the client.
  const q = quoteProduct(toProfile(customer), product, today);
  await db().insert(proposals).values({
    agentId: agent.id,
    customerId: customer.id,
    productId: product.id,
    sumInsured: q.sumInsured,
    termYears: q.termYears,
    basePremium: q.basePremium,
    gst: q.gst,
    totalPremium: q.totalPremium,
    publicToken: newPublicToken(),
  });
  revalidatePath(`/customers/${customer.id}`);
  return { ok: true, message: `${product.name} selected. Proposal PDF is ready.` };
}

export async function markSharedAction(proposalId: number): Promise<ActionResult> {
  const agent = await requireAgent();
  const b = await getProposalBundleForAgent(agent.id, proposalId);
  if (!b) return { ok: false, error: "Proposal not found" };
  await db()
    .update(proposals)
    .set({ status: "shared", updatedAt: new Date() })
    .where(and(eq(proposals.id, proposalId), eq(proposals.status, "quoted")));
  revalidatePath(`/customers/${b.customer.id}`);
  return { ok: true };
}

export async function createPaymentLinkAction(proposalId: number): Promise<ActionResult> {
  const agent = await requireAgent();
  const b = await getProposalBundleForAgent(agent.id, proposalId);
  if (!b) return { ok: false, error: "Proposal not found" };
  if (b.proposal.status === "policy_active") return { ok: false, error: "This policy is already paid" };
  if (b.proposal.razorpayLinkUrl) return { ok: true, message: "Payment link already created" };
  if (!razorpayConfigured()) return { ok: false, error: "Payments are not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET" };

  try {
    const link = await createPaymentLink({
      amountInr: b.proposal.totalPremium,
      referenceId: `${proposalReference(b.proposal.id)}-${b.proposal.publicToken.slice(0, 8)}`,
      description: `${b.product.name} (${b.product.insurer}) - annual premium incl. GST`,
      customer: { name: b.customer.name, contact: `+${b.customer.phone}`, email: b.customer.email },
      callbackUrl: `${getAppUrl()}/pay/success?proposal=${b.proposal.publicToken}`,
      notes: { proposal_id: String(b.proposal.id), agent: b.agent.name },
    });
    await db()
      .update(proposals)
      .set({ razorpayLinkId: link.id, razorpayLinkUrl: link.short_url, status: "payment_pending", updatedAt: new Date() })
      .where(and(eq(proposals.id, proposalId), inArray(proposals.status, ["quoted", "shared"])));
  } catch (err) {
    return fail(err);
  }
  revalidatePath(`/customers/${b.customer.id}`);
  return { ok: true, message: "Payment link created. Share it on WhatsApp." };
}

export async function refreshPaymentStatusAction(proposalId: number): Promise<ActionResult> {
  const agent = await requireAgent();
  const b = await getProposalBundleForAgent(agent.id, proposalId);
  if (!b) return { ok: false, error: "Proposal not found" };
  try {
    const r = await reconcileProposal(b.proposal);
    revalidatePath(`/customers/${b.customer.id}`);
    if (r.status === "policy_active") return { ok: true, message: "Payment received. The policy is active." };
    return { ok: true, message: "No payment yet. The customer hasn't completed checkout." };
  } catch (err) {
    return fail(err);
  }
}
