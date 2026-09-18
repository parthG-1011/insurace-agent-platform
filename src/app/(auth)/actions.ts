"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth/current";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { fieldErrors, formValues, signupSchema, type FormState } from "@/lib/validation/auth";

const safeNext = (value: FormDataEntryValue | null) => {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
};

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const [agent] = await db().select().from(agents).where(eq(agents.email, email)).limit(1);
  if (!agent || !(await verifyPassword(password, agent.passwordHash))) {
    return { error: "Incorrect email or password", values: formValues(formData) };
  }
  await createSession({ agentId: agent.id, name: agent.name });
  redirect(safeNext(formData.get("next")));
}

export async function signupAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values: formValues(formData) };

  const { name, email, phone, password } = parsed.data;
  const [existing] = await db().select({ id: agents.id }).from(agents).where(eq(agents.email, email)).limit(1);
  if (existing) return { fieldErrors: { email: "An agent with this email already exists" }, values: formValues(formData) };

  const [agent] = await db()
    .insert(agents)
    .values({ name, email, phone, passwordHash: await hashPassword(password) })
    .returning({ id: agents.id, name: agents.name });
  await createSession({ agentId: agent.id, name: agent.name });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
