import type { ProposalStatus } from "@/lib/db/schema";

export const STATUS_STEPS: { status: ProposalStatus; label: string }[] = [
  { status: "quoted", label: "Quoted" },
  { status: "shared", label: "Proposal shared" },
  { status: "payment_pending", label: "Payment link sent" },
  { status: "paid", label: "Paid" },
  { status: "policy_active", label: "Policy active" },
];

export const STATUS_LABEL = Object.fromEntries(STATUS_STEPS.map((s) => [s.status, s.label])) as Record<ProposalStatus, string>;

export const STATUS_TONE: Record<ProposalStatus, "slate" | "blue" | "amber" | "emerald" | "violet"> = {
  quoted: "slate",
  shared: "blue",
  payment_pending: "amber",
  paid: "violet",
  policy_active: "emerald",
};

export const statusIndex = (s: ProposalStatus) => STATUS_STEPS.findIndex((step) => step.status === s);
