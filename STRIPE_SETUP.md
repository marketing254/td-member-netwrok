# DMN Stripe Dashboard setup

Step-by-step config for the 3 audiences that subscribe through Stripe:
**members**, **vendor partners**, and **experts**. Same Stripe account
for all three — no separate sub-accounts, no Stripe Connect for
billing. Each audience just gets its own **product** (with its own set
of prices) on the shared catalog, distinguished by product name +
metadata. Currency: **USD**.

The Stripe account itself is Canadian (Ekwa Marketing entity) and can
charge USD without any extra setup.

---

## How the founding waiver works (no Stripe for months 1-6)

The launch / founding phase (months 1-6) doesn't touch Stripe at all:

1. Partner/expert submits the public signup form.
2. An admin reviews + activates them from the admin portal (`status = active`).
3. They sign in to the portal with no payment step.
4. The portal is fully open during months 1-6. `months_in_program` increments
   monthly via the admin cron task.
5. From month 5 onward, the in-portal billing page shows an **Upgrade** card
   with the three paid plan choices so they can lock the launch rate (or
   jump to annual) before the waiver runs out.
6. At month 7, if no subscription exists, the `BillingGate` paywall takes
   over on every page except `/expert/billing` (or `/vendor/account`).
   That single page stays accessible so they can always upgrade their way
   out of the lock.

So Stripe only needs to know about the **paid** phases — Growth ($49/mo),
Standard Monthly ($199/mo), and Standard Annual ($1,990/yr). No $0 catalog
product is needed.

---

## Quick reference — env vars

Add these to `landing/.env.local` (dev) and Vercel Project Settings →
Environment Variables (preview + production).

```bash
# === Shared ===
STRIPE_SECRET_KEY=sk_test_...        # or sk_live_... in prod
STRIPE_PUBLISHABLE_KEY=pk_test_...   # NEXT_PUBLIC_* if needed client-side
STRIPE_WEBHOOK_SECRET=whsec_...      # one secret per webhook endpoint

# === Members (existing — already wired) ===
STRIPE_PRICE_FOUNDING_MONTHLY=price_...     # $49/mo  (USD)
STRIPE_PRICE_FOUNDING_ANNUAL=price_...      # $490/yr
STRIPE_PRICE_EARLY_MONTHLY=price_...        # $99/mo
STRIPE_PRICE_EARLY_ANNUAL=price_...         # $990/yr
STRIPE_PRICE_STANDARD_MONTHLY=price_...     # $199/mo
STRIPE_PRICE_STANDARD_ANNUAL=price_...      # $1,990/yr

# === Vendor partners (new) ===
STRIPE_PRICE_PARTNER_GROWTH_MONTHLY=price_...      # $49/mo  — months 7-12
STRIPE_PRICE_PARTNER_STANDARD_MONTHLY=price_...    # $199/mo — month 13+
STRIPE_PRICE_PARTNER_STANDARD_ANNUAL=price_...     # $1,990/yr — annual pre-pay

# === Experts (new) ===
STRIPE_PRICE_EXPERT_GROWTH_MONTHLY=price_...       # $49/mo  — months 7-12
STRIPE_PRICE_EXPERT_STANDARD_MONTHLY=price_...     # $199/mo — month 13+
STRIPE_PRICE_EXPERT_STANDARD_ANNUAL=price_...      # $1,990/yr — annual pre-pay
```

---

## 1. Products — full catalog details

Create three products on the **same** Stripe account, Live mode (Test
mode for sandbox is identical but a separate environment). Stripe
Dashboard → **Products** → **Add product**.

### Product 1 — DMN Member Network · Founding Membership

| Field                  | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| **Name**               | `DMN Member Network — Founding Membership`                           |
| **Description**        | Membership for dental practice owners. 24/7 Expert Hotline returning a written action plan in 2–3 business days, partner-network discounts averaging $6,400/year, full kit library, weekly resources, monthly AMAs + CE events. |
| **Image**              | Upload `td-logo-horizontal-dark.svg`                                 |
| **Statement descriptor** | `DMN MEMBERSHIP`                                                   |
| **Tax code**           | `txcd_10103001` (SaaS — Personal Use)                                |
| **Tax behavior**       | Exclusive                                                            |
| **Metadata**           | `audience: member`, `dmn_product: membership`                        |
| **Tags / unit label**  | Tag with `membership` if your Stripe org uses product tagging        |

