import { createHmac, timingSafeEqual } from "node:crypto";

/** Verifies Razorpay's X-Razorpay-Signature: hex HMAC-SHA256 of the raw request body. */
export function verifyRazorpaySignature(rawBody: string, signature: string | null, secret: string | undefined): boolean {
  if (!signature || !secret) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
