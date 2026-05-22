'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { GameCard } from '@/components/casino/GameCard';
import { ALL_GAMES, YALA_ORIGINALS, ALL_PROVIDERS, type GameCategory } from '@/lib/mock-data/games';
import { Search, Zap, TrendingUp, Sparkles, Clock, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn, formatGC, formatSC } from '@/lib/utils';

const CATEGORIES: { id: GameCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All Games', emoji: '🎮' },
  { id: 'slots', label: 'Slots', emoji: '🎰' },
  { id: 'live', label: 'Live Casino', emoji: '🎥' },
  { id: 'table', label: 'Table Games', emoji: '🃏' },
  { id: 'megaways', label: 'Megaways', emoji: '⚡' },
  { id: 'gameshows', label: 'Game Shows', emoji: '🎪' },
  { id: 'scratch', label: 'Scratch', emoji: '🎟' },
  { id: 'fish', label: 'Fish Games', emoji: '🐠' },
  { id: 'casual', label: 'Casual', emoji: '🎲' },
];

const ORIGINALS_COLORS: Record<string, string> = {
  'mirage-crash': 'linear-gradient(135deg, #7C2D12, #431407)',
  'oasis-plinko': 'linear-gradient(135deg, #064E3B, #022C22)',
  'dune-mines': 'linear-gradient(135deg, #78350F, #1C1917)',
  'golden-dice': 'linear-gradient(135deg, #92400E, #451A03)',
  'sandstorm-limbo': 'linear-gradient(135deg, #1B6B45, #0C1812)',
  'emerald-wheel': 'linear-gradient(135deg, #064E3B, #022C22)',
};

const LIVE_PLAYERS = 2_847;

