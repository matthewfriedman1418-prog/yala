'use client';
import { useState } from 'react';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { GameCard } from '@/components/casino/GameCard';
import { ALL_GAMES, YALA_ORIGINALS, ALL_PROVIDERS, type GameCategory } from '@/lib/mock-data/games';
import { Search, ChevronRight, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn, formatGC, formatSC } from '@/lib/utils';

const CATEGORIES: { id: GameCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Games' },
  { id: 'slots', label: 'Slots' },
  { id: 'live', label: 'Live Casino' },
  { id: 'table', label: 'Table Games' },
  { id: 'megaways', label: 'Megaways' },
  { id: 'gameshows', label: 'Game Shows' },
  { id: 'scratch', label: 'Scratch Cards' },
  { id: 'fish', label: 'Fish Games' },
  { id: 'casual', label: 'Casual' },
];

export default function CasinoPage() {
  const { activeCurrency, goldCoins, sweepCoins } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, openBuyCoins } = useUIStore();
  const [activeCategory, setActiveCategory] = useState<GameCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#D6A84F' : '#10B981';

  const filteredGames = ALL_GAMES.filter((g) => {
    const matchesCategory = activeCategory === 'all' || g.category === activeCategory;
    const matchesSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.provider.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hotGames = ALL_GAMES.filter((g) => g.isHot).slice(0, 6);
  const newGames = ALL_GAMES.filter((g) => g.isNew).slice(0, 6);

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Lobby hero */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#1E1E1E]"
        style={{ background: isGC ? 'radial-gradient(ellipse at 30% 50%, rgba(214,168,79,0.12) 0%, transparent 60%), #0A0A0A' : 'radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.12) 0%, transparent 60%), #0A0A0A' }}
      >
        <svg className="absolute bottom-0 right-0 w-64 opacity-5" viewBox="0 0 200 200" fill="none">
          <path d="M0 150 Q50 80 100 130 Q150 180 200 100 V200 H0Z" fill={accent} />
        </svg>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>Casino Lobby</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>
            Welcome to the Oasis
          </h1>
          <p className="text-sm max-w-lg mb-6" style={{ color: '#9CA3AF' }}>
            {ALL_GAMES.length + YALA_ORIGINALS.length}+ games · {ALL_PROVIDERS.length} providers · Provably fair originals
          </p>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl border" style={{ borderColor: `${accent}30`, backgroundColor: `${accent}10` }}>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Your Balance</p>
                <p className="font-bold number-display text-lg" style={{ color: accent }}>
                  {isGC ? `${formatGC(goldCoins)} GC` : `${formatSC(sweepCoins)} SC`}
                </p>
              </div>
              <button
                onClick={openBuyCoins}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-black"
                style={{ background: `linear-gradient(135deg, ${accent}, ${isGC ? '#F0C97A' : '#34D399'})` }}
              >
                Get More Coins
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('register')}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
            >
              Sign Up — Play Free
            </button>
          )}
        </div>
      </div>

      {/* Yala Originals strip */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: accent }} />
            <h2 className="font-semibold text-[#F5E8C8]">Yala Originals</h2>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">Exclusive</span>
          </div>
          <Link href="/originals" className="flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: accent }}>
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {YALA_ORIGINALS.slice(0, 6).map((g) => {
            const gradientColors: Record<string, string[]> = {
              'mirage-crash': ['#92400e', '#78350f'],
              'oasis-plinko': ['#065f46', '#134e4a'],
              'dune-mines': ['#78350f', '#1c1917'],
              'golden-dice': ['#a16207', '#78350f'],
              'sandstorm-limbo': ['#1c1917', '#292524'],
              'emerald-wheel': ['#065f46', '#052e16'],
            };
            const colors = gradientColors[g.slug] || ['#1c1917', '#0a0a0a'];
            return (
              <Link key={g.slug} href={`/originals/${g.slug}`} className="group">
                <div
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer game-card-hover"
                  style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[10px] font-bold text-white truncate">{g.name}</p>
                    <p className="text-[9px]" style={{ color: accent }}>{g.type}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hot Games */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <h2 className="font-semibold text-[#F5E8C8]">Hot Right Now</h2>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {hotGames.map((g) => <GameCard key={g.id} game={g} size="sm" />)}
        </div>
      </section>

      {/* Search + categories */}
      <section>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games or providers..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-[#1E1E1E] text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 transition-colors"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                activeCategory === cat.id
                  ? 'text-black'
                  : 'text-[#9CA3AF] bg-white/5 hover:text-[#F5E8C8]'
              )}
              style={activeCategory === cat.id ? { background: `linear-gradient(135deg, ${accent}, ${isGC ? '#F0C97A' : '#34D399'})` } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Game grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filteredGames.map((g) => <GameCard key={g.id} game={g} size="sm" />)}
          </div>
        ) : (
          <div className="text-center py-16 text-[#9CA3AF]">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No games found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </section>

      {/* New Games */}
      {activeCategory === 'all' && !search && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="font-semibold text-[#F5E8C8]">New Arrivals</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {newGames.map((g) => <GameCard key={g.id} game={g} size="sm" />)}
          </div>
        </section>
      )}

      {/* Legal */}
      <div className="border-t border-[#1E1E1E] pt-6 text-center">
        <p className="text-xs text-[#9CA3AF]/60">
          18+ · No Purchase Necessary · Gold Coins have no cash value · Void Where Prohibited · Play Responsibly
        </p>
        <p className="text-[10px] text-[#9CA3AF]/40 mt-1">
          Problem Gambling Helpline: 1-800-522-4700
        </p>
      </div>
    </div>
  );
}
