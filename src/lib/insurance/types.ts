export const CATEGORIES = ["term", "health", "vehicle", "travel", "home"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  term: "Term Insurance",
  health: "Health Insurance",
  vehicle: "Vehicle Insurance",
  travel: "Travel Insurance",
  home: "Home Insurance",
};

export type VehicleType = "none" | "two_wheeler" | "car";

export interface EligibilityRules {
  minAge?: number;
  maxAge?: number;
  minIncome?: number;
  requiresVehicle?: "two_wheeler" | "car" | "any";
  maxVehicleAgeYears?: number;
  excludeSmoker?: boolean;
  excludePreExisting?: boolean;
}

export interface AgeBand {
  upTo: number;
  factor: number;
}

export type PricingRules =
  | {
      kind: "per_thousand";
      ratePerThousand: number;
      ageBands: AgeBand[];
      smokerFactor?: number;
      preExistingFactor?: number;
      dependantLoadPct?: number;
      incomeMultipleCap?: number;
      minPremium?: number;
    }
  | {
      kind: "vehicle";
      ratePct: number;
      depreciationPerYear: number;
      maxDepreciation: number;
      minPremium: number;
    };

export interface ProductLike {
  id: number;
  name: string;
  category: Category;
  eligibility: EligibilityRules;
  pricing: PricingRules;
  defaultSumInsured: number;
  defaultTermYears: number;
}

export interface CustomerProfile {
  dob: string; // YYYY-MM-DD
  annualIncome: number;
  smoker: boolean;
  preExistingCondition: boolean;
  dependants: number;
  vehicleType: VehicleType;
  vehicleRegYear: number | null;
  vehicleValue: number | null;
}

export interface Quote<P extends ProductLike = ProductLike> {
  product: P;
  sumInsured: number;
  termYears: number;
  basePremium: number;
  gst: number;
  totalPremium: number;
}
