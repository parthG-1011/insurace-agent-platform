import { describe, expect, it } from "vitest";
import { phoneSearchNeedle, searchTerm } from "./queries";

describe("searchTerm", () => {
  it("trims surrounding whitespace", () => expect(searchTerm("  Rahul  ")).toBe("Rahul"));

  it.each([undefined, "", "   "])("treats %j as no filter", (input) => expect(searchTerm(input)).toBeUndefined());
});

describe("phoneSearchNeedle", () => {
  it.each([
    ["+91 98765-43210", "%919876543210%"],
    ["98765 43210", "%9876543210%"],
    ["919876543210", "%919876543210%"],
    ["Rahul", "%Rahul%"],
  ])("builds the needle for %s", (input, expected) => expect(phoneSearchNeedle(input)).toBe(expected));

  it.each([undefined, ""])("produces no needle for %j", (input) => expect(phoneSearchNeedle(input)).toBeUndefined());
});