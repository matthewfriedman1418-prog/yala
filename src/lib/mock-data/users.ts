export interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  amount: number;
  currency: 'GC' | 'SC';
  country: string;
  isYou?: boolean;
}

import type { YalaIconName } from '@/components/ui/YalaIcon';

// `icon` is the YalaIcon name to render. Emoji fallback kept on each tier
// as a last-resort glyph (used only by old code paths not yet migrated).
export const VIP_TIERS: {
  tier: number; name: string; color: string;
  xpRequired: number; xpToNext: number | null; rakeback: number;
  icon: YalaIconName; emoji: string;
}[] = [
  { tier: 1, name: 'Scout',      color: '#CD7F32', xpRequired: 0,       xpToNext: 10000,   rakeback: 5,  icon: 'shield',     emoji: '🔰' },
  { tier: 2, name: 'Contender',  color: '#C0C0C0', xpRequired: 10000,   xpToNext: 50000,   rakeback: 8,  icon: 'lightning',  emoji: '⚡' },
  { tier: 3, name: 'High Roller',color: '#D6A84F', xpRequired: 50000,   xpToNext: 200000,  rakeback: 12, icon: 'star',       emoji: '⭐' },
  { tier: 4, name: 'Champion',   color: '#E5E4E2', xpRequired: 200000,  xpToNext: 750000,  rakeback: 16, icon: 'trophy',     emoji: '🏆' },
  { tier: 5, name: 'Legend',     color: '#10B981', xpRequired: 750000,  xpToNext: 2000000, rakeback: 20, icon: 'diamond',    emoji: '💎' },
  { tier: 6, name: 'Icon',       color: '#D6A84F', xpRequired: 2000000, xpToNext: null,    rakeback: 25, icon: 'crown',      emoji: '♾️' },
];

export const WEEKLY_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1,  username: 'GoldRushKing',  avatar: 'GK', amount: 4_280_000, currency: 'GC', country: 'US' },
  { rank: 2,  username: 'NightHunter',   avatar: 'NH', amount: 3_154_200, currency: 'GC', country: 'CA' },
  { rank: 3,  username: 'NeonLuck',      avatar: 'NL', amount: 2_890_000, currency: 'GC', country: 'AU' },
  { rank: 4,  username: 'ThunderX',      avatar: 'TX', amount: 2_441_000, currency: 'GC', country: 'NZ' },
  { rank: 5,  username: 'NightFox88',    avatar: 'NF', amount: 2_156_800, currency: 'GC', country: 'US', isYou: true },
  { rank: 6,  username: 'NeonRunner',    avatar: 'NR', amount: 1_987_300, currency: 'GC', country: 'GB' },
  { rank: 7,  username: 'EmeraldWave',   avatar: 'EW', amount: 1_742_100, currency: 'GC', country: 'US' },
  { rank: 8,  username: 'NightOwl7',     avatar: 'NO', amount: 1_501_500, currency: 'GC', country: 'CA' },
  { rank: 9,  username: 'CoinKing',      avatar: 'CK', amount: 1_289_000, currency: 'GC', country: 'DE' },
  { rank: 10, username: 'SpinAce',       avatar: 'SA', amount: 1_100_800, currency: 'GC', country: 'FR' },
];

export const SC_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, username: 'NightHunter',  avatar: 'NH', amount: 842.50, currency: 'SC', country: 'CA' },
  { rank: 2, username: 'EmeraldWave',  avatar: 'EW', amount: 724.20, currency: 'SC', country: 'US' },
  { rank: 3, username: 'ThunderX',     avatar: 'TX', amount: 611.80, currency: 'SC', country: 'AU' },
  { rank: 4, username: 'GoldRushKing', avatar: 'GK', amount: 540.00, currency: 'SC', country: 'US' },
  { rank: 5, username: 'NightFox88',   avatar: 'NF', amount: 480.50, currency: 'SC', country: 'US', isYou: true },
];
