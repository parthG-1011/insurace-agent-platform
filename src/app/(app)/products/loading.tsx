import { Skeleton } from "@/components/primitives";

/**
 * Shape-matched to the catalogue: header, the segmented category control at its
 * real height, then the card grid at the same 1 / 2 / 3 breakpoints the page uses,
 * so the swap into real plans changes only the greys.
 */
export default function ProductsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading products">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Same scroll container as the real tab bar, so the strip can never push the
          page wider than the viewport on a phone. */}
      <div className="mb-6 overflow-x-auto border border-line bg-raised rounded-[8px] p-1">
        <div className="flex w-max gap-1">
          {["w-16", "w-20", "w-24", "w-24", "w-20", "w-20"].map((w, i) => (
            <Skeleton key={i} className={`h-8 ${w}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          // Same internal rhythm as the real card: badge row, title, description,
          // three benefits, then the footer rule.
          <div key={i} className="flex flex-col rounded-card border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-4/6" />
            </div>
            <div className="mt-auto pt-4">
              <div className="flex gap-1.5 border-t border-line pt-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="mt-2 h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}