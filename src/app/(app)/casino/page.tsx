'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { GameCard } from '@/components/casino/GameCard';
import { ALL_GAMES, YALA_ORIGINALS, type GameCategory } from '@/lib/mock-data/games';
import {
  Search, Zap, TrendingUp, Sparkles, Clock, Users, ChevronRight,
  ChevronLeft, Play, Activity, Plus,
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

// ─── Hero ─────────────────────────────────────────────────────────────────────
// Hard branch on auth.
//   Signed-out: brand statement (YALA / LET'S PLAY) + side daily-race card,
//               editorial stats row (numbers + labels, NO pill chips).
//   Signed-in:  3-card promo strip — Streak · Daily Race · Weekend Reload.
//               No balance card here (header already shows it); no big
//               'welcome back' headline, returning users don't need a pitch.
// No live-wins ticker. No grid overlay. Just soft radial gradients.

// ─── Signed-OUT hero ─────────────────────────────────────────────────────────
function SignedOutHero({ openAuthModal }: { openAuthModal: (tab?: 'login' | 'register') => void }) {
  return (
    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 px-6 py-10 lg:px-12 lg:py-14">
      {/* LEFT */}
      <div className="flex flex-col justify-center gap-6">
        <h1
          className="font-display font-black leading-[0.88]"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.03em' }}
        >
          <span className="gold-shimmer">YALA</span><br />
          <span style={{ color: '#F5E8C8' }}>LET&apos;S PLAY</span>
        </h1>

        <p className="text-base max-w-md" style={{ color: '#8FA899', lineHeight: 1.55 }}>
          200+ casino games. Real cash prizes. Free to start, no deposit needed.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => openAuthModal('register')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-black transition-all hover:brightness-110 active:scale-95 whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #10B981, #2DC97A)',
              color: '#060E0A',
              boxShadow: '0 4px 28px rgba(45,201,122,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <Zap className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
            Play Free — Get 250K GC
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
          >
            Sign In
          </button>
        </div>

        {/* Editorial stats row (no pills). Numbers do the work. */}
        <div className="flex items-end gap-8 mt-2">
          <HeroStat value="200+" label="Games" />
          <span className="self-stretch w-px" style={{ background: '#1A2E22' }} />
          <HeroStat value="2,847" label="Playing now" live />
          <span className="self-stretch w-px" style={{ background: '#1A2E22' }} />
          <HeroStat value="$4.2M" label="Prize pool YTD" />
        </div>

        <p className="text-[10px] mt-1" style={{ color: '#4A6A55' }}>
          18+ · No purchase necessary · Sweep Coins redeemable for cash where permitted by law
        </p>
      </div>

      {/* RIGHT */}
      <div className="lg:w-[280px] flex flex-col">
        <HeroDailyRaceCard />
      </div>
    </div>
  );
}

function HeroStat({ value, label, live }: { value: string; label: string; live?: boolean }) {
  return (
    <div>
      <p
        className="font-display font-black number-display leading-none"
        style={{ color: '#F5E8C8', fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
      <div className="flex items-center gap-1.5 mt-1.5">
        {live && <span className="live-dot" style={{ width: 6, height: 6 }} />}
        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#8FA899' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Signed-IN hero — welcome + marketing tagline + 3-card promo strip ────
// Tagline rotates each page load (random pick from RETURN_TAGLINES).
// Promo cards can be swapped seasonally by editing the strip below.
// Tagline rotation pool. Each entry MUST be a 2-line headline where neither
// line breaks mid-word. Adding seasonal lines: just append here.
const RETURN_TAGLINES = [
  { line1: 'YALA',            line2: "LET'S PLAY"   },
  { line1: 'Ready when',      line2: 'you are.'     },
  { line1: 'Back for',        line2: 'more.'        },
  { line1: 'Your seat is',    line2: 'still warm.'  },
  { line1: 'Tonight is',      line2: 'your night.'  },
  { line1: "Pick a game.",    line2: "Let's go."    },
  { line1: "Luck doesn't",    line2: 'sleep.'       },
  { line1: 'Spin. Win.',      line2: 'Repeat.'      },
  { line1: 'One spin from',   line2: 'lucky.'       },
  { line1: 'Press your',      line2: 'luck.'        },
];

function SignedInHero({ userName, openBuyCoins }: { userName?: string; openBuyCoins: () => void }) {
  const [tagline, setTagline] = useState(RETURN_TAGLINES[0]);
  // Pick a new tagline on each mount (i.e. every fresh page load). Avoids
  // SSR hydration mismatch by setting AFTER mount.
  useEffect(() => {
    setTagline(RETURN_TAGLINES[Math.floor(Math.random() * RETURN_TAGLINES.length)]);
  }, []);

  return (
    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-8 px-6 py-8 lg:px-10 lg:py-9 lg:items-center">
      {/* LEFT COLUMN — welcome / tagline / CTAs */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold" style={{ color: '#8FA899' }}>
          Welcome back, <span className="font-bold" style={{ color: '#F5E8C8' }}>{userName || 'Player'}</span>
        </p>
        <h1
          className="font-display font-black leading-[0.9]"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}
        >
          <span className="gold-shimmer">{tagline.line1}</span><br />
          <span style={{ color: '#F5E8C8' }}>{tagline.line2}</span>
        </h1>
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <Link
            href="#browse"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #10B981, #2DC97A)',
              color: '#060E0A',
              boxShadow: '0 4px 22px rgba(45,201,122,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <Play className="w-4 h-4 flex-shrink-0" fill="#060E0A" />
            Browse games
          </Link>
          <button
            onClick={openBuyCoins}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Get coins
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: 3 mini promo cards stacked */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:w-[280px]">
        <PromoStripCard variant="streak" />
        <PromoStripCard variant="race" />
        <PromoStripCard variant="reload" />
      </div>
    </div>
  );
}

// Compact promo card — fits in the right column of the signed-in hero.
function PromoStripCard({ variant }: { variant: 'streak' | 'race' | 'reload' }) {
  if (variant === 'streak') {
    return (
      <Link
        href="/daily-bonus"
        className="group relative rounded-xl p-3.5 overflow-hidden transition-all hover:-translate-y-0.5 flex flex-col"
        style={{
          background: 'linear-gradient(135deg, rgba(240,178,50,0.10), rgba(240,178,50,0.02))',
          border: '1px solid rgba(240,178,50,0.28)',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#F0B232' }}>Daily Streak</span>
          <span className="text-base" aria-hidden>🔥</span>
        </div>
        <p className="font-display text-lg font-black leading-none" style={{ color: '#F5E8C8' }}>Day 4 of 7</p>
        <div className="flex gap-0.5 mt-2 mb-2">
          {[1,2,3,4,5,6,7].map((d) => (
            <div key={d} className="flex-1 h-1 rounded-full" style={{ background: d <= 4 ? '#F0B232' : '#1A2E22' }} />
          ))}
        </div>
        <p className="text-[10px] font-semibold" style={{ color: '#F0B232' }}>
          Claim 2,500 GC →
        </p>
      </Link>
    );
  }
  if (variant === 'race') {
    return (
      <Link
        href="/leaderboards"
        className="group relative rounded-xl p-3.5 overflow-hidden transition-all hover:-translate-y-0.5 flex flex-col"
        style={{
          background: 'linear-gradient(135deg, rgba(45,201,122,0.12), rgba(45,201,122,0.02))',
          border: '1px solid rgba(45,201,122,0.32)',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#2DC97A' }}>Daily Race</span>
          </div>
        </div>
        <p className="font-display text-lg font-black number-display leading-none" style={{ color: '#F5E8C8' }}>
          500K <span className="text-[10px] font-normal" style={{ color: '#8FA899' }}>GC pool</span>
        </p>
        <p className="text-[10px] mt-1" style={{ color: '#8FA899' }}>
          You: <span className="font-bold" style={{ color: '#F5E8C8' }}>#47</span> · ends <span className="font-mono" style={{ color: '#F5E8C8' }}>14h 32m</span>
        </p>
        <p className="text-[10px] font-semibold mt-2" style={{ color: '#2DC97A' }}>
          Race now →
        </p>
      </Link>
    );
  }
  // reload
  return (
    <Link
      href="/wallet"
      className="group relative rounded-xl p-3.5 overflow-hidden transition-all hover:-translate-y-0.5 flex flex-col"
      style={{
        background: 'linear-gradient(135deg, rgba(96,165,250,0.10), rgba(96,165,250,0.02))',
        border: '1px solid rgba(96,165,250,0.28)',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#60A5FA' }}>Weekend Reload</span>
        <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded" style={{ background: 'rgba(96,165,250,0.18)', color: '#60A5FA' }}>FRI–SUN</span>
      </div>
      <p className="font-display text-lg font-black leading-none" style={{ color: '#F5E8C8' }}>+20% bonus</p>
      <p className="text-[10px] mt-1" style={{ color: '#8FA899' }}>
        on every coin purchase this weekend
      </p>
      <p className="text-[10px] font-semibold mt-2" style={{ color: '#60A5FA' }}>
        Top up wallet →
      </p>
    </Link>
  );
}

function HeroDailyRaceCard() {
  // Tiny countdown — independent of the leaderboards page's timer.
  // No need for state subscription; this just shows a static-ish demo.
  return (
    <div
      className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(45,201,122,0.08), rgba(240,178,50,0.05))',
        border: '1px solid rgba(45,201,122,0.28)',
        minWidth: 240,
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(45,201,122,0.25), transparent 60%)', filter: 'blur(20px)' }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="live-dot" />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2DC97A' }}>Daily Race · Live</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest" style={{ color: '#8FA899' }}>Prize pool</p>
        <p className="font-display text-2xl font-black number-display" style={{ color: '#F0B232' }}>
          500,000 <span className="text-sm">GC</span>
        </p>
      </div>
      <div className="relative">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: '#8FA899' }}>Ends in</p>
        <p className="font-mono text-base font-bold" style={{ color: '#F5E8C8' }}>14h 32m 09s</p>
      </div>
      <div className="relative flex items-center justify-between pt-3 mt-1" style={{ borderTop: '1px solid rgba(45,201,122,0.15)' }}>
        <div>
          <p className="text-[10px]" style={{ color: '#8FA899' }}>Your rank</p>
          <p className="text-sm font-bold number-display" style={{ color: '#F5E8C8' }}>#47</p>
        </div>
        <Link
          href="/leaderboards"
          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)', color: '#060E0A' }}
        >
          Race
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

interface CasinoHeroProps {
  isLoggedIn: boolean;
  userName?: string;
  openBuyCoins: () => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
}

function CasinoHero({
  isLoggedIn, userName, openBuyCoins, openAuthModal,
}: CasinoHeroProps) {
  return (
    <section
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 12% 80%, rgba(45,201,122,0.18) 0%, transparent 55%), radial-gradient(ellipse at 92% 8%, rgba(240,178,50,0.14) 0%, transparent 55%), linear-gradient(180deg, #0A1410 0%, #060E0A 100%)',
        border: '1px solid #1A2E22',
      }}
    >
      {isLoggedIn
        ? <SignedInHero userName={userName} openBuyCoins={openBuyCoins} />
        : <SignedOutHero openAuthModal={openAuthModal} />
      }

      {/* Bottom gradient rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(45,201,122,0.3), rgba(240,178,50,0.3), transparent)' }} />
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CasinoPage() {
  const { activeCurrency, goldCoins, sweepCoins } = useWalletStore();
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal, openBuyCoins } = useUIStore();
  const [activeCategory, setActiveCategory] = useState<GameCategory | 'all'>('all');
  const [activeProvider, setActiveProvider] = useState<string>('all');
  const [search, setSearch] = useState('');

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
      <CasinoHero
        isLoggedIn={isLoggedIn}
        userName={user?.displayName || user?.username}
        openBuyCoins={openBuyCoins}
        openAuthModal={openAuthModal}
      />

      {/* ── 2. BROWSE GAMES ───────────────────────────────────── */}
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
