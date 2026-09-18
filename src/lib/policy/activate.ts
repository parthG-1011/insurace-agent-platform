import { and, eq, ne } from "drizzle-orm";
import { getProposalBundleById } from "@/lib/data/queries";
import { db } from "@/lib/db";
import { proposals, type Proposal } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/send";
import { policyStartedEmail } from "@/lib/email/templates";
import { getAppUrl } from "@/lib/env";
import { fetchPaymentLink } from "@/lib/payments/razorpay";
import { formatPhone } from "@/lib/phone";
import { makePolicyNumber } from "@/lib/tokens";

/**
 * Marks a proposal paid and its policy active, then emails the customer.
 * Idempotent: the conditional update only succeeds once, so the email is sent at most once
 * even if the webhook and the reconcile path race.
 */
export async function activateProposal(proposalId: number, paymentId: string | null): Promise<{ activated: boolean }> {
  const now = new Date();
  const updated = await db()
    .update(proposals)
    .set({
      status: "policy_active",
      paidAt: now,
      policyStartDate: now.toISOString().slice(0, 10),
      policyNumber: makePolicyNumber(proposalId, now),
      razorpayPaymentId: paymentId,
      updatedAt: now,
    })
    .where(and(eq(proposals.id, proposalId), ne(proposals.status, "policy_active")))
    .returning({ id: proposals.id });
  if (!updated.length) return { activated: false };

  const b = await getProposalBundleById(proposalId);
  if (b) {
    const { subject, html } = policyStartedEmail({
      customerName: b.customer.name,
      productName: b.product.name,
      insurer: b.product.insurer,
      policyNumber: b.proposal.policyNumber!,
      startDate: b.proposal.policyStartDate!,
      sumInsured: b.proposal.sumInsured,
      termYears: b.proposal.termYears,
      totalPremium: b.proposal.totalPremium,
      paymentId,
      agentName: b.agent.name,
      agentPhone: formatPhone(b.agent.phone),
      agentEmail: b.agent.email,
      documentUrl: `${getAppUrl()}/q/${b.proposal.publicToken}`,
    });
    await sendEmail({ to: b.customer.email, subject, html, proposalId });
  }
  return { activated: true };
}

/** Asks Razorpay directly whether the link is paid; used when the webhook is late or not configured. */
export async function reconcileProposal(p: Pick<Proposal, "id" | "status" | "razorpayLinkId">) {
  if (p.status === "policy_active" || !p.razorpayLinkId) return { status: p.status, activated: false };
  const link = await fetchPaymentLink(p.razorpayLinkId);
  if (link.status !== "paid") return { status: p.status, activated: false };
  const paymentId = link.payments?.find((x) => x.status === "captured")?.payment_id ?? link.payments?.[0]?.payment_id ?? null;
  const { activated } = await activateProposal(p.id, paymentId);
  return { status: "policy_active" as const, activated };
}