export default function CasinoPage() {
  const { activeCurrency, goldCoins, sweepCoins } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, openBuyCoins } = useUIStore();
  const [activeCategory, setActiveCategory] = useState<GameCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#F0B232' : '#10B981';
  const accentLight = isGC ? '#FFD166' : '#34D399';

  const filteredGames = ALL_GAMES.filter((g) => {
    const matchesCategory = activeCategory === 'all' || g.category === activeCategory;
    const matchesSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.provider.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hotGames = ALL_GAMES.filter((g) => g.isHot).slice(0, 6);
  const newGames = ALL_GAMES.filter((g) => g.isNew).slice(0, 6);

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* ── HERO ────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 15% 60%, rgba(45,201,122,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 25%, rgba(240,178,50,0.14) 0%, transparent 55%), #0C1812',
          border: '1px solid #1A2E22',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,#2DC97A 39px,#2DC97A 40px), repeating-linear-gradient(90deg,transparent,transparent 39px,#2DC97A 39px,#2DC97A 40px)' }}
        />

        {/* Floating pyramid watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-[0.06]">
          <svg width="280" height="238" viewBox="0 0 40 34" fill="none">
            <defs><clipPath id="pyr-casino-wm"><polygon points="20,0 40,34 0,34"/></clipPath></defs>
            <rect x="0" y="0" width="40" height="8.5" fill="#F0B232" clipPath="url(#pyr-casino-wm)"/>
            <rect x="0" y="8.5" width="40" height="8.5" fill="#84CC16" clipPath="url(#pyr-casino-wm)"/>
            <rect x="0" y="17" width="40" height="8.5" fill="#2DC97A" clipPath="url(#pyr-casino-wm)"/>
            <rect x="0" y="25.5" width="40" height="8.5" fill="#1A5C8A" clipPath="url(#pyr-casino-wm)"/>
          </svg>
        </div>

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
          {/* Live stat row */}
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.2)' }}>
              <span className="live-dot" />
              <span className="text-xs font-semibold" style={{ color: '#2DC97A' }}>
                {LIVE_PLAYERS.toLocaleString()} playing now
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}>
              <Sparkles className="w-3 h-3" style={{ color: '#F0B232' }} />
              <span className="text-xs font-semibold" style={{ color: '#F0B232' }}>
                {ALL_GAMES.length + YALA_ORIGINALS.length}+ Games
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}>
              <Users className="w-3 h-3" style={{ color: '#8FA899' }} />
              <span className="text-xs font-semibold" style={{ color: '#8FA899' }}>
                {ALL_PROVIDERS.length} Providers
              </span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-3" style={{ color: '#F5E8C8' }}>
            Welcome to the{' '}
            <span className="gold-shimmer">Oasis</span>
          </h1>
          <p className="text-sm sm:text-base mb-7 max-w-lg" style={{ color: '#8FA899' }}>
            Premium social casino · Dual-currency · Provably fair originals
          </p>

          {isLoggedIn ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}
              >
                <span className="text-sm font-bold" style={{ color: accent }}>{isGC ? '◈' : '◇'}</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: '#8FA899' }}>Balance</p>
                  <p className="font-bold number-display text-base leading-none" style={{ color: '#F5E8C8' }}>
                    {isGC ? formatGC(goldCoins) : formatSC(sweepCoins)} {activeCurrency}
                  </p>
                </div>
              </div>
              <button
                onClick={openBuyCoins}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accentLight})`, color: '#060E0A', boxShadow: `0 4px 20px ${accent}35` }}
              >
                <Sparkles className="w-4 h-4" />
                Get More Coins
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuthModal('register')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A', boxShadow: '0 4px 20px rgba(45,201,122,0.3)' }}
              >
                <Zap className="w-4 h-4 flex-shrink-0" />
                Play Free: No Deposit
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1A2E22', color: '#8FA899' }}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── YALA ORIGINALS ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #2DC97A, #F0B232)' }} />
            <Zap className="w-4 h-4" style={{ color: accent }} />
            <h2 className="font-bold text-[#F5E8C8]">Yala Originals</h2>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider text-red-400" style={{ background: 'rgba(239,68,68,0.15)' }}>
              EXCLUSIVE
            </span>
          </div>
          <Link href="/originals" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80" style={{ color: accent }}>
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {YALA_ORIGINALS.slice(0, 6).map((g, i) => (
            <motion.div
              key={g.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/originals/${g.slug}`} className="group block">
                <div
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer game-card-hover"
                  style={{ background: ORIGINALS_COLORS[g.slug] || 'linear-gradient(135deg, #1C2E22, #0C1812)' }}
                >
                  {/* Glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {/* Icon area */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <Zap className="w-5 h-5" style={{ color: accent }} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-[10px] font-bold text-white leading-tight truncate">{g.name}</p>
                    <p className="text-[9px] font-medium" style={{ color: accent }}>{g.type}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOT RIGHT NOW ────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full bg-red-400" />
            <TrendingUp className="w-4 h-4 text-red-400" />
            <h2 className="font-bold text-[#F5E8C8]">Hot Right Now</h2>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider text-red-400" style={{ background: 'rgba(239,68,68,0.12)' }}>
              🔥 TRENDING
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {hotGames.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GameCard game={g} size="sm" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SEARCH + CATEGORY TABS ───────────────────────────── */}
      <section>
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4A6A55' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games, providers…"
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-colors"
            style={{
              background: '#101C16',
              border: '1px solid #1A2E22',
              color: '#F5E8C8',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = `${accent}60`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#1A2E22'; }}
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn('category-chip', activeCategory === cat.id ? 'active' : '')}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Game grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filteredGames.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                <GameCard game={g} size="sm" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: '#4A6A55' }}>
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium" style={{ color: '#8FA899' }}>No games found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────────── */}
      {activeCategory === 'all' && !search && (
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-5 rounded-full bg-blue-400" />
            <Clock className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-[#F5E8C8]">New Arrivals</h2>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider text-blue-400" style={{ background: 'rgba(96,165,250,0.12)' }}>
              ✨ FRESH
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {newGames.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GameCard game={g} size="sm" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── PROVIDERS STRIP ──────────────────────────────────── */}
      {activeCategory === 'all' && !search && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm" style={{ color: '#8FA899' }}>Game Providers</h2>
            <Link href="/providers" className="text-xs transition-opacity hover:opacity-80" style={{ color: accent }}>
              View all →
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {ALL_PROVIDERS.slice(0, 10).map((p) => (
              <div
                key={p.slug}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                style={{ background: '#101C16', border: '1px solid #1A2E22', color: '#8FA899', whiteSpace: 'nowrap' }}
              >
                {p.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Legal */}
      <div className="border-t pt-6 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.5)' }}>
          18+ · No Purchase Necessary · Gold Coins have no cash value · Void Where Prohibited · Play Responsibly
        </p>
        <p className="text-[10px] mt-1" style={{ color: 'rgba(143,168,153,0.3)' }}>
          Problem Gambling Helpline: 1-800-522-4700
        </p>
      </div>
    </div>
  );
}