### Product 2 — DMN Vendor Network · Featured Partner

| Field                  | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| **Name**               | `DMN Vendor Network — Featured Partner`                              |
| **Description**        | Featured placement in the DMN Vendor Directory for companies serving dental practices. Includes enhanced directory listing, priority category placement, member-inquiry lead routing, Verified Partner badge, quarterly newsletter mentions, one dedicated email to members per year, podcast / webinar eligibility, full lead dashboard, refer & earn $50 per converted member. Annual pre-pay = 2 months free. |
| **Image**              | Upload `td-logo-horizontal-dark.svg`                                 |
| **Statement descriptor** | `DMN PARTNER`                                                      |
| **Tax code**           | `txcd_10103001` (SaaS — Personal Use)                                |
| **Tax behavior**       | Exclusive                                                            |
| **Metadata**           | `audience: vendor`, `dmn_product: partner_directory`                 |
| **Tags / unit label**  | Tag with `partner` if your Stripe org uses product tagging           |

### Product 3 — DMN Expert Bench · Featured Expert

| Field                  | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| **Name**               | `DMN Expert Bench — Featured Expert`                                 |
| **Description**        | Featured placement on the DMN Expert Bench for coaches, consultants, and educators serving dental practices. We produce your kits, surface them in the member library, route warm leads to your calendar, send Hotline referrals, and co-market across the Thriving Dentist podcast / webinars / social. Includes your own course platform — sell on-demand courses and keep 90% of net (DMN takes 10% to run platform + payments). Annual pre-pay = 2 months free. |
| **Image**              | Upload `td-logo-horizontal-dark.svg`                                 |
| **Statement descriptor** | `DMN EXPERT`                                                       |
| **Tax code**           | `txcd_10103001` (SaaS — Personal Use)                                |
| **Tax behavior**       | Exclusive                                                            |
| **Metadata**           | `audience: expert`, `dmn_product: expert_bench`                      |
| **Tags / unit label**  | Tag with `expert` if your Stripe org uses product tagging            |

> Why the `audience` + `dmn_product` metadata matters — the webhook
> handler uses those keys to decide whether to update the `members`,
> `vendors`, or `experts` table. Skipping them works but you'll lose
> the ability to filter by audience in Stripe reports.

---

## 2. Prices — per-product price list

Add prices to each product after creating it. The `Plan key` column is
the env-var-side name; the actual `price_…` ID lives in the env var.

### Members (under Product 1)

| Plan key                | Amount         | Billing  |
| ----------------------- | -------------- | -------- |
| `founding_monthly`      | USD 49.00      | Monthly  |
| `founding_annual`       | USD 490.00     | Yearly   |
| `early_monthly`         | USD 99.00      | Monthly  |
| `early_annual`          | USD 990.00     | Yearly   |
| `standard_monthly`      | USD 199.00     | Monthly  |
| `standard_annual`       | USD 1,990.00   | Yearly   |

### Vendor partners (under Product 2)

| Plan key                       | Amount         | Billing  | Phase      |
| ------------------------------ | -------------- | -------- | ---------- |
| `partner_growth_monthly`       | USD 49.00      | Monthly  | Months 7-12 |
| `partner_standard_monthly`     | USD 199.00     | Monthly  | Month 13+   |
| `partner_standard_annual`      | USD 1,990.00   | Yearly   | Month 13+   |

### Experts (under Product 3)

| Plan key                       | Amount         | Billing  | Phase      |
| ------------------------------ | -------------- | -------- | ---------- |
| `expert_growth_monthly`        | USD 49.00      | Monthly  | Months 7-12 |
| `expert_standard_monthly`      | USD 199.00     | Monthly  | Month 13+   |
| `expert_standard_annual`       | USD 1,990.00   | Yearly   | Month 13+   |

After creating each price, copy its `price_…` ID (the "API ID" column
on the product page) into the matching `STRIPE_PRICE_*` env var.

