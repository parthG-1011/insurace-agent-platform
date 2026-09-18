# Deployment guide

How to take AgentDesk from this repo to a public Vercel URL with a seeded database, working test-mode payments and confirmation emails.

**Time:** about 30 minutes. **Cost:** free (Vercel Hobby, Neon free tier, Razorpay test mode, Resend free tier).

| # | Step | Where |
|---|---|---|
| 0 | Prerequisites | terminal |
| 1 | Push the code to GitHub | terminal |
| 2 | Create the Vercel project | Vercel dashboard |
| 3 | Add Neon Postgres | Vercel dashboard |
| 4 | Get Razorpay test keys | Razorpay dashboard |
| 5 | Get a Resend API key | Resend dashboard |
| 6 | Set environment variables | Vercel dashboard |
| 7 | Create tables and seed demo data | terminal |
| 8 | Deploy | Vercel |
| 9 | Add the Razorpay webhook | Razorpay dashboard |
| 10 | Check the deployment | browser + terminal |
| 11 | Final README updates | editor |

---

## 0. Prerequisites

- Node 20 or later (`node -v`)
- Accounts: GitHub, Vercel (sign up with GitHub), Razorpay, Resend
- Log in to the CLIs:

```bash
gh auth login          # GitHub.com → HTTPS → Login with a web browser
npx vercel login
```

## 1. Push the code to GitHub

From the project root (the repo already has commits on `main`):

```bash
# Private repo (then share it with reviewers in step 11):
gh repo create insurance-agent-platform --private --source . --remote origin --push

# or a public repo:
gh repo create insurance-agent-platform --public --source . --remote origin --push
```

Check it worked: `gh repo view --web` opens the repo. `.env.local` must **not** be listed there; `.gitignore` excludes it.

## 2. Create the Vercel project

1. https://vercel.com/new → **Import** `insurance-agent-platform`.
2. Framework preset: **Next.js** (detected automatically). Leave the build and output settings at their defaults.
3. **Don't deploy yet** if the screen lets you skip it. If it deploys straight away, that's fine: the first deploy will build, but pages will fail until the database and environment variables are set. You'll redeploy in step 8.

Link your local folder to the project, which the terminal steps below need:

```bash
npx vercel link        # pick your scope and the existing project "insurance-agent-platform"
```

## 3. Add Neon Postgres

1. Vercel dashboard → your project → **Storage** tab → **Create Database** → **Neon** (Serverless Postgres) → Continue.
2. Accept the Neon terms, then choose:
   - Region: the one closest to your Vercel functions (e.g. **Mumbai / ap-south-1** if available; otherwise Singapore or US East).
   - Plan: **Free**
3. On **Connect Project**:
   - Environments: tick **Production**, **Preview** and **Development**.
   - **Custom prefix: leave empty.** The app reads `DATABASE_URL` exactly.
4. Project → **Settings → Environment Variables**. Check that `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` now exist.

> The app connects through the **pooled** URL at runtime. It uses `prepare: false`, which is required when connecting through Neon's pooler. Schema changes in step 7 use the **unpooled** URL.

## 4. Get Razorpay test keys

1. https://dashboard.razorpay.com → sign up or log in. Test mode needs no business verification.
2. Switch the toggle at the top to **Test Mode**.
3. **Account & Settings → API Keys → Generate Key.** Copy both:
   - Key ID: `rzp_test_…`
   - Key Secret: shown only once, so save it now.
4. Make up a **webhook secret** now and use it in steps 6 and 9, for example:
   ```bash
   openssl rand -hex 24
   ```

## 5. Get a Resend API key

1. https://resend.com → sign up. **Note the email you sign up with.**
2. **API Keys → Create API Key** → permission **Sending access** → copy `re_…`.

> **Limitation:** without a verified domain, Resend only delivers to the account owner's email. When testing, enter that address as the customer's email. Other addresses appear in the app's **Email log** with Resend's error message.
> To deliver to any address: Resend → **Domains → Add domain**, add the DNS records it shows, then set `EMAIL_FROM="AgentDesk <policies@your-domain.com>"`.

