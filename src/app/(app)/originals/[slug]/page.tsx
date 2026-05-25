'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { YALA_ORIGINALS } from '@/lib/mock-data/games';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { Shield, TrendingUp, Info, BarChart3, Users, Lock, ChevronLeft } from 'lucide-react';
import { cn, getVIPColor } from '@/lib/utils';
import Link from 'next/link';

const RECENT_PLAYS = [
  { user: 'GoldDuneKing', avatar: 'GK', tier: 6, bet: 500, mult: 4.2, payout: 2100, time: '2s ago', won: true },
  { user: 'OasisHunter', avatar: 'OH', tier: 5, bet: 1000, mult: 0, payout: 0, time: '5s ago', won: false },
  { user: 'SandstormX', avatar: 'SX', tier: 4, bet: 250, mult: 12.5, payout: 3125, time: '8s ago', won: true },
  { user: 'EmeraldDunes', avatar: 'ED', tier: 5, bet: 750, mult: 1.5, payout: 1125, time: '12s ago', won: true },
  { user: 'NightBazaar7', avatar: 'NB', tier: 3, bet: 100, mult: 0, payout: 0, time: '15s ago', won: false },
  { user: 'PyramidAce', avatar: 'PA', tier: 2, bet: 200, mult: 3.1, payout: 620, time: '18s ago', won: true },
  { user: 'CaravanKing', avatar: 'CK', tier: 4, bet: 500, mult: 0, payout: 0, time: '20s ago', won: false },
  { user: 'MirageRunner', avatar: 'MR', tier: 3, bet: 300, mult: 8.0, payout: 2400, time: '22s ago', won: true },
];

const LEADERBOARD = [
  { rank: 1, user: 'GoldDuneKing', avatar: 'GK', tier: 6, profit: 482_000 },
  { rank: 2, user: 'OasisHunter', avatar: 'OH', tier: 5, profit: 334_200 },
  { rank: 3, user: 'SandstormX', avatar: 'SX', tier: 4, profit: 218_500 },
  { rank: 4, user: 'EmeraldDunes', avatar: 'ED', tier: 5, profit: 187_300 },
  { rank: 5, user: 'DesertFox88', avatar: 'DF', tier: 5, profit: 142_800 },
];

const GRADIENT_COLORS: Record<string, string[]> = {
  'trail': ['#065f46', '#1c1917'],
  'caravan-cross':  ['#92400e', '#7f1d1d'],
  'mirage-auction': ['#4c1d95', '#92400e'],
  'mirage-crash': ['#92400e', '#78350f'],
  'oasis-plinko': ['#065f46', '#134e4a'],
  'dune-mines': ['#78350f', '#1c1917'],
  'golden-dice': ['#a16207', '#92400e'],
  'sandstorm-limbo': ['#1c1917', '#292524'],
  'emerald-wheel': ['#065f46', '#052e16'],
  'caravan-keno': ['#78350f', '#451a03'],
  'night-bazaar-blackjack': ['#1e293b', '#0f172a'],
  'pharaoh-towers': ['#713f12', '#431407'],
  'oasis-hi-lo': ['#134e4a', '#042f2e'],
  'desert-roulette': ['#7f1d1d', '#450a0a'],
  'scorpion-cases': ['#1c1917', '#0a0a0a'],
};

type Tab = 'recent' | 'leaderboard' | 'rules' | 'fairness';

