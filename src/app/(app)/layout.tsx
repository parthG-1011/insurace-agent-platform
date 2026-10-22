import { Sidebar } from "@/components/sidebar";
import { requireAgent } from "@/lib/auth/current";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const agent = await requireAgent();
  return (
    <div className="min-h-screen bg-canvas">
      {/* Below `lg` the sidebar is only a 56px top bar, so it sits on its own
          row above the content. From `lg` up that bar is hidden and the column
          + content share the row below. */}
      <Sidebar variant="bar" agentName={agent.name} agentEmail={agent.email} />
      <div className="flex min-h-0">
        <Sidebar variant="column" agentName={agent.name} agentEmail={agent.email} />
        <main className="min-w-0 flex-1 px-4 py-5 lg:px-8 lg:py-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}