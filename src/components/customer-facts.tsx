import { cx } from "@/components/ui";

/**
 * The at-a-glance facts grid for the customer detail screen.
 *
 * The `facts` array itself is built on the page and passed in verbatim — this
 * component only decides how it is *read*: one column on a phone, two from
 * `sm`, three from `xl`. The old fixed `grid-cols-3` crushed ten rows into
 * three columns at 375px, which is exactly where the screen lost its "at a
 * glance" promise.
 *
 * `monetary` names the rows whose value is a rupee figure (annual income, and
 * the vehicle row which carries the vehicle value), so those get the `amount`
 * utility and read in tabular numerals.
 */
export type CustomerFact = readonly [string, string];

export function CustomerFacts({
  facts,
  monetary = [],
}: {
  facts: CustomerFact[];
  monetary?: readonly string[];
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-fg-muted">{label}</dt>
            <dd className={cx("mt-0.5 break-words text-sm font-medium text-fg", monetary.includes(label) && "amount")}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}