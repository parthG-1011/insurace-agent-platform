import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { formatAmount, formatCover, formatTerm } from "@/lib/format";

export interface ProposalPdfData {
  reference: string;
  issuedOn: string;
  status: "proposal" | "policy";
  policyNumber?: string | null;
  customer: { name: string; phone: string; email: string; dob: string; age: number; gender: string; city: string; smoker: boolean };
  product: { name: string; insurer: string; category: string; description: string; benefits: string[] };
  cover: { sumInsured: number; termYears: number; basePremium: number; gst: number; totalPremium: number; isVehicle: boolean };
  vehicle?: { type: string; regYear: number; value: number } | null;
  agent: { name: string; phone: string; email: string };
}

// Standard PDF fonts only cover WinAnsi; replace anything else (e.g. ₹, Devanagari) so drawing never throws.
const safe = (s: string) => s.replace(/₹/g, "Rs. ").replace(/[–—]/g, "-").replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
const rs = (n: number) => `Rs. ${formatAmount(n)}`;

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 48;
const BLUE = rgb(0.11, 0.3, 0.85);
const INK = rgb(0.06, 0.09, 0.16);
const MUTED = rgb(0.4, 0.45, 0.53);
const LINE = rgb(0.89, 0.91, 0.94);

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of safe(text).split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildProposalPdf(d: ProposalPdfData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${d.status === "policy" ? "Policy" : "Proposal"} ${d.reference} - ${safe(d.product.name)}`);
  pdf.setAuthor("AgentDesk");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = A4[0] - MARGIN * 2;

  let page: PDFPage = pdf.addPage(A4);
  let y = 0;

  const text = (s: string, x: number, size = 10, f = font, color = INK) =>
    page.drawText(safe(s), { x, y, size, font: f, color });
  const rightText = (s: string, xRight: number, size = 10, f = font, color = INK) =>
    page.drawText(safe(s), { x: xRight - f.widthOfTextAtSize(safe(s), size), y, size, font: f, color });
  const ensure = (h: number) => {
    if (y - h < 56) {
      page = pdf.addPage(A4);
      y = A4[1] - MARGIN;
    }
  };
  const heading = (s: string) => {
    ensure(76); // keep a heading together with the start of its section
    y -= 26;
    text(s.toUpperCase(), MARGIN, 9, bold, BLUE);
    y -= 8;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + width, y }, thickness: 0.8, color: LINE });
    y -= 16;
  };
  const pairs = (rows: [string, string][]) => {
    const colW = width / 2;
    for (let i = 0; i < rows.length; i += 2) {
      ensure(30);
      for (const [j, [label, value]] of rows.slice(i, i + 2).entries()) {
        const x = MARGIN + j * colW;
        text(label, x, 8, font, MUTED);
        y -= 12;
        text(value, x, 10.5, bold);
        y += 12;
      }
      y -= 30;
    }
  };

  // Header band
  page.drawRectangle({ x: 0, y: A4[1] - 96, width: A4[0], height: 96, color: BLUE });
  y = A4[1] - 50;
  text("AgentDesk", MARGIN, 22, bold, rgb(1, 1, 1));
  rightText(d.status === "policy" ? "POLICY DOCUMENT" : "INSURANCE PROPOSAL", A4[0] - MARGIN, 11, bold, rgb(1, 1, 1));
  y = A4[1] - 72;
  text(d.status === "policy" ? "Your policy is active" : "Personalised quote prepared for you", MARGIN, 10, font, rgb(0.85, 0.9, 1));
  rightText(`Ref ${d.reference}  |  ${d.issuedOn}`, A4[0] - MARGIN, 9, font, rgb(0.85, 0.9, 1));
  y = A4[1] - 110;

  if (d.status === "policy" && d.policyNumber) {
    y -= 18;
    page.drawRectangle({ x: MARGIN, y: y - 8, width, height: 26, color: rgb(0.92, 0.98, 0.94) });
    text(`Policy number ${d.policyNumber} - payment received, cover in force`, MARGIN + 10, 10, bold, rgb(0.02, 0.45, 0.25));
    y -= 12;
  }

  heading("Prepared for");
  pairs([
    ["Name", d.customer.name],
    ["Mobile", d.customer.phone],
    ["Email", d.customer.email],
    ["City", d.customer.city],
    ["Date of birth", `${d.customer.dob} (age ${d.customer.age})`],
    ["Gender / Tobacco", `${d.customer.gender} / ${d.customer.smoker ? "Smoker" : "Non-smoker"}`],
  ]);
  if (d.vehicle) {
    pairs([
      ["Vehicle", `${d.vehicle.type}, registered ${d.vehicle.regYear}`],
      ["Declared market value", rs(d.vehicle.value)],
    ]);
  }

  heading("Plan");
  ensure(40);
  text(d.product.name, MARGIN, 14, bold);
  y -= 15;
  text(`${d.product.insurer}  |  ${d.product.category}`, MARGIN, 9.5, font, MUTED);
  y -= 16;
  for (const line of wrap(d.product.description, font, 10, width)) {
    ensure(14);
    text(line, MARGIN, 10);
    y -= 14;
  }

  heading("Cover and premium");
  const tableRows: [string, string, boolean][] = [
    [d.cover.isVehicle ? "Insured declared value (IDV)" : "Sum insured", `Rs. ${formatAmount(d.cover.sumInsured)} (${formatCover(d.cover.sumInsured, "")})`, false],
    ["Policy term", formatTerm(d.cover.termYears), false],
    ["Annual premium", rs(d.cover.basePremium), false],
    ["GST @ 18%", rs(d.cover.gst), false],
    ["Total payable per year", rs(d.cover.totalPremium), true],
  ];
  for (const [label, value, strong] of tableRows) {
    ensure(24);
    if (strong) page.drawRectangle({ x: MARGIN, y: y - 7, width, height: 24, color: rgb(0.93, 0.95, 1) });
    text(label, MARGIN + 8, strong ? 11 : 10, strong ? bold : font, strong ? INK : MUTED);
    rightText(value, MARGIN + width - 8, strong ? 12 : 10, bold, strong ? BLUE : INK);
    y -= 24;
  }

  heading("Key benefits");
  for (const benefit of d.product.benefits) {
    const lines = wrap(benefit, font, 10, width - 14);
    ensure(lines.length * 14);
    page.drawCircle({ x: MARGIN + 3, y: y + 3.5, size: 2, color: BLUE });
    for (const line of lines) {
      text(line, MARGIN + 14, 10);
      y -= 14;
    }
  }

  heading("Next steps");
  const steps =
    d.status === "policy"
      ? "Your premium has been received and your policy is active from the start date above. Keep this document for your records."
      : "If you are happy with this proposal, let your agent know on WhatsApp. They will send you a secure Razorpay payment link. Your policy starts as soon as the payment is complete, and you will receive a confirmation email.";
  for (const line of wrap(steps, font, 10, width)) {
    ensure(14);
    text(line, MARGIN, 10);
    y -= 14;
  }

  heading("Your agent");
  pairs([
    ["Name", d.agent.name],
    ["Contact", `${d.agent.phone}  |  ${d.agent.email}`],
  ]);

  // Footer on every page
  for (const p of pdf.getPages()) {
    p.drawText(
      safe("Demo application - premiums are illustrative and no real insurance cover is issued. Quote valid for 15 days."),
      { x: MARGIN, y: 28, size: 7.5, font, color: MUTED },
    );
  }

  return pdf.save();
}
