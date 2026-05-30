# YALA Admin — API & Data Contract
*The contract the back office consumes. Build the backend to THIS and the UI lights up with zero changes.*
*Generated: 2026-05-28*

> **How to use this doc.** Every admin screen currently reads from a typed mock
> layer (`src/lib/admin/ledger.ts`, `src/lib/mock-data/admin.ts`,
> `src/lib/mock-data/admin-extra.ts`, `src/lib/admin/finance.ts`). This document
> turns those shapes into REST endpoints. When each endpoint exists, replace the
> body of the matching mock function with a `fetch()` — **no component changes**.
> TypeScript interfaces below are the source files' exported types; treat them as
> the response schemas.

---

## 1. Conventions

- **Base URL:** `/api/admin/v1`
- **Auth:** operator session (httpOnly cookie) + RBAC. Every request carries the
  acting operator; the server enforces role permissions (see Admin spec §2).
- **Format:** JSON. `camelCase`. Timestamps are ISO-8601 UTC.
- **Money:** integers in the currency's smallest sensible unit (USD cents OR coin
  units); the field name states the unit. Never floats for money.
- **Pagination:** `?page=0&limit=25` → `{ data: [...], page, limit, total }`.
- **Filtering/sort:** `?status=pending&sort=-netRevenue&q=fox` (`-` = desc).
- **Errors:** `{ error: { code, message, details? } }` + HTTP status.
- **Idempotency:** every mutation accepts `Idempotency-Key` header (required for
  money/identity writes). Re-sending the same key returns the original result.
- **Audit:** every mutation writes an audit entry server-side (actor, action,
  target, before/after, reason). Returned via the audit endpoints.
- **Dual control:** money/identity actions above thresholds return
  `202 { status: 'pending_approval', approvalId }` instead of executing.

---

## 2. Ledger (keystone) — `/ledger`

The single source of truth. Balances are **derived**, never set.

```ts
type LedgerCurrency = 'GC' | 'SC' | 'BONUS' | 'USD' | 'XP';
type EntryType = 'opening'|'purchase'|'redeem'|'bet'|'win'|'bonus_grant'
               |'rakeback'|'referral'|'adjustment'|'reversal'|'vault'|'fee';
interface LedgerEntry {
  id; ts; playerId; currency: LedgerCurrency; amount;  // signed: +credit / -debit
  type: EntryType; reason; counter; operator?;
}
```

| Method | Path | Purpose |
|---|---|---|
| GET | `/ledger/entries?playerId=&type=&q=&page=` | Global/player ledger (paginated) |
| GET | `/players/:id/balances` | Derived `Record<LedgerCurrency, number>` |
| POST | `/ledger/adjustments` | Reason-coded double-entry adjustment. Body `{ playerId, currency, amount, reason, idempotencyKey }`. Returns the new entry (or `202` pending approval over threshold). |
| GET | `/ledger/reconciliation?date=` | Recon run vs processor report → `{ breaks: [...] }` |

> Mock parity: `useLedgerStore.adjustBalance`, `balancesFor`, `entriesFor`.

---

## 3. Players — `/players`

```ts
interface AdminPlayer {
  id; username; email; avatar; country; vipTier; vipName;
  status: 'active'|'flagged'|'banned'|'self_excluded'|'dormant';
  kyc: 'verified'|'pending'|'unverified'|'rejected';
  joinDate; lastSeen; gcBalance; scBalance;
  totalDeposited; totalRedeemed; totalWagered; netRevenue; flags: string[];
}
```

| Method | Path | Purpose |
|---|---|---|
| GET | `/players?q=&status=&kyc=&sort=&page=` | Search/list (table) |
| GET | `/players/:id` | Profile header + identity |
| PATCH | `/players/:id` | Update status/email/phone/flags `{ field, value, reason }` (audited) |
| POST | `/players/:id/ban` | `{ reason }` → audited; reversible |
| POST | `/players/bulk` | Bulk action `{ ids:[], action:'tag'|'bonus'|'suspend', payload, reason }` |
| GET | `/players/:id/revenue` | `RevenueStack { deposits, withdrawals, bonuses, ggr, ngr }` — **NGR = GGR − Bonuses** |
| GET | `/players/:id/rtp` | `{ windows:[{label,rtp,wagered,flagged}], allTime, flagged }` — RTP ≥ 97% sustained ⇒ AML flag |
| GET | `/players/:id/playthroughs` | active + completed `Playthrough[]` |
| POST | `/players/:id/playthroughs/:ptId/void` | `{ reason }` → writes reversal |
| GET | `/players/:id/activity?type=` | solo/play-together/purchases/redemptions/bonuses |
| GET | `/players/:id/rounds` | bet history → links to round explorer |
| GET | `/players/:id/duplicates` | linked-account clusters |
| GET / POST | `/players/:id/notes` | status-update log + free notes |
| GET / PUT | `/players/:id/limits` | RG limits (deposit/loss/time) + self-exclusion |
| GET | `/players/:id/referrals` | referred users + L1/L2 reward tiers |
| POST | `/players/:id/xp` · `/tier` · `/fast-track` | manual VIP adjustments (audited) |
| GET | `/players/:id/pnl?marginTarget=&bonusAdj=` | per-range PNL + recommended safe bonus |

