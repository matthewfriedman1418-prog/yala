'use client';
// ─────────────────────────────────────────────────────────────────────────────
// MOCK LEDGER SERVICE — the backend contract, in front-end form.
//
// This module is the single boundary between the admin UI and "the ledger."
// Today it's an in-memory, seeded, double-entry store. When the real
// Hono/Postgres ledger lands, replace the BODIES of these functions with
// `fetch('/api/ledger/...')` calls — the component-facing signatures do not
// change, so no UI is touched.
//
// Invariants honored even in the mock:
//   • Balances are DERIVED from entries, never stored directly.
//   • Every mutation appends a balanced, reason-coded, attributed entry.
//   • "Adjustments" are new reversing entries — nothing is overwritten.
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { PLAYERS } from '@/lib/mock-data/admin';

export type LedgerCurrency = 'GC' | 'SC' | 'BONUS' | 'USD' | 'XP';
export type EntryType =
  | 'opening' | 'purchase' | 'redeem' | 'bet' | 'win' | 'bonus_grant'
  | 'rakeback' | 'referral' | 'adjustment' | 'reversal' | 'vault' | 'fee';

export interface LedgerEntry {
  id: string;
  ts: string;
  playerId: string;
  currency: LedgerCurrency;
  /** Signed: positive = credit to player, negative = debit. */
  amount: number;
  type: EntryType;
  reason: string;
  /** The counter (house / liability / bonus / processor) account this balances against. */
  counter: string;
  /** Operator email if this was a manual action; undefined for system events. */
  operator?: string;
}

export interface Playthrough {
  id: string;
  playerId: string;
  currency: 'SC' | 'USD';
  amount: number;
  multiplier: number;
  playRequirement: number;
  netBalance: number;
  totalBet: number;
  totalWon: number;
  achieved: boolean;
  type: string;
  created: string;
}

const CURRENCIES: LedgerCurrency[] = ['GC', 'SC', 'BONUS', 'USD', 'XP'];

// Deterministic seed: build a short history per player whose signed sum equals
// the player's stated balance (via a final reconciling "opening" entry), so the
// derived balance always matches the rest of the mock data.
function seedEntries(): LedgerEntry[] {
  const out: LedgerEntry[] = [];
  PLAYERS.forEach((p, pi) => {
    const targets: Record<LedgerCurrency, number> = {
      GC: p.gcBalance,
      SC: p.scBalance,
      BONUS: Math.round(p.totalDeposited * 0.08),
      USD: 0,
      XP: p.vipTier * 50_000 + (pi * 1234) % 40_000,
    };
    // A few recent, believable events for the first 14 players (keeps memory light).
    const detail = pi < 14;
    CURRENCIES.forEach((cur) => {
      const events: { d: number; amount: number; type: EntryType; reason: string; counter: string }[] = [];
      if (detail && cur === 'GC') {
        events.push({ d: 1, amount: 50_000, type: 'purchase', reason: 'Coin package: Oasis Bundle', counter: 'processor:card' });
        events.push({ d: 2, amount: -12_500, type: 'bet', reason: 'Wager · Mirage Crash', counter: 'house:wager' });
        events.push({ d: 2, amount: 8_200, type: 'win', reason: 'Win · Mirage Crash', counter: 'house:payout' });
        events.push({ d: 3, amount: 2_500, type: 'bonus_grant', reason: 'Daily login bonus', counter: 'bonus:liability' });
      }
      if (detail && cur === 'SC') {
        events.push({ d: 1, amount: 50, type: 'bonus_grant', reason: 'Welcome SC', counter: 'bonus:liability' });
        events.push({ d: 4, amount: -25, type: 'redeem', reason: 'Redemption → ACH', counter: 'processor:ach' });
      }
      const sum = events.reduce((s, e) => s + e.amount, 0);
      const opening = targets[cur] - sum;
      const base = new Date('2026-05-20T00:00:00Z').getTime();
      // opening first
      out.push({
        id: `le_${p.id}_${cur}_0`, ts: new Date(base - 10 * 86_400_000).toISOString(),
        playerId: p.id, currency: cur, amount: opening, type: 'opening',
        reason: 'Opening balance', counter: 'house:opening',
      });
      events.forEach((e, ei) => out.push({
        id: `le_${p.id}_${cur}_${ei + 1}`, ts: new Date(base + e.d * 86_400_000).toISOString(),
        playerId: p.id, currency: cur, amount: e.amount, type: e.type, reason: e.reason, counter: e.counter,
      }));
    });
  });
  return out;
}

