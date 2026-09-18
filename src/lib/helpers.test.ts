import { describe, expect, it } from "vitest";
import { formatAmount, formatCover } from "./format";
import { formatPhone, normalizeIndianPhone } from "./phone";
import { makePolicyNumber, newPublicToken } from "./tokens";
import { paymentMessage, proposalMessage, whatsappLink } from "./whatsapp";

describe("normalizeIndianPhone", () => {
  it.each([
    ["98765 43210", "919876543210"],
    ["+91-98765-43210", "919876543210"],
    ["09876543210", "919876543210"],
    ["919876543210", "919876543210"],
  ])("normalises %s", (input, expected) => expect(normalizeIndianPhone(input)).toBe(expected));

  it.each(["12345", "5876543210", "98765432101", ""])("rejects %s", (input) => expect(normalizeIndianPhone(input)).toBeNull());

  it("formats for display", () => expect(formatPhone("919876543210")).toBe("+91 98765 43210"));
});

describe("format", () => {
  it("uses Indian digit grouping", () => expect(formatAmount(1234567)).toBe("12,34,567"));
  it("formats cover in lakh/crore", () => {
    expect(formatCover(10_000_000)).toBe("₹1 Cr");
    expect(formatCover(2_500_000)).toBe("₹25 L");
    expect(formatCover(540_000)).toBe("₹5.4 L");
    expect(formatCover(90_000)).toBe("₹90,000");
  });
});

describe("whatsapp", () => {
  const ctx = {
    customerName: "Rahul Verma",
    productName: "iSecure Term Plan",
    insurer: "Aegis Life",
    sumInsured: 10_000_000,
    termYears: 30,
    totalPremium: 10620,
    agentName: "Asha",
  };

  it("builds an encoded wa.me link", () => {
    expect(whatsappLink("919876543210", "Hi & bye")).toBe("https://wa.me/919876543210?text=Hi%20%26%20bye");
  });

  it("includes the PDF link and premium in the proposal message", () => {
    const msg = proposalMessage({ ...ctx, pdfUrl: "https://x.test/q/abc" });
    expect(msg).toContain("Hi Rahul");
    expect(msg).toContain("₹1 Cr for 30 years");
    expect(msg).toContain("₹10,620 per year");
    expect(msg).toContain("https://x.test/q/abc");
  });

  it("includes the payment link and email in the payment message", () => {
    const msg = paymentMessage({ ...ctx, paymentUrl: "https://rzp.io/l/x", customerEmail: "r@example.com" });
    expect(msg).toContain("https://rzp.io/l/x");
    expect(msg).toContain("r@example.com");
  });
});

describe("tokens", () => {
  it("generates distinct url-safe tokens", () => {
    const a = newPublicToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{24}$/);
    expect(a).not.toBe(newPublicToken());
  });
  it("formats policy numbers", () => expect(makePolicyNumber(42, new Date("2026-09-18"))).toBe("POL-2026-000042"));
});
