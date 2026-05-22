'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import { Gift, CheckCircle2, Lock, Zap, Target, Trophy, TrendingUp } from 'lucide-react';

const STREAK_REWARDS = [
  { day: 1, gc: 500,   sc: 0,   label: 'Day 1' },
  { day: 2, gc: 750,   sc: 0,   label: 'Day 2' },
  { day: 3, gc: 1000,  sc: 0,   label: 'Day 3' },
  { day: 4, gc: 1500,  sc: 0,   label: 'Day 4' },
  { day: 5, gc: 2000,  sc: 0.5, label: 'Day 5' },
  { day: 6, gc: 2500,  sc: 0.5, label: 'Day 6' },
  { day: 7, gc: 5000,  sc: 1,   label: 'Day 7',  special: true },
];

const FREE_PLAY_OPTIONS = [
  {
    id: 'daily',
    title: 'Daily Login Bonus',
    desc: 'Claim free GC just for showing up. Streak multiplies the reward.',
    icon: Gift,
    color: '#F0B232',
    available: true,
    href: null, // handled inline
  },
  {
    id: 'missions',
    title: 'Daily Missions',
    desc: '3 missions reset every day. Complete them to earn bonus GC and XP.',
    icon: Target,
    color: '#2DC97A',
    available: true,
    href: '/missions',
    cta: 'View Missions',
  },
  {
    id: 'race',
    title: 'Daily Race',
    desc: 'Wager today and compete for a share of 500,000 GC.',
    icon: Trophy,
    color: '#A78BFA',
    available: true,
    href: '/rewards',
    cta: 'Enter Race',
  },
  {
    id: 'rakeback',
    title: 'Rakeback',
    desc: 'Earn a % back on every wager automatically. Claim anytime from Rewards.',
    icon: TrendingUp,
    color: '#60A5FA',
    available: true,
    href: '/rewards',
    cta: 'Claim Now',
  },
];

export default function DailyBonusPage() {
  const { addGC, addSC } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [currentStreak] = useState(7);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const todayReward = STREAK_REWARDS[Math.min(currentStreak - 1, 6)];

  const handleDailyClaim = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    addGC(todayReward.gc);
    if (todayReward.sc) addSC(todayReward.sc);
    setDailyClaimed(true);
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">

      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}>
            <Gift className="w-3.5 h-3.5 text-[#F0B232]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0B232]">Free Play</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Daily Free Play</h1>
        <p style={{ color: '#8FA899' }}>No purchase necessary. Coins, races, and missions reset every day.</p>
      </div>

      {/* ── DAILY CLAIM — hero card ── */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 lg:p-8"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(240,178,50,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(45,201,122,0.08) 0%, transparent 55%), #0C1812',
          border: dailyClaimed ? '1px solid rgba(45,201,122,0.3)' : '1px solid rgba(240,178,50,0.2)',
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

          {/* Left: streak + info */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.25)' }}
            >
              🔥
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#4A6A55' }}>Login Streak</p>
              <p className="font-display text-2xl font-black" style={{ color: '#F0B232' }}>{currentStreak} Days</p>
              <p className="text-sm" style={{ color: '#8FA899' }}>
                Today: <span className="font-bold" style={{ color: '#F5E8C8' }}>{formatGC(todayReward.gc)} GC</span>
                {todayReward.sc ? <span className="text-[#2DC97A]"> + {todayReward.sc} SC</span> : ''}
              </p>
            </div>
          </div>

          {/* Center: 7-day calendar */}
          <div className="flex gap-1.5 flex-wrap">
            {STREAK_REWARDS.map((r) => {
              const past    = r.day < currentStreak;
              const current = r.day === currentStreak;
              return (
                <div
                  key={r.day}
                  className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-center w-12"
                  style={{
                    borderColor: current ? '#F0B232' : past ? 'rgba(240,178,50,0.25)' : '#1A2E22',
                    background:  current ? 'rgba(240,178,50,0.1)' : past ? 'rgba(240,178,50,0.04)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <span className="text-sm">
                    {past ? '✓' : current ? '🎁' : <Lock className="w-3 h-3 text-[#4A6A55]" />}
                  </span>
                  <p className="text-[8px] font-semibold" style={{ color: current ? '#F0B232' : '#4A6A55' }}>
                    {r.special ? '🔥' : `D${r.day}`}
                  </p>
                  <p className="text-[8px] number-display" style={{ color: '#6B8F7B' }}>
                    {r.gc >= 1000 ? `${r.gc / 1000}K` : r.gc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: claim button */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <AnimatePresence mode="wait">
              {dailyClaimed ? (
                <motion.div
                  key="claimed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl"
                  style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.3)' }}
                >
                  <CheckCircle2 className="w-5 h-5 text-[#2DC97A]" />
                  <div>
                    <p className="text-sm font-bold text-[#2DC97A]">Claimed!</p>
                    <p className="text-xs" style={{ color: '#4A6A55' }}>Come back tomorrow</p>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="claim"
                  onClick={handleDailyClaim}
                  className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #F0B232, #D6A84F)', color: '#060E0A', boxShadow: '0 4px 20px rgba(240,178,50,0.35)' }}
                >
                  <Gift className="w-4 h-4" />
                  Claim {formatGC(todayReward.gc)} GC
                  {todayReward.sc ? ` + ${todayReward.sc} SC` : ''}
                </motion.button>
              )}
            </AnimatePresence>
            <p className="text-[10px] text-center mt-2" style={{ color: '#4A6A55' }}>Resets midnight UTC · No purchase necessary</p>
          </div>
        </div>
      </div>

      {/* ── FREE PLAY OPTIONS ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #2DC97A, #F0B232)' }} />
          <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>More Free Play</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FREE_PLAY_OPTIONS.map((opt, i) => {
            const Icon = opt.icon;
            const inner = (
              <div className="rounded-2xl p-5 h-full flex flex-col transition-all hover:border-opacity-50 group"
                style={{ background: '#0F1A14', border: `1px solid ${opt.color}18` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
                  style={{ background: `${opt.color}12`, border: `1px solid ${opt.color}25` }}
                >
                  <Icon className="w-5 h-5" style={{ color: opt.color }} />
                </div>
                <p className="font-semibold text-sm mb-1 group-hover:opacity-80 transition-opacity" style={{ color: '#F5E8C8' }}>{opt.title}</p>
                <p className="text-xs leading-relaxed flex-1" style={{ color: '#6B8F7B' }}>{opt.desc}</p>
                {opt.cta && (
                  <p className="text-xs font-semibold mt-3 flex items-center gap-1" style={{ color: opt.color }}>
                    <Zap className="w-3 h-3" /> {opt.cta}
                  </p>
                )}
              </div>
            );

            return (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="h-full"
              >
                {opt.href ? <Link href={opt.href} className="block h-full">{inner}</Link> : inner}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── NEXT MILESTONES ── */}
      <div
        className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: 'rgba(45,201,122,0.04)', border: '1px solid rgba(45,201,122,0.15)' }}
      >
        <div>
          <p className="font-semibold mb-0.5" style={{ color: '#F5E8C8' }}>Keep your streak alive</p>
          <p className="text-sm" style={{ color: '#8FA899' }}>Day 7 pays 5,000 GC + 1 SC — your biggest daily haul. Don&apos;t break the chain.</p>
        </div>
        <Link
          href="/casino"
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)', color: '#060E0A' }}
        >
          <Zap className="w-4 h-4" />
          Play Now
        </Link>
      </div>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.4)' }}>
          18+ · No Purchase Necessary · Gold Coins have no cash value · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}
