'use client';

/**
 * Rewards store — small, focused, persisted.
 *
 * Holds the user's daily bonus claim state so both /rewards (the hub
 * preview / "available now" ribbon) and /daily-bonus (the detail page with
 * the 7-day calendar) read the same source of truth. Without this they were
 * out of sync — claiming from the ribbon left the calendar page showing
 * "Day 4 unclaimed" until refresh.
 *
 * Streak day is computed from `lastClaimDateUTC`:
 *   - if last claim is today (UTC), no claim available, streak unchanged
 *   - if last claim was yesterday, today extends the streak (+1, wraps at 7)
 *   - if last claim was 2+ days ago, streak resets to day 1
 *   - if no claim ever, streak starts at day 1
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/** Returns YYYY-MM-DD in UTC. */
function utcDateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Days between two UTC date keys. Positive if `to` is after `from`. */
function daysBetween(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00Z`).getTime();
  const to   = new Date(`${toKey}T00:00:00Z`).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

interface RewardsState {
  /** Highest streak day reached on the most-recent run. 1..7. */
  streakDay: number;
  /** YYYY-MM-DD UTC of the most-recent claim. Null = never claimed. */
  lastClaimDateUTC: string | null;
  /** ISO date of the most-recent weekly bonus claim. Null = never. */
  lastWeeklyClaimDateUTC: string | null;
  /** ISO date of the most-recent monthly bonus claim. Null = never. */
  lastMonthlyClaimDateUTC: string | null;

  /** True when today (UTC) hasn't been claimed yet. */
  canClaimDailyToday: () => boolean;
  /** The streak day the user is on if they claim *today*. Always 1..7. */
  pendingStreakDay: () => number;
  /** Mark today as claimed and advance the streak. Returns the day claimed (1..7). */
  claimDaily: () => number;

  /** Has at least one calendar-week (Mon UTC reset) elapsed since the last claim? */
  canClaimWeekly: () => boolean;
  /** Has at least one calendar-month (1st UTC reset) elapsed since the last claim? */
  canClaimMonthly: () => boolean;
  claimWeekly: () => void;
  claimMonthly: () => void;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      streakDay: 0,           // "no run yet"; pendingStreakDay() will return 1
      lastClaimDateUTC: null,
      lastWeeklyClaimDateUTC: null,
      lastMonthlyClaimDateUTC: null,

      canClaimDailyToday: () => {
        const last = get().lastClaimDateUTC;
        if (!last) return true;
        return last !== utcDateKey();
      },

      pendingStreakDay: () => {
        const last = get().lastClaimDateUTC;
        const today = utcDateKey();
        if (!last) return 1;
        if (last === today) return get().streakDay || 1; // already claimed
        const gap = daysBetween(last, today);
        if (gap === 1) {
          // Consecutive → advance, wrapping at 7 (day 8 → day 1)
          return get().streakDay >= 7 ? 1 : get().streakDay + 1;
        }
        // Missed at least one day → reset
        return 1;
      },

      claimDaily: () => {
        if (!get().canClaimDailyToday()) return get().streakDay;
        const next = get().pendingStreakDay();
        set({ streakDay: next, lastClaimDateUTC: utcDateKey() });
        return next;
      },

      // Weekly bonus: claimable if never claimed, or if the last claim was
      // before the most-recent Monday 00:00 UTC. (i.e. a new week has started.)
      canClaimWeekly: () => {
        const last = get().lastWeeklyClaimDateUTC;
        if (!last) return true;
        const now = new Date();
        const day = now.getUTCDay();
        const daysSinceMonday = day === 0 ? 6 : day - 1;
        const mondayKey = utcDateKey(
          new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday)),
        );
        return last < mondayKey;
      },

      // Monthly bonus: claimable if never claimed, or if the last claim was
      // before the 1st of the current month UTC.
      canClaimMonthly: () => {
        const last = get().lastMonthlyClaimDateUTC;
        if (!last) return true;
        const now = new Date();
        const firstOfMonthKey = utcDateKey(
          new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
        );
        return last < firstOfMonthKey;
      },

      claimWeekly:  () => set({ lastWeeklyClaimDateUTC:  utcDateKey() }),
      claimMonthly: () => set({ lastMonthlyClaimDateUTC: utcDateKey() }),
    }),
    {
      name: 'yala-rewards',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
