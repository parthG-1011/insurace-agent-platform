import { formatINR } from "@/lib/format";
import type { CustomerProfile, EligibilityRules, ProductLike, Quote } from "./types";

export const GST_RATE = 0.18;

export function ageOn(dob: string, today: Date): number {
  const [y, m, d] = dob.split("-").map(Number);
  let age = today.getFullYear() - y;
  if ((today.getMonth() + 1) * 100 + today.getDate() < m * 100 + d) age--;
  return age;
}

/** Returns human-readable reasons the customer is ineligible; empty means eligible. */
export function checkEligibility(c: CustomerProfile, r: EligibilityRules, today: Date): string[] {
  const reasons: string[] = [];
  const age = ageOn(c.dob, today);
  if (r.minAge !== undefined && age < r.minAge) reasons.push(`Minimum entry age is ${r.minAge} (customer is ${age})`);
  if (r.maxAge !== undefined && age > r.maxAge) reasons.push(`Maximum entry age is ${r.maxAge} (customer is ${age})`);
  if (r.minIncome !== undefined && c.annualIncome < r.minIncome) {
    reasons.push(`Needs annual income of at least ${formatINR(r.minIncome)}`);
  }
  if (r.excludeSmoker && c.smoker) reasons.push("Not available for smokers");
  if (r.excludePreExisting && c.preExistingCondition) reasons.push("Not available with a pre-existing condition");

  if (r.requiresVehicle) {
    if (c.vehicleType === "none") {
      reasons.push({ car: "Needs a car", two_wheeler: "Needs a two-wheeler", any: "Needs a vehicle" }[r.requiresVehicle]);
    } else if (r.requiresVehicle !== "any" && c.vehicleType !== r.requiresVehicle) {
      reasons.push(r.requiresVehicle === "car" ? "Only for cars" : "Only for two-wheelers");
    } else if (c.vehicleRegYear == null || c.vehicleValue == null) {
      reasons.push("Vehicle details are missing");
    } else if (r.maxVehicleAgeYears !== undefined && today.getFullYear() - c.vehicleRegYear > r.maxVehicleAgeYears) {
      reasons.push(`Vehicle must be at most ${r.maxVehicleAgeYears} years old`);
    }
  }
  return reasons;
}

export function quoteProduct<P extends ProductLike>(c: CustomerProfile, p: P, today: Date): Quote<P> {
  const pr = p.pricing;
  let sumInsured: number;
  let basePremium: number;

  if (pr.kind === "vehicle") {
    const vehicleAge = Math.max(0, today.getFullYear() - (c.vehicleRegYear ?? today.getFullYear()));
    const depreciation = Math.min(pr.depreciationPerYear * vehicleAge, pr.maxDepreciation);
    sumInsured = Math.round((c.vehicleValue ?? 0) * (1 - depreciation));
    basePremium = Math.max(pr.minPremium, Math.round((sumInsured * pr.ratePct) / 100));
  } else {
    sumInsured = p.defaultSumInsured;
    if (pr.incomeMultipleCap) {
      const byIncome = Math.floor((c.annualIncome * pr.incomeMultipleCap) / 100_000) * 100_000;
      sumInsured = Math.max(100_000, Math.min(sumInsured, byIncome));
    }
    const age = ageOn(c.dob, today);
    const band = pr.ageBands.find((b) => age <= b.upTo) ?? pr.ageBands[pr.ageBands.length - 1];
    let premium = (sumInsured / 1000) * pr.ratePerThousand * band.factor;
    if (c.smoker && pr.smokerFactor) premium *= pr.smokerFactor;
    if (c.preExistingCondition && pr.preExistingFactor) premium *= pr.preExistingFactor;
    if (pr.dependantLoadPct) premium *= 1 + pr.dependantLoadPct * c.dependants;
    basePremium = Math.max(pr.minPremium ?? 0, Math.round(premium));
  }

  const gst = Math.round(basePremium * GST_RATE);
  return { product: p, sumInsured, termYears: p.defaultTermYears, basePremium, gst, totalPremium: basePremium + gst };
}

export function evaluateProducts<P extends ProductLike>(c: CustomerProfile, products: P[], today: Date) {
  const eligible: Quote<P>[] = [];
  const ineligible: { product: P; reasons: string[] }[] = [];
  for (const product of products) {
    const reasons = checkEligibility(c, product.eligibility, today);
    if (reasons.length) ineligible.push({ product, reasons });
    else eligible.push(quoteProduct(c, product, today));
  }
  return { eligible, ineligible };
}

export function describeEligibility(r: EligibilityRules): string[] {
  const out: string[] = [];
  if (r.minAge !== undefined || r.maxAge !== undefined) out.push(`Age ${r.minAge ?? 18}–${r.maxAge ?? "any"}`);
  if (r.minIncome) out.push(`Income from ${formatINR(r.minIncome)}/yr`);
  if (r.requiresVehicle) {
    out.push({ car: "Cars only", two_wheeler: "Two-wheelers only", any: "Any vehicle" }[r.requiresVehicle]);
  }
  if (r.maxVehicleAgeYears !== undefined) out.push(`Vehicle up to ${r.maxVehicleAgeYears} yrs old`);
  if (r.excludeSmoker) out.push("Non-smokers only");
  if (r.excludePreExisting) out.push("No pre-existing conditions");
  return out;
}
