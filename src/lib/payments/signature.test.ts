import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyRazorpaySignature } from "./signature";

const body = JSON.stringify({ event: "payment_link.paid" });
const secret = "whsec_test";
const sign = (b: string, s: string) => createHmac("sha256", s).update(b).digest("hex");

describe("verifyRazorpaySignature", () => {
  it("accepts a correct signature", () => expect(verifyRazorpaySignature(body, sign(body, secret), secret)).toBe(true));
  it("rejects a wrong secret or altered body", () => {
    expect(verifyRazorpaySignature(body, sign(body, "other"), secret)).toBe(false);
    expect(verifyRazorpaySignature(body + " ", sign(body, secret), secret)).toBe(false);
  });
  it("rejects missing signature, missing secret, and wrong length", () => {
    expect(verifyRazorpaySignature(body, null, secret)).toBe(false);
    expect(verifyRazorpaySignature(body, sign(body, secret), undefined)).toBe(false);
    expect(verifyRazorpaySignature(body, "abc", secret)).toBe(false);
  });
});
