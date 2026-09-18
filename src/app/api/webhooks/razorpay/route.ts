import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentEvents, proposals } from "@/lib/db/schema";
import { verifyRazorpaySignature } from "@/lib/payments/signature";
import { activateProposal } from "@/lib/policy/activate";

interface RazorpayEvent {
  event: string;
  payload: {
    payment_link?: { entity: { id: string; status: string } };
    payment?: { entity: { id: string } };
  };
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyRazorpaySignature(raw, request.headers.get("x-razorpay-signature"), process.env.RAZORPAY_WEBHOOK_SECRET)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw) as RazorpayEvent;
  const eventId = request.headers.get("x-razorpay-event-id") ?? createHash("sha256").update(raw).digest("hex");
  const inserted = await db()
    .insert(paymentEvents)
    .values({ providerEventId: eventId, type: event.event, payload: event })
    .onConflictDoNothing()
    .returning({ id: paymentEvents.id });
  if (!inserted.length) return Response.json({ ok: true, duplicate: true });

  if (event.event === "payment_link.paid" && event.payload.payment_link) {
    const linkId = event.payload.payment_link.entity.id;
    const [proposal] = await db().select({ id: proposals.id }).from(proposals).where(eq(proposals.razorpayLinkId, linkId)).limit(1);
    if (proposal) {
      try {
        await activateProposal(proposal.id, event.payload.payment?.entity.id ?? null);
      } catch (err) {
        // Forget the event so Razorpay's retry gets processed.
        await db().delete(paymentEvents).where(eq(paymentEvents.id, inserted[0].id));
        console.error("Webhook activation failed", err);
        return Response.json({ error: "Activation failed" }, { status: 500 });
      }
    }
  }
  return Response.json({ ok: true });
}
