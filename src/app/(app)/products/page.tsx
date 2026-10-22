import Link from "next/link";
import { Check, Shield } from "@/components/icons";
import { EmptyState } from "@/components/primitives";
import { Badge, Card, cx, PageHeader } from "@/components/ui";
import { listActiveProducts } from "@/lib/data/queries";
import { formatCover, formatTerm } from "@/lib/format";
import { describeEligibility } from "@/lib/insurance/eligibility";
import { CATEGORIES, CATEGORY_LABEL, type Category } from "@/lib/insurance/types";

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const { category } = await searchParams;
  const active = CATEGORIES.includes(category as Category) ? (category as Category) : null;
  const all = await listActiveProducts();
  const shown = active ? all.filter((p) => p.category === active) : all;

  const tabs: { key: Category | null; label: string; count: number }[] = [
    { key: null, label: "All", count: all.length },
    ...CATEGORIES.map((c) => ({ key: c, label: CATEGORY_LABEL[c].replace(" Insurance", ""), count: all.filter((p) => p.category === c).length })),
  ];

  return (
    <>
      <PageHeader title="Products" description="Every plan you can offer, across insurers and categories." />

      {/* Segmented control: a filter is a control with one selected position, not a row
          of competing pills. Below `sm` it scrolls sideways — six categories wrapped
          into a tall stack pushed the catalogue off the fold on a phone. */}
      <div className="mb-6 -mx-1 overflow-x-auto px-1">
        <nav aria-label="Product category" className="flex w-max border border-line bg-raised rounded-[8px] p-1">
          {tabs.map((t) => (
            <Link
              key={t.label}
              href={t.key ? `/products?category=${t.key}` : "/products"}
              aria-current={active === t.key ? "page" : undefined}
              className={cx(
                "rounded-[6px] px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                active === t.key ? "bg-surface text-fg font-medium" : "text-fg-muted hover:text-fg",
              )}
            >
              {t.label} <span className="text-fg-subtle">{t.count}</span>
            </Link>
          ))}
        </nav>
      </div>

      {shown.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Shield />}
            title="No plans in this category"
            description="Nothing is published for this filter right now. Try another category, or check back once plans are added."
            action={
              active ? (
                <Link href="/products" className="text-sm font-medium text-primary hover:underline">
                  See all products
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <Card key={p.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="blue">{CATEGORY_LABEL[p.category]}</Badge>
                <span className="text-xs text-fg-muted">{p.insurer}</span>
              </div>
              <h3 className="mt-3 font-semibold text-fg">{p.name}</h3>
              <p className="mt-1 text-sm text-fg-muted">{p.description}</p>
              <ul className="mt-3 space-y-1 text-sm text-fg">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                <div className="flex flex-wrap gap-1.5 border-t border-line pt-3">
                  {describeEligibility(p.eligibility).map((e) => (
                    <Badge key={e}>{e}</Badge>
                  ))}
                </div>
                <p className="mt-2 text-xs text-fg-muted">
                  {p.pricing.kind === "vehicle"
                    ? "Cover based on the vehicle's insured declared value · 1 year"
                    : `Cover up to ${formatCover(p.defaultSumInsured)} · ${formatTerm(p.defaultTermYears)}`}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}