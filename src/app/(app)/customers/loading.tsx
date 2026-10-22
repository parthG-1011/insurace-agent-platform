import { Skeleton } from "@/components/primitives";

/**
 * Shape-matched to the customers list, so the swap into real rows changes only
 * the greys: the search field, then a header row and five rows with the same
 * column widths the table uses.
 */
export default function CustomersLoading() {
  return (
    <div aria-busy="true" aria-label="Loading customers">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="mb-4 flex max-w-lg gap-2">
        <Skeleton className="h-9.5 flex-1" />
        <Skeleton className="h-9.5 w-24" />
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <div className="flex items-center gap-4 border-b border-line bg-raised px-5 py-2.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="hidden h-3 w-24 sm:block" />
          <Skeleton className="hidden h-3 w-20 md:block" />
          <Skeleton className="hidden h-3 w-36 md:block" />
          <Skeleton className="ml-auto hidden h-3 w-16 md:block" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="hidden h-3.5 w-28 md:block" />
            <Skeleton className="hidden h-3.5 w-24 lg:block" />
            <Skeleton className="hidden h-6 w-36 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}