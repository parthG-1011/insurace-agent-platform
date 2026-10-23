import { Logo } from "@/components/ui";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <div className="space-y-6">
      <Logo className="lg:hidden" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">Welcome back. Sign in to your agent account.</p>
      </div>
      <div className="rounded-lg border border-accent/30 bg-accent-tint px-3 py-2.5 text-sm text-accent-ink">
        <p className="font-medium">Demo account</p>
        <p className="font-mono text-xs">demo@agentdesk.in / Demo@1234</p>
      </div>
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </div>
  );
}