## 6. Set environment variables

Vercel → Project → **Settings → Environment Variables**. Add each of these for **Production**, and for Preview as well if you want preview deployments to work:

| Name | Value |
|---|---|
| `AUTH_SECRET` | output of `openssl rand -base64 32` |
| `APP_URL` | `https://<your-project>.vercel.app`, the production domain shown in Project → Settings → Domains, with no trailing slash |
| `RAZORPAY_KEY_ID` | `rzp_test_…` |
| `RAZORPAY_KEY_SECRET` | the key secret from step 4 |
| `RAZORPAY_WEBHOOK_SECRET` | the secret you generated in step 4 |
| `RESEND_API_KEY` | `re_…` |
| `EMAIL_FROM` | `AgentDesk <onboarding@resend.dev>` (or your verified-domain sender) |

`DATABASE_URL` is already set by Neon.

Or from the terminal (it prompts you for each value):

```bash
for v in AUTH_SECRET APP_URL RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET RAZORPAY_WEBHOOK_SECRET RESEND_API_KEY EMAIL_FROM; do
  npx vercel env add $v production
done
```

> `APP_URL` is what goes into the PDF and payment links customers receive on WhatsApp, so it must be the public production domain, not a preview URL. If it isn't set, the app falls back to Vercel's production domain automatically.

## 7. Create tables and seed demo data

This runs from your machine against the **production** database. Pull the production variables into a separate file so your local `.env.local` isn't overwritten:

```bash
npx vercel env pull .env.production.vercel --environment=production

# load them into this shell session only
set -a; source .env.production.vercel; set +a

# create the tables (unpooled connection for schema changes)
DATABASE_URL="$DATABASE_URL_UNPOOLED" npm run db:push

# add demo data
DATABASE_URL="$DATABASE_URL_UNPOOLED" npm run db:seed
```

Expected output of the seed:

```
Seeded 12 products, 7 customers.
Login: demo@agentdesk.in / Demo@1234  (second agent: agent2@agentdesk.in)
```

> ⚠️ `db:seed` **empties every table** before inserting demo data. Run it only when setting up, or when you deliberately want to reset the demo.
> Values from the shell take priority over `.env.local`, so these commands affect production only while those variables are loaded. Open a new terminal (or run `unset DATABASE_URL DATABASE_URL_UNPOOLED`) before doing local work again.

Delete the pulled file when you're done (it's git-ignored, but it contains secrets):

```bash
rm .env.production.vercel
```

## 8. Deploy

Environment variables only apply to **new** deployments, so redeploy after adding them:

- Dashboard: **Deployments** → latest → **⋯ → Redeploy**, or
- Terminal: `npx vercel --prod`, or
- push a commit to `main` (Vercel deploys automatically).

The build doesn't need database access. Every page is rendered when requested.

## 9. Add the Razorpay webhook

Razorpay Dashboard (**Test Mode**) → **Account & Settings → Webhooks → + Add New Webhook**:

| Field | Value |
|---|---|
| Webhook URL | `https://<your-project>.vercel.app/api/webhooks/razorpay` |
| Secret | exactly the `RAZORPAY_WEBHOOK_SECRET` value |
| Alert email | your email |
| Active events | **`payment_link.paid`** only (under *Payment Link*) |

Save it. The webhook isn't strictly required, because the post-payment page and the **Check payment** button also ask Razorpay directly, but it's what activates the policy when the customer closes the tab right after paying.

## 10. Check the deployment

### Quick checks from the terminal

```bash
APP=https://<your-project>.vercel.app

curl -s -o /dev/null -w "login page: %{http_code}\n" $APP/login                    # 200
curl -s -o /dev/null -w "protected:  %{http_code} → %{redirect_url}\n" $APP/dashboard  # 307 → /login
curl -s -o /dev/null -w "bad PDF:    %{http_code}\n" $APP/q/not-a-token            # 404
curl -s -X POST -H "x-razorpay-signature: bad" -d '{}' -w "  webhook: %{http_code}\n" \
  $APP/api/webhooks/razorpay                                                       # 400 Invalid signature
```

### Full flow in the browser