export default function OriginalGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const game = YALA_ORIGINALS.find((g) => g.slug === slug);
  if (!game) notFound();

  const { activeCurrency, toggleCurrency } = useWalletStore();
  const { openComingSoon } = useUIStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('recent');

  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#D6A84F' : '#10B981';
  const colors = GRADIENT_COLORS[slug] || ['#1c1917', '#0a0a0a'];

  const TABS: { id: Tab; label: string; icon: typeof Info }[] = [
    { id: 'recent', label: 'Recent Plays', icon: TrendingUp },
    { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { id: 'rules', label: 'Rules', icon: Info },
    { id: 'fairness', label: 'Provably Fair', icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Back link */}
      <Link href="/originals" className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80" style={{ color: '#9CA3AF' }}>
        <ChevronLeft className="w-4 h-4" />
        All Originals
      </Link>

      {/* Game Hero */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, minHeight: '280px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full text-black" style={{ background: accent }}>
            {game.type}
          </span>
        </div>

        {/* Mode toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderColor: `${accent}50`,
              color: accent,
            }}
          >
            <span>{isGC ? '◈ GC' : '◇ SC'}</span>
            <span className="text-[#9CA3AF]/60">/ Switch</span>
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6" style={{ minHeight: '280px' }}>
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-2">{game.name}</h1>
            <p className="text-sm max-w-md leading-relaxed" style={{ color: 'rgba(245,232,200,0.7)' }}>{game.tagline}</p>
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1" style={{ color: 'rgba(245,232,200,0.6)' }}>
                <Shield className="w-3.5 h-3.5" style={{ color: accent }} />
                RTP: {game.rtp}%
              </div>
              <div style={{ color: 'rgba(245,232,200,0.6)' }}>Max Win: <span style={{ color: accent }}>{game.maxWin}</span></div>
              <div style={{ color: 'rgba(245,232,200,0.6)' }}>Min Bet: <span style={{ color: accent }}>{game.minBet} {isGC ? 'GC' : 'SC'}</span></div>
            </div>
          </div>

          {/* Play button area */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <button
              onClick={() => isLoggedIn ? openComingSoon(game.name) : openAuthModal()}
              className="relative w-36 py-4 rounded-2xl font-bold text-base text-black transition-all hover:opacity-90 group"
              style={{ background: `linear-gradient(135deg, ${accent}, ${isGC ? '#F0C97A' : '#34D399'})` }}
            >
              <Lock className="w-4 h-4 mx-auto mb-1 opacity-60" />
              <span>Coming Soon</span>
            </button>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(245,232,200,0.5)' }}>
              <Users className="w-3.5 h-3.5" />
              <span>247 playing now</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'RTP', value: `${game.rtp}%` },
              { label: 'Max Win', value: game.maxWin },
              { label: 'Min Bet', value: `${game.minBet} ${isGC ? 'GC' : 'SC'}` },
              { label: 'House Edge', value: `${game.houseEdge}%` },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>{stat.label}</p>
                <p className="font-bold number-display" style={{ color: accent }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="glass-card overflow-hidden">
            <div className="flex border-b border-[#1E1E1E]">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all',
                      activeTab === tab.id ? 'border-b-2' : 'text-[#9CA3AF] hover:text-[#F5E8C8]'
                    )}
                    style={activeTab === tab.id ? { color: accent, borderColor: accent } : {}}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4">
              {activeTab === 'recent' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">Recent Activity</p>
                  {RECENT_PLAYS.map((play, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 py-2 border-b border-[#1E1E1E] last:border-0"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${getVIPColor(play.tier)}, rgba(0,0,0,0.3))` }}
                      >
                        {play.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: getVIPColor(play.tier) }}>{play.user}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{play.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs number-display" style={{ color: '#9CA3AF' }}>{play.bet.toLocaleString()} {isGC ? 'GC' : 'SC'}</p>
                        {play.won ? (
                          <p className="text-xs font-bold number-display text-emerald-400">+{play.payout.toLocaleString()} ({play.mult}×)</p>
                        ) : (
                          <p className="text-xs font-bold number-display text-red-400">Lost</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">All-Time Top Players</p>
                  {LEADERBOARD.map((entry) => (
                    <div key={entry.rank} className="flex items-center gap-3 py-2 border-b border-[#1E1E1E] last:border-0">
                      <span className={cn('w-6 text-center text-sm font-bold', `rank-${entry.rank}`)}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${getVIPColor(entry.tier)}, rgba(0,0,0,0.3))` }}
                      >
                        {entry.avatar}
                      </div>
                      <span className="flex-1 text-xs font-semibold" style={{ color: getVIPColor(entry.tier) }}>{entry.user}</span>
                      <span className="text-xs font-bold number-display" style={{ color: accent }}>{entry.profit.toLocaleString()} {isGC ? 'GC' : 'SC'}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>How to Play</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{game.description}</p>
                  <div className="mt-4 space-y-2">
                    {game.rules.map((rule, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0 mt-0.5" style={{ background: accent }}>
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'fairness' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: accent }} />
                    <p className="font-semibold" style={{ color: '#F5E8C8' }}>Provably Fair</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{game.fairnessNote}</p>
                  <div className="space-y-3 mt-4">
                    <div className="glass-card p-3">
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>Server Seed Hash (Example)</p>
                      <p className="font-mono text-xs break-all" style={{ color: accent }}>
                        7b3c9f8a2d4e6f1b5a8c9d2e4f6b3a9c8d7e2f1b4a5c6d8e9f2b3c4d5e6f7a8b
                      </p>
                    </div>
                    <div className="glass-card p-3">
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>Client Seed (Example)</p>
                      <p className="font-mono text-xs" style={{ color: '#9CA3AF' }}>yala_player_8f9e2a1b</p>
                    </div>
                    <div className="glass-card p-3">
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>Nonce</p>
                      <p className="font-mono text-xs" style={{ color: '#9CA3AF' }}>1</p>
                    </div>
                    <button
                      className="w-full py-2 rounded-lg text-xs font-semibold border transition-all hover:opacity-80"
                      style={{ borderColor: `${accent}30`, color: accent }}
                      onClick={() => {}}
                    >
                      Verify Result (Coming Soon)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Description */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-3" style={{ color: '#F5E8C8' }}>About {game.name}</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{game.description}</p>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold mb-3" style={{ color: '#F5E8C8' }}>Currency Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => toggleCurrency()}
                className={cn('flex-1 py-2 rounded-lg text-xs font-semibold border transition-all', isGC ? 'text-black' : 'text-[#9CA3AF] border-[#2a2a2a]')}
                style={isGC ? { background: 'linear-gradient(135deg, #D6A84F, #F0C97A)', border: 'none' } : {}}
              >
                ◈ Gold Coins
              </button>
              <button
                onClick={() => toggleCurrency()}
                className={cn('flex-1 py-2 rounded-lg text-xs font-semibold border transition-all', !isGC ? 'text-black' : 'text-[#9CA3AF] border-[#2a2a2a]')}
                style={!isGC ? { background: 'linear-gradient(135deg, #10B981, #34D399)', border: 'none' } : {}}
              >
                ◇ Sweep Coins
              </button>
            </div>
            {!isGC && (
              <p className="text-[10px] mt-2 leading-relaxed" style={{ color: '#9CA3AF' }}>
                Sweep Coins can be redeemed for prizes where permitted by applicable law.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Void Where Prohibited · Play Responsibly</p>
      </div>
    </div>
  );
}
