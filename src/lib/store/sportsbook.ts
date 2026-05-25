'use client';

/**
 * Sportsbook bets store — tracks the user's recently-placed bets so the slip
 * can show a "Your recent bets" preview when empty, and so a future bet-history
 * page has something to render.
 *
 * Bets are stored as PLACED + simulated as settled randomly in the UI. This
 * gives a believable preview without faking live odds movement (which would
 * be misleading). Real settlement waits for a real odds feed + grade engine.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type BetStatus = 'pending' | 'won' | 'lost' | 'void';

export interface PlacedBet {
  id: string;
  /** When the user placed it. */
  ts: string;
  /** GC or SC */
  currency: 'GC' | 'SC';
  stake: number;
  potentialPayout: number;
  status: BetStatus;
  /** "single" or "parlay" — for icon + label. */
  mode: 'single' | 'parlay';
  /** Pretty summary of the bet (first leg label + N more if parlay). */
  summary: string;
  /** Decimal odds (so settled payout is stake × odds when won). */
  odds: number;
  /** Number of legs (1 for single, N for parlay). */
  legs: number;
  /** When (if) it settled. */
  settledAt?: string;
}

interface SportsbookState {
  bets: PlacedBet[];
  /** Push a freshly-placed bet to the top. */
  addBet: (bet: Omit<PlacedBet, 'id' | 'ts' | 'status'>) => string;
  /** Mark a bet as settled. */
  settle: (id: string, status: BetStatus) => void;
  /** Wipe history. */
  clear: () => void;
}

export const useSportsbookStore = create<SportsbookState>()(
  persist(
    (set) => ({
      bets: [],
      addBet: (bet) => {
        const id = `bet_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
        set((s) => ({
          bets: [
            {
              id,
              ts: new Date().toISOString(),
              status: 'pending' as const,
              ...bet,
            },
            ...s.bets,
          ].slice(0, 50),
        }));
        return id;
      },
      settle: (id, status) =>
        set((s) => ({
          bets: s.bets.map((b) =>
            b.id === id ? { ...b, status, settledAt: new Date().toISOString() } : b,
          ),
        })),
      clear: () => set({ bets: [] }),
    }),
    {
      name: 'yala-sportsbook',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