---

## 4. Payments & Finance — `/finance`

```ts
interface Redemption { id; player; playerId; amountSC; usd; method;
  status:'pending'|'in_review'|'approved'|'rejected'|'paid'; requestedAt; kyc; riskScore; note?; }
```

| Method | Path | Purpose |
|---|---|---|
| GET | `/finance/transactions?type=&q=&page=` | Unified ledger view |
| GET | `/finance/redemptions?status=` | Redemption queue |
| POST | `/finance/redemptions/:id/approve` | `≥ $2000 ⇒ 202 pending_approval` (dual control). Gated on `kyc=verified` + playthrough met |
| POST | `/finance/redemptions/:id/reject` | `{ reason }` |
| GET / POST / PATCH | `/finance/packages` | Coin package/pricing CRUD `CoinPackage` |
| GET | `/finance/chargebacks` + `/:id/represent` `/:id/accept` | Disputes |
| GET | `/finance/tax?year=` + `/:id/statement` | W-2G / 1099 records & PDFs |

---

## 5. Compliance & Risk — `/compliance`

| Method | Path | Schema / purpose |
|---|---|---|
| GET | `/compliance/kyc?status=` | `KycCase` queue (docs, checks, riskScore) |
| POST | `/compliance/kyc/:id/decision` | `{ decision:'approved'|'rejected', reason }` |
| GET / POST | `/compliance/aml` + `/:id/clear` `/:id/sar` | `AmlCase`; SAR filing requires reason (audited) |
| GET / PATCH | `/compliance/fraud-rules` | `FraudRule[]` (enable/disable, thresholds, action) |
| GET | `/compliance/devices` | `DeviceCluster[]` (fingerprint/IP/payment graph) |
| POST | `/compliance/devices/:id/consolidate` | merge duplicate accounts |
| GET / PUT | `/compliance/geo` | `GeoRule[]` per jurisdiction |
| GET / POST | `/compliance/responsible-gaming` | `RgRecord[]`; self-exclusion confirm |
| GET / POST | `/compliance/amoe` | mail-in entries → validate/grant SC |

---

## 6. Casino / Game Ops — `/games`

```ts
interface AdminGame { id; name; provider; category; rtp; enabled; featured;
  isHot; isNew; ggr30d; sessions30d; }
interface GameRound { id; player; playerId; game; currency; bet; payout;
  multiplier; result; ts; serverSeedHash; clientSeed; nonce; }
```

| Method | Path | Purpose |
|---|---|---|
| GET / PATCH | `/games` + `/:id` | catalog; toggle enabled/featured/hot/new |
| PUT | `/games/order` | drag-reorder lobby `{ ids: [] }` |
| GET / PATCH | `/games/providers` · `/aggregators` · `/categories` | integrations + lobby cats (reorderable) |
| GET | `/games/rtp?window=` | weighted RTP + per-game playthrough weight |
| GET | `/games/rounds?q=&playerId=` | round explorer |
| POST | `/games/rounds/:id/verify` | provably-fair check `{ ok, computedHash }` |
| GET / PATCH | `/games/jackpots` | *(planned)* pools/contrib config |
| GET / PATCH | `/games/monitors` | provider feature-flag monitors (`abandoned_bets:*`) |

---

## 7. Engagement — `/engagement`

```ts
interface Bonus { id; title; type;  // free-form key
  frequency:'one_time'|'daily'|'weekly'|'monthly'|'event';
  isPercentage; percent; percentBasis:'deposit'|'net_losses'|'wager';
  gcAmount; scAmount; active; validity; eligibility; }
```

