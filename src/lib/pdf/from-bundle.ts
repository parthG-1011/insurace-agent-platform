import type { ProposalBundle } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { ageOn } from "@/lib/insurance/eligibility";
import { CATEGORY_LABEL } from "@/lib/insurance/types";
import { formatPhone } from "@/lib/phone";
import { proposalReference } from "@/lib/tokens";
import type { ProposalPdfData } from "./proposal-pdf";

const GENDER = { male: "Male", female: "Female", other: "Other" };
const VEHICLE = { car: "Car", two_wheeler: "Two-wheeler", none: "" };

export function pdfDataFromBundle({ proposal, customer, product, agent }: ProposalBundle): ProposalPdfData {
  const isPolicy = proposal.status === "policy_active";
  return {
    reference: proposalReference(proposal.id),
    issuedOn: formatDate(isPolicy && proposal.paidAt ? proposal.paidAt : proposal.createdAt),
    status: isPolicy ? "policy" : "proposal",
    policyNumber: proposal.policyNumber,
    customer: {
      name: customer.name,
      phone: formatPhone(customer.phone),
      email: customer.email,
      dob: formatDate(customer.dob),
      age: ageOn(customer.dob, proposal.createdAt),
      gender: GENDER[customer.gender],
      city: customer.city,
      smoker: customer.smoker,
    },
    product: {
      name: product.name,
      insurer: product.insurer,
      category: CATEGORY_LABEL[product.category],
      description: product.description,
      benefits: product.benefits,
    },
    cover: {
      sumInsured: proposal.sumInsured,
      termYears: proposal.termYears,
      basePremium: proposal.basePremium,
      gst: proposal.gst,
      totalPremium: proposal.totalPremium,
      isVehicle: product.pricing.kind === "vehicle",
    },
    vehicle:
      product.category === "vehicle" && customer.vehicleRegYear && customer.vehicleValue
        ? { type: VEHICLE[customer.vehicleType], regYear: customer.vehicleRegYear, value: customer.vehicleValue }
        : null,
    agent: { name: agent.name, phone: formatPhone(agent.phone), email: agent.email },
  };
}
