import { z } from "zod";
import { normalizeIndianPhone } from "@/lib/phone";

export const indianPhone = z.string().transform((value, ctx) => {
  const normalized = normalizeIndianPhone(value);
  if (!normalized) {
    ctx.addIssue({ code: "custom", message: "Enter a valid 10-digit Indian mobile number" });
    return z.NEVER;
  }
  return normalized;
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  phone: indianPhone,
  password: z.string().min(8, "Use at least 8 characters"),
});

/** First error message per field, for showing under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

export type FormState = { error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> } | undefined;

export function formValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && k !== "password") out[k] = v;
  return out;
}
