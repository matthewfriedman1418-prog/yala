# YALA — Admin Console / Back-Office Specification
*Head of Product / CTO design — feature set & dynamics*
*Generated: 2026-05-28*

> **Reference basis:** Benchmarked against the TrueIGTech operator console (clean modular IA)
> and the MyPrize / MyTechnology console (deep customer-360, playthrough & promo engines, PNL
> calculator, weighted RTP). Used for **feature parity only** — Yala's implementation, branding,
> copy, and data models are original. Everything is **local + mocked**; no real money, no real
> PII, and nothing touches the MyTechnology work side.

---

## 0. What this document is

A complete design for Yala's operator back office: the information architecture, every module's
feature set, the per-screen actions, and — most importantly — the **dynamics** (the engines and
state machines that the UI is a window onto). The player-facing app is the storefront; this is the
factory floor.

The current `/admin` build (Overview, Players, Transactions, Redemptions, KYC, Games, Promotions,
Compliance, Support, Affiliates, Staff) is the **v0 operational core**. This spec is the v1 target
it grows into.

---

## 1. Operating principles (non-negotiables)

These are the rules every screen must obey. They're what separate a real iGaming back office from a
CRUD admin panel.

1. **The ledger is the source of truth.** No screen ever sets a balance directly. Every balance
   change is a double-entry ledger transaction (a debit and a credit that sum to zero) with an
   idempotency key. "Adjust balance" writes a *reversing/adjusting entry* with a reason code — it
   never overwrites a number. This is what makes money provably correct and auditable.
2. **Every mutation is attributed, reasoned, and reversible.** Who, when, what changed (prev → new),
   and a required note. Status changes, balance adjustments, KYC overrides, promo grants — all land
   in an immutable audit log (see the MyPrize "Status Updates" log: time / admin / prev / new / note).
3. **Dual control for money & identity.** Redemptions over a threshold, manual credits over a
   threshold, and KYC overrides require a second operator's sign-off (maker/checker).
4. **Least privilege by role.** A support agent can read a wallet and reply to a ticket but cannot
   approve a $2k payout or override KYC. RBAC is enforced server-side; the UI only hides what the
   server forbids.
5. **Everything is queue-driven.** Redemptions, KYC, fraud flags, RG requests, chargebacks, and
   tickets are *work queues* with SLAs, assignment, and aging — not just tables.
