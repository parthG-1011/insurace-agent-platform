import { formatCover, formatINR, formatTerm } from "@/lib/format";

export const whatsappLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

const firstName = (name: string) => name.trim().split(/\s+/)[0];

interface ShareContext {
  customerName: string;
  productName: string;
  insurer: string;
  sumInsured: number;
  termYears: number;
  totalPremium: number;
  agentName: string;
}

export function proposalMessage(c: ShareContext & { pdfUrl: string }): string {
  return [
    `Hi ${firstName(c.customerName)}, thank you for your time today. As discussed, here is your personalised ${c.productName} proposal from ${c.insurer}.`,
    "",
    `Cover: ${formatCover(c.sumInsured)} for ${formatTerm(c.termYears)}`,
    `Premium: ${formatINR(c.totalPremium)} per year (incl. GST)`,
    "",
    `View your proposal: ${c.pdfUrl}`,
    "",
    `Reply here if you have any questions. – ${c.agentName}`,
  ].join("\n");
}

export function paymentMessage(c: ShareContext & { paymentUrl: string; customerEmail: string }): string {
  return [
    `Hi ${firstName(c.customerName)}, great to hear you'd like to go ahead with ${c.productName}.`,
    "",
    `Pay the premium of ${formatINR(c.totalPremium)} securely here: ${c.paymentUrl}`,
    "",
    `Your policy starts as soon as the payment is complete, and you'll get a confirmation email at ${c.customerEmail}. – ${c.agentName}`,
  ].join("\n");
}