---

## 3. Subscription Schedules — auto-roll Growth → Standard

Optional but recommended. When a partner/expert upgrades from the
Upgrade card at month 7, set up a Subscription Schedule so Stripe
auto-rolls them to the Standard price at month 13. This saves an
admin task and prevents lapses.

Two phases:

```
Phase 1 — starts: checkout    duration: 6 months   price: partner_growth_monthly
Phase 2 — starts: +6 months   duration: until cancelled  price: partner_standard_monthly
```

If you skip schedules, the customer stays on the Growth price until you
manually swap it in the dashboard or they switch via the Customer
Portal. Either approach works.

The annual pre-pay (`*_standard_annual`) is **not** part of any
schedule — it's a separate subscription the customer picks at upgrade
time or switches into later via the Customer Portal.

---

## 4. Customer Portal

Stripe Dashboard → **Settings** → **Customer portal**.

### Can I leave the defaults?

**Yes — defaults work for launch.** Stripe ships sensible defaults:

- Customers can update payment methods ✔
- Customers can view + download invoices ✔
- Customers can cancel subscriptions ✔ (set to end of billing period)

If you leave it alone, the portal still works for every partner /
expert / member — they can update their card, download invoices, and
cancel. The branding will be generic Stripe (no DMN logo), and they
won't be able to switch between plans without canceling + re-checkout.

### What you get if you customise it (optional polish)

| Setting                       | What it changes                                                  |
| ----------------------------- | ---------------------------------------------------------------- |
| Branding → Business name      | "Dental Member Network" appears in portal header + emails         |
| Branding → Brand colour       | `#0E2A3D` navy, `#D9A84B` gold accent — feels on-brand            |
| Branding → Logo               | Upload `td-logo-horizontal-dark.svg`                              |
| Subscription updates → allow plan switching | Add all monthly + annual prices so customers can switch monthly ↔ annual without canceling |
| Subscription cancellations    | Set to "Cancel at end of billing period" (matches 30-day notice clause) |
| Invoice history               | Already on by default                                              |

**For launch, defaults are fine.** Add the customisations after launch
when you have spare time — they're polish, not requirements.

---

## 5. Webhooks

Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**.

| Field           | Value                                                                              |
| --------------- | ---------------------------------------------------------------------------------- |
| Endpoint URL    | `https://dentalmembernetwork.com/api/stripe/webhook` (prod) · ngrok or `localhost` URL for dev |
| Events to send  | See list below                                                                     |

**Events to subscribe to:**

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

After creating, click "Reveal" on the Signing Secret and put it in
`STRIPE_WEBHOOK_SECRET`. **Different per endpoint** — Test mode and
Live mode have separate secrets.

