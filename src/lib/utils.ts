import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGC(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

export function formatSC(amount: number): string {
  return amount.toFixed(2);
}

export function formatCurrency(amount: number, currency: 'GC' | 'SC' | 'bonus'): string {
  if (currency === 'SC') return `${formatSC(amount)} SC`;
  return `${formatGC(amount)} ${currency === 'bonus' ? 'Bonus' : 'GC'}`;
}

export function formatXP(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(2)}M XP`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K XP`;
  return `${xp.toLocaleString()} XP`;
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function getVIPColor(tier: number): string {
  const colors: Record<number, string> = {
    1: '#CD7F32',
    2: '#C0C0C0',
    3: '#D6A84F',
    4: '#E5E4E2',
    5: '#10B981',
    6: '#D6A84F',
  };
  return colors[tier] || '#9CA3AF';
}

export function getVIPName(tier: number): string {
  const names: Record<number, string> = {
    1: 'Wanderer',
    2: 'Nomad',
    3: 'Oasis Seeker',
    4: 'Caravan Lord',
    5: 'Desert Prince',
    6: 'Sheikh',
  };
  return names[tier] || 'Wanderer';
}

export function xpProgress(current: number, tierThresholds: number[]): number {
  const tier = tierThresholds.findIndex((t) => current < t);
  if (tier === -1) return 100;
  const prevThreshold = tier > 0 ? tierThresholds[tier - 1] : 0;
  const nextThreshold = tierThresholds[tier];
  return Math.min(100, ((current - prevThreshold) / (nextThreshold - prevThreshold)) * 100);
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
}