6. **Feature-flagged & monitored.** Provider integrations, jobs, and risky features toggle live
   (TrueIGTech's `abandoned_bets:pragmatic` ON/OFF model). Operators see job/monitor health.
7. **Real-time where it matters.** Online players, live wager feed, pending-withdrawal count, and
   balances push live; the rest polls.
8. **Read-heavy, write-careful.** Most operators read 95% of the time. Make search, filter, and
   360-views fast; make writes deliberate (confirmations, reasons, previews).

---

## 2. Personas & RBAC

| Role | Primary job | Can do | Cannot do |
|---|---|---|---|
| **Super Admin / Owner** | Everything | All, incl. RBAC & system settings | — |
| **Admin / Ops Lead** | Run the floor | Players, games, promos, most config | Edit RBAC, rotate API keys |
| **Support L1** | First-line tickets | Read 360, reply tickets, add notes, soft actions | Adjust balance, approve payouts, KYC override |
| **Support L2** | Escalations | L1 + small manual credits, resend payouts | Large payouts, ban, KYC override |
| **Compliance / AML** | KYC, AML, RG | KYC decisions, self-exclusion, sanctions, SAR | Game config, promo creation |
| **Risk / Fraud** | Protect the float | Flag/hold, device & multi-account tools, rules | Approve own holds (dual control) |
| **Finance / Payments** | Money movement | Approve redemptions, reconcile, chargebacks, tax | Game/promo config |
| **CRM / Marketing** | Growth | Promos, bonuses, banners, segments, campaigns | Money, KYC, RBAC |
| **Game Ops** | Catalog & RTP | Games, providers, categories, RTP weighting | Money, KYC |
| **VIP / Host** | Retention | PNL calculator, manual XP/tier, host actions | Bulk config, RBAC |
| **Analyst** | Read-only insight | All dashboards & reports, exports | Any write |

Every role inherits **read** on the Command Center. The **audit log** records the acting role.

---

## 3. Information Architecture (left nav)

Improved over both references — TrueIGTech's clean grouping, plus the finance/compliance depth both
under-serve. Badge = live work-queue count.

```
■ Command Center            (dashboard, live ops, alerts, queue snapshot)

■ Players                   (CRM 360: search, list, bulk update, detail)

■ Payments & Finance
    Deposits / Purchases
    Redemptions / Withdrawals          ‹queue›
    Ledger & Reconciliation
    Packages & Pricing
    Chargebacks & Disputes             ‹queue›
    Tax & Statements (W-2G / 1099)

■ Compliance & Risk
    KYC Queue & Tiers                  ‹queue›
    AML · Sanctions · PEP              ‹queue›
    Fraud & Risk Rules
    Devices & Multi-account
    Responsible Gaming                 ‹queue›
    Geo & Jurisdiction
    AMOE (mail-in entries)

■ Casino / Game Ops
    Games
    Providers & Aggregators
    Categories
    RTP & Game Weighting
    Bet / Round Explorer  (+ provably fair)
    Jackpots
    Provider Monitors & Flags

■ Engagement
    Bonuses
    Promos & Bonus Drops
    Tags & Widgets
    Spin Wheel · Daily Streak · Chest & Cards
    Missions / Quests
    Tournaments · Races · Leaderboards
    Referrals & Affiliates

■ VIP & Hosts
    Tiers & Benefits
    Player PNL Calculator
    Manual XP / Rank / Fast-Track
    Creator / Host Program

■ CRM & Messaging
    Segments / Audiences
    Campaigns (email / push / in-app)
    Bulk Assign (CSV)

■ Content (CMS)
    Pages · Banners · Promo content · Localization

■ Support                   ‹queue›

■ System Settings
    Feature Flags · Jobs & Monitors · API Keys & Webhooks · System Health

■ Administrator             (staff & RBAC)

■ Audit Log

■ Reports
```

---

## 4. Module specifications

### 4.1 Command Center (Dashboard)
**Purpose:** The 10-second health read + the day's work at a glance.

- **KPI cards** (with sparkline + delta vs prior period): Registered users, FTD count & amount,
  GGR, NGR, Total wagered, Total purchased, Total redeemed, Offline purchased/redeemed, SC purchased
  coins, Quick purchases, ARPPU, hold/margin %.
- **Real-time panel:** Online players (live), winnings last hour, active wagers, **pending
  withdrawals** (the number finance must clear today).
- **Work-queue snapshot:** redemptions, KYC, fraud flags, RG requests, tickets — counts + oldest-age
  SLA breach, each a deep link.
- **SC economy widget:** SC issued vs SC in circulation, redemption rate, GC→SC conversion rate
  (the float health number).
- **Top performing** games / providers (GGR, payout, wagered) with Game/Provider toggle + export.
- **Demographic map** (US state heat) + **financial activity** (deposits vs withdrawals over time).
- **Compliance & security tile:** flagged accounts, KYC pass-rate, high-value (>$1k) txns to review.
- **Date-range control** + role-aware layout (finance sees money first, compliance sees queues first).

### 4.2 Players — the Customer 360
The most-used screen in the building. **Search by** id / username / email / phone / provider_id / IP.
List supports column chooser, filters, saved views, and **Bulk User Update** (status, tag, flag, grant).

**Detail header:** avatar, username, tier badge, status chip; quick actions — Edit, Activate/Suspend
(status + reason → audit), **Mark as Internal** (test accounts excluded from reports), Verify email,
**KYC verified / Mark Unverified / Require Documentary KYC**, Eligible for Affiliate, Eligible for
Promo, **Promote to VIP / Creator**, **Set Fast Track**, More Actions.

**Identity block:** id, username, full name, email (Change), phone (Change), account type, last login
IP, DOB, email-verification state, internal flag, referrer id, last seen, created/updated,
**jurisdiction** (signup vs last: JX / country / region), "reached transaction threshold."

**Right-rail limits panel (tabbed):** Self-Exclusion · Withdrawal Limit · Deposit Limit — daily /
weekly / monthly amounts, submit/reset, with cool-off and withdraw-only-until.

**Tabs:**
- **Details** — wallet (GC / SC / Bonus / USD / XP / PXP), Manage Balance (→ ledger adjust dialog
  with reason code), total transactions (purchased / offline / redeemed).
- **Balances & Playthroughs** — withdrawable vs locked, remaining redemption caps, and the
  **playthrough table** (amount × multiplier = play requirement, net balance, total bet, total won,
  achieved, type, created) for active & completed; delete/void with reason (dual-control).
- **Activity** — Solo / Play-together / All plays / Purchases / Redemptions / Bonuses; amount in →
  amount out, game, status, time; sortable.
- **Transactions** — full ledger view for this player.
- **Bet History** — round-level, links to Bet/Round Explorer + provably-fair verify.
- **Referred Users / Referrals** — L1/L2 reward tiers, referred list, wager attributed, join date.
- **Duplicates** — device/email/IP/payment-instrument matches → "consolidate accounts" workflow.
- **Comment / Notes** — internal notes + **Status Updates log** (time / admin / prev → new / note).
- **Tier Progresses** — XP, current/next tier, manual adjust.
- **Assigned Promos / Promos** — promos assigned to this user (type, assigned by, claimed, expires)
  + an Assign panel to grant a promo (direct or spin) to this user.
- **Crypto Deposits**, **Streaks**, **RTP** (weighted RTP for this player: all-time/daily/weekly/
  bi-weekly/monthly), **Redeemable Categories**, **Chat** (per-user mute/ban + global controls).

### 4.3 Payments & Finance
- **Deposits / Purchases** — every purchase, PSP, method, status; refund (dual-control); link to player.
- **Redemptions / Withdrawals (queue)** — pending → in-review → approved → paid / rejected. Risk
  score, KYC gate (can't approve unverified), playthrough-met gate, amount thresholds → second sign,
  velocity flags, payout method, batch export. **This queue is finance's daily job.**
- **Ledger & Reconciliation** — append-only double-entry view; daily reconcile against PSP report;
  break list; adjusting-entry tool (reason-coded).
- **Packages & Pricing** — coin-package editor (GC amount, bonus SC, price, "best value" flags,
  schedule, A/B price, regional pricing). This is the store.
- **Chargebacks & Disputes (queue)** — represent/accept, evidence, auto-ban on confirmed fraud.
- **Tax & Statements** — W-2G / 1099 thresholds, generated statements, year-end export.

### 4.4 Compliance & Risk
- **KYC Queue & Tiers** — document review (ID + selfie/liveness), automated checks (authenticity,
  face match, address, sanctions/PEP, age), tiers (email-verified → ID → documentary), approve/reject,
  "require documentary KYC," threshold-triggered escalation. Vendor-SDK-backed in prod (Persona/Veriff).
- **AML · Sanctions · PEP (queue)** — screening hits, ongoing monitoring, case management, SAR draft.
- **Fraud & Risk Rules** — rules engine (velocity, bonus abuse, multi-account, geo mismatch,
  card-testing); each rule has thresholds, action (flag/hold/ban), and a hit log. Risk score model.
- **Devices & Multi-account** — fingerprint graph, accounts sharing device/IP/instrument, consolidate.
- **Responsible Gaming (queue)** — deposit/loss/time/session limits, reality checks, cool-off,
  **self-exclusion** (request → confirm → enforce; reversible only after term), withdraw-only.
  NCPG resources surfaced.
- **Geo & Jurisdiction** — allowed states/countries, geo-block rules, VPN/proxy detection,
  signup-vs-last-location drift.
- **AMOE (mail-in entries)** — free SC entry requests (the legal "no purchase necessary" path):
  intake, validation, dedupe, SC grant, audit. Required for sweeps legality.

### 4.5 Casino / Game Ops
- **Games** — feature toggle, enable/disable, hot/new, category, provider, RTP, desktop/mobile
  thumbnails, status, **drag-to-reorder** (lobby ordering), bulk actions, GGR/sessions per game.
- **Providers & Aggregators** — integration status, thumbnails, enable/disable, per-provider config.
- **Categories** — lobby categories (Slots, Live, Table, Fish, Bingo, Sweet Slots…), reorder,
  thumbnails, active/inactive.
- **RTP & Game Weighting** — weighted RTP by window (all-time/daily/weekly/bi-weekly/monthly),
  contribution weighting toward playthrough, target-margin levers.
- **Bet / Round Explorer** — search any round, see bet/outcome/payout, **provably-fair verify**
  (server seed / client seed / nonce → hash check).
- **Jackpots** — pools, seed/contribution rates, recent winners.
- **Provider Monitors & Flags** — per-provider job toggles (abandoned-bet reconciliation, settlement
  jobs), monitor health, last-run, error counts.

### 4.6 Engagement (Promo & Bonus engine)
- **Bonuses** — typed library: Welcome, Weekly commission, Weekly cashback, Birthday, Early-user,
  Referral, Boost, Reload. Editor: title, type, GC amount, SC amount, **amount-in-percentage toggle**,
  active flag, desktop/mobile image, validity, eligibility, **T&C rich text**.
- **Promos & Bonus Drops** — draft / active / archived; **value + playthrough** (SC + SC-PT,
  USD + USD-PT multiplier), start/end, tag, widget; Copy ID / Edit / Clone / Archive; direct vs spin
  type; **Create & assign via CSV**; claim tracking (unclaimed / complete); bonus-drop scheduling.
- **Tags & Widgets** — promo tags with color + border hex + 80×80 widget badge image.
- **Spin Wheel / Daily Streak / Chest & Cards** — reward-table config, odds, caps.
- **Missions / Quests** — objective, reward, progress rules, schedule.
- **Tournaments · Races · Leaderboards** — per-room/game, type, prize structure, start/end, results.
- **Referrals & Affiliates** — referral L1/L2 reward tiers; affiliate/creator codes, commission
  rates, referral counts, earnings, unpaid balance, payout, review/pause.

### 4.7 VIP & Hosts
- **Tiers & Benefits** — Bronze → Ruby (+ beyond): tier id, **wagering threshold**, rewards (cash,
  **commission %**, **rakeback %**), perks; edit per tier.
- **Player PNL Calculator** — the retention brain. Inputs: margin threshold, margin target, bonus
  adjustment. Per time-range (24h / 7d / 14d / month / all-time): total deposits, total bonus,
  total bet, GGR, NGR, **margin %**, → **potential additional bonus** and **adjusted promo**. Tells
  a host exactly how much bonus a player "earns" without going negative.
- **Manual XP / Rank / Fast-Track** — set XP, promote tier, fast-track until date.
- **Creator / Host Program** — promote to creator, assign host, host book of players.

### 4.8 CRM & Messaging
- **Segments / Audiences** — rule-built cohorts (e.g. "deposited once, dormant 14d, KYC verified").
- **Campaigns** — email / push / in-app; template, audience, schedule, A/B, performance.
- **Bulk Assign (CSV)** — upload user list → grant promo/bonus/tag/flag in bulk (with dry-run preview).

### 4.9 Content (CMS)
- **Pages** — privacy, terms, responsible gambling, sweeps rules, help articles (status, slug, i18n).
- **Banners** — by placement (Home, Casino, Store, Refer-friend, Registration), desktop/mobile image,
  redirect URL, **priority ordering**, enabled, schedule, reorder.
- **Promo content** — marketing promo pages (category, slug, card image, redirect, multilingual, body).
- **Localization** — string catalog per locale.

### 4.10 Support
- Ticket inbox (queue): priority, category, status, assignee, SLA aging; conversation thread;
  canned-response **macros**; resolve/close; link to player 360; per-user notes sync.

### 4.11 System Settings
- **Feature Flags** — code / status (ON/OFF) / description (TrueIGTech model), per-environment.
- **Jobs & Monitors** — cron/queue health, last-run, retries, dead-letter.
- **API Keys & Webhooks** — provider keys, webhook endpoints + delivery log + replay.
- **System Health** — service status, error rate (Sentry), latency.

### 4.12 Administrator (Staff & RBAC)
- Operator list (status, role, 2FA, last active), invite, suspend, role assignment, permission matrix.

### 4.13 Audit Log
- Global, immutable, filterable by actor / action / target / kind / date. Export. The compliance
  backbone.

### 4.14 Reports
- Transactions banking, Casino transactions, Redeem requests, GGR/NGR, cohort retention, funnels,
  LTV, bonus cost, tax — all date-ranged and exportable; scheduled email delivery.

---

## 5. The dynamics (engines behind the UI)

The screens are easy; these mechanics are the product. Even in the mocked front end, the data models
should reflect these so the UI is honest.

1. **Double-entry ledger.** Accounts per (player × currency) + house/bonus/liability accounts. Every
   event = balanced entries with idempotency key, type, and reason. Balances are *derived*, never set.
   Adjustments are reversing entries. This is why "Manage Balance" is a dialog with a reason, not a
   text input on a number.

2. **Multi-currency wallet.** GC (no cash value), SC (sweeps, redeemable), Bonus, USD, XP, PXP.
   Each has rules: GC is freely granted; SC must clear playthrough before it's withdrawable; XP only
   moves tier. The 360 shows *withdrawable vs locked* explicitly.

3. **Playthrough / wagering engine.** Every bonus/SC credit carries `amount × multiplier =
   play_requirement`. As the player wagers, `total_bet` accrues against it (with per-game weighting
   from RTP module) until `achieved`. Only then does SC become withdrawable. Operators can view,
   void, or complete a playthrough (reason-coded). Min redemption + daily/weekly caps + a
   24–72h review window sit on top. **This is the anti-money-laundering core.**

4. **Promo engine.** A promo is a template: value (SC/USD) + playthrough multiplier (SC-PT/USD-PT) +
   window + eligibility + tag + widget. Lifecycle: draft → active → archived. Assignment: direct,
   spin-awarded, segment, or CSV bulk. Each grant tracks claimed/expires and writes a ledger entry +
   a playthrough on claim.

5. **Bonus engine.** Typed recurring bonuses (welcome/cashback/commission/birthday/referral/boost)
   with eligibility rules, %-of-activity or flat amounts, schedules, and caps; cashback/commission
   computed from NGR over a window.

6. **VIP / PNL engine.** Tier = f(XP / wager threshold) → rakeback %, commission %, cash perks.
   The PNL calculator computes per-player margin (GGR/NGR vs deposits+bonus) and, given a target
   margin + adjustment, outputs the *safe* bonus to grant. Retention without bleeding the float.

7. **RTP & game weighting.** Weighted RTP per window per player and per game; contribution weights
   feed the playthrough engine; target-margin levers inform VIP bonus sizing.

8. **KYC / identity state machine.** `unverified → email-verified → ID-verified → documentary` with
   threshold triggers (cumulative redemption/purchase forces documentary KYC), overrides (reason +
   dual-control), and gating (no redemption until the required tier).

9. **Fraud / risk engine.** Rules produce a risk score and actions (flag / hold / withdraw-only /
   ban). Device-fingerprint + payment-instrument graph powers multi-account detection and the
   "consolidate duplicates" workflow.

10. **Responsible-gaming controls.** Player- or operator-set limits (deposit/loss/time/session),
    reality checks, cool-off, and self-exclusion (request → confirm → hard-enforced for the term).

11. **AMOE.** The legally-required free entry path: intake → validate → dedupe → grant SC → audit.

12. **RBAC + audit + dual control.** Every write checks permission, records who/what/why, and — for
    money & identity — requires a second approver above thresholds.

13. **Feature flags & monitors.** Provider integrations and jobs toggle live; operators watch monitor
    health and replay failed webhooks.

14. **Real-time bus.** Online players, live wagers, balance changes, pending-withdrawal count, and
    chat stream over websockets; dashboards subscribe.

---

## 6. How this differs from the references (the "better than" thesis)

- **Finance & compliance are first-class, not afterthoughts.** Both references bury the ledger,
  reconciliation, chargebacks, tax, and AML. For a US sweeps operator these are existential — they
  get top-level modules and proper queues with SLAs and dual control.
- **Queues, not tables.** Redemptions/KYC/RG/fraud/tickets are aging work-queues with assignment and
  SLA breach surfacing — the difference between "a list" and "an operations tool."
- **One Customer 360, everything linked.** Every number deep-links to its ledger entry, round, promo,
  or case. No dead-end tables.
- **The PNL calculator is promoted to a first-class retention tool** and wired to the bonus engine,
  not a standalone calculator.
- **Provably-fair + bet/round explorer** for trust, which neither reference foregrounds.
- **Audit-first.** A global immutable audit log + per-action attribution + maker/checker on money.

---

## 7. Build phasing (front-end, mock-data driven)

**Phase 0 — done:** Overview, Players(+detail), Transactions, Redemptions, KYC, Games, Promotions,
Compliance, Support, Affiliates, Staff.

**Phase 1 — Customer 360 depth + money rigor (highest value):**
- Expand player detail into the full tabbed 360 (Balances & Playthroughs, Activity filters, Bet
  History, Duplicates, Notes + Status-update log, Assigned Promos, RTP, Streaks, limits rail).
- Redemptions → true queue (review drawer, dual-control, risk gates).
- Ledger view + Manage-Balance reason-coded dialog. Bulk User Update.

**Phase 2 — Engagement engine:**
- Bonus editor (typed, %-toggle, T&C), Promo editor (value + playthrough + tag + widget + CSV assign),
  Tags & Widgets, Banners/CMS, Spin Wheel / Streak / Missions / Tournaments / Leaderboards.

**Phase 3 — VIP & Game Ops:**
- VIP tiers + PNL calculator + manual XP/fast-track; Games reorder + Providers + Categories +
  RTP weighting; Bet/Round explorer + provably-fair.

**Phase 4 — Compliance & platform:**
- KYC tiers/AML/Fraud rules/Devices/Geo/AMOE; Packages & pricing; Tax; Chargebacks; CRM segments &
  campaigns; Feature flags / Jobs / Webhooks / Audit log / Reports.

---

## 8. Visual direction

Keep Yala's obsidian/teal-forest + gold theme (cohesive with the player app, unlike the references'
generic dark-blue/light-purple). Operator density: tighter rows, more data per screen than the
player app, but the same tokens, fonts (Manrope / Archivo Black / Geist Mono), and glass surfaces.
Status/risk use a consistent color language (green/amber/red/blue/purple) across every queue.

## END OF SPEC
