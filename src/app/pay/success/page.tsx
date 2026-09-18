import { Card, Logo } from "@/components/ui";
import { getProposalBundleByToken } from "@/lib/data/queries";
import { formatDate, formatINR } from "@/lib/format";
import { reconcileProposal } from "@/lib/policy/activate";

// Razorpay redirects the customer here after checkout. We never trust the query string:
// the proposal is activated only if Razorpay's API confirms the link is paid.
export default async function PaymentSuccessPage({ searchParams }: PageProps<"/pay/success">) {
  const { proposal: token } = await searchParams;
  const bundle = typeof token === "string" ? await getProposalBundleByToken(token) : null;

  let status = bundle?.proposal.status;
  if (bundle) {
    try {
      status = (await reconcileProposal(bundle.proposal)).status;
    } catch (err) {
      console.error("Reconcile failed", err);
    }
  }
  const fresh = bundle && typeof token === "string" ? await getProposalBundleByToken(token) : null;
  const active = status === "policy_active";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <Logo className="justify-center" />
        {!bundle ? (
          <p className="mt-6 text-slate-600">We couldn't find this proposal.</p>
        ) : active ? (
          <>
            <div className="mx-auto mt-6 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</div>
            <h1 className="mt-4 text-xl font-semibold">Payment received. Your policy is active.</h1>
            <p className="mt-2 text-sm text-slate-600">
              {bundle.product.name} · {formatINR(bundle.proposal.totalPremium)}
            </p>
            {fresh?.proposal.policyNumber && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                Policy number <span className="font-mono font-semibold">{fresh.proposal.policyNumber}</span>
                {fresh.proposal.policyStartDate && <> · starts {formatDate(fresh.proposal.policyStartDate)}</>}
              </p>
            )}
            <p className="mt-4 text-sm text-slate-500">A confirmation email is on its way to {bundle.customer.email}.</p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-xl font-semibold">We're confirming your payment</h1>
            <p className="mt-2 text-sm text-slate-600">
              This usually takes a few seconds. You'll get an email at {bundle.customer.email} as soon as your policy starts.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
