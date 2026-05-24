'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import { CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { GoldCoinIcon, SweepCoinIcon, YalaIcon, type YalaIconName } from '@/components/ui/YalaIcon';
import { toast } from 'sonner';

const STREAK_REWARDS = [
  { day: 1, gc:   500, sc: 0   },
  { day: 2, gc:   750, sc: 0   },
  { day: 3, gc: 1_000, sc: 0   },
  { day: 4, gc: 1_500, sc: 0   },
  { day: 5, gc: 2_000, sc: 0.5 },
  { day: 6, gc: 2_500, sc: 0.5 },
  { day: 7, gc: 5_000, sc: 1,   special: true },
];

const FREE_PLAY_OPTIONS: {
  id: string; title: string; desc: string; href: string;
  icon: YalaIconName; color: string; cta: string;
}[] = [
  {
    id: 'missions',
    title: 'Daily Missions',
    desc: 'Three quests reset every 24h. Complete them for bonus GC, SC, and XP.',
    href: '/missions',
    icon: 'badge-star',
    color: '#F0B232',
    cta: 'View missions',
  },
  {
    id: 'race',
    title: 'Daily Race',
    desc: 'Wager today and compete for a share of the 500,000 GC prize pool.',
    href: '/leaderboards',
    icon: 'trophy',
    color: '#2DC97A',
    cta: 'Enter race',
  },
  {
    id: 'referral',
    title: 'Refer a Friend',
    desc: 'Share your code and earn 5,000 GC for every friend who plays.',
    href: '/affiliate',
    icon: 'gift',
    color: '#A78BFA',
    cta: 'Get my code',
  },
];

