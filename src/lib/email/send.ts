import { Resend } from "resend";
import { db } from "@/lib/db";
import { emailLog } from "@/lib/db/schema";

/** Sends through Resend when configured, and always records the attempt in email_log. */
export async function sendEmail(input: { to: string; subject: string; html: string; proposalId: number }) {
  const key = process.env.RESEND_API_KEY;
  let status: "sent" | "failed" | "skipped";
  let error: string | null = null;
  let providerId: string | null = null;

  if (!key) {
    status = "skipped";
    error = "RESEND_API_KEY is not set";
  } else {
    try {
      const { data, error: sendError } = await new Resend(key).emails.send({
        from: process.env.EMAIL_FROM || "AgentDesk <onboarding@resend.dev>",
        to: input.to,
        subject: input.subject,
        html: input.html,
      });
      if (sendError) {
        status = "failed";
        error = sendError.message;
      } else {
        status = "sent";
        providerId = data?.id ?? null;
      }
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : String(err);
    }
  }

  await db().insert(emailLog).values({ ...input, status, error, providerId });
  return { status, error };
}
