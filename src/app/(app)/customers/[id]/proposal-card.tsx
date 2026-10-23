import { ActionButton, CopyButton, WhatsAppButton } from "@/components/action-button";
import { StatusStepper } from "@/components/status";
import { Badge, buttonStyles, Card } from "@/components/ui";
import type { Customer, EmailLogEntry, Product, Proposal } from "@/lib/db/schema";
import { formatCover, formatDate, formatDateTime, formatINR, formatTerm } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/insurance/types";
import { proposalReference } from "@/lib/tokens";
import { paymentMessage, proposalMessage, whatsappLink } from "@/lib/whatsapp";
import { createPaymentLinkAction, markSharedAction, refreshPaymentStatusAction } from "./actions";

const EMAIL_TONE = { sent: "emerald", failed: "red", skipped: "amber" } as const;

export function ProposalCard({
  proposal,
  product,
  customer,
  agentName,
  appUrl,
  email,
}: {
  proposal: Proposal;
  product: Product;
  customer: Customer;
  agentName: string;
  appUrl: string;
  email?: EmailLogEntry;
}) {
  const pdfUrl = `${appUrl}/q/${proposal.publicToken}`;
  const ctx = {
    customerName: customer.name,
    productName: product.name,
    insurer: product.insurer,
    sumInsured: proposal.sumInsured,
    termYears: proposal.termYears,
    totalPremium: proposal.totalPremium,
    agentName,
  };
  const active = proposal.status === "policy_active";

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="blue">{CATEGORY_LABEL[product.category]}</Badge>
            <span className="font-mono text-xs text-ink-faint">{proposalReference(proposal.id)}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-ink-muted">
            {product.insurer} · Cover {formatCover(proposal.sumInsured)} · {formatTerm(proposal.termYears)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">{formatINR(proposal.totalPremium)}</p>
          <p className="text-xs text-ink-muted">
            per year · {formatINR(proposal.basePremium)} + {formatINR(proposal.gst)} GST
          </p>
        </div>
      </div>

      <div className="border-t border-line-soft px-5 py-3">
        <StatusStepper status={proposal.status} />
      </div>

      {active ? (
        <div className="space-y-3 border-t border-line-soft bg-success-tint p-5 text-sm">
          <p className="font-medium text-success-ink">
            Policy active · <span className="font-mono">{proposal.policyNumber}</span> · started{" "}
            {proposal.policyStartDate && formatDate(proposal.policyStartDate)}
          </p>
          <p className="text-success-ink/80">
            Paid {proposal.paidAt && formatDateTime(proposal.paidAt)}
            {proposal.razorpayPaymentId && <> · Razorpay payment {proposal.razorpayPaymentId}</>}
          </p>
          {email && (
            <p className="flex items-center gap-2 text-ink-strong">
              Confirmation email to {email.to}: <Badge tone={EMAIL_TONE[email.status]}>{email.status}</Badge>
              {email.error && <span className="text-xs text-ink-muted">({email.error})</span>}
            </p>
          )}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles.secondary}>
            View policy document
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-line-soft border-t border-line-soft">
          <div className="space-y-3 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">1 · Share the proposal</p>
            <div className="flex flex-wrap gap-2">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles.secondary}>
                View PDF
              </a>
              <WhatsAppButton
                href={whatsappLink(customer.phone, proposalMessage({ ...ctx, pdfUrl }))}
                onShare={markSharedAction.bind(null, proposal.id)}
              >
                Share PDF on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
          <div className="space-y-3 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">2 · Collect payment</p>
            {proposal.razorpayLinkUrl ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <WhatsAppButton
                    href={whatsappLink(
                      customer.phone,
                      paymentMessage({ ...ctx, paymentUrl: proposal.razorpayLinkUrl, customerEmail: customer.email }),
                    )}
                  >
                    Share payment link
                  </WhatsAppButton>
                  <ActionButton action={refreshPaymentStatusAction.bind(null, proposal.id)} pendingLabel="Checking…">
                    Check payment
                  </ActionButton>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className="truncate font-mono">{proposal.razorpayLinkUrl}</span>
                  <CopyButton value={proposal.razorpayLinkUrl} />
                </div>
              </>
            ) : (
              <ActionButton
                action={createPaymentLinkAction.bind(null, proposal.id)}
                variant="primary"
                pendingLabel="Creating link…"
              >
                Generate payment link
              </ActionButton>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
