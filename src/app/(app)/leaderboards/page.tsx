'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WEEKLY_LEADERBOARD, SC_LEADERBOARD } from '@/lib/mock-data/users';
import { formatGC, formatSC, getVIPColor } from '@/lib/utils';
import { TrendingUp, Flame, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { YalaIcon, GoldCoinIcon, SweepCoinIcon } from '@/components/ui/YalaIcon';

type Period = 'daily' | 'weekly' | 'monthly' | 'alltime';

// Daily race prize pool + countdown (was on the Rewards page — consolidated here).
// Pool is in the active currency unit (5,000 SC default; equivalent ~500K GC).
const DAILY_RACE_POOL_GC = 500_000;
const DAILY_RACE_POOL_SC = 5_000;
const DAILY_RACE_ENDS_IN = 14 * 3600 + 32 * 60 + 9;

function useCountdown(initial: number) {
  const [s, setS] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => setS(x => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const fmt = (n: number) => String(n).padStart(2, '0');
  return `${fmt(h)}h ${fmt(m)}m ${fmt(sec)}s`;
}

export default function LeaderboardsPage() {
  const [period, setPeriod] = useState<Period>('weekly');
  // SC is the meaningful currency on a leaderboard (real prizes redeem from SC),
  // so we default to SC regardless of the user's active wallet toggle.
  const [mode, setMode] = useState<'GC' | 'SC'>('SC');
  const dailyCountdown = useCountdown(DAILY_RACE_ENDS_IN);

  const leaderboard = mode === 'GC' ? WEEKLY_LEADERBOARD : SC_LEADERBOARD;
  const accent = mode === 'GC' ? '#F0B232' : '#2DC97A';
  const accentRgb = mode === 'GC' ? '240,178,50' : '45,201,122';

  const periodLabel: Record<Period, string> = {
    daily: 'Daily Race', weekly: 'Weekly', monthly: 'Monthly', alltime: 'All Time',
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border"
        style={{
          borderColor: '#1A2E22',
          background: `radial-gradient(ellipse at 30% 50%, rgba(${accentRgb},0.12) 0%, transparent 60%), #0A1410`,
        }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <YalaIcon name="trophy" size={16} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>Leaderboards</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Desert Champions</h1>
          <p className="text-sm max-w-lg" style={{ color: '#8FA899' }}>
            Top wagerers compete for daily, weekly, and monthly prize pools.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Mode toggle — uses YalaIcons now (gold coin / cash bill), no Unicode glyphs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}>
          <button
            onClick={() => setMode('GC')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={mode === 'GC'
              ? { background: 'linear-gradient(135deg, #F0B232, #FFD166)', color: '#060E0A' }
              : { color: '#8FA899' }}
          >
            <GoldCoinIcon size={16} />
            Gold Coins
          </button>
          <button
            onClick={() => setMode('SC')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={mode === 'SC'
              ? { background: 'linear-gradient(135deg, #2DC97A, #5EDDA0)', color: '#060E0A' }
              : { color: '#8FA899' }}
          >
            <SweepCoinIcon size={18} />
            Sweep Coins
          </button>
        </div>

        {/* Period */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}>
          {(['daily', 'weekly', 'monthly', 'alltime'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all',
                period === p ? 'text-black' : 'text-[#8FA899]'
              )}
              style={period === p ? { background: accent } : {}}
            >
              {p === 'daily' && period === p && <Flame className="w-3 h-3" />}
              {p === 'alltime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Prize pool banner — daily race when daily selected, weekly otherwise */}
      {period === 'daily' && (
        <div
          className="relative rounded-2xl overflow-hidden flex items-center justify-between px-5 py-4 border"
          style={{ background: 'rgba(45,201,122,0.06)', borderColor: 'rgba(45,201,122,0.22)' }}
        >
          <div
            className="absolute top-0 left-1/4 w-64 h-24 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(45,201,122,0.10) 0%, transparent 70%)', filter: 'blur(16px)' }}
          />
          <div className="relative flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(45,201,122,0.14)', border: '1px solid rgba(45,201,122,0.28)' }}
            >
              <Flame className="w-5 h-5 text-[#2DC97A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-wider font-bold" style={{ color: '#2DC97A' }}>Daily Race</p>
                <span
                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.18)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                  Live
                </span>
              </div>
              <p className="font-display text-2xl font-bold number-display" style={{ color: accent }}>
                {(mode === 'SC' ? DAILY_RACE_POOL_SC : DAILY_RACE_POOL_GC).toLocaleString()} <span className="text-sm">{mode}</span>
              </p>
            </div>
          </div>
          <div className="relative text-right">
            <p className="text-xs" style={{ color: '#8FA899' }}>Ends in</p>
            <p className="font-bold text-lg number-display" style={{ color: '#F5E8C8' }}>{dailyCountdown}</p>
            <div className="flex items-center gap-1 justify-end mt-1">
              <Users className="w-3 h-3" style={{ color: '#4A6A55' }} />
              <span className="text-[10px]" style={{ color: '#4A6A55' }}>2,847 racing</span>
            </div>
          </div>
        </div>
      )}
      {period === 'weekly' && (
        <div className="flex items-center justify-between px-5 py-4 rounded-2xl border"
          style={{ background: `rgba(${accentRgb},0.06)`, borderColor: `rgba(${accentRgb},0.22)` }}>
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#8FA899' }}>Weekly Prize Pool</p>
            <p className="font-display text-3xl font-bold number-display" style={{ color: accent }}>
              {mode === 'SC' ? '1,000 SC' : '100,000 GC'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#8FA899' }}>Resets in</p>
            <p className="font-bold text-lg number-display" style={{ color: '#F5E8C8' }}>3d 14h 22m</p>
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#1A2E22' }}>
          <div className="flex items-center gap-2">
            {mode === 'GC' ? <GoldCoinIcon size={14} /> : <SweepCoinIcon size={16} />}
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#F5E8C8' }}>
              {periodLabel[period]} Rankings · {mode} Wagers
            </p>
          </div>
          <TrendingUp className="w-4 h-4" style={{ color: accent }} />
        </div>

        <div className="divide-y" style={{ borderColor: '#1A2E22' }}>
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-4 py-3.5 border-b last:border-b-0"
              style={{
                borderColor: '#1A2E22',
                ...(entry.isYou ? { background: `rgba(${accentRgb},0.06)`, borderLeft: `2px solid ${accent}` } : {}),
              }}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {entry.rank === 1 ? (
                  <YalaIcon name="crown" size={18} />
                ) : entry.rank === 2 ? (
                  <span className="text-sm font-bold tabular-nums" style={{ color: '#C0C0C0' }}>2</span>
                ) : entry.rank === 3 ? (
                  <span className="text-sm font-bold tabular-nums" style={{ color: '#CD7F32' }}>3</span>
                ) : (
                  <span className="text-sm font-bold" style={{ color: '#8FA899' }}>#{entry.rank}</span>
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
                    {entry.isYou && (
                      <span
                        className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-bold"
                        style={{ background: `rgba(${accentRgb},0.18)`, color: accent }}
                      >You</span>
                    )}
                  </p>
                  <span className="text-[10px] hidden sm:inline" style={{ color: '#8FA899' }}>{entry.country}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0 flex items-center gap-1.5">
                {mode === 'GC' ? <GoldCoinIcon size={14} /> : <SweepCoinIcon size={16} />}
                <div>
                  <p className="text-sm font-bold number-display" style={{ color: accent }}>
                    {mode === 'GC' ? formatGC(entry.amount) : formatSC(entry.amount)}
                  </p>
                  <p className="text-[10px] text-right" style={{ color: '#8FA899' }}>wagered</p>
                </div>
              </div>

              {/* Prize (top 5 for weekly/daily GC) */}
              {((period === 'weekly' && mode === 'GC') || (period === 'daily' && mode === 'GC')) && entry.rank <= 5 && (
                <div className="w-16 text-right flex-shrink-0">
                  <p className="text-xs font-bold number-display" style={{ color: '#F0B232' }}>
                    {period === 'daily'
                      ? (entry.rank === 1 ? '125K' : entry.rank === 2 ? '75K' : entry.rank === 3 ? '50K' : entry.rank === 4 ? '30K' : '20K')
                      : (entry.rank === 1 ? '30K'  : entry.rank === 2 ? '20K' : entry.rank === 3 ? '15K' : entry.rank === 4 ? '10K' : '5K')
                    } GC
                  </p>
                  <p className="text-[10px]" style={{ color: '#8FA899' }}>prize</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.5)' }}>18+ · No Purchase Necessary · Void Where Prohibited</p>
      </div>
    </div>
  );
}
