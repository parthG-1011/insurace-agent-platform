"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Input } from "@/components/primitives";
import { Field } from "@/components/ui";
import { loginAction } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  /* `loginAction` has no field-level errors — it returns one form-level message
     for wrong credentials — so the error is announced by the banner below rather
     than marked invalid on a field that may well be correct. */
  const error = state?.error;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" name="email">
        <Input id="email" name="email" type="email" required autoComplete="email" defaultValue={state?.values?.email} />
      </Field>
      <Field label="Password" name="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </Field>
      {error ? (
        <p
          role="alert"
          className="rounded-[8px] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} aria-busy={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-fg-muted">
        New agent?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}