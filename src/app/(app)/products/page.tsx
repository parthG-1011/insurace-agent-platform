import Link from "next/link";
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
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/products?category=${t.key}` : "/products"}
            className={cx(
              "rounded-full px-3.5 py-1.5 text-sm font-medium",
              active === t.key ? "bg-accent text-white" : "bg-surface text-ink-muted ring-1 ring-line hover:bg-elevated",
            )}
          >
            {t.label} <span className="opacity-70">{t.count}</span>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {shown.map((p) => (
          <Card key={p.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <Badge tone="blue">{CATEGORY_LABEL[p.category]}</Badge>
              <span className="text-xs text-ink-muted">{p.insurer}</span>
            </div>
            <h3 className="mt-3 font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-ink-muted">{p.description}</p>
            <ul className="mt-3 space-y-1 text-sm text-ink-strong">
              {p.benefits.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-success-ink">✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-4">
              <div className="flex flex-wrap gap-1.5 border-t border-line-soft pt-3">
                {describeEligibility(p.eligibility).map((e) => (
                  <Badge key={e}>{e}</Badge>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                {p.pricing.kind === "vehicle"
                  ? "Cover based on the vehicle's insured declared value · 1 year"
                  : `Cover up to ${formatCover(p.defaultSumInsured)} · ${formatTerm(p.defaultTermYears)}`}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
