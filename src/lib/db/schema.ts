import { boolean, date, integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { CATEGORIES, type EligibilityRules, type PricingRules } from "@/lib/insurance/types";

export const categoryEnum = pgEnum("category", CATEGORIES);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["none", "two_wheeler", "car"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["quoted", "shared", "payment_pending", "paid", "policy_active"]);
export const emailStatusEnum = pgEnum("email_status", ["sent", "failed", "skipped"]);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  category: categoryEnum("category").notNull(),
  name: text("name").notNull(),
  insurer: text("insurer").notNull(),
  description: text("description").notNull(),
  benefits: jsonb("benefits").$type<string[]>().notNull(),
  eligibility: jsonb("eligibility").$type<EligibilityRules>().notNull(),
  pricing: jsonb("pricing").$type<PricingRules>().notNull(),
  defaultSumInsured: integer("default_sum_insured").notNull(),
  defaultTermYears: integer("default_term_years").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  dob: date("dob", { mode: "string" }).notNull(),
  gender: genderEnum("gender").notNull(),
  city: text("city").notNull(),
  annualIncome: integer("annual_income").notNull(),
  smoker: boolean("smoker").notNull().default(false),
  preExistingCondition: boolean("pre_existing_condition").notNull().default(false),
  dependants: integer("dependants").notNull().default(0),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull().default("none"),
  vehicleRegYear: integer("vehicle_reg_year"),
  vehicleValue: integer("vehicle_value"),
  createdAt: createdAt(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  sumInsured: integer("sum_insured").notNull(),
  termYears: integer("term_years").notNull(),
  basePremium: integer("base_premium").notNull(),
  gst: integer("gst").notNull(),
  totalPremium: integer("total_premium").notNull(),
  publicToken: text("public_token").notNull().unique(),
  status: proposalStatusEnum("status").notNull().default("quoted"),
  razorpayLinkId: text("razorpay_link_id").unique(),
  razorpayLinkUrl: text("razorpay_link_url"),
  razorpayPaymentId: text("razorpay_payment_id"),
  policyNumber: text("policy_number").unique(),
  policyStartDate: date("policy_start_date", { mode: "string" }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentEvents = pgTable("payment_events", {
  id: serial("id").primaryKey(),
  providerEventId: text("provider_event_id").notNull().unique(),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: createdAt(),
});

export const emailLog = pgTable("email_log", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => proposals.id, { onDelete: "cascade" }),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  status: emailStatusEnum("status").notNull(),
  error: text("error"),
  providerId: text("provider_id"),
  createdAt: createdAt(),
});

export type Agent = typeof agents.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type ProposalStatus = Proposal["status"];
export type EmailLogEntry = typeof emailLog.$inferSelect;
