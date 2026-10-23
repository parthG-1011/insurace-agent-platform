"use client";

import { useActionState, useState } from "react";
import { buttonStyles, Card, Field, inputStyles } from "@/components/ui";
import { createCustomerAction } from "./actions";

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="grid grid-cols-3 gap-8 p-6">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      <div className="col-span-2 grid grid-cols-2 gap-4">{children}</div>
    </Card>
  );
}

export function CustomerForm() {
  const [state, action, pending] = useActionState(createCustomerAction, undefined);
  const e = state?.fieldErrors ?? {};
  const v = state?.values ?? {};
  const [vehicleType, setVehicleType] = useState(v.vehicleType ?? "none");

  return (
    <form action={action} className="space-y-5" noValidate>
      <Section title="Contact" description="Used to share the proposal and payment link on WhatsApp, and send the policy email.">
        <Field label="Full name" name="name" error={e.name}>
          <input id="name" name="name" defaultValue={v.name} className={inputStyles} placeholder="Rahul Verma" />
        </Field>
        <Field label="WhatsApp mobile number" name="phone" error={e.phone}>
          <input id="phone" name="phone" type="tel" defaultValue={v.phone} className={inputStyles} placeholder="98765 43210" />
        </Field>
        <Field label="Email" name="email" error={e.email}>
          <input id="email" name="email" type="email" defaultValue={v.email} className={inputStyles} placeholder="rahul@example.com" />
        </Field>
        <Field label="City" name="city" error={e.city}>
          <input id="city" name="city" defaultValue={v.city} className={inputStyles} placeholder="Pune" />
        </Field>
      </Section>

      <Section title="Personal & financial" description="Decides which plans the customer qualifies for, and the premium.">
        <Field label="Date of birth" name="dob" error={e.dob}>
          <input id="dob" name="dob" type="date" defaultValue={v.dob} className={inputStyles} />
        </Field>
        <Field label="Gender" name="gender" error={e.gender}>
          <select id="gender" name="gender" defaultValue={v.gender ?? ""} className={inputStyles}>
            <option value="" disabled>Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Annual income (₹)" name="annualIncome" error={e.annualIncome}>
          <input id="annualIncome" name="annualIncome" type="number" min={0} step={10000} defaultValue={v.annualIncome} className={inputStyles} placeholder="1200000" />
        </Field>
        <Field label="Dependants" name="dependants" error={e.dependants} hint="Spouse, children or parents to cover">
          <input id="dependants" name="dependants" type="number" min={0} max={10} defaultValue={v.dependants ?? "0"} className={inputStyles} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-ink-strong">
          <input type="checkbox" name="smoker" defaultChecked={v.smoker === "on"} className="h-4 w-4 rounded border-line" />
          Smokes or uses tobacco
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-strong">
          <input type="checkbox" name="preExistingCondition" defaultChecked={v.preExistingCondition === "on"} className="h-4 w-4 rounded border-line" />
          Has a pre-existing medical condition
        </label>
      </Section>

      <Section title="Vehicle" description="Only needed for vehicle insurance.">
        <Field label="Vehicle owned" name="vehicleType">
          <select id="vehicleType" name="vehicleType" value={vehicleType} onChange={(ev) => setVehicleType(ev.target.value)} className={inputStyles}>
            <option value="none">No vehicle</option>
            <option value="car">Car</option>
            <option value="two_wheeler">Two-wheeler</option>
          </select>
        </Field>
        <div />
        {vehicleType !== "none" && (
          <>
            <Field label="Registration year" name="vehicleRegYear" error={e.vehicleRegYear}>
              <input id="vehicleRegYear" name="vehicleRegYear" type="number" min={1990} defaultValue={v.vehicleRegYear} className={inputStyles} placeholder="2022" />
            </Field>
            <Field label="Current market value (₹)" name="vehicleValue" error={e.vehicleValue}>
              <input id="vehicleValue" name="vehicleValue" type="number" min={0} step={1000} defaultValue={v.vehicleValue} className={inputStyles} placeholder="800000" />
            </Field>
          </>
        )}
      </Section>

      <div className="flex items-center justify-end gap-3">
        {state?.error && <p className="text-sm text-danger-ink">{state.error}</p>}
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? "Saving…" : "Save & see eligible plans"}
        </button>
      </div>
    </form>
  );
}
