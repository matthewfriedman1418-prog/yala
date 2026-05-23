'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { GameCard } from '@/components/casino/GameCard';
import { ALL_GAMES, YALA_ORIGINALS, type GameCategory } from '@/lib/mock-data/games';
import {
  Search, Zap, TrendingUp, Sparkles, Clock, Users, ChevronRight,
  ChevronLeft, Gift, Trophy, Play, Star, Activity,
} from 'lucide-react';
import { cn, formatGC, formatSC } from '@/lib/utils';
import { GoldCoinIcon, SweepCoinIcon, YalaIcon } from '@/components/ui/YalaIcon';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Category chips ───────────────────────────────────────────────────────────
const CATEGORIES: { id: GameCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all',       label: 'All',      icon: '🎮' },
  { id: 'slots',     label: 'Slots',    icon: '🎰' },
  { id: 'live',      label: 'Live',     icon: '📡' },
  { id: 'table',     label: 'Table',    icon: '🃏' },
  { id: 'megaways',  label: 'Megaways', icon: '⚡' },
  { id: 'gameshows', label: 'Shows',    icon: '🎪' },
  { id: 'scratch',   label: 'Scratch',  icon: '🎟' },
  { id: 'fish',      label: 'Fish',     icon: '🐠' },
  { id: 'casual',    label: 'Casual',   icon: '🎲' },
];

// ─── Featured game ────────────────────────────────────────────────────────────
const FEATURED_GAME = ALL_GAMES.find(g => g.slug === 'sultan-riches')!;

// ─── Promo cards ─────────────────────────────────────────────────────────────
const PROMO_CARDS = [
  {
    id: 'daily',
    title: 'Daily Bonus',
    subtitle: 'Login & claim up to',
    highlight: '250K GC',
    badge: 'EVERY DAY',
    href: '/daily-bonus',
    gradientFrom: '#D6A84F',
    gradientTo: '#7C4F0E',
    glowColor: 'rgba(240,178,50,0.25)',
    icon: Gift,
    accent: '#F0B232',
  },
  {
    id: 'vip',
    title: 'VIP Club',
    subtitle: 'Unlock exclusive perks at',
    highlight: 'Diamond Tier',
    badge: 'INVITE ONLY',
    href: '/vip',
    gradientFrom: '#7C3AED',
    gradientTo: '#1E1040',
    glowColor: 'rgba(124,58,237,0.25)',
    icon: Trophy,
    accent: '#A78BFA',
  },
  {
    id: 'missions',
    title: 'Active Missions',
    subtitle: '3 missions ready · earn',
    highlight: '15K GC',
    badge: '3 ACTIVE',
    href: '/missions',
    gradientFrom: '#059669',
    gradientTo: '#064E3B',
    glowColor: 'rgba(45,201,122,0.25)',
    icon: Star,
    accent: '#2DC97A',
  },
];

// ─── Live bet feed data ───────────────────────────────────────────────────────
type BetEntry = {
  id: number;
  game: string;
  icon: string;
  user: string;
  bet: number;
  currency: 'GC' | 'SC';
  multiplier: number;
  profit: number;
};

