import { describe, expect, it } from "vitest";
import { ageOn, checkEligibility, describeEligibility, evaluateProducts, quoteProduct } from "./eligibility";
import type { CustomerProfile, ProductLike } from "./types";

const today = new Date("2026-09-18T10:00:00Z");

const term: ProductLike = {
  id: 1,
  name: "Term",
  category: "term",
  eligibility: { minAge: 18, maxAge: 65, minIncome: 300_000 },
  pricing: {
    kind: "per_thousand",
    ratePerThousand: 0.9,
    ageBands: [
      { upTo: 30, factor: 1 },
      { upTo: 40, factor: 1.4 },
      { upTo: 50, factor: 2.3 },
      { upTo: 65, factor: 4 },
    ],
    smokerFactor: 1.6,
    incomeMultipleCap: 20,
  },
  defaultSumInsured: 10_000_000,
  defaultTermYears: 30,
};

const health: ProductLike = {
  id: 2,
  name: "Family Health",
  category: "health",
  eligibility: { minAge: 18, maxAge: 65 },
  pricing: {
    kind: "per_thousand",
    ratePerThousand: 12,
    ageBands: [{ upTo: 35, factor: 1 }, { upTo: 65, factor: 2 }],
    preExistingFactor: 1.25,
    dependantLoadPct: 0.35,
  },
  defaultSumInsured: 1_000_000,
  defaultTermYears: 1,
};

const car: ProductLike = {
  id: 3,
  name: "Car Comprehensive",
  category: "vehicle",
  eligibility: { requiresVehicle: "car", maxVehicleAgeYears: 15 },
  pricing: { kind: "vehicle", ratePct: 2.8, depreciationPerYear: 0.1, maxDepreciation: 0.5, minPremium: 4000 },
  defaultSumInsured: 0,
  defaultTermYears: 1,
};

const base: CustomerProfile = {
  dob: "1997-03-14", // 29
  annualIncome: 1_200_000,
  smoker: false,
  preExistingCondition: false,
  dependants: 0,
  vehicleType: "none",
  vehicleRegYear: null,
  vehicleValue: null,
};

describe("ageOn", () => {
  it("counts completed years", () => {
    expect(ageOn("1997-03-14", today)).toBe(29);
    expect(ageOn("2000-09-18", today)).toBe(26);
    expect(ageOn("2000-09-19", today)).toBe(25);
  });
});

describe("checkEligibility", () => {
  it("passes an eligible customer", () => {
    expect(checkEligibility(base, term.eligibility, today)).toEqual([]);
  });

  it("explains age, income, smoker and pre-existing exclusions", () => {
    expect(checkEligibility({ ...base, dob: "2010-01-01" }, term.eligibility, today)).toEqual([
      "Minimum entry age is 18 (customer is 16)",
    ]);
    expect(checkEligibility({ ...base, dob: "1955-01-01" }, term.eligibility, today)[0]).toMatch(/Maximum entry age is 65/);
    expect(checkEligibility({ ...base, annualIncome: 200_000 }, term.eligibility, today)).toEqual([
      "Needs annual income of at least ₹3,00,000",
    ]);
    expect(checkEligibility({ ...base, smoker: true }, { excludeSmoker: true }, today)).toEqual(["Not available for smokers"]);
    expect(checkEligibility({ ...base, preExistingCondition: true }, { excludePreExisting: true }, today)).toEqual([
      "Not available with a pre-existing condition",
    ]);
  });

  it("checks vehicle type and age", () => {
    expect(checkEligibility(base, car.eligibility, today)).toEqual(["Needs a car"]);
    const twoWheeler = { ...base, vehicleType: "two_wheeler" as const, vehicleRegYear: 2020, vehicleValue: 100_000 };
    expect(checkEligibility(twoWheeler, car.eligibility, today)).toEqual(["Only for cars"]);
    const oldCar = { ...base, vehicleType: "car" as const, vehicleRegYear: 2006, vehicleValue: 300_000 };
    expect(checkEligibility(oldCar, car.eligibility, today)).toEqual(["Vehicle must be at most 15 years old"]);
  });
});

describe("quoteProduct", () => {
  it("prices term cover per thousand with age band and 18% GST", () => {
    const q = quoteProduct(base, term, today);
    expect(q).toMatchObject({ sumInsured: 10_000_000, termYears: 30, basePremium: 9000, gst: 1620, totalPremium: 10620 });
  });

  it("applies smoker loading and older age bands", () => {
    expect(quoteProduct({ ...base, smoker: true }, term, today).basePremium).toBe(14400);
    expect(quoteProduct({ ...base, dob: "1981-01-01" }, term, today).basePremium).toBe(20700);
  });

  it("caps term cover at 20x income, rounded down to a lakh", () => {
    const q = quoteProduct({ ...base, annualIncome: 312_345 }, term, today);
    expect(q.sumInsured).toBe(6_200_000);
    expect(q.basePremium).toBe(5580);
  });

  it("loads health premium for dependants and pre-existing conditions", () => {
    expect(quoteProduct({ ...base, dependants: 2 }, health, today).basePremium).toBe(20400);
    expect(quoteProduct({ ...base, dependants: 2, preExistingCondition: true }, health, today).basePremium).toBe(25500);
  });

  it("prices vehicles on depreciated value (IDV)", () => {
    const newish = { ...base, vehicleType: "car" as const, vehicleRegYear: 2022, vehicleValue: 900_000 };
    expect(quoteProduct(newish, car, today)).toMatchObject({ sumInsured: 540_000, basePremium: 15120, termYears: 1 });
    const older = { ...newish, vehicleRegYear: 2014 };
    expect(quoteProduct(older, car, today)).toMatchObject({ sumInsured: 450_000, basePremium: 12600 });
    const cheap = { ...newish, vehicleValue: 100_000 };
    expect(quoteProduct(cheap, car, today).basePremium).toBe(4000);
  });
});

describe("evaluateProducts", () => {
  it("splits products into quotes and reasons", () => {
    const { eligible, ineligible } = evaluateProducts(base, [term, health, car], today);
    expect(eligible.map((q) => q.product.id)).toEqual([1, 2]);
    expect(ineligible).toEqual([{ product: car, reasons: ["Needs a car"] }]);
  });
});

describe("describeEligibility", () => {
  it("summarises rules for the catalogue", () => {
    expect(describeEligibility(term.eligibility)).toEqual(["Age 18–65", "Income from ₹3,00,000/yr"]);
    expect(describeEligibility({ ...car.eligibility, excludeSmoker: true })).toEqual([
      "Cars only",
      "Vehicle up to 15 yrs old",
      "Non-smokers only",
    ]);
  });
});
