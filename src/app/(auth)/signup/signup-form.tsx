"use client";

import Link from "next/link";
import { useActionState } from "react";
import { buttonStyles, Field, inputStyles } from "@/components/ui";
import { signupAction } from "../actions";

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, undefined);
  const err = state?.fieldErrors ?? {};
  const v = state?.values ?? {};
  return (
    <form action={action} className="space-y-4">
      <Field label="Full name" name="name" error={err.name}>
        <input id="name" name="name" required autoComplete="name" defaultValue={v.name} className={inputStyles} />
      </Field>
      <Field label="Email" name="email" error={err.email}>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={v.email} className={inputStyles} />
      </Field>
      <Field label="Mobile number" name="phone" error={err.phone} hint="Shown to customers on proposals">
        <input id="phone" name="phone" type="tel" required placeholder="98765 43210" defaultValue={v.phone} className={inputStyles} />
      </Field>
      <Field label="Password" name="password" error={err.password} hint="At least 8 characters">
        <input id="password" name="password" type="password" required autoComplete="new-password" className={inputStyles} />
      </Field>
      <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full`}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-blue-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
