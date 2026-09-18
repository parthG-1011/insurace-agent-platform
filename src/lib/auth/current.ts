import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from "./session";

export async function createSession(payload: SessionPayload) {
  (await cookies()).set(SESSION_COOKIE, await signSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The logged-in agent, confirmed to still exist in the database. Redirects to login otherwise. */
export async function requireAgent() {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect("/login");
  const [agent] = await db()
    .select({ id: agents.id, name: agents.name, email: agents.email, phone: agents.phone })
    .from(agents)
    .where(eq(agents.id, session.agentId))
    .limit(1);
  // Stale cookie (e.g. database was reseeded): clear it via a route handler, since pages can't set cookies.
  if (!agent) redirect("/api/auth/logout");
  return agent;
}
