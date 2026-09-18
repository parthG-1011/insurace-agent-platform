import { beforeAll, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";
import { signSession, verifySession } from "./session";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-test-secret-test-secret-123";
});

describe("password", () => {
  it("verifies the right password only", async () => {
    const hash = await hashPassword("Demo@1234");
    expect(await verifyPassword("Demo@1234", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("session", () => {
  it("round-trips a signed session", async () => {
    const token = await signSession({ agentId: 7, name: "Asha" });
    expect(await verifySession(token)).toEqual({ agentId: 7, name: "Asha" });
  });

  it("rejects missing or tampered tokens", async () => {
    const token = await signSession({ agentId: 7, name: "Asha" });
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession(token.slice(0, -2) + "xx")).toBeNull();
  });
});