Use a private/incognito window, which also confirms the site is public.

- [ ] `/login` loads with no Vercel login screen. If one appears: Project → Settings → **Deployment Protection** → turn off Vercel Authentication for production.
- [ ] Log in as `demo@agentdesk.in` / `Demo@1234`. The dashboard shows 6 customers and 1 active policy.
- [ ] **Products** lists 12 plans; the category filters work.
- [ ] **New customer**: use **your WhatsApp number** and **your Resend signup email**; vehicle = Car, 2023, 800000 → Save.
- [ ] The profile lists eligible plans with premiums, and "N plans not available" expands with reasons.
- [ ] **Select plan** → the proposal card appears → **View PDF** opens a one-page PDF with your details.
- [ ] **Share PDF on WhatsApp** opens WhatsApp with the message and PDF link; the status becomes *Proposal shared*.
- [ ] Open the PDF link from your phone. It works without logging in.
- [ ] **Generate payment link** → toast "Payment link created" → the `rzp.io` link is shown.
- [ ] **Share payment link** → open it → pay with UPI `success@razorpay`.
- [ ] You're redirected to `/pay/success` showing **"Payment received. Your policy is active."** and a policy number.
- [ ] The proposal card shows **Policy active**, the policy number and "Confirmation email: sent".
- [ ] The email arrives in your inbox (check spam) and the **Email log** shows it as `sent`.
- [ ] Razorpay → Webhooks → your webhook → recent deliveries show `payment_link.paid` with a **200** response.
- [ ] Log in as `agent2@agentdesk.in`. None of the demo agent's customers are visible.
- [ ] Reset the demo data before submitting (step 7 seed only) so reviewers start clean.

## 11. Final README updates

1. In `README.md`, replace `https://YOUR-APP.vercel.app` with the real URL.
2. Commit and push:
   ```bash
   git commit -am "docs: add live URL" && git push
   ```
3. If the repo is private, share access with reviewers:
   ```bash
   gh api -X PUT repos/<your-github-username>/insurance-agent-platform/collaborators/<reviewer-username> -f permission=pull
   ```
   Or: GitHub → repo → **Settings → Collaborators → Add people**.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Pages show "Application error" / 500; logs say `DATABASE_URL is not set` | Neon was connected with a custom prefix, or not for this environment. Check the variable names in Settings → Environment Variables, then redeploy. |
| Logs say `AUTH_SECRET must be set to at least 32 characters` | Add `AUTH_SECRET` (`openssl rand -base64 32`) and redeploy. |
| Logs say `relation "agents" does not exist` | Step 7 wasn't run against the production database. |
| Login fails with correct credentials | The database wasn't seeded, or was seeded into a different database. Re-run step 7 and check `DATABASE_URL` points at Neon. |
| "Payments are not configured" toast | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` missing, or added after the last deploy. Redeploy. |
| "Razorpay: Authentication failed" | Live keys were used instead of test keys, or the key and secret don't match. Regenerate the test keys. |
| Paid, but the status stays "Payment link sent" | Click **Check payment** on the proposal card. If that activates it, the webhook is misconfigured: check the URL, that the secret exactly matches `RAZORPAY_WEBHOOK_SECRET`, and that the `payment_link.paid` event is enabled. |
| Razorpay webhook deliveries show 400 | The secret doesn't match `RAZORPAY_WEBHOOK_SECRET`. |
| Email log shows `failed`: "You can only send testing emails to your own email address" | Expected on Resend's free tier without a domain (see step 5). Use your Resend signup email as the customer email, or verify a domain. |
| Email log shows `skipped` | `RESEND_API_KEY` isn't set in this deployment. |
| PDF/payment links in WhatsApp point to `localhost` or a preview URL | Set `APP_URL` to the production domain and redeploy. Existing payment links keep the old redirect URL, so generate a new proposal. |
| Visitors see a Vercel login page | Deployment Protection is on for production. Turn it off in Project → Settings → Deployment Protection. |
| `npm run db:push` hangs or errors on the pooler | Use `DATABASE_URL_UNPOOLED` as shown in step 7. |
