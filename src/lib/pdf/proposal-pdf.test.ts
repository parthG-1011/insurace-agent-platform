import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { buildProposalPdf, type ProposalPdfData } from "./proposal-pdf";

const data: ProposalPdfData = {
  reference: "QT-000042",
  issuedOn: "18 Sept 2026",
  status: "proposal",
  customer: {
    name: "राहुल Verma",
    phone: "+91 98123 00001",
    email: "rahul@example.com",
    dob: "1997-03-14",
    age: 29,
    gender: "Male",
    city: "Pune",
    smoker: false,
  },
  product: {
    name: "iSecure Term Plan",
    insurer: "Aegis Life",
    category: "Term Insurance",
    description: "Pure term life cover that pays a lump sum to the family. ".repeat(6),
    benefits: ["Cover up to 20x annual income", "Tax benefit under Sec 80C – ₹1.5 L"],
  },
  cover: { sumInsured: 10_000_000, termYears: 30, basePremium: 9000, gst: 1620, totalPremium: 10620, isVehicle: false },
  vehicle: null,
  agent: { name: "Asha Kulkarni", phone: "+91 98123 99999", email: "demo@agentdesk.in" },
};

describe("buildProposalPdf", () => {
  it("produces a loadable PDF even with non-Latin text", async () => {
    const bytes = await buildProposalPdf(data);
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(doc.getTitle()).toContain("QT-000042");
  });

  it("renders the policy variant with vehicle details", async () => {
    const bytes = await buildProposalPdf({
      ...data,
      status: "policy",
      policyNumber: "POL-2026-000042",
      vehicle: { type: "Car", regYear: 2022, value: 900_000 },
      cover: { ...data.cover, isVehicle: true },
    });
    expect((await PDFDocument.load(bytes)).getTitle()).toContain("Policy");
  });
});
