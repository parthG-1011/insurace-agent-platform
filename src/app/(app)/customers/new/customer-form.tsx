"use client";

import { useActionState, useState } from "react";
import { AlertCircle } from "@/components/icons";
import { Button, Input, Select } from "@/components/primitives";
import { Field } from "@/components/ui";
import { createCustomerAction } from "./actions";

/**
 * `aria-invalid` and `aria-describedby` are what make the validation readable
 * rather than merely red: the error text below each control is the describedby
 * target, so a screen reader announces the reason when focus lands there.
 * `primitives`' control base already carries `aria-[invalid=true]:border-danger`,
 * so the invalid control gets the danger border without any per-field class.
 */
const describedBy = (name: string, error?: string, hint?: string) =>
  error ? `${name}-error` : hint ? `${name}-hint` : undefined;

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    /* The heading column is only a third of the width from `lg` up — below it
       the two columns stacked, which is what made this the widest form in the
       product to fill in. */
    <section className="grid gap-6 rounded-card border border-line bg-surface p-5 lg:grid-cols-3 lg:gap-8 lg:p-6">
      <div>
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        <p className="mt-1 text-xs text-fg-muted">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">{children}</div>
    </section>
  );
}

function Checkbox({
  name,
  defaultChecked,
  children,
}: {
  name: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}) {
  return (
    /* Implicit-label wrapping kept — the checkbox and its text stay one target.
       The padded hit area is the label, so the whole row is clickable. */
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-control px-1 py-1 text-sm text-fg hover:bg-overlay">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 shrink-0 rounded border-line-strong accent-primary"
      />
      {children}
    </label>
  );
}

export function CustomerForm() {
  const [state, action, pending] = useActionState(createCustomerAction, undefined);
  const e = state?.fieldErrors ?? {};
  const v = state?.values ?? {};
  const [vehicleType, setVehicleType] = useState(v.vehicleType ?? "none");

  return (
    /* `pb-24` clears the fixed submit bar on phones so the last field is never
       trapped underneath it. */
    <form action={action} className="space-y-4 pb-24 lg:space-y-5 lg:pb-0" noValidate>
      <Section title="Contact" description="Used to share the proposal and payment link on WhatsApp, and send the policy email.">
        <Field label="Full name" name="name" error={e.name}>
          <Input
            id="name"
            name="name"
            defaultValue={v.name}
            placeholder="Rahul Verma"
            aria-invalid={!!e.name}
            aria-describedby={describedBy("name", e.name)}
          />
        </Field>
        <Field label="WhatsApp mobile number" name="phone" error={e.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={v.phone}
            placeholder="98765 43210"
            aria-invalid={!!e.phone}
            aria-describedby={describedBy("phone", e.phone)}
          />
        </Field>
        <Field label="Email" name="email" error={e.email}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={v.email}
            placeholder="rahul@example.com"
            aria-invalid={!!e.email}
            aria-describedby={describedBy("email", e.email)}
          />
        </Field>
        <Field label="City" name="city" error={e.city}>
          <Input
            id="city"
            name="city"
            defaultValue={v.city}
            placeholder="Pune"
            aria-invalid={!!e.city}
            aria-describedby={describedBy("city", e.city)}
          />
        </Field>
      </Section>

      <Section title="Personal & financial" description="Decides which plans the customer qualifies for, and the premium.">
        <Field label="Date of birth" name="dob" error={e.dob}>
          <Input
            id="dob"
            name="dob"
            type="date"
            defaultValue={v.dob}
            aria-invalid={!!e.dob}
            aria-describedby={describedBy("dob", e.dob)}
          />
        </Field>
        <Field label="Gender" name="gender" error={e.gender}>
          <Select
            id="gender"
            name="gender"
            defaultValue={v.gender ?? ""}
            aria-invalid={!!e.gender}
            aria-describedby={describedBy("gender", e.gender)}
          >
            <option value="" disabled>Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Annual income (₹)" name="annualIncome" error={e.annualIncome}>
          <Input
            id="annualIncome"
            name="annualIncome"
            type="number"
            min={0}
            step={10000}
            defaultValue={v.annualIncome}
            placeholder="1200000"
            className="amount"
            aria-invalid={!!e.annualIncome}
            aria-describedby={describedBy("annualIncome", e.annualIncome)}
          />
        </Field>
        <Field label="Dependants" name="dependants" error={e.dependants} hint="Spouse, children or parents to cover">
          <Input
            id="dependants"
            name="dependants"
            type="number"
            min={0}
            max={10}
            defaultValue={v.dependants ?? "0"}
            aria-invalid={!!e.dependants}
            aria-describedby={describedBy("dependants", e.dependants, "Spouse, children or parents to cover")}
          />
        </Field>
        <Checkbox name="smoker" defaultChecked={v.smoker === "on"}>
          Smokes or uses tobacco
        </Checkbox>
        <Checkbox name="preExistingCondition" defaultChecked={v.preExistingCondition === "on"}>
          Has a pre-existing medical condition
        </Checkbox>
      </Section>

      <Section title="Vehicle" description="Only needed for vehicle insurance.">
        <Field label="Vehicle owned" name="vehicleType">
          <Select
            id="vehicleType"
            name="vehicleType"
            value={vehicleType}
            onChange={(ev) => setVehicleType(ev.target.value)}
          >
            <option value="none">No vehicle</option>
            <option value="car">Car</option>
            <option value="two_wheeler">Two-wheeler</option>
          </Select>
        </Field>
        <div aria-hidden />
        {vehicleType !== "none" && (
          <>
            <Field label="Registration year" name="vehicleRegYear" error={e.vehicleRegYear}>
              <Input
                id="vehicleRegYear"
                name="vehicleRegYear"
                type="number"
                min={1990}
                defaultValue={v.vehicleRegYear}
                placeholder="2022"
                aria-invalid={!!e.vehicleRegYear}
                aria-describedby={describedBy("vehicleRegYear", e.vehicleRegYear)}
              />
            </Field>
            <Field label="Current market value (₹)" name="vehicleValue" error={e.vehicleValue}>
              <Input
                id="vehicleValue"
                name="vehicleValue"
                type="number"
                min={0}
                step={1000}
                defaultValue={v.vehicleValue}
                placeholder="800000"
                className="amount"
                aria-invalid={!!e.vehicleValue}
                aria-describedby={describedBy("vehicleValue", e.vehicleValue)}
              />
            </Field>
          </>
        )}
      </Section>

      {state?.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-control border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      ) : null}

      {/* Desktop: in the flow, where the eye already is after the last field. */}
      <div className="hidden items-center justify-end gap-3 lg:flex">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Saving…" : "Save & see eligible plans"}
        </Button>
      </div>

      {/* Phone: this form is long enough that reaching the submit means a
          scroll past three screens of fields. A fixed bar keeps it one tap
          away the whole way down. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <Button type="submit" disabled={pending} aria-busy={pending} className="w-full">
          {pending ? "Saving…" : "Save & see eligible plans"}
        </Button>
      </div>
    </form>
  );
}