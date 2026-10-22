import { describe, expect, it } from "vitest";
import type { ProposalStatus } from "@/lib/db/schema";
import { STATUS_STEPS } from "@/lib/insurance/status";
import { customerStatusFilterOptions, NO_PLAN_FILTER, parseCustomerStatusFilter, type CustomerStatusFilter } from "./queries";

describe("parseCustomerStatusFilter", () => {
  it.each(STATUS_STEPS.map((s) => s.status))("accepts the %s status", (status) => {
    expect(parseCustomerStatusFilter(status)).toBe(status);
  });

  it("keeps the no-plan sentinel distinct from every real status", () => {
    expect(parseCustomerStatusFilter(NO_PLAN_FILTER)).toBe(NO_PLAN_FILTER);
    expect(STATUS_STEPS.some((s) => s.status === (NO_PLAN_FILTER as ProposalStatus))).toBe(false);
  });

  it.each(["bogus", "'; drop table customers; --", "QUOTED", "0"])("falls back to All for %s", (raw) => {
    expect(parseCustomerStatusFilter(raw)).toBeNull();
  });

  it.each([undefined, null, "", "   "])("falls back to All for empty input %s", (raw) => {
    expect(parseCustomerStatusFilter(raw)).toBeNull();
  });

  it("falls back to All for an array (a repeated ?status= param)", () => {
    expect(parseCustomerStatusFilter(["paid", "quoted"])).toBeNull();
  });

  it("trims a valid value with surrounding whitespace", () => {
    const parsed: CustomerStatusFilter | null = parseCustomerStatusFilter("  paid  ");
    expect(parsed).toBe("paid");
  });
});

describe("customerStatusFilterOptions", () => {
  const options = customerStatusFilterOptions();

  it("starts with All and the no-plan bucket", () => {
    expect(options[0]).toEqual({ value: "", label: "All" });
    expect(options[1]).toEqual({ value: "none", label: "No plan selected" });
  });

  it("lists one option per STATUS_STEPS entry, in order, after the two sentinels", () => {
    expect(options).toHaveLength(STATUS_STEPS.length + 2);
    expect(options.slice(2).map((o) => o.value)).toEqual(STATUS_STEPS.map((s) => s.status));
  });

  it("labels options from STATUS_LABEL rather than the raw status string", () => {
    expect(options.find((o) => o.value === "payment_pending")?.label).toBe("Payment link sent");
    expect(options.filter((o) => o.label === o.value)).toEqual([]);
  });

  it("emits only option values the parser accepts", () => {
    for (const o of options.slice(2)) {
      expect(parseCustomerStatusFilter(o.value)).toBe(o.value);
    }
  });

  it("has no duplicate option values", () => {
    expect(new Set(options.map((o) => o.value)).size).toBe(options.length);
  });
});