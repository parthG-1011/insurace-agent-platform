import { Logo } from "@/components/ui";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <div className="space-y-6">
      <Logo className="lg:hidden" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Sign in</h1>
        <p className="mt-1 text-sm text-fg-muted">Welcome back. Sign in to your agent account.</p>
      </div>
      <div className="rounded-card border border-line bg-primary-soft px-3.5 py-3">
        <p className="text-sm font-medium text-fg">Demo account</p>
        <p className="mt-0.5 font-mono text-xs text-fg-muted">demo@agentdesk.in / Demo@1234</p>
      </div>
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </div>
  );
}