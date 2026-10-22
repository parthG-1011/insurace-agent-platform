import { Skeleton } from "@/components/primitives";

/**
 * Shape-matched skeleton for the whole route group, so entering a screen is a
 * swap of grey blocks into real content rather than a spinner and a jump.
 * Four stat tiles + an activity table mirror the dashboard's own layout.
 */
export default function AppLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 rounded-card border border-line bg-surface p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
        <div className="border-b border-line px-5 py-4">
          <Skeleton className="h-4 w-36" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="hidden h-3.5 w-32 sm:block" />
            <Skeleton className="ml-auto h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}