| Method | Path | Purpose |
|---|---|---|
| GET / POST / PUT | `/engagement/bonuses` | typed bonus library; `isPercentage` switches award = % of basis vs flat |
| GET / POST / PUT | `/engagement/promos` | promos & drops (value + SC-PT/USD-PT playthrough) |
| POST | `/engagement/promos/:id/assign` | direct / CSV bulk assign |
| GET / POST | `/engagement/missions` · `/leaderboards` | objective rewards, ranked comps |
| GET / POST | `/engagement/tournaments` | *(planned)* |
| GET | `/engagement/affiliates` + `/:id/{approve,pause,payout}` | program oversight |

---

## 8. VIP, CRM, Content — `/vip` `/crm` `/content`

| Method | Path | Purpose |
|---|---|---|
| GET / PUT | `/vip/tiers` | `VipTierConfig[]` — wagerThreshold, cash, commission%, rakeback% (editable) |
| GET / POST / PUT | `/crm/segments` | rule-built cohorts |
| GET | `/crm/segments/:id/members?page=` | players matching a segment |
| GET / POST | `/crm/campaigns` | email/push/in-app |
| POST | `/crm/bulk-assign` | CSV → dry-run `{ valid, notFound, ineligible }` then execute |
| GET / POST / PUT | `/content/pages` · `/banners` | CMS pages + placements (priority/reorder) |

---

## 9. Analytics & time-series — `/analytics`

Powers the dashboard KPIs and every drill-down. **This is the piece that needs
a real warehouse/rollup, not just the OLTP ledger.**

| Method | Path | Returns |
|---|---|---|
| GET | `/analytics/kpis?range=30d` | Headline stack: `{ deposits, withdrawals, bonuses, ggr, ngr }` + deltas |
| GET | `/analytics/kpis/:key/daily?range=30d` | Daily series for ANY KPI (drill-down). e.g. `signups → [{day,value,source:{organic,paid,affiliate}}]` |
| GET | `/analytics/sc-economy` | `{ issued, inCirculation, redeemed, pendingRedemption, redemptionRatePct }` (SC only — GC has no value) |
| GET | `/analytics/revenue?by=channel&range=` | time-series for charts |
| GET | `/analytics/dau?range=14d` | daily active players |
| GET | `/analytics/top-games?by=handle&range=` | leaderboard |
| GET | `/analytics/reports/:id?range=&format=csv` | exportable reports (GGR/NGR, cohorts, funnels, LTV, bonus cost, tax) |

---

## 10. Platform — `/platform`

| Method | Path | Purpose |
|---|---|---|
| GET / PATCH | `/platform/flags` | feature flags (code/enabled/description) |
| GET / POST | `/platform/jobs` + `/:name/run` | cron/queue monitors |
| GET / POST | `/platform/webhooks` + `/:id/replay` | inbound delivery log |
| GET | `/platform/health` | service status/latency |
| GET / POST / PATCH | `/platform/staff` | operators & RBAC |
| GET | `/platform/audit?actor=&kind=&q=&page=` | immutable audit log |

---

## 11. Inbound webhooks the backend must consume → ledger events

These external events drive most ledger writes. Each is verified, idempotent,
and produces audited ledger entries.

| Source | Event | Ledger effect |
|---|---|---|
| PSP (Nuvei/Worldpay) | `payment.succeeded` | `purchase` credit (GC + bonus SC) |
| PSP | `payment.refunded` / chargeback | `reversal` |
| ACH/Crypto out (Dwolla/BitPay) | `transfer.settled` | redemption `paid` |
| KYC vendor (Persona/Veriff) | `inquiry.completed` | update `kyc` status, gate redemptions |
| Game aggregator (SoftSwiss/Relax) | `round.settled` | `bet` + `win` entries, playthrough accrual |
| Sanctions (ComplyAdvantage) | `screening.hit` | open `AmlCase` |

---

## 12. Build order (mirrors the player product's reality)

1. **Auth + RBAC + audit + ledger** — foundational, single-owner, can't parallelize.
2. **Players + balances + transactions + redemptions** — the daily ops core.
3. **KYC + payments webhooks** — unblocks real money movement.
4. **Analytics rollups** — KPIs + drill-downs (warehouse).
5. **Engagement (bonuses/promos) + VIP + CRM.**
6. **Compliance depth (AML/fraud/geo/AMOE) + platform (flags/jobs/webhooks).**

Speculative modules (Tournaments, Jackpots) ship their endpoints when the
player-facing feature does — they're marked "Soon" in the admin nav.

## END OF CONTRACT
