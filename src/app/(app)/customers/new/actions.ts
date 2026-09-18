"use server";

import { redirect } from "next/navigation";
import { requireAgent } from "@/lib/auth/current";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { fieldErrors, formValues, type FormState } from "@/lib/validation/auth";
import { customerSchema } from "@/lib/validation/customer";

export async function createCustomerAction(_: FormState, formData: FormData): Promise<FormState> {
  const agent = await requireAgent();
  const parsed = customerSchema().safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: formValues(formData) };
  }
  const [row] = await db().insert(customers).values({ ...parsed.data, agentId: agent.id }).returning({ id: customers.id });
  redirect(`/customers/${row.id}?created=1`);
}
