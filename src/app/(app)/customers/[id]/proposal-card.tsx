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
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{CATEGORY_LABEL[product.category]}</Badge>
            <span className="font-mono text-xs text-fg-subtle">{proposalReference(proposal.id)}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-fg">{product.name}</h3>
          <p className="text-sm text-fg-muted">
            {product.insurer} · Cover {formatCover(proposal.sumInsured)} · {formatTerm(proposal.termYears)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="amount text-2xl font-semibold text-fg">{formatINR(proposal.totalPremium)}</p>
          <p className="amount text-xs text-fg-muted">
            per year · {formatINR(proposal.basePremium)} + {formatINR(proposal.gst)} GST
          </p>
        </div>
      </div>

      {/* The five status steps are ~450px wide and do not fit 375px. The Card
          clips its overflow, so this row scrolls sideways rather than silently
          hiding the last steps. StatusStepper itself is unchanged. */}
      <div className="overflow-x-auto border-t border-line px-5 py-3">
        <StatusStepper status={proposal.status} />
      </div>

      {active ? (
        <div className="space-y-3 border-t border-line bg-success/5 p-5 text-sm">
          <p className="font-medium text-success">
            Policy active · <span className="font-mono">{proposal.policyNumber}</span> · started{" "}
            {proposal.policyStartDate && formatDate(proposal.policyStartDate)}
          </p>
          <p className="text-fg-muted">
            Paid {proposal.paidAt && formatDateTime(proposal.paidAt)}
            {proposal.razorpayPaymentId && <> · Razorpay payment {proposal.razorpayPaymentId}</>}
          </p>
          {email && (
            <p className="flex flex-wrap items-center gap-2 text-fg-muted">
              Confirmation email to {email.to}: <Badge tone={EMAIL_TONE[email.status]}>{email.status}</Badge>
              {email.error && <span className="text-xs text-fg-subtle">({email.error})</span>}
            </p>
          )}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles.secondary}>
            View policy document
          </a>
        </div>
      ) : (
        /* The two stages really are a sequence, so the number carries real
           information here — it is the step the agent is on. */
        <div className="grid grid-cols-1 divide-y divide-line border-t border-line md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="space-y-3 p-5">
            <StepLabel n={1}>Share the proposal</StepLabel>
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
            <StepLabel n={2}>Collect payment</StepLabel>
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
                <div className="flex items-center gap-2 text-xs text-fg-muted">
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

function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold text-fg-muted">
      <span className="grid h-4.5 w-4.5 place-items-center rounded-pill bg-primary-soft text-[10px] font-semibold text-primary">
        {n}
      </span>
      {children}
    </p>
  );
}