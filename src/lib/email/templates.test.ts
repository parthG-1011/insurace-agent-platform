import { describe, expect, it } from "vitest";
import { policyStartedEmail } from "./templates";

const data = {
  customerName: "Rahul <script>",
  productName: "iSecure Term Plan",
  insurer: "Aegis Life",
  policyNumber: "POL-2026-000042",
  startDate: "2026-09-18",
  sumInsured: 10_000_000,
  termYears: 30,
  totalPremium: 10620,
  paymentId: "pay_123",
  agentName: "Asha",
  agentPhone: "+91 98123 99999",
  agentEmail: "demo@agentdesk.in",
  documentUrl: "https://x.test/q/abc",
};

describe("policyStartedEmail", () => {
  it("includes the policy details", () => {
    const { subject, html } = policyStartedEmail(data);
    expect(subject).toBe("Your iSecure Term Plan policy has started (POL-2026-000042)");
    for (const s of ["POL-2026-000042", "₹1 Cr", "₹10,620", "pay_123", "https://x.test/q/abc"]) expect(html).toContain(s);
  });
  it("escapes customer-provided text", () => {
    const { html } = policyStartedEmail(data);
    expect(html).toContain("Rahul &lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
