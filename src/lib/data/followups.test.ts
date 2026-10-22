import { describe, expect, it } from "vitest";
import {
  FOLLOW_UP_ACTION,
  FOLLOW_UP_STATUSES,
  followUpDays,
  followUpTone,
  type FollowUpTone,
} from "./queries";

const now = new Date("2026-10-22T09:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

describe("followUpTone", () => {
  it("buckets by how long the customer has been waiting", () => {
    expect(followUpTone(0)).toBe("fresh");
    expect(followUpTone(1)).toBe("waiting");
    expect(followUpTone(3)).toBe("stale");
  });

  it("holds the tone across the boundaries", () => {
    const cases: [number, FollowUpTone][] = [
      [0, "fresh"],
      [1, "waiting"],
      [2, "waiting"],
      [3, "stale"],
      [30, "stale"],
      [365, "stale"],
    ];
    for (const [days, tone] of cases) expect(followUpTone(days)).toBe(tone);
  });
});

describe("followUpDays", () => {
  it("counts whole days since the proposal last moved", () => {
    expect(followUpDays(daysAgo(0), now)).toBe(0);
    expect(followUpDays(daysAgo(1), now)).toBe(1);
    expect(followUpDays(daysAgo(4), now)).toBe(4);
    expect(followUpDays(daysAgo(30), now)).toBe(30);
  });

  it("rounds a partial day down to zero", () => {
    const hoursAgo = new Date(now.getTime() - 5 * 3_600_000);
    expect(followUpDays(hoursAgo, now)).toBe(0);
  });

  it("never reports a negative wait for activity dated in the future", () => {
    const future = new Date(now.getTime() + 86_400_000);
    expect(followUpDays(future, now)).toBe(0);
  });

  it("drives the tone from the real date rather than a hand-computed count", () => {
    expect(followUpTone(followUpDays(daysAgo(4), now))).toBe("stale");
    expect(followUpTone(followUpDays(daysAgo(0), now))).toBe("fresh");
  });
});

describe("FOLLOW_UP_STATUSES", () => {
  it("queues only statuses still awaiting money", () => {
    expect([...FOLLOW_UP_STATUSES]).toEqual(["quoted", "shared", "payment_pending"]);
  });

  it("never surfaces won business", () => {
    expect(FOLLOW_UP_STATUSES).not.toContain("paid");
    expect(FOLLOW_UP_STATUSES).not.toContain("policy_active");
  });

  it("names the literal next step for every queued status", () => {
    expect(FOLLOW_UP_ACTION).toEqual({
      quoted: "Send proposal",
      shared: "Chase payment",
      payment_pending: "Check payment",
    });
    for (const status of FOLLOW_UP_STATUSES) expect(FOLLOW_UP_ACTION[status]).toBeTruthy();
  });
});