function seedPlaythroughs(): Playthrough[] {
  const out: Playthrough[] = [];
  PLAYERS.slice(0, 10).forEach((p, i) => {
    const amount = [50, 25, 100, 15, 200][i % 5];
    const mult = [1, 1, 1, 5, 1][i % 5];
    const req = amount * mult;
    const bet = Math.round(req * (0.2 + ((i * 17) % 80) / 100) * 100) / 100;
    out.push({
      id: `pt_${p.id}_a`, playerId: p.id, currency: 'SC', amount, multiplier: mult,
      playRequirement: req, netBalance: Math.round((amount - bet * 0.4) * 100) / 100,
      totalBet: bet, totalWon: Math.round(bet * 0.9 * 100) / 100,
      achieved: bet >= req, type: i % 3 === 0 ? 'welcome' : 'promo_claim',
      created: new Date(Date.parse('2026-05-22T00:00:00Z') - i * 86_400_000).toISOString(),
    });
  });
  return out;
}

interface LedgerState {
  entries: LedgerEntry[];
  playthroughs: Playthrough[];
  /** Append a reason-coded adjustment (the only sanctioned way to change a balance). */
  adjustBalance: (args: { playerId: string; currency: LedgerCurrency; amount: number; reason: string; operator: string }) => void;
  voidPlaythrough: (id: string, reason: string, operator: string) => void;
}

let _seq = 1000;
const nextId = () => `le_adj_${_seq++}`;

export const useLedgerStore = create<LedgerState>((set) => ({
  entries: seedEntries(),
  playthroughs: seedPlaythroughs(),
  adjustBalance: ({ playerId, currency, amount, reason, operator }) =>
    set((s) => ({
      entries: [
        {
          id: nextId(),
          ts: new Date('2026-05-28T09:30:00Z').toISOString(),
          playerId, currency, amount, type: 'adjustment',
          reason, counter: 'house:manual_adjustment', operator,
        },
        ...s.entries,
      ],
    })),
  voidPlaythrough: (id, reason, operator) =>
    set((s) => ({
      playthroughs: s.playthroughs.map((p) => (p.id === id ? { ...p, achieved: true, type: `${p.type} · voided` } : p)),
      entries: [
        {
          id: nextId(), ts: new Date('2026-05-28T09:30:00Z').toISOString(),
          playerId: s.playthroughs.find((p) => p.id === id)?.playerId ?? '',
          currency: 'SC', amount: 0, type: 'reversal',
          reason: `Voided playthrough ${id}: ${reason}`, counter: 'bonus:liability', operator,
        },
        ...s.entries,
      ],
    })),
}));

// ── Pure selectors (work the same against a real API response) ────────────────
export function balancesFor(entries: LedgerEntry[], playerId: string): Record<LedgerCurrency, number> {
  const acc: Record<LedgerCurrency, number> = { GC: 0, SC: 0, BONUS: 0, USD: 0, XP: 0 };
  for (const e of entries) if (e.playerId === playerId) acc[e.currency] += e.amount;
  return acc;
}

export function entriesFor(entries: LedgerEntry[], playerId: string): LedgerEntry[] {
  return entries
    .filter((e) => e.playerId === playerId)
    .sort((a, b) => +new Date(b.ts) - +new Date(a.ts));
}

export function playthroughsFor(pts: Playthrough[], playerId: string): Playthrough[] {
  return pts.filter((p) => p.playerId === playerId);
}
