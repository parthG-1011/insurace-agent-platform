import { Logo } from "@/components/ui";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <Logo className="lg:hidden" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create your agent account</h1>
        <p className="mt-1 text-sm text-slate-500">Start selling in under a minute.</p>
      </div>
      <SignupForm />
    </div>
  );
}