For local dev, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the printed whsec_… into landing/.env.local
```

---

## 6. Portal lock when payment lapses

Once the founding waiver ends (month 7 onward), every partner and
expert is expected to have a healthy `active`/`trialing` subscription.
If they don't — they never subscribed, card declined, customer
cancelled — both portals lock automatically. Two layers:

**Layer A — UI gate.** [components/shared/BillingGate.tsx](src/components/shared/BillingGate.tsx)
wraps the portal content in [ExpertAppShell](src/components/expert/ExpertAppShell.tsx)
and [VendorAppShell](src/components/vendor/VendorAppShell.tsx). When
`checkBillingAccess()` returns `allowed: false`, the portal renders a
paywall card with two buttons: "Open Stripe portal" (update card,
reactivate) and "Go to billing page". The billing page is allow-listed
so a blocked user can always reach the Upgrade controls.

**Layer B — API guard.** [lib/auth/guards.ts](src/lib/auth/guards.ts)
exposes `requirePaidExpert()` and `requirePaidVendor()`. Use these on
any /api/{expert,vendor}/* route that publishes member-visible work
(catalog/offer publishes, profile edits, kit uploads, post-to-feed).
Blocked users get a structured 402 Payment Required with the same
`reason`, `message`, and `cta` strings as the UI gate.

Decision matrix for `checkBillingAccess()`:

| months_in_program | subscription_status                          | result                  |
| ----------------: | -------------------------------------------- | ----------------------- |
|              ≤ 6  | anything                                     | allowed (waiver active) |
|              > 6  | `active` / `trialing`                        | allowed                 |
|              > 6  | `past_due`                                   | BLOCKED — `past_due`    |
|              > 6  | `unpaid`                                     | BLOCKED — `unpaid`      |
|              > 6  | `canceled` / `incomplete_expired`            | BLOCKED — `canceled`    |
|              > 6  | `null`                                       | BLOCKED — `subscription_required` |

`months_in_program` is incremented monthly by an admin task running on
the 1st of every month.

---

## 7. Refer-and-earn payouts (partners + experts)

The partner referral pays $50 per converted member. Two options:

**Option A — Invoice credit (simpler).** When a referral converts,
issue a $50 credit on the partner's next invoice via Stripe Dashboard
→ Customers → [partner] → **Add credit**. Tracked in the
`referral_signups` table.

**Option B — Stripe Connect Express payouts.** Onboard partners +
experts as Connect Express accounts. Payouts go to their bank once
balance > $200. This is also how the expert 90/10 course revenue split
will pay out long-term.

Phase 1 launch uses Option A. Migrate to Option B in the autumn. The
portal UI doesn't change — only the back-office workflow differs.

---

## 8. Quick verification checklist

After setup, smoke-test each audience:

```
[ ] /pricing renders all 3 audiences (Members + Experts + Partners) with phase ladders
[ ] /experts shows the simple price strip + 90/10 split callout + Apply CTAs on each card
[ ] /partners shows the simple price strip + refer-and-earn callout + Apply CTAs on each card
[ ] Test signup as vendor → admin activates → vendor signs in → /vendor/account loads cleanly
[ ] Same for expert → admin activates → /expert/billing loads cleanly
[ ] Upgrade card on /expert/billing shows 3 plan choices
[ ] Click a plan → redirects to Stripe Checkout (Test card 4242 4242 4242 4242 works)
[ ] Webhook fires after checkout — subscription_status flips to "active"
[ ] BillingGate stays out of the way while subscription is active
[ ] Re-sync from Stripe button works when webhook misses an event
```

If any of those fail, the corresponding `STRIPE_PRICE_*` env var is
probably missing or has a stale `price_…` ID. Check Vercel → Project
Settings → Environment Variables for both Preview and Production scopes.

---

## 9. Going live

1. Switch the dashboard to **Live mode** (top-right toggle).
2. Re-create all 3 products + their prices in Live mode (Test prices
   don't carry over).
3. Replace every `STRIPE_*` env var on Vercel Production with the live
   keys + live price IDs.
4. Add a Live webhook endpoint; copy its signing secret into
   `STRIPE_WEBHOOK_SECRET` (Production scope).
5. Customer Portal branding (optional — see §4): defaults work for
   launch.
6. Smoke-test with a real card on one member, one vendor, one expert.
   Refund each immediately afterwards.

---

## Related code

- [lib/stripe.ts](src/lib/stripe.ts) — plan keys, display tables, `priceIdFor` helpers, `checkBillingAccess`
- [lib/auth/guards.ts](src/lib/auth/guards.ts) — `requireMember`, `requirePaidExpert`, `requirePaidVendor`
- [api/stripe/webhook/route.ts](src/app/api/stripe/webhook/route.ts) — event handler (members wired; vendor + expert handlers extend the same dispatch using subscription metadata `audience`)
- [api/expert/billing/](src/app/api/expert/billing) — invoices, sync, portal, **checkout**
- [api/vendor/billing/](src/app/api/vendor/billing) — invoices, sync, portal, **checkout**
- [components/shared/BillingGate.tsx](src/components/shared/BillingGate.tsx) — portal lock paywall
- [components/shared/UpgradePlanChoice.tsx](src/components/shared/UpgradePlanChoice.tsx) — in-portal plan choice cards
- [supabase/migrations/0015_stripe_billing.sql](supabase/migrations/0015_stripe_billing.sql) — member columns
- [supabase/migrations/0033_vendor_expert_billing.sql](supabase/migrations/0033_vendor_expert_billing.sql) — vendor + expert columns