const BET_POOL: Omit<BetEntry, 'id'>[] = [
  { game: 'Book of Dead',        icon: '📖', user: 'GoldR***King',  bet: 5000,  currency: 'GC', multiplier: 120.5, profit:  597500 },
  { game: 'Yala Crash',          icon: '🌄', user: 'Spin***Ace',    bet: 2500,  currency: 'GC', multiplier: 0,     profit: -2500  },
  { game: 'Gates of Olympus',    icon: '⚡', user: 'Nigh***Fox88',  bet: 1000,  currency: 'GC', multiplier: 85.2,  profit:  84200 },
  { game: 'Lightning Roulette',  icon: '⚡', user: 'Emer***Wave',   bet: 10,    currency: 'SC', multiplier: 72.0,  profit:  710   },
  { game: 'Dune Mines',          icon: '💣', user: 'Thun***derX',   bet: 3000,  currency: 'GC', multiplier: 0,     profit: -3000  },
  { game: 'Emerald Wheel',       icon: '🎡', user: 'Neon***Luck',   bet: 500,   currency: 'GC', multiplier: 24.0,  profit:  11500 },
  { game: 'Sweet Bonanza',       icon: '🍬', user: 'Coin***King',   bet: 2000,  currency: 'GC', multiplier: 0,     profit: -2000  },
  { game: 'Yala Plinko',         icon: '💧', user: 'Nigh***Hunt',   bet: 750,   currency: 'GC', multiplier: 68.0,  profit:  50250 },
  { game: 'Blackjack',           icon: '♠️', user: 'Neon***Run',    bet: 5000,  currency: 'GC', multiplier: 2.0,   profit:  5000  },
  { game: 'Desert Roulette',     icon: '🎡', user: 'Spin***Ace',    bet: 1500,  currency: 'GC', multiplier: 0,     profit: -1500  },
  { game: 'Golden Dice',         icon: '🎲', user: 'GoldR***King',  bet: 10000, currency: 'GC', multiplier: 4.5,   profit:  35000 },
  { game: 'Crazy Time',          icon: '🎪', user: 'Luck***Star',   bet: 20,    currency: 'SC', multiplier: 50.0,  profit:  980   },
  { game: 'Pharaoh Towers',      icon: '🏛', user: 'Thun***derX',   bet: 1000,  currency: 'GC', multiplier: 0,     profit: -1000  },
  { game: 'Oasis Hi-Lo',         icon: '🃏', user: 'Emer***Wave',   bet: 2500,  currency: 'GC', multiplier: 3.0,   profit:  5000  },
  { game: 'Scorpion Cases',      icon: '📦', user: 'Coin***King',   bet: 500,   currency: 'GC', multiplier: 15.0,  profit:  7000  },
  { game: 'Sandstorm Limbo',     icon: '🌪', user: 'Nigh***Fox88',  bet: 3000,  currency: 'GC', multiplier: 0,     profit: -3000  },
  { game: 'Caravan Keno',        icon: '🎯', user: 'Neon***Luck',   bet: 250,   currency: 'GC', multiplier: 200.0, profit:  49750 },
  { game: 'Sultan Riches',       icon: '👑', user: 'Nigh***Hunt',   bet: 2000,  currency: 'GC', multiplier: 0,     profit: -2000  },
  { game: 'Lightning Roulette',  icon: '⚡', user: 'Luck***Star',   bet: 5,     currency: 'SC', multiplier: 500.0, profit:  2495  },
  { game: 'Book of Dead',        icon: '📖', user: 'GoldR***King',  bet: 8000,  currency: 'GC', multiplier: 0,     profit: -8000  },
  { game: 'Gold Salon Baccarat', icon: '💛', user: 'VIP***Ace',     bet: 25000, currency: 'GC', multiplier: 1.95,  profit:  23750 },
  { game: 'Yala Crash',          icon: '🌄', user: 'Moon***Bet',    bet: 1200,  currency: 'GC', multiplier: 5.5,   profit:  5400  },
  { game: 'Gates of Olympus',    icon: '⚡', user: 'Zeus***777',    bet: 750,   currency: 'GC', multiplier: 0,     profit: -750   },
  { game: 'Royal Baccarat',      icon: '♦️', user: 'High***Roll',   bet: 50,    currency: 'SC', multiplier: 1.95,  profit:  47    },
  { game: 'Yala Plinko',         icon: '💧', user: 'Drop***King',   bet: 400,   currency: 'GC', multiplier: 88.0,  profit:  34800 },
];

// ─── Horizontal scroll row ────────────────────────────────────────────────────
function GameScrollRow({ games }: { games: typeof ALL_GAMES }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };
  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(12,24,18,0.95)', border: '1px solid #1A2E22', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
      >
        <ChevronLeft className="w-4 h-4" style={{ color: '#F5E8C8' }} />
      </button>
      <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar pb-1" style={{ scrollSnapType: 'x mandatory' }}>
        {games.map((g, i) => (
          <motion.div
            key={g.id}
            className="flex-shrink-0 w-36"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            style={{ scrollSnapAlign: 'start' }}
          >
            <GameCard game={g} size="md" />
          </motion.div>
        ))}
        {games.length === 0 && (
          <div className="w-full">
            <EmptyState
              icon="dice"
              title="No games match your filters"
              body="Try clearing search or picking a different category or provider."
              size="sm"
            />
          </div>
        )}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(12,24,18,0.95)', border: '1px solid #1A2E22', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
      >
        <ChevronRight className="w-4 h-4" style={{ color: '#F5E8C8' }} />
      </button>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon, title, badge, badgeColor = '#F0B232', accentColor = '#2DC97A', href,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  badge?: string;
  badgeColor?: string;
  accentColor?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-0.5 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }} />
        <Icon className="w-4 h-4" style={{ color: accentColor }} />
        <h2 className="font-bold text-[#F5E8C8] text-sm">{title}</h2>
        {badge && (
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: `${badgeColor}18`, color: badgeColor }}>
            {badge}
          </span>
        )}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: accentColor }}>
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

