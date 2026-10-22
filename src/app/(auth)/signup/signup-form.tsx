"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Input } from "@/components/primitives";
import { Field } from "@/components/ui";
import { signupAction } from "../actions";

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, undefined);
  const err = state?.fieldErrors ?? {};
  const v = state?.values ?? {};
  return (
    <form action={action} className="space-y-4">
      <Field label="Full name" name="name" error={err.name}>
        <Input
          id="name"
          name="name"
          required
          autoComplete="name"
          defaultValue={v.name}
          aria-invalid={!!err.name}
          aria-describedby={err.name ? "name-error" : undefined}
        />
      </Field>
      <Field label="Email" name="email" error={err.email}>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={v.email}
          aria-invalid={!!err.email}
          aria-describedby={err.email ? "email-error" : undefined}
        />
      </Field>
      <Field label="Mobile number" name="phone" error={err.phone} hint="Shown to customers on proposals">
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="98765 43210"
          defaultValue={v.phone}
          aria-invalid={!!err.phone}
          aria-describedby={err.phone ? "phone-error" : "phone-hint"}
        />
      </Field>
      <Field label="Password" name="password" error={err.password} hint="At least 8 characters">
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          aria-invalid={!!err.password}
          aria-describedby={err.password ? "password-error" : "password-hint"}
        />
      </Field>
      <Button type="submit" disabled={pending} aria-busy={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-fg-muted">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}