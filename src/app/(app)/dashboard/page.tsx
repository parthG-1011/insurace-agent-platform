import Link from "next/link";
import { ActivityTable } from "@/components/activity-table";
import { Plus } from "@/components/icons";
import { StatCard } from "@/components/stat-card";
import { buttonStyles, PageHeader } from "@/components/ui";
import { requireAgent } from "@/lib/auth/current";
import { getDashboard } from "@/lib/data/queries";

export default async function DashboardPage() {
  const agent = await requireAgent();
  const d = await getDashboard(agent.id);

  // Tone is meaning here, not decoration — see `StatCard`. The hints say what
  // each number counts, so an agent reads it without a tooltip.
  const stats = [
    { label: "Customers", value: d.customers, hint: "people you work with", tone: "neutral" as const },
    { label: "Open quotes", value: d.quoted, hint: "quotes + shared", tone: "info" as const },
    { label: "Awaiting payment", value: d.paymentPending, hint: "premium still to collect", tone: "warning" as const },
    { label: "Active policies", value: d.active, hint: "paid + policy active", tone: "success" as const },
  ];

  return (
    <>
      <PageHeader
        title={`Hello, ${agent.name.split(" ")[0]}`}
        description="Here's where your customers are in the journey."
        actions={
          <Link href="/customers/new" className={buttonStyles.primary}>
            <Plus className="h-4 w-4" />
            New customer
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} hint={s.hint} tone={s.tone} />
        ))}
      </div>

      <ActivityTable recent={d.recent} />
    </>
  );
}