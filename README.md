# AgentDesk: Insurance Agent Platform (MVP)

A desktop web app that lets insurance agents sell Term, Health, Vehicle, Travel and Home insurance end to end:

**sign up → browse products → capture customer → see eligible plans with premiums → select plan → personalised PDF → share on WhatsApp → generate payment link → share on WhatsApp → customer pays → policy activated + confirmation email**

| | |
|---|---|
| **Live app** | https://YOUR-APP.vercel.app |
| **Agent login** | `demo@agentdesk.in` / `Demo@1234` |
| Second agent (to check data isolation) | `agent2@agentdesk.in` / `Demo@1234` |

You can also create a new agent account at `/signup`.

---

## Reviewer walkthrough (about 5 minutes)

1. **Log in** with the demo agent. The dashboard shows seeded activity, including one completed sale (Kavita Joshi).
2. **Products**: browse all 12 plans and filter by category. Each card shows its eligibility rules.
3. **New customer**: enter a customer. **Use your own WhatsApp number and email address** so you receive the messages. Choose "Car" under Vehicle to also see motor plans.
4. Saving opens the **customer profile**, which lists the plans the customer qualifies for, with premiums (18% GST included). Ineligible plans are collapsed below, with the reason for each (for example "Maximum entry age is 65").
5. **Select plan**. This creates a proposal with a status tracker.
6. **View PDF** opens the personalised proposal. **Share PDF on WhatsApp** opens WhatsApp Web/Desktop with a pre-filled message to the customer containing the PDF link. The status moves to *Proposal shared*.
7. **Generate payment link** creates a Razorpay payment link in **test mode**. **Share payment link** sends it over WhatsApp.
8. Open the payment link and pay with Razorpay test credentials:
   - UPI: `success@razorpay` (the quickest option)
   - Netbanking: choose any bank and click **Success** on the test bank page
   - Cards: use any card from [Razorpay's test card list](https://razorpay.com/docs/payments/payments/test-card-details/), with any future expiry and CVV
9. After paying you land on the confirmation page. The Razorpay webhook (with a direct API check as backup) marks the proposal **Policy active**, assigns a policy number and sends the **"Your policy has started"** email.
10. **Email log** shows every confirmation email with the provider's result and a preview of the email.

> **Email delivery note:** Resend's free tier without a verified domain only delivers to the Resend account owner's address. Emails to any other address show up in the **Email log** with the provider's error, and the full email can still be previewed there.

---

## Architecture

```
Browser (agent, desktop)
   │  Next.js App Router pages + Server Actions (auth-checked)
   ▼
Next.js 16 on Vercel ── Postgres (Neon) via Drizzle ORM
   │        │
   │        ├── /q/[token]              public PDF (pdf-lib, generated on request from DB)
   │        ├── /api/webhooks/razorpay  signature-verified, idempotent → activate policy → Resend email
   │        └── /pay/success            Razorpay redirect; checks with the Razorpay API before activating
   ▼
wa.me click-to-chat links (WhatsApp)   Razorpay Payment Links API   Resend
```

- **Eligibility and pricing** are handled by one pure function set in [`src/lib/insurance/eligibility.ts`](src/lib/insurance/eligibility.ts). The rules and pricing for each product are stored as JSON on the product (age, income, vehicle, smoker and pre-existing rules; age bands and loadings). The server always recalculates the premium; the browser never sends a price.
- **Proposals** move through `quoted → shared → payment_pending → policy_active`. The move to active happens in exactly one place, `activateProposal()`, using a conditional update. So when the webhook and the redirect check race, the policy is activated and emailed only once.
- **Security**: bcrypt password hashes; a signed JWT (HS256) in an httpOnly session cookie; a proxy protects every agent page; every query is limited to the logged-in agent; public PDF links use random 24-character tokens; the webhook checks the HMAC signature.

```
src/
  app/(auth)/            login, signup, actions
  app/(app)/             dashboard, products, customers, customers/[id], emails
  app/q/[token]/         public proposal/policy PDF
  app/api/webhooks/      Razorpay webhook
  app/pay/success/       post-payment page
  lib/insurance/         product catalogue, eligibility & pricing, statuses
  lib/payments/          Razorpay client + signature verification
  lib/policy/            activation + reconciliation
  lib/pdf/  lib/email/   document + email rendering
  lib/db/                Drizzle schema + client
scripts/seed.ts          demo data
```

## Third-party services and how they're used

| Service | Used for | Mode / configuration |
|---|---|---|
| **Vercel** | Hosting (Next.js) | Hobby plan |
| **Neon Postgres** (via Vercel Marketplace) | Database | Free tier, pooled connection string |
| **Razorpay** | Payment Links + `payment_link.paid` webhook | **Test mode**: no real money moves. Razorpay's own SMS/email notifications are off, because the agent shares the link on WhatsApp |
| **Resend** | Policy confirmation email | Free tier, sender `onboarding@resend.dev` (see the delivery note above) |
| **WhatsApp** | Sharing the PDF and payment link | **Click-to-chat (`wa.me`) links**: no API, no account, no Meta approval. The agent's own WhatsApp opens with the message ready and the agent presses Send |

Why click-to-chat for WhatsApp: the WhatsApp Cloud API needs Meta business verification and approved message templates, and in test mode it can only send to 5 pre-registered numbers, which would stop reviewers testing with their own phone. Click-to-chat also matches how agents actually work: the message comes from the agent's own number.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string (Neon **pooled** URL in production) |
| `AUTH_SECRET` | yes | 32+ random characters for signing sessions: `openssl rand -base64 32` |
| `APP_URL` | yes (prod) | Public base URL, e.g. `https://your-app.vercel.app`. Used in PDF links and the Razorpay redirect URL |
| `RAZORPAY_KEY_ID` | for payments | Razorpay **test** key id (`rzp_test_…`) |
| `RAZORPAY_KEY_SECRET` | for payments | Razorpay test key secret |
| `RAZORPAY_WEBHOOK_SECRET` | for webhook | Secret you set when creating the webhook |
| `RESEND_API_KEY` | for email | Resend API key. Without it, emails are logged as `skipped` |
| `EMAIL_FROM` | no | Defaults to `AgentDesk <onboarding@resend.dev>` |

See [`.env.example`](.env.example).

## Running locally

Requires Node 20+ and a Postgres database (local, Docker, or a Neon connection string).

```bash
npm install
cp .env.example .env.local        # fill in DATABASE_URL and AUTH_SECRET at minimum
createdb agentdesk                # if using local Postgres
npm run db:push                   # create tables
npm run db:seed                   # demo agents, products, customers (DESTRUCTIVE: resets all data)
npm run dev                       # http://localhost:3000
```

```bash
npm test                          # unit tests (eligibility, pricing, validation, PDF, signatures, email)
npm run typecheck
```

To test the Razorpay webhook locally, expose port 3000 with a tunnel (e.g. `ngrok http 3000`) and point a test-mode webhook at it. Even without a webhook, the **Check payment** button and the `/pay/success` page ask Razorpay directly whether the link is paid.

## Deploying (Vercel)

1. Import the GitHub repo into Vercel.
2. Storage → add **Neon** (Marketplace). This sets `DATABASE_URL`.
3. Add the other environment variables above (Production).
4. Deploy, then set `APP_URL` to the production URL and redeploy.
5. Create the tables and demo data against the production database:
   `vercel env pull .env.local && npm run db:push && npm run db:seed`
6. Razorpay Dashboard (Test mode) → Webhooks → add `https://YOUR-APP.vercel.app/api/webhooks/razorpay`, event **`payment_link.paid`**, with the same secret as `RAZORPAY_WEBHOOK_SECRET`.

## MVP scope decisions

Left out on purpose, to ship quickly: KYC and underwriting, issuing real policies with insurers, automated WhatsApp sending through the Business API, a customer portal, an admin screen for editing products, and a mobile layout. Premiums are illustrative, and the insurer names are fictional.

**Next steps after the MVP:** WhatsApp Business API templates with delivery receipts, a verified sending domain, an admin catalogue editor, e-KYC, quote versioning and expiry, renewal reminders, and an agent commission dashboard.