export default function DailyBonusPage() {
  const { addGC, addSC } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [currentStreak] = useState(4);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const todayReward = STREAK_REWARDS[Math.min(currentStreak - 1, 6)];

  const handleDailyClaim = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    addGC(todayReward.gc);
    if (todayReward.sc) addSC(todayReward.sc);
    setDailyClaimed(true);
    const reward = [
      todayReward.gc ? `${formatGC(todayReward.gc)} GC` : '',
      todayReward.sc ? `${todayReward.sc} SC` : '',
    ].filter(Boolean).join(' + ');
    if (currentStreak === 7) {
      toast.success('7-day streak complete! 🏆', {
        description: `${reward} added · new cycle starts at midnight UTC.`,
      });
    } else {
      toast.success(`Day ${currentStreak} claimed`, { description: `${reward} added to your wallet.` });
    }
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">

      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.22)' }}
          >
            <YalaIcon name="gift" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0B232]">Free Play</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Daily Free Play</h1>
        <p style={{ color: '#8FA899' }}>
          No purchase necessary. Coins, races, and missions reset every day at midnight UTC.
        </p>
      </div>

      {/* ── DAILY CLAIM HERO ── */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 lg:p-7"
        style={{
          background: dailyClaimed
            ? 'radial-gradient(ellipse at 15% 80%, rgba(45,201,122,0.10) 0%, transparent 55%), #0F1A14'
            : 'radial-gradient(ellipse at 15% 80%, rgba(240,178,50,0.14) 0%, transparent 55%), radial-gradient(ellipse at 90% 0%, rgba(45,201,122,0.08) 0%, transparent 55%), #0F1A14',
          border: `1px solid ${dailyClaimed ? 'rgba(45,201,122,0.28)' : 'rgba(240,178,50,0.24)'}`,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 items-center">
          {/* Left: streak summary */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(240,178,50,0.12)',
                border: '1px solid rgba(240,178,50,0.3)',
                boxShadow: '0 0 24px rgba(240,178,50,0.15)',
              }}
            >
              <YalaIcon name="daily-star" size={32} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#8FA899' }}>
                Login Streak
              </p>
              <p className="font-display text-2xl font-black" style={{ color: '#F0B232' }}>
                Day {currentStreak} <span className="text-sm" style={{ color: '#8FA899' }}>of 7</span>
              </p>
              <p className="text-sm mt-1 flex items-center gap-2 flex-wrap" style={{ color: '#8FA899' }}>
                Today:
                <span className="font-bold flex items-center gap-1" style={{ color: '#F5E8C8' }}>
                  <GoldCoinIcon size={12} /> {formatGC(todayReward.gc)} GC
                </span>
                {todayReward.sc > 0 && (
                  <span className="font-bold flex items-center gap-1" style={{ color: '#2DC97A' }}>
                    <SweepCoinIcon size={14} /> {todayReward.sc} SC
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Center: 7-day calendar */}
          <div className="flex gap-1.5 justify-center lg:justify-start">
            {STREAK_REWARDS.map((r) => {
              // 'past' now includes today's day IF the user has claimed it —
              // so the tile flips from gift → green check the moment they claim.
              const past    = r.day < currentStreak || (r.day === currentStreak && dailyClaimed);
              const current = r.day === currentStreak && !dailyClaimed;
              const future  = r.day > currentStreak;
              return (
                <div
                  key={r.day}
                  className="flex flex-col items-center gap-1 px-1.5 py-2.5 rounded-xl text-center transition-all"
                  style={{
                    width: 44,
                    background: current
                      ? 'linear-gradient(180deg, rgba(240,178,50,0.18), rgba(240,178,50,0.06))'
                      : past
                        ? 'rgba(45,201,122,0.06)'
                        : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${
                      current ? 'rgba(240,178,50,0.55)' :
                      past    ? 'rgba(45,201,122,0.22)' :
                      '#1A2E22'
                    }`,
                    boxShadow: current ? '0 0 16px rgba(240,178,50,0.18)' : undefined,
                  }}
                >
                  {/* status icon */}
                  <div className="h-4 flex items-center justify-center">
                    {past
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: '#2DC97A' }} />
                      : current
                        ? <YalaIcon name="gift" size={16} />
                        : <YalaIcon name="lock" size={11} />
                    }
                  </div>
                  {/* day label */}
                  <p
                    className="text-[9px] font-bold"
                    style={{
                      color: current ? '#F0B232' : past ? '#2DC97A' : '#4A6A55',
                    }}
                  >
                    {r.special ? 'BIG' : `D${r.day}`}
                  </p>
                  {/* amount */}
                  <p
                    className="text-[9px] font-mono leading-none"
                    style={{
                      color: current ? '#F5E8C8' : future ? '#4A6A55' : '#8FA899',
                    }}
                  >
                    {r.gc >= 1000 ? `${r.gc / 1000}K` : r.gc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: claim button — separate UI for Day 7 cycle-complete moment */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <AnimatePresence mode="wait">
              {dailyClaimed && currentStreak === 7 ? (
                // Cycle complete state
                <motion.div
                  key="cycle-complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(240,178,50,0.12), rgba(45,201,122,0.10))',
                    border: '1px solid rgba(240,178,50,0.35)',
                  }}
                >
                  <YalaIcon name="trophy" size={24} />
                  <div>
                    <p className="text-sm font-black" style={{ color: '#F0B232' }}>Streak complete!</p>
                    <p className="text-[10px]" style={{ color: '#8FA899' }}>
                      New 7-day cycle starts at midnight UTC
                    </p>
                  </div>
                </motion.div>
              ) : dailyClaimed ? (
                // Day 1–6 claimed state
                <motion.div
                  key="claimed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl"
                  style={{ background: 'rgba(45,201,122,0.12)', border: '1px solid rgba(45,201,122,0.35)' }}
                >
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#2DC97A' }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#2DC97A' }}>Claimed</p>
                    <p className="text-[10px]" style={{ color: '#8FA899' }}>
                      Day {currentStreak + 1} unlocks tomorrow
                    </p>
                  </div>
                </motion.div>
              ) : (
                // Unclaimed
                <motion.button
                  key="claim"
                  onClick={handleDailyClaim}
                  className="w-full lg:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #F0B232, #FFD166)',
                    color: '#060E0A',
                    boxShadow: '0 4px 20px rgba(240,178,50,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  <YalaIcon name="gift" size={16} />
                  Claim {formatGC(todayReward.gc)} GC
                  {todayReward.sc ? ` + ${todayReward.sc} SC` : ''}
                </motion.button>
              )}
            </AnimatePresence>
            <p className="text-[10px] text-center mt-2" style={{ color: '#4A6A55' }}>
              {dailyClaimed && currentStreak === 7
                ? 'Streak resets to Day 1 tomorrow · keep showing up'
                : 'Resets midnight UTC · No purchase necessary'}
            </p>
          </div>
        </div>
      </div>

      {/* ── FREE PLAY OPTIONS ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #2DC97A, #F0B232)' }} />
          <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>More ways to earn free</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FREE_PLAY_OPTIONS.map((opt, i) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.06 }}
            >
              <Link
                href={opt.href}
                className="block h-full rounded-2xl p-4 transition-all hover:-translate-y-0.5 group"
                style={{ background: '#0F1A14', border: `1px solid ${opt.color}22` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${opt.color}14`, border: `1px solid ${opt.color}30` }}
                >
                  <YalaIcon name={opt.icon} size={22} />
                </div>
                <p className="font-bold text-sm mb-1 transition-colors group-hover:text-[#F5E8C8]" style={{ color: '#F5E8C8' }}>
                  {opt.title}
                </p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: '#8FA899' }}>
                  {opt.desc}
                </p>
                <span className="text-xs font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5" style={{ color: opt.color }}>
                  {opt.cta} <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── STREAK NUDGE / CYCLE-COMPLETE BANNER ── */}
      <div
        className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: dailyClaimed && currentStreak === 7
            ? 'linear-gradient(135deg, rgba(240,178,50,0.10), rgba(45,201,122,0.08))'
            : 'rgba(240,178,50,0.05)',
          border: `1px solid ${dailyClaimed && currentStreak === 7 ? 'rgba(240,178,50,0.32)' : 'rgba(240,178,50,0.18)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: dailyClaimed && currentStreak === 7
                ? 'rgba(240,178,50,0.18)'
                : 'rgba(240,178,50,0.12)',
              border: '1px solid rgba(240,178,50,0.28)',
            }}
          >
            <YalaIcon name={dailyClaimed && currentStreak === 7 ? 'trophy' : 'daily-star'} size={20} />
          </div>
          <div>
            {dailyClaimed && currentStreak === 7 ? (
              <>
                <p className="font-bold mb-0.5" style={{ color: '#F5E8C8' }}>You did it · 7-day streak unlocked</p>
                <p className="text-sm" style={{ color: '#8FA899' }}>
                  Cycle resets at midnight UTC. Show up tomorrow and start Day 1 — keep showing up and you&apos;ll unlock VIP streak rewards.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold mb-0.5" style={{ color: '#F5E8C8' }}>Keep your streak alive</p>
                <p className="text-sm" style={{ color: '#8FA899' }}>
                  Day 7 pays <span className="font-bold" style={{ color: '#F0B232' }}>5,000 GC + 1 SC</span> — your biggest daily haul. Don&apos;t break the chain.
                </p>
              </>
            )}
          </div>
        </div>
        <Link
          href="/casino"
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #10B981, #2DC97A)',
            color: '#060E0A',
            boxShadow: '0 2px 12px rgba(45,201,122,0.3)',
          }}
        >
          <Zap className="w-4 h-4" strokeWidth={2.5} />
          Play now
        </Link>
      </div>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.5)' }}>
          18+ · No Purchase Necessary · Gold Coins have no cash value · Void Where Prohibited · <Link href="/sweepstakes-rules" className="underline transition-colors hover:opacity-80">Sweepstakes Rules</Link>
        </p>
      </div>
    </div>
  );
}
