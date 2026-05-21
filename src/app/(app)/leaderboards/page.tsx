'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { WEEKLY_LEADERBOARD, SC_LEADERBOARD } from '@/lib/mock-data/users';
import { formatGC, formatSC, getVIPColor } from '@/lib/utils';
import { Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeaderboardsPage() {
  const { activeCurrency } = useWalletStore();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly');
  const [mode, setMode] = useState<'GC' | 'SC'>(activeCurrency as 'GC' | 'SC');

  const leaderboard = mode === 'GC' ? WEEKLY_LEADERBOARD : SC_LEADERBOARD;
  const accent = mode === 'GC' ? '#D6A84F' : '#10B981';

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#1E1E1E]"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${mode === 'GC' ? 'rgba(214,168,79,0.12)' : 'rgba(16,185,129,0.12)'} 0%, transparent 60%), #0A0A0A` }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4" style={{ color: accent }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>Leaderboards</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Desert Champions</h1>
          <p className="text-sm max-w-lg" style={{ color: '#9CA3AF' }}>Top wagerers compete for weekly GC prize pools and leaderboard glory.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Mode toggle */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E1E1E' }}>
          <button
            onClick={() => setMode('GC')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={mode === 'GC' ? { background: 'linear-gradient(135deg, #D6A84F, #F0C97A)', color: '#000' } : { color: '#9CA3AF' }}
          >
            ◈ Gold Coins
          </button>
          <button
            onClick={() => setMode('SC')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={mode === 'SC' ? { background: 'linear-gradient(135deg, #10B981, #34D399)', color: '#000' } : { color: '#9CA3AF' }}
          >
            ◇ Sweep Coins
          </button>
        </div>

        {/* Period */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E1E1E' }}>
          {(['daily', 'weekly', 'monthly', 'alltime'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn('px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all', period === p ? 'text-black' : 'text-[#9CA3AF]')}
              style={period === p ? { background: accent } : {}}
            >
              {p === 'alltime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Prize pool banner */}
      {period === 'weekly' && mode === 'GC' && (
        <div className="flex items-center justify-between px-5 py-4 rounded-2xl border" style={{ background: 'rgba(214,168,79,0.06)', borderColor: 'rgba(214,168,79,0.2)' }}>
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>Weekly Prize Pool</p>
            <p className="font-display text-3xl font-bold number-display" style={{ color: '#D6A84F' }}>100,000 GC</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Resets in</p>
            <p className="font-bold text-lg number-display" style={{ color: '#F5E8C8' }}>3d 14h 22m</p>
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
            {period.charAt(0).toUpperCase() + period.slice(1)} Rankings — {mode} Wagers
          </p>
          <TrendingUp className="w-4 h-4" style={{ color: accent }} />
        </div>

        <div className="divide-y divide-[#1E1E1E]">
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-4 py-3.5"
              style={entry.isYou ? { background: `${accent}08`, borderLeft: `2px solid ${accent}` } : {}}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {entry.rank <= 3 ? (
                  <span className="text-lg">{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
                ) : (
                  <span className="text-sm font-bold" style={{ color: '#9CA3AF' }}>#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${getVIPColor(5)}, rgba(0,0,0,0.2))` }}
              >
                {entry.avatar}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate" style={{ color: entry.isYou ? accent : '#F5E8C8' }}>
                    {entry.username}
                    {entry.isYou && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${accent}20`, color: accent }}>You</span>}
                  </p>
                  <span className="text-[10px] text-[#9CA3AF] hidden sm:inline">{entry.country}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold number-display" style={{ color: accent }}>
                  {mode === 'GC' ? formatGC(entry.amount) : formatSC(entry.amount)}
                </p>
                <p className="text-[10px]" style={{ color: '#9CA3AF' }}>wagered</p>
              </div>

              {/* Prize (top 3 for weekly GC) */}
              {period === 'weekly' && mode === 'GC' && entry.rank <= 5 && (
                <div className="w-16 text-right flex-shrink-0">
                  <p className="text-xs font-bold number-display" style={{ color: '#D6A84F' }}>
                    {entry.rank === 1 ? '30K' : entry.rank === 2 ? '20K' : entry.rank === 3 ? '15K' : entry.rank === 4 ? '10K' : '5K'} GC
                  </p>
                  <p className="text-[10px]" style={{ color: '#9CA3AF' }}>prize</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Void Where Prohibited</p>
      </div>
    </div>
  );
}
