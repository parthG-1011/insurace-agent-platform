"use client";

import { createContext, useActionState, useContext, useState, type ReactNode } from "react";
import { buttonStyles, Card, Field, inputStyles } from "@/components/ui";
import { updateCustomerAction, type UpdateCustomerResult, type UpdateCustomerState } from "./actions";

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="grid grid-cols-3 gap-8 p-6">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="col-span-2 grid grid-cols-2 gap-4">{children}</div>
    </Card>
  );
}

const EditContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
  customerId: number;
  values: Record<string, string>;
} | null>(null);

/**
 * The toggle lives in the page header and the form directly under the facts grid, so both
 * read the same open state. The profile's read-only facts, plan table and proposal cards
 * render inside the provider unchanged.
 */
export function CustomerEditProvider({
  customerId,
  values,
  children,
}: {
  customerId: number;
  values: Record<string, string>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <EditContext.Provider value={{ open, setOpen, customerId, values }}>{children}</EditContext.Provider>
  );
}

export function EditDetailsToggle() {
  const edit = useContext(EditContext);
  if (!edit) return null;
  return (
    <button type="button" onClick={() => edit.setOpen(!edit.open)} aria-expanded={edit.open} className={buttonStyles.secondary}>
      {edit.open ? "Close editor" : "Edit details"}
    </button>
  );
}

/** The edit entry point itself, placed right under the read-only facts it corrects. */
export function EditCustomerFormSection() {
  const edit = useContext(EditContext);
  if (!edit?.open) return null;
  return (
    <section className="mt-8 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Edit details</h2>
        <p className="mt-1 text-sm text-slate-500">
          The plans below are recalculated from these details as soon as you save.
        </p>
      </div>
      <EditCustomerForm customerId={edit.customerId} values={edit.values} />
    </section>
  );
}

function EditCustomerForm({ customerId, values }: { customerId: number; values: Record<string, string> }) {
  const [state, action, pending] = useActionState<UpdateCustomerState, FormData>(
    updateCustomerAction.bind(null, customerId),
    undefined,
  );
  // Submitted values win, so a rejected save shows what the agent typed rather than the stored row.
  const v = { ...values, ...state?.values };
  const e = (state && !state.ok ? state.fieldErrors : undefined) ?? {};
  const [vehicleType, setVehicleType] = useState(values.vehicleType ?? "none");

  return (
    <form action={action} className="space-y-5" noValidate>
      <Section title="Contact" description="Used to share the proposal and payment link on WhatsApp, and send the policy email.">
        <Field label="Full name" name="name" error={e.name}>
          <input id="name" name="name" defaultValue={v.name} className={inputStyles} />
        </Field>
        <Field label="WhatsApp mobile number" name="phone" error={e.phone}>
          <input id="phone" name="phone" type="tel" defaultValue={v.phone} className={inputStyles} />
        </Field>
        <Field label="Email" name="email" error={e.email}>
          <input id="email" name="email" type="email" defaultValue={v.email} className={inputStyles} />
        </Field>
        <Field label="City" name="city" error={e.city}>
          <input id="city" name="city" defaultValue={v.city} className={inputStyles} />
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
          <input id="annualIncome" name="annualIncome" type="number" min={0} step={10000} defaultValue={v.annualIncome} className={inputStyles} />
        </Field>
        <Field label="Dependants" name="dependants" error={e.dependants} hint="Spouse, children or parents to cover">
          <input id="dependants" name="dependants" type="number" min={0} max={10} defaultValue={v.dependants ?? "0"} className={inputStyles} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="smoker" defaultChecked={v.smoker === "on"} className="h-4 w-4 rounded border-slate-300" />
          Smokes or uses tobacco
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="preExistingCondition" defaultChecked={v.preExistingCondition === "on"} className="h-4 w-4 rounded border-slate-300" />
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
              <input id="vehicleRegYear" name="vehicleRegYear" type="number" min={1990} defaultValue={v.vehicleRegYear} className={inputStyles} />
            </Field>
            <Field label="Current market value (₹)" name="vehicleValue" error={e.vehicleValue}>
              <input id="vehicleValue" name="vehicleValue" type="number" min={0} step={1000} defaultValue={v.vehicleValue} className={inputStyles} />
            </Field>
          </>
        )}
      </Section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.ok && <p className="max-w-xl text-sm text-emerald-700">{state.message}</p>}
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}