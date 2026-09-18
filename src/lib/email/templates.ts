import { formatCover, formatDate, formatINR, formatTerm } from "@/lib/format";

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export interface PolicyEmailData {
  customerName: string;
  productName: string;
  insurer: string;
  policyNumber: string;
  startDate: string;
  sumInsured: number;
  termYears: number;
  totalPremium: number;
  paymentId: string | null;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  documentUrl: string;
}

export function policyStartedEmail(d: PolicyEmailData): { subject: string; html: string } {
  const e = (s: string) => escapeHtml(s);
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#64748b">${e(label)}</td><td style="padding:6px 0;text-align:right;font-weight:600">${e(value)}</td></tr>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#1d4ed8;color:#fff;border-radius:12px 12px 0 0;padding:24px">
<p style="margin:0;font-size:14px;opacity:.85">AgentDesk</p>
<h1 style="margin:8px 0 0;font-size:22px">Your policy has started</h1>
</div>
<div style="background:#fff;border-radius:0 0 12px 12px;padding:24px">
<p>Dear ${e(d.customerName)},</p>
<p>Thank you for your payment. Your <strong>${e(d.productName)}</strong> policy from ${e(d.insurer)} is now active.</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
${row("Policy number", d.policyNumber)}
${row("Start date", formatDate(d.startDate))}
${row("Cover", formatCover(d.sumInsured))}
${row("Policy term", formatTerm(d.termYears))}
${row("Premium paid (incl. GST)", formatINR(d.totalPremium))}
${d.paymentId ? row("Payment reference", d.paymentId) : ""}
</table>
<p><a href="${e(d.documentUrl)}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px">View your policy document</a></p>
<p style="font-size:14px;color:#475569">Questions? Your agent ${e(d.agentName)} is here to help: ${e(d.agentPhone)} · ${e(d.agentEmail)}</p>
</div>
<p style="font-size:12px;color:#94a3b8;text-align:center">This is a demo application. No real insurance cover has been issued.</p>
</div></body></html>`;
  return { subject: `Your ${d.productName} policy has started (${d.policyNumber})`, html };
}
