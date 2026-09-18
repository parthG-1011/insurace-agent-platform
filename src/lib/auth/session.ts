import { jwtVerify, SignJWT } from "jose";

// Kept free of next/headers so the proxy can import it.
export const SESSION_COOKIE = "agentdesk_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export interface SessionPayload {
  agentId: number;
  name: string;
}

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function signSession({ agentId, name }: SessionPayload): Promise<string> {
  return new SignJWT({ name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(agentId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    const agentId = Number(payload.sub);
    if (!Number.isInteger(agentId) || typeof payload.name !== "string") return null;
    return { agentId, name: payload.name };
  } catch {
    return null;
  }
}
