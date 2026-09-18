import { randomBytes } from "node:crypto";

/** Unguessable token for public proposal links. */
export const newPublicToken = () => randomBytes(18).toString("base64url");

export const proposalReference = (id: number) => `QT-${String(id).padStart(6, "0")}`;

export const makePolicyNumber = (proposalId: number, date: Date) =>
  `POL-${date.getFullYear()}-${String(proposalId).padStart(6, "0")}`;