// ─── Originals card ───────────────────────────────────────────────────────────
const ORIGINALS_PALETTE: Record<string, { from: string; to: string; label: string }> = {
  'mirage-crash':            { from: '#7C2D12', to: '#1C0A00', label: '🌄' },
  'oasis-plinko':            { from: '#064E3B', to: '#011A14', label: '💧' },
  'dune-mines':              { from: '#78350F', to: '#1C0A00', label: '💣' },
  'golden-dice':             { from: '#92400E', to: '#2A0F00', label: '🎲' },
  'sandstorm-limbo':         { from: '#1B6B45', to: '#0C1812', label: '🌪' },
  'emerald-wheel':           { from: '#064E3B', to: '#011A14', label: '🎡' },
  'caravan-keno':            { from: '#78350F', to: '#1C0A00', label: '🎯' },
  'night-bazaar-blackjack':  { from: '#1E293B', to: '#0F172A', label: '♠️' },
  'pharaoh-towers':          { from: '#78350F', to: '#1C0A00', label: '🏛' },
  'oasis-hi-lo':             { from: '#0F4C35', to: '#011A14', label: '🃏' },
  'desert-roulette':         { from: '#7F1D1D', to: '#1A0505', label: '🎡' },
  'scorpion-cases':          { from: '#1C1917', to: '#0A0805', label: '📦' },
};

