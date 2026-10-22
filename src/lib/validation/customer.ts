import { z } from "zod";
import { ageOn } from "@/lib/insurance/eligibility";
import { indianPhone } from "./auth";

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const optionalInt = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().nullable());

export function customerSchema(today = new Date()) {
  return z
    .object({
      name: z.string().trim().min(2, "Enter the customer's full name"),
      phone: indianPhone,
      email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
      dob: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter date of birth")
        .refine((dob) => {
          const age = ageOn(dob, today);
          return age >= 18 && age <= 75;
        }, "Customer must be 18–75 years old"),
      gender: z.enum(["male", "female", "other"], { message: "Select gender" }),
      city: z.string().trim().min(2, "Enter city"),
      annualIncome: z.coerce.number({ message: "Enter annual income" }).int().min(0, "Cannot be negative").max(1_000_000_000),
      smoker: checkbox,
      preExistingCondition: checkbox,
      dependants: z.coerce.number().int().min(0).max(10, "At most 10 dependants"),
      vehicleType: z.enum(["none", "two_wheeler", "car"]),
      vehicleRegYear: optionalInt,
      vehicleValue: optionalInt,
    })
    .superRefine((c, ctx) => {
      if (c.vehicleType !== "none") {
        const year = today.getFullYear();
        if (c.vehicleRegYear == null || c.vehicleRegYear < 1990 || c.vehicleRegYear > year) {
          ctx.addIssue({ code: "custom", path: ["vehicleRegYear"], message: `Enter a year between 1990 and ${year}` });
        }
        if (c.vehicleValue == null || c.vehicleValue < 10_000) {
          ctx.addIssue({ code: "custom", path: ["vehicleValue"], message: "Enter the vehicle's current value (min ₹10,000)" });
        }
      }
    })
    .transform((c) => ({ ...c, ...normaliseVehicleFields(c) }));
}

/**
 * Vehicle facts are only meaningful when a vehicle is owned. A removed vehicle must clear
 * them, or checkEligibility keeps seeing stale data and motor plans stay "available".
 */
export function normaliseVehicleFields(v: {
  vehicleType: string;
  vehicleRegYear: number | null;
  vehicleValue: number | null;
}) {
  return v.vehicleType === "none"
    ? { vehicleRegYear: null, vehicleValue: null }
    : { vehicleRegYear: v.vehicleRegYear, vehicleValue: v.vehicleValue };
}

export type CustomerInput = z.output<ReturnType<typeof customerSchema>>;
