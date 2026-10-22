import { Skeleton } from "@/components/primitives";

/**
 * Shape-matched to the email log: header, then disclosure rows with the same
 * two-line summary the real rows use — subject and address on the left, status
 * badge and timestamp on the right.
 */
export default function EmailsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading emails">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-36" />
        {/* `max-w-full` keeps the description line inside a 375px viewport — a bare
            w-96 is 384px and pushes the whole page into a horizontal scroll. */}
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="overflow-hidden rounded-card border border-line bg-surface">
            <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}