function OriginalCard({ orig }: { orig: typeof YALA_ORIGINALS[0] }) {
  const pal = ORIGINALS_PALETTE[orig.slug] || { from: '#1C2E22', to: '#0C1812', label: '⚡' };
  return (
    <Link href={`/originals/${orig.slug}`}>
      <div
        className="group relative w-32 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
        style={{ aspectRatio: '2/3', background: `linear-gradient(160deg, ${pal.from}, ${pal.to})` }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 15px,rgba(255,255,255,1) 15px,rgba(255,255,255,1) 16px),repeating-linear-gradient(90deg,transparent,transparent 15px,rgba(255,255,255,1) 15px,rgba(255,255,255,1) 16px)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl drop-shadow-lg">{pal.label}</span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest" style={{ background: 'rgba(240,178,50,0.2)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.3)' }}>
            YALA
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(240,178,50,0.85)' }}>
            <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[11px] font-bold text-white leading-tight truncate">{orig.name}</p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[9px] font-medium" style={{ color: '#F0B232' }}>{orig.type}</p>
            <p className="text-[9px]" style={{ color: '#8FA899' }}>RTP {orig.rtp}%</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Live Bets Feed ───────────────────────────────────────────────────────────
// Fixed row height + no layout animation = zero jitter
const VISIBLE_ROWS = 8;
const ROW_H = 46;

function LiveBetsFeed() {
  const counterRef = useRef(VISIBLE_ROWS);
  const [feed, setFeed] = useState<BetEntry[]>(
    BET_POOL.slice(0, VISIBLE_ROWS).map((b, i) => ({ ...b, id: i }))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const next = BET_POOL[counterRef.current % BET_POOL.length];
      counterRef.current += 1;
      setFeed(prev => [
        { ...next, id: counterRef.current },
        ...prev.slice(0, VISIBLE_ROWS - 1),
      ]);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Scoped 3-D tumble keyframe — perspective() inline keeps overflow:hidden compatible */}
      <style>{`
        @keyframes _bet-tumble {
          0%   { opacity: 0;   transform: perspective(500px) rotateX(-80deg) scaleY(0.8); }
          55%  { opacity: 1; }
          100% { opacity: 1;   transform: perspective(500px) rotateX(0deg)   scaleY(1);   }
        }
        ._bet-tumble {
          animation: _bet-tumble 0.42s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
          transform-origin: top center;
        }
      `}</style>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #1A2E22' }}>
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4" style={{ color: '#2DC97A' }} />
            <h2 className="font-bold text-sm" style={{ color: '#F5E8C8' }}>Live Bets</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Live</span>
            </div>
          </div>
          <span className="text-[11px]" style={{ color: '#4A6A55' }}>Updated in real time</span>
        </div>

        {/* Column labels */}
        <div
          className="grid px-5 py-2 text-[10px] font-bold uppercase tracking-widest"
          style={{ gridTemplateColumns: '2.2fr 1.4fr 1fr 0.8fr 1fr', color: '#4A6A55', borderBottom: '1px solid rgba(26,46,34,0.5)' }}
        >
          <span>Game</span>
          <span>Player</span>
          <span>Bet</span>
          <span>Multi</span>
          <span className="text-right">Profit</span>
        </div>

        {/* Fixed-height container — layout never shifts, 3-D tumble on newest row */}
        <div style={{ height: VISIBLE_ROWS * ROW_H, overflow: 'hidden' }}>
          {feed.map((bet, i) => {
            const win = bet.profit > 0;
            return (
              <div
                key={bet.id}
                className={cn('grid px-5 items-center', i === 0 ? '_bet-tumble' : '')}
                style={{
                  gridTemplateColumns: '2.2fr 1.4fr 1fr 0.8fr 1fr',
                  height: ROW_H,
                  borderBottom: '1px solid rgba(26,46,34,0.35)',
                }}
              >
                {/* Game */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {bet.icon}
                  </div>
                  <span className="text-xs font-medium truncate" style={{ color: '#F5E8C8' }}>{bet.game}</span>
                </div>
                {/* Player */}
                <span className="text-xs font-mono" style={{ color: '#8FA899' }}>{bet.user}</span>
                {/* Bet */}
                <span className="text-xs number-display" style={{ color: '#8FA899' }}>
                  {bet.currency === 'GC' ? `${bet.bet.toLocaleString()} GC` : `${bet.bet} SC`}
                </span>
                {/* Multi */}
                <span className="text-xs font-semibold number-display" style={{ color: win ? '#F0B232' : '#4A6A55' }}>
                  {win ? `${bet.multiplier}x` : '—'}
                </span>
                {/* Profit */}
                <span className="text-xs font-bold text-right number-display" style={{ color: win ? '#2DC97A' : '#EF4444' }}>
                  {win ? '+' : ''}{bet.currency === 'GC' ? bet.profit.toLocaleString() : bet.profit} {bet.currency}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CasinoPage() {
  const { activeCurrency, goldCoins, sweepCoins } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, openBuyCoins } = useUIStore();
  const [activeCategory, setActiveCategory] = useState<GameCategory | 'all'>('all');
  const [activeProvider, setActiveProvider] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [featuredImgError, setFeaturedImgError] = useState(false);

  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#F0B232' : '#10B981';
  const accentLight = isGC ? '#FFD166' : '#34D399';

  // Unique provider list derived from games
  const allProviders = Array.from(new Set(ALL_GAMES.map(g => g.provider))).sort();

  const filteredGames = ALL_GAMES.filter((g) => {
    const matchCat  = activeCategory === 'all' || g.category === activeCategory;
    const matchProv = activeProvider === 'all' || g.provider === activeProvider;
    const matchSrch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.provider.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchProv && matchSrch;
  });

  const hotGames  = ALL_GAMES.filter(g => g.isHot).slice(0, 12);
  const newGames  = ALL_GAMES.filter(g => g.isNew).slice(0, 12);
  const liveGames = ALL_GAMES.filter(g => g.category === 'live' || g.category === 'gameshows').slice(0, 12);
  const slotGames = ALL_GAMES.filter(g => g.category === 'slots' || g.category === 'megaways').slice(0, 14);

  return (
    <div className="space-y-10">

      {/* ── 1. HERO ───────────────────────────────────────────── */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 20% 80%, rgba(45,201,122,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(240,178,50,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(26,92,138,0.12) 0%, transparent 70%), #080F0A',
          border: '1px solid #1A2E22',
          minHeight: '300px',
        }}
      >
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,#2DC97A 39px,#2DC97A 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#2DC97A 39px,#2DC97A 40px)' }} />

        <div className="relative z-10 flex items-stretch gap-0 min-h-[300px]">
          {/* Left copy */}
          <div className="flex-1 px-8 py-8 flex flex-col justify-center gap-6">
            <div>
              <h1 className="font-display font-black leading-none mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#F5E8C8', letterSpacing: '-0.02em' }}>
                <span className="gold-shimmer">YALA</span><br />
                <span style={{ color: '#2DC97A' }}>LET&apos;S</span>{' '}
                <span style={{ color: '#F5E8C8' }}>PLAY</span>
              </h1>
              <p className="text-sm mt-3 max-w-xs" style={{ color: '#8FA899', lineHeight: 1.6 }}>
                Premium sweepstakes casino. Dual-currency play, provably fair originals, and real prizes. No deposit required.
              </p>
            </div>
            <div className="pt-2">
              {isLoggedIn ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl" style={{ background: `${accent}10`, border: `1px solid ${accent}22` }}>
                    {isGC ? <GoldCoinIcon size={22} /> : <SweepCoinIcon size={22} />}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: '#8FA899' }}>Balance</p>
                      <p className="font-black number-display text-lg leading-none" style={{ color: '#F5E8C8' }}>
                        {isGC ? formatGC(goldCoins) : formatSC(sweepCoins)}&nbsp;{activeCurrency}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={openBuyCoins}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accentLight})`, color: '#060E0A', boxShadow: `0 4px 24px ${accent}40` }}
                  >
                    <YalaIcon name="diamond" size={16} />
                    Get Coins
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openAuthModal('register')}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A', boxShadow: '0 4px 28px rgba(45,201,122,0.35)' }}
                  >
                    <Zap className="w-4 h-4 flex-shrink-0" />
                    Play Free: No Deposit
                  </button>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#8FA899' }}
                  >
                    Sign In
                  </button>
                </div>
              )}
              <p className="text-[10px] mt-3" style={{ color: '#4A6A55' }}>
                18+ · Free to play · No real money gambling · Void where prohibited
              </p>
            </div>
          </div>

          {/* Right: featured game */}
          <div className="flex-shrink-0 w-56 relative flex flex-col items-center justify-center p-6 gap-4">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-56 rounded-2xl" style={{ background: 'radial-gradient(ellipse, rgba(240,178,50,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }} />
            </div>
            <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}>
              <Star className="w-3 h-3" style={{ color: '#F0B232' }} fill="#F0B232" />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#F0B232' }}>Featured</span>
            </div>
            <div
              className="relative z-10 w-36 rounded-2xl overflow-hidden cursor-pointer group"
              style={{
                aspectRatio: '2/3',
                background: FEATURED_GAME?.imageUrl ? '#0C1812' : 'linear-gradient(160deg, #065f46, #022c22)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(240,178,50,0.15)',
              }}
            >
              {FEATURED_GAME?.imageUrl && !featuredImgError && (
                <Image src={FEATURED_GAME.imageUrl} alt={FEATURED_GAME.name} fill sizes="144px" className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized onError={() => setFeaturedImgError(true)} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute top-2 left-2 right-2">
                <div className="px-2 py-1 rounded-lg text-center" style={{ background: 'rgba(240,178,50,0.85)', backdropFilter: 'blur(4px)' }}>
                  <p className="text-[8px] font-black uppercase tracking-widest text-black">Max Win</p>
                  <p className="text-[11px] font-black text-black leading-none">{FEATURED_GAME?.maxWin}</p>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(240,178,50,0.9)', boxShadow: '0 0 24px rgba(240,178,50,0.6)' }}>
                  <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-[11px] font-bold text-white truncate">{FEATURED_GAME?.name}</p>
                <p className="text-[9px]" style={{ color: '#F0B232' }}>{FEATURED_GAME?.provider}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(45,201,122,0.3), rgba(240,178,50,0.3), transparent)' }} />
      </section>

      {/* ── 2. PROMO CARDS ────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-4">
        {PROMO_CARDS.map((promo, i) => {
          const Icon = promo.icon;
          return (
            <motion.div key={promo.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link href={promo.href}>
                <div
                  className="relative rounded-xl overflow-hidden cursor-pointer group transition-transform hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg, ${promo.gradientFrom}22, ${promo.gradientTo}88)`, border: `1px solid ${promo.accent}22`, padding: '16px 20px', boxShadow: `0 4px 24px ${promo.glowColor}` }}
                >
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-30" style={{ background: promo.accent, filter: 'blur(24px)' }} />
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: promo.accent }}>{promo.badge}</p>
                      <p className="font-bold text-sm text-[#F5E8C8]">{promo.title}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: '#8FA899' }}>{promo.subtitle}</p>
                      <p className="font-black text-base mt-1" style={{ color: promo.accent }}>{promo.highlight}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3" style={{ background: `${promo.accent}18`, border: `1px solid ${promo.accent}30` }}>
                      <Icon className="w-5 h-5" style={{ color: promo.accent }} />
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center gap-1 mt-3">
                    <span className="text-[10px] font-semibold" style={{ color: promo.accent }}>Claim now</span>
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" style={{ color: promo.accent }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* ── 3. BROWSE GAMES ───────────────────────────────────── */}
      <section>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4A6A55' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games or providers…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{ background: '#0F1A14', border: '1px solid #1A2E22', color: '#F5E8C8' }}
            onFocus={e  => (e.currentTarget.style.borderColor = `${accent}55`)}
            onBlur={e => (e.currentTarget.style.borderColor = '#1A2E22')}
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn('category-chip flex-shrink-0', activeCategory === cat.id ? 'active' : '')}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Provider chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
          <button
            onClick={() => setActiveProvider('all')}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={activeProvider === 'all' ? { background: 'rgba(240,178,50,0.15)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.3)' } : { background: '#0F1A14', color: '#8FA899', border: '1px solid #1A2E22' }}
          >
            All Providers
          </button>
          {allProviders.map((prov) => (
            <button
              key={prov}
              onClick={() => setActiveProvider(prov)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
              style={activeProvider === prov ? { background: 'rgba(240,178,50,0.15)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.3)' } : { background: '#0F1A14', color: '#8FA899', border: '1px solid #1A2E22' }}
            >
              {prov}
            </button>
          ))}
        </div>

        {/* Count + scroll row */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: '#4A6A55' }}>
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
          </p>
        </div>
        <GameScrollRow key={`${activeCategory}-${activeProvider}-${search}`} games={filteredGames} />
      </section>

      {/* ── 4. YALA ORIGINALS ─────────────────────────────────── */}
      <section>
        <SectionHeader icon={Zap} title="Yala Originals" badge="EXCLUSIVE" accentColor="#F0B232" badgeColor="#F0B232" href="/originals" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {YALA_ORIGINALS.map((orig, i) => (
            <motion.div key={orig.slug} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <OriginalCard orig={orig} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5. HOT RIGHT NOW ──────────────────────────────────── */}
      <section>
        <SectionHeader icon={TrendingUp} title="Hot Right Now" badge="🔥 TRENDING" accentColor="#EF4444" badgeColor="#EF4444" />
        <GameScrollRow games={hotGames} />
      </section>

      {/* ── 6. LIVE CASINO ────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Users} title="Live Casino" badge="LIVE NOW" accentColor="#2DC97A" badgeColor="#2DC97A" href="/casino" />
        <GameScrollRow games={liveGames} />
      </section>

      {/* ── 7. TOP SLOTS ──────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Sparkles} title="Top Slots" badge="POPULAR" accentColor="#A78BFA" badgeColor="#A78BFA" />
        <GameScrollRow games={slotGames} />
      </section>

      {/* ── 8. NEW ARRIVALS ───────────────────────────────────── */}
      <section>
        <SectionHeader icon={Clock} title="New Arrivals" badge="✨ FRESH" accentColor="#60A5FA" badgeColor="#60A5FA" />
        <GameScrollRow games={newGames} />
      </section>

      {/* ── 9. LIVE BETS FEED ─────────────────────────────────── */}
      <section>
        <LiveBetsFeed />
      </section>

    </div>
  );
}
