export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'welcome' | 'daily' | 'reload' | 'race' | 'vip' | 'seasonal' | 'referral';
  badge: string;
  badgeColor: string;
  gcBonus?: number;
  scBonus?: number;
  expiresAt: string;
  terms: string;
  ctaText: string;
  gradient: string;
}

export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo_001',
    title: 'Desert Welcome Pack',
    subtitle: 'Your first step into the oasis',
    description: 'Unlock up to 100,000 Gold Coins and 50 Sweep Coins on your first purchase. Enter the desert in style.',
    type: 'welcome',
    badge: 'NEW PLAYERS',
    badgeColor: 'text-emerald-400',
    gcBonus: 100000,
    scBonus: 50,
    expiresAt: 'Ongoing',
    terms: 'Available to new players on first purchase only. No wagering requirement on Gold Coins. Sweep Coins subject to 1× playthrough.',
    ctaText: 'Claim Welcome Pack',
    gradient: 'from-amber-900/40 to-emerald-900/40',
  },
  {
    id: 'promo_002',
    title: 'Daily Login Bonus',
    subtitle: 'Return to the oasis every day',
    description: 'Log in every day to earn escalating Gold Coins. Reach a 7-day streak to unlock a bonus Sweep Coin reward.',
    type: 'daily',
    badge: 'DAILY',
    badgeColor: 'text-gold',
    gcBonus: 2500,
    scBonus: 1,
    expiresAt: 'Every day at midnight',
    terms: 'Daily login bonus resets at 00:00 UTC. 7-day streak bonus requires consecutive daily logins.',
    ctaText: 'Claim Daily Bonus',
    gradient: 'from-yellow-900/40 to-amber-900/40',
  },
  {
    id: 'promo_003',
    title: 'Weekly Dune Race',
    subtitle: '100,000 GC prize pool — every week',
    description: 'Compete on the weekly leaderboard. The top 50 players by wagered Gold Coins share a 100,000 GC prize pool.',
    type: 'race',
    badge: 'WEEKLY',
    badgeColor: 'text-sand',
    gcBonus: 100000,
    expiresAt: 'Resets every Monday 00:00 UTC',
    terms: 'Only Gold Coin wagers count toward the weekly race. Prizes distributed within 24 hours of race end.',
    ctaText: 'View Leaderboard',
    gradient: 'from-orange-900/40 to-red-900/40',
  },
  {
    id: 'promo_004',
    title: 'Oasis Reload',
    subtitle: 'Every purchase, every week',
    description: 'Get a 10% bonus on every Gold Coin purchase made on Fridays. Load up for the weekend.',
    type: 'reload',
    badge: 'FRIDAY ONLY',
    badgeColor: 'text-gold-light',
    gcBonus: 0,
    expiresAt: 'Every Friday',
    terms: '10% reload bonus applies to all Friday purchases. Bonus credited within 1 hour. Gold Coins only.',
    ctaText: 'Buy Coins',
    gradient: 'from-amber-800/40 to-yellow-900/40',
  },
  {
    id: 'promo_005',
    title: 'Desert Prince Perks',
    subtitle: 'Exclusive VIP benefits',
    description: 'As a Desert Prince, enjoy weekly GC rewards, priority support, exclusive promotions, and personalized VIP offers.',
    type: 'vip',
    badge: 'VIP EXCLUSIVE',
    badgeColor: 'text-emerald-400',
    gcBonus: 25000,
    expiresAt: 'Weekly',
    terms: 'VIP rewards are exclusive to Desert Prince tier and above. Rewards credited every Monday.',
    ctaText: 'View VIP Club',
    gradient: 'from-emerald-900/40 to-teal-900/40',
  },
  {
    id: 'promo_006',
    title: 'Refer a Friend',
    subtitle: 'Share the oasis, earn rewards',
    description: 'Invite friends using your unique referral code. You earn 5,000 GC when they make their first purchase.',
    type: 'referral',
    badge: 'REFERRAL',
    badgeColor: 'text-light-sand',
    gcBonus: 5000,
    expiresAt: 'Ongoing',
    terms: 'Referral bonus paid after referee makes first purchase of any amount. Maximum 50 referrals per account.',
    ctaText: 'Get Referral Code',
    gradient: 'from-purple-900/40 to-indigo-900/40',
  },
  {
    id: 'promo_007',
    title: 'Sandstorm Originals Bonus',
    subtitle: 'Play Yala Originals, earn extra',
    description: 'Earn 2× XP on all Yala Originals games this week. Accelerate your VIP progress.',
    type: 'seasonal',
    badge: 'LIMITED TIME',
    badgeColor: 'text-red-400',
    expiresAt: '2026-05-28T00:00:00Z',
    terms: 'Double XP applies to Yala Originals games only. Runs May 21–28. Standard wagering applies.',
    ctaText: 'Play Originals',
    gradient: 'from-yellow-800/40 to-orange-900/40',
  },
  {
    id: 'promo_008',
    title: 'Daily Spin & Win',
    subtitle: 'Free daily wheel spin — no purchase needed',
    description: 'Spin the Emerald Wheel once per day for free. Win up to 10,000 GC or a bonus SC reward. No purchase necessary.',
    type: 'daily',
    badge: 'FREE PLAY',
    badgeColor: 'text-emerald-400',
    gcBonus: 10000,
    scBonus: 1,
    expiresAt: 'Every day',
    terms: 'One free spin per account per day. No purchase necessary. Void where prohibited. 18+ only.',
    ctaText: 'Spin Now',
    gradient: 'from-teal-900/40 to-emerald-900/40',
  },
];
