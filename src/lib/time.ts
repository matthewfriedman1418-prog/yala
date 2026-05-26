'use client';

/**
 * Small client-only helpers for "time until X" countdowns shown on the
 * Rewards Hub and Promotions page (next daily reset, next weekly reset, etc).
 *
 * Resets are in UTC to match how competitor sweeps casinos schedule them
 * (Stake / Chumba both reset at 00:00 UTC).
 */

export function msUntilNextDailyResetUTC(): number {
  const now = new Date();
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0,
  ));
  return next.getTime() - now.getTime();
}

/** Next Monday 00:00 UTC. */
export function msUntilNextWeeklyResetUTC(): number {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun..6=Sat
  // Days until next Monday (UTC). If today is Monday and not yet 00:00 we just
  // count down within this day; otherwise next Monday.
  const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7 || 7;
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilMonday,
    0, 0, 0, 0,
  ));
  return next.getTime() - now.getTime();
}

/** First of the following month, 00:00 UTC. */
export function msUntilNextMonthlyResetUTC(): number {
  const now = new Date();
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    1,
    0, 0, 0, 0,
  ));
  return next.getTime() - now.getTime();
}

/** Format a ms duration as "Xd Yh", "Xh Ym", or "Xm Ys". */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (days > 0)    return `${days}d ${hours}h`;
  if (hours > 0)   return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
