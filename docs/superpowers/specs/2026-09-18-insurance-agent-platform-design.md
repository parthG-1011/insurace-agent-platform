# Insurance Agent Platform — MVP Design

Date: 2026-09-18
Status: Approved in brainstorming, pending written-spec review

## 1. Goal

A desktop web app that lets insurance agents sell products (Term, Health, Vehicle, Travel, Home) end to end:
sign up/login → browse catalogue → capture customer → see eligible plans with premiums → select plan →
personalised PDF → share on WhatsApp → generate payment link → share on WhatsApp → customer pays →
customer receives "policy started" email.

Deployed on Vercel, publicly accessible, seeded with demo data, with demo agent credentials in the README.

## 2. Stack

| Concern | Choice | Mode |
|---|---|---|
| App | Next.js (App Router, TypeScript, Server Actions), Tailwind CSS | — |
| Hosting | Vercel | Hobby |
| Database | Neon Postgres via Vercel Marketplace, Drizzle ORM | Free tier |
| Auth | Own implementation: bcryptjs hashes + `jose`-signed JWT in httpOnly cookie | — |
| PDF | `pdf-lib`, generated on request from DB | — |
| Payments | Razorpay Payment Links API + webhook | **Test mode** |
| Email | Resend | Free tier, `onboarding@resend.dev` sender unless a domain is verified |
| WhatsApp | `https://wa.me/<phone>?text=<msg>` click-to-chat | No API / no account |
| Validation | Zod | — |
| Tests | Vitest | — |

## 3. Data model

- **agents**: `id`, `name`, `email` (unique, lowercased), `phone`, `password_hash`, `created_at`
- **products**: `id`, `code` (unique), `category` (`term|health|vehicle|travel|home`), `name`, `insurer`,
  `description`, `benefits` (jsonb string[]), `eligibility` (jsonb), `pricing` (jsonb), `default_sum_insured`,
  `default_term_years`, `is_active`
- **customers**: `id`, `agent_id` → agents, `name`, `phone` (normalised `91XXXXXXXXXX`), `email`, `dob`, `gender`,
  `city`, `annual_income`, `smoker`, `pre_existing_condition`, `dependants`, `vehicle_type` (`none|two_wheeler|car`),
  `vehicle_reg_year`, `vehicle_value`, `created_at`
- **proposals**: `id`, `customer_id`, `product_id`, `agent_id`, `sum_insured`, `term_years`, `base_premium`, `gst`,
  `total_premium` (integers, INR), `public_token` (24-char random, unique), `status`
  (`quoted|shared|payment_pending|paid|policy_active`), `razorpay_link_id`, `razorpay_link_url`, `policy_number`,
  `policy_start_date`, `paid_at`, `created_at`, `updated_at`
- **payment_events**: `id`, `provider_event_id` (unique — idempotency), `type`, `payload` (jsonb), `created_at`
- **email_log**: `id`, `proposal_id`, `to`, `subject`, `html`, `status` (`sent|failed|skipped`), `error`, `created_at`

All agent-facing queries are scoped by `agent_id`.

## 4. Eligibility & pricing

Pure module `src/lib/eligibility.ts`:

`evaluateProducts(customer, products, today) → { eligible: Quote[], ineligible: {product, reasons[]}[] }`

Eligibility rule keys (all optional): `minAge`, `maxAge`, `minIncome`, `requiresVehicle` (`two_wheeler|car|any`),
`maxVehicleAgeYears`, `excludeSmoker`, `excludePreExisting`.

Pricing:
- Life/health/travel/home: `base = sumInsured / 1000 × ratePerThousand × ageFactor × smokerFactor × dependantFactor
  × preExistingFactor`; age factor from bands in `pricing.ageBands`.
- Vehicle: `base = vehicleValue × ratePct × depreciationFactor(vehicleAge)`, floor at `pricing.minPremium`.
- Term sum insured default = min(product default, 20 × annual income), rounded to 1 lakh.
- GST 18% shown separately; all amounts rounded to whole rupees.

Unit tested with fixed `today`.

## 5. Screens

