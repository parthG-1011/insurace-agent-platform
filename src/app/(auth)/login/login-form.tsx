"use client";

import Link from "next/link";
import { useActionState } from "react";
import { buttonStyles, Field, inputStyles } from "@/components/ui";
import { loginAction } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" name="email">
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state?.values?.email} className={inputStyles} />
      </Field>
      <Field label="Password" name="password">
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputStyles} />
      </Field>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-slate-500">
        New agent?{" "}
        <Link href="/signup" className="font-medium text-blue-700 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
