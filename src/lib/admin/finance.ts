// ─────────────────────────────────────────────────────────────────────────────
// Canonical finance model. ONE definition of the revenue stack, used everywhere
// money is summarized (overview KPIs, player 360, PNL calculator, reports).
//
//   Deposits     — gross purchases (cash in)
//   Withdrawals  — redemptions / payouts (cash out)
//   Bonuses      — bonus value granted (cost)
//   GGR          — Gross Gaming Revenue (house win from play)
//   NGR          — Net Gaming Revenue = GGR − Bonuses   ← this is PROFIT
//
// Internal consistency rule used across the mock so every screen ties out:
//   NGR  = Deposits − Withdrawals      (net cash kept = profit)
//   GGR  = NGR + Bonuses               (⇒ NGR = GGR − Bonuses holds by construction)
// ─────────────────────────────────────────────────────────────────────────────
import type { AdminPlayer } from '@/lib/mock-data/admin';

export interface RevenueStack {
  deposits: number;
  withdrawals: number;
  bonuses: number;
  ggr: number;
  ngr: number; // profit
}

/** NGR is always GGR minus bonuses. The single formula the whole app trusts. */
export function ngr(ggr: number, bonuses: number): number {
  return ggr - bonuses;
}

/** Derive the full revenue stack for a player from their lifetime totals. */
export function playerRevenue(p: AdminPlayer): RevenueStack {
  const deposits = p.totalDeposited;
  const withdrawals = p.totalRedeemed;
  const bonuses = Math.round(deposits * 0.08);
  const profit = deposits - withdrawals; // NGR (net cash kept)
  const ggr = profit + bonuses; // so that ngr(ggr, bonuses) === profit
  return { deposits, withdrawals, bonuses, ggr, ngr: ngr(ggr, bonuses) };
}

/** Margin % = NGR / GGR (how much of gross revenue survives bonus cost). */
export function marginPct(stack: RevenueStack): number {
  if (!stack.ggr) return 0;
  return (stack.ngr / stack.ggr) * 100;
}

// Platform-level 30-day headline figures (internally consistent with the rule).
const DEPOSITS_30D = 1_840_000;
const WITHDRAWALS_30D = 612_000;
const BONUSES_30D = 214_000;
const NGR_30D = DEPOSITS_30D - WITHDRAWALS_30D;        // 1,228,000 profit
const GGR_30D = NGR_30D + BONUSES_30D;                 // 1,442,000

export const PLATFORM_30D: RevenueStack = {
  deposits: DEPOSITS_30D,
  withdrawals: WITHDRAWALS_30D,
  bonuses: BONUSES_30D,
  ggr: GGR_30D,
  ngr: NGR_30D,
};

// ── Player RTP / money-laundering signal ─────────────────────────────────────
// RTP = won / wagered. A player who wagers large volume but consistently loses
// almost nothing (RTP near 100%) is cycling money, not gambling — the classic
// sweeps-laundering pattern. We surface RTP per window and flag sustained highs.
export const RTP_LAUNDERING_THRESHOLD = 97; // % — sustained RTP at/above this is suspicious

export interface RtpWindow { label: string; rtp: number; wagered: number; flagged: boolean; }

export function playerRtp(p: AdminPlayer): { windows: RtpWindow[]; allTime: number; flagged: boolean } {
  // Deterministic per-player realized RTP, seeded from id, centred ~94% but a
  // few players land in the laundering zone.
  const seed = p.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const high = seed % 5 === 0; // ~1 in 5 looks suspicious in the demo
  const baseAll = high ? 98.4 + (seed % 12) / 10 : 92 + (seed % 50) / 10; // 92.0–97.0 normal
  const windows: RtpWindow[] = [
    { label: 'Last 24h', d: 1 }, { label: 'Last 7d', d: 7 }, { label: 'Last 14d', d: 14 },
    { label: 'Last 30d', d: 30 }, { label: 'All time', d: 0 },
  ].map(({ label, d }, i) => {
    const jitter = high ? ((seed + i) % 8) / 10 : ((seed + i) % 60) / 10 - 3;
    const rtp = Math.min(100, Math.max(80, +(baseAll + jitter).toFixed(2)));
    const wagered = Math.round((p.totalWagered / (d || 6)) * (d ? 0.8 : 1));
    return { label, rtp, wagered, flagged: rtp >= RTP_LAUNDERING_THRESHOLD };
  });
  const flagged = windows.filter((w) => w.flagged).length >= 2;
  return { windows, allTime: windows[windows.length - 1].rtp, flagged };
}

// Headline finance KPI cards for the dashboard (with prior-period deltas + trend).
export interface FinanceKpi {
  key: string;
  label: string;
  value: number;
  /** Render as compact USD ($1.4M) vs full. */
  delta: number;
  upIsGood: boolean;
  accent: 'gold' | 'teal' | 'blue' | 'purple' | 'amber';
  spark: number[];
  /** Optional helper line, e.g. the NGR formula. */
  note?: string;
}

export const FINANCE_KPIS: FinanceKpi[] = [
  { key: 'deposits', label: 'Deposits', value: DEPOSITS_30D, delta: 12.4, upIsGood: true, accent: 'teal', spark: [42, 48, 45, 51, 58, 55, 63, 61, 68, 72, 70, 78] },
  { key: 'withdrawals', label: 'Withdrawals', value: WITHDRAWALS_30D, delta: -3.8, upIsGood: false, accent: 'amber', spark: [70, 66, 68, 64, 62, 65, 60, 58, 61, 57, 59, 55] },
  { key: 'bonuses', label: 'Bonuses', value: BONUSES_30D, delta: 8.2, upIsGood: false, accent: 'purple', spark: [30, 32, 34, 33, 36, 38, 40, 39, 42, 44, 43, 46] },
  { key: 'ggr', label: 'GGR', value: GGR_30D, delta: 9.6, upIsGood: true, accent: 'gold', spark: [50, 52, 51, 55, 58, 57, 61, 63, 66, 68, 70, 73] },
  { key: 'ngr', label: 'NGR (profit)', value: NGR_30D, delta: 6.1, upIsGood: true, accent: 'teal', spark: [44, 46, 45, 48, 50, 49, 53, 55, 57, 58, 60, 62], note: 'GGR − Bonuses' },
];