Agent (auth-protected, desktop sidebar layout):
1. `/signup`, `/login` — demo credentials hinted on login page.
2. `/dashboard` — counts (customers, shared, payment pending, active policies) + recent proposals.
3. `/products` — catalogue with category filter, product details.
4. `/customers` — searchable list with latest proposal status.
5. `/customers/new` — capture form; vehicle fields shown when vehicle type ≠ none. Save → redirect to profile.
6. `/customers/[id]` — profile summary; eligible plans with premiums + "Select plan"; collapsed ineligible list with
   reasons; proposal cards with status stepper and actions: View PDF, Share PDF on WhatsApp, Generate payment link,
   Share payment link on WhatsApp, Copy link, Refresh payment status.
7. `/emails` — email log.

Public:
- `/q/[token]` — route handler returning `application/pdf` (inline).
- `/pay/success?proposal=<token>` — returns from Razorpay; triggers a status reconcile; shows result.

## 6. Flows

**Select plan** → server action computes quote via eligibility module (never trusts client prices) → inserts proposal
(`quoted`) with `public_token`.

**Share PDF** → client opens `wa.me/<phone>?text=` with greeting, plan, premium and absolute PDF URL
(`APP_URL/q/<token>`); server action marks `shared` (only advances forward).

**Generate payment link** → server action calls Razorpay `POST /v1/payment_links` with amount (paise), customer
name/phone/email, `reference_id` = proposal id, `callback_url` = `APP_URL/pay/success?proposal=<token>`,
`notify.sms/email = false` (agent shares via WhatsApp). Stores link id/url, status `payment_pending`. Idempotent: if
a link exists, reuse it.

**Payment confirmation** — `activateProposal(proposalId)` is the single idempotent function:
conditional update `WHERE status <> 'policy_active'` → sets `paid_at`, `policy_number` (`POL-YYYY-XXXXXX`),
`policy_start_date`, status `policy_active` → if the update affected a row, send confirmation email via Resend and
write `email_log`. Callers:
- `POST /api/webhooks/razorpay` — verifies `X-Razorpay-Signature` (HMAC-SHA256 of raw body with
  `RAZORPAY_WEBHOOK_SECRET`, timing-safe compare); records `payment_events` by `x-razorpay-event-id` (duplicate →
  200 no-op); on `payment_link.paid` looks up proposal by `razorpay_link_id` and activates.
- Reconcile: `/pay/success` and the "Refresh payment status" action fetch `GET /v1/payment_links/:id`; if
  `status === 'paid'`, activate.

## 7. Errors & missing configuration

- Zod validation on every form/server action; field errors returned to forms.
- External call failures surface as a toast and leave state unchanged.
- No Razorpay keys → "Payments not configured" error, no fake link.
- No Resend key → email logged with status `skipped` and the reason.

## 8. Security

bcrypt (cost 10); session JWT (HS256, `AUTH_SECRET`, 7 days) in httpOnly/SameSite=Lax/Secure cookie; middleware
guards agent routes; ownership checks on every customer/proposal access; unguessable public tokens; webhook
signature verification.

## 9. Seed

~12 products across 5 categories; 2 demo agents (`demo@agentdesk.in` / `Demo@1234`, plus a second);
~6 customers for the primary agent covering: young non-smoker, 60-year-old, car owner, two-wheeler owner,
pre-existing condition, and one with a completed `policy_active` proposal. Seed is re-runnable (upserts / reset).

## 10. Testing

Vitest: eligibility & pricing, phone normalisation, WhatsApp link builder, webhook signature verification,
`activateProposal` idempotency logic (pure parts). Manual/scripted E2E against deployed URL before submission.

## 11. Delivery

GitHub repo + Vercel project with Neon integration. README: live URL, demo credentials, reviewer walkthrough
(incl. Razorpay test card/UPI), local setup, env var table, third-party services and modes, architecture,
post-MVP roadmap.

Env vars: `DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`.

User-owned steps: `gh auth login`, Vercel login/project, Neon integration, Razorpay test keys + webhook, Resend key.

## 12. Out of scope (MVP)

Underwriting/KYC, real policy issuance with insurers, WhatsApp Business API automation, customer portal, admin panel
for editing products, multi-language, mobile layout optimisation beyond basic responsiveness.
