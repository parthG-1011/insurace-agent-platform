import { Skeleton } from "@/components/primitives";

/**
 * The customer lands here from Razorpay and waits here while the payment is
 * confirmed, so the skeleton holds the same centred single column the page does
 * — the layout does not jump when the real card replaces it.
 */
export default function PaymentSuccessLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div aria-busy="true" aria-label="Confirming your payment" className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center">
        <div className="flex justify-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-28 self-center" />
        </div>
        <div className="mt-6 space-y-2.5">
          <Skeleton className="mx-auto h-4 w-3/4" />
          <Skeleton className="mx-auto h-3 w-1/2" />
        </div>
        <Skeleton className="mt-6 h-9 w-32 rounded-full" />
        <div className="mt-6 space-y-2">
          <Skeleton className="mx-auto h-5 w-2/3" />
          <Skeleton className="mx-auto h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}