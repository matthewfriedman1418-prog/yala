export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'welcome' | 'daily' | 'reload' | 'race' | 'vip' | 'cashback' | 'tournament' | 'referral';
  badge: string;
  badgeColor: string;
  gcBonus?: number;
  scBonus?: number;
  expiresAt: string;
  terms: string;
  ctaText: string;
  gradient: string;
}

// Tightened taxonomy: every promo maps to a single, recognizable mechanic.
// Copy follows a consistent shape — subtitle says what + how often, description
// says what action triggers it. No two promos read alike.
export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo_001',
    title: 'Welcome Pack',
    subtitle: 'First purchase · one-time',
    description: 'Double your first coin purchase, plus 50 SC on the house. Hits your wallet instantly.',
    type: 'welcome',
    badge: 'NEW PLAYERS',
    badgeColor: 'text-emerald-400',
    gcBonus: 100_000,
    scBonus: 50,
    expiresAt: 'Available on first purchase',
    terms: 'New accounts only. SC subject to 1× playthrough before redemption.',
    ctaText: 'Claim Welcome Pack',
    gradient: 'from-amber-900/40 to-emerald-900/40',
  },
  {
    id: 'promo_002',
    title: 'Daily Login',
    subtitle: 'Free coins · every 24 hours',
    description: 'Log in once a day to claim. Hit a 7-day streak and your reward doubles, plus a bonus SC drop.',
    type: 'daily',
    badge: 'DAILY',
    badgeColor: 'text-gold',
    gcBonus: 2_500,
    scBonus: 1,
    expiresAt: 'Resets daily at 00:00 UTC',
    terms: 'Streak resets if you skip a day. Free play promotion — no purchase required.',
    ctaText: 'Claim Today',
    gradient: 'from-yellow-900/40 to-amber-900/40',
  },
  {
    id: 'promo_003',
    title: 'Daily Race',
    subtitle: 'Wager-based leaderboard · 24 hours',
    description: 'Wager GC across any game. Top 100 split a 500K GC pool. Rank #1 takes 125K.',
    type: 'race',
    badge: 'LIVE NOW',
    badgeColor: 'text-emerald-400',
    gcBonus: 500_000,
    expiresAt: 'Resets daily at 00:00 UTC',
    terms: 'Only GC wagers count. Prizes credited within 1 hour of race end.',
    ctaText: 'View Standings',
    gradient: 'from-orange-900/40 to-red-900/40',
  },
  {
    id: 'promo_004',
    title: 'Weekend Reload',
    subtitle: '+20% on any coin purchase · Fri–Sun',
    description: 'Every Gold Coin package bought Friday through Sunday gets a 20% bonus. Stacks with Welcome Pack on first purchase.',
    type: 'reload',
    badge: 'FRI–SUN',
    badgeColor: 'text-gold-light',
    gcBonus: 0,
    expiresAt: 'Active every weekend',
    terms: 'Bonus credited at checkout. Applies to GC portion only.',
    ctaText: 'Buy Coins',
    gradient: 'from-amber-800/40 to-yellow-900/40',
  },
  {
    id: 'promo_005',
    title: 'Weekly Cashback',
    subtitle: 'Get back 10% of net losses · every Monday',
    description: 'Tough week? We refund 10% of your net GC losses every Monday morning, no minimum.',
    type: 'cashback',
    badge: 'AUTOMATIC',
    badgeColor: 'text-emerald-400',
    gcBonus: 0,
    expiresAt: 'Calculated Sunday, paid Monday',
    terms: 'Calculated on Sunday at 23:59 UTC. Paid to wallet by 09:00 UTC Monday.',
    ctaText: 'How it works',
    gradient: 'from-emerald-900/40 to-teal-900/40',
  },
  {
    id: 'promo_006',
    title: 'VIP Boost',
    subtitle: 'Tier 4+ only · weekly',
    description: 'Diamond Tier and above get a 25K GC drop every Monday, plus access to private tournaments.',
    type: 'vip',
    badge: 'TIER 4+',
    badgeColor: 'text-purple-400',
    gcBonus: 25_000,
    expiresAt: 'Every Monday',
    terms: 'Requires Diamond Tier (Tier 4) or higher. Auto-credited.',
    ctaText: 'See VIP Perks',
    gradient: 'from-purple-900/40 to-indigo-900/40',
  },
  {
    id: 'promo_007',
    title: 'Originals Tournament',
    subtitle: 'Multi-day bracket · ends Sunday',
    description: 'Plinko, Crash, Mines and Dice. Highest multiplier hit on each game wins. Three prize tiers per game.',
    type: 'tournament',
    badge: 'LIMITED',
    badgeColor: 'text-red-400',
    gcBonus: 250_000,
    expiresAt: 'Ends Sunday 23:59 UTC',
    terms: 'Each game ranked separately. Single highest multiplier wins. GC wagers only.',
    ctaText: 'Play Originals',
    gradient: 'from-yellow-800/40 to-orange-900/40',
  },
  {
    id: 'promo_008',
    title: 'Refer a Friend',
    subtitle: '5K GC per qualified signup · unlimited',
    description: 'Send your code, get 5,000 GC when they make their first purchase. No cap, no expiry.',
    type: 'referral',
    badge: 'EVERGREEN',
    badgeColor: 'text-light-sand',
    gcBonus: 5_000,
    expiresAt: 'Ongoing',
    terms: 'Referee must complete KYC + first purchase. Max 50 referrals/year per account.',
    ctaText: 'Get My Code',
    gradient: 'from-purple-900/40 to-indigo-900/40',
  },
];
