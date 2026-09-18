import { Sidebar } from "@/components/sidebar";
import { requireAgent } from "@/lib/auth/current";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const agent = await requireAgent();
  return (
    <div className="flex min-h-screen">
      <Sidebar agentName={agent.name} agentEmail={agent.email} />
      <main className="min-w-0 flex-1 px-10 py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
