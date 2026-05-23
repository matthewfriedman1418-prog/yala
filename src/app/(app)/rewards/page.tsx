'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { formatGC, formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { PROMOTIONS } from '@/lib/mock-data/promotions';
import {
  TrendingUp, ChevronRight,
  CheckCircle2, Zap, Medal, Users, Flame,
} from 'lucide-react';
import { YalaIcon, type YalaIconName } from '@/components/ui/YalaIcon';

// ─── Daily Race Data ──────────────────────────────────────────────────────────
const RACE_PRIZE_POOL = 500_000;
const RACE_ENDS_IN_SECONDS_INITIAL = 14 * 3600 + 32 * 60 + 9;

const RACE_LEADERS = [
  { rank: 1, name: 'CryptoKing99',  avatar: '👑', wagered: 2_847_500, prize: 125_000, color: '#F0B232' },
  { rank: 2, name: 'LuckyAce7',     avatar: '🃏', wagered: 2_104_200, prize: 75_000,  color: '#9CA3AF' },
  { rank: 3, name: 'NightOwlBets',  avatar: '🦉', wagered: 1_655_800, prize: 50_000,  color: '#CD7F32' },
  { rank: 4, name: 'QuantumSpin',   avatar: '⚛️', wagered: 1_203_400, prize: 30_000,  color: '#8FA899' },
  { rank: 5, name: 'SlotMagnet',    avatar: '🧲', wagered:   891_600, prize: 20_000,  color: '#8FA899' },
];
const MY_RANK = 47;
const MY_WAGERED = 12_400;

function useDailyRaceTimer(initial: number) {
  const [secs, setSecs] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return { h, m, s };
}

function TimerUnit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-11 h-12 flex items-center justify-center rounded-xl font-mono text-xl font-black"
        style={{ background: 'rgba(45,201,122,0.12)', border: '1px solid rgba(45,201,122,0.25)', color: '#2DC97A' }}
      >
        {str}
      </div>
      <span className="text-[9px] uppercase tracking-widest mt-1" style={{ color: '#4A6A55' }}>{label}</span>
    </div>
  );
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <YalaIcon name="crown" size={16} />;
  if (rank === 2) return <Medal className="w-4 h-4 text-[#9CA3AF]" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-[#CD7F32]" />;
  return <span className="text-xs font-bold tabular-nums w-4 text-center" style={{ color: '#8FA899' }}>#{rank}</span>;
}

const REWARD_HUBS: {
  id: string; title: string; subtitle: string; description: string;
  icon: YalaIconName; color: string; href: string; cta: string; badge: string;
}[] = [
  {
    id: 'daily-bonus',
    title: 'Daily Login Bonus',
    subtitle: 'Day 4 of 7 streak',
    description: 'Claim your daily GC reward and keep your streak alive.',
    icon: 'daily-star',
    color: '#F0B232',
    href: '/daily-bonus',
    cta: 'Claim Now',
    badge: 'Ready',
  },
  {
    id: 'missions',
    title: 'Missions',
    subtitle: '3 dailies available',
    description: 'Complete missions to earn bonus GC, SC and XP.',
    icon: 'badge-star',
    color: '#8B5CF6',
    href: '/missions',
    cta: 'View Missions',
    badge: '3 New',
  },
  {
    id: 'leaderboards',
    title: 'Leaderboards',
    subtitle: 'Weekly race ends in 3d 14h',
    description: 'Compete for a share of the 100,000 GC weekly prize pool.',
    icon: 'trophy',
    color: '#F59E0B',
    href: '/leaderboards',
    cta: 'See Rankings',
    badge: 'Active',
  },
  {
    id: 'vault',
    title: 'Vault',
    subtitle: 'Protect your coins',
    description: "Lock Gold Coins you don't want to spend. They won't be used while playing.",
    icon: 'lock',
    color: '#06B6D4',
    href: '/vault',
    cta: 'Open Vault',
    badge: 'Protected',
  },
  {
    id: 'promotions',
    title: 'Promotions',
    subtitle: '8 active offers',
    description: 'Browse all current bonuses, reload offers and limited deals.',
    icon: 'gift',
    color: '#EC4899',
    href: '/promotions',
    cta: 'View Offers',
    badge: '8 Active',
  },
];

const FEATURED_PROMOS = PROMOTIONS.slice(0, 3);

export default function RewardsPage() {
  const { isLoggedIn, user } = useAuthStore();
  const { xp, rakebackBalance, bonusBalance, vaultBalance, claimRakeback } = useWalletStore();
  const { openAuthModal, openPromotionsDrawer } = useUIStore();
  const [rakeClaimed, setRakeClaimed] = useState(false);
  const timer = useDailyRaceTimer(RACE_ENDS_IN_SECONDS_INITIAL);

  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress = nextTier
    ? Math.max(0, Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100))
    : 100;
  const tierColor = getVIPColor(user?.vipTier || 1);

  const handleClaimRakeback = () => {
    if (rakebackBalance <= 0) return;
    claimRakeback();
    setRakeClaimed(true);
    setTimeout(() => setRakeClaimed(false), 3000);
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}
          >
            <YalaIcon name="gift" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0B232]">Rewards</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Rewards Hub</h1>
        <p style={{ color: '#8FA899' }}>Everything you&apos;ve earned. All in one place.</p>
      </div>

      {/* ── DAILY RACE ───────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: 'rgba(12,24,18,0.95)', border: '1px solid rgba(45,201,122,0.22)' }}
      >
        {/* Glow blobs */}
        <div
          className="absolute top-0 left-1/4 w-64 h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(45,201,122,0.10) 0%, transparent 70%)', filter: 'blur(16px)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-48 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(240,178,50,0.08) 0%, transparent 70%)', filter: 'blur(16px)' }}
        />

        <div className="relative p-5 sm:p-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(45,201,122,0.12)', border: '1px solid rgba(45,201,122,0.25)' }}
              >
                <Flame className="w-5 h-5 text-[#2DC97A]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-display text-lg font-bold" style={{ color: '#F5E8C8' }}>Daily Race</h2>
                  <span
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.18)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                    Live
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#8FA899' }}>
                  Wager the most today and claim your share of the prize pool
                </p>
              </div>
            </div>

            {/* Prize pool + timer */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: '#8FA899' }}>Prize Pool</p>
                <p className="font-display text-xl font-black number-display" style={{ color: '#F0B232' }}>
                  {RACE_PRIZE_POOL.toLocaleString()} <span className="text-sm">GC</span>
                </p>
              </div>
              <div className="flex items-end gap-1">
                <TimerUnit value={timer.h} label="hrs" />
                <span className="text-lg font-black mb-2.5" style={{ color: '#2DC97A' }}>:</span>
                <TimerUnit value={timer.m} label="min" />
                <span className="text-lg font-black mb-2.5" style={{ color: '#2DC97A' }}>:</span>
                <TimerUnit value={timer.s} label="sec" />
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="space-y-2 mb-4">
            {RACE_LEADERS.map((p, i) => {
              const pct = (p.wagered / RACE_LEADERS[0].wagered) * 100;
              return (
                <motion.div
                  key={p.rank}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 overflow-hidden"
                  style={{
                    background: p.rank === 1 ? 'rgba(240,178,50,0.07)' : 'rgba(255,255,255,0.03)',
                    border: p.rank === 1 ? '1px solid rgba(240,178,50,0.18)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Progress fill */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      width: `${pct}%`,
                      background: p.rank === 1
                        ? 'linear-gradient(90deg, rgba(240,178,50,0.08), transparent)'
                        : 'linear-gradient(90deg, rgba(45,201,122,0.05), transparent)',
                    }}
                  />
                  {/* Rank */}
                  <div className="w-6 flex items-center justify-center flex-shrink-0 relative">
                    <RankMedal rank={p.rank} />
                  </div>
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 relative"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    {p.avatar}
                  </div>
                  {/* Name + wagered */}
                  <div className="flex-1 min-w-0 relative">
                    <p className="text-sm font-semibold truncate" style={{ color: p.rank <= 3 ? p.color : '#F5E8C8' }}>
                      {p.name}
                    </p>
                    <p className="text-[11px] number-display" style={{ color: '#8FA899' }}>
                      {p.wagered.toLocaleString()} GC wagered
                    </p>
                  </div>
                  {/* Prize */}
                  <div className="text-right flex-shrink-0 relative">
                    <p className="text-sm font-bold number-display" style={{ color: p.rank <= 3 ? p.color : '#8FA899' }}>
                      +{p.prize.toLocaleString()} GC
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Separator + player's rank */}
            {isLoggedIn && (
              <>
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 border-t border-dashed" style={{ borderColor: '#1A2E22' }} />
                  <span className="text-[10px]" style={{ color: '#4A6A55' }}>your position</span>
                  <div className="flex-1 border-t border-dashed" style={{ borderColor: '#1A2E22' }} />
                </div>
                <div
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(45,201,122,0.06)', border: '1px solid rgba(45,201,122,0.2)' }}
                >
                  <div className="w-6 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: '#2DC97A' }}>#{MY_RANK}</span>
                  </div>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(45,201,122,0.12)' }}
                  >
                    🎮
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#2DC97A' }}>You</p>
                    <p className="text-[11px] number-display" style={{ color: '#8FA899' }}>{MY_WAGERED.toLocaleString()} GC wagered</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs" style={{ color: '#8FA899' }}>Not in prizes yet</p>
                    <p className="text-[10px]" style={{ color: '#4A6A55' }}>
                      wager {(RACE_LEADERS[4].wagered - MY_WAGERED).toLocaleString()} more GC
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" style={{ color: '#8FA899' }} />
              <span className="text-xs" style={{ color: '#8FA899' }}>2,847 players racing today</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/casino"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)', color: '#060E0A' }}
              >
                <Zap className="w-3.5 h-3.5" />
                Race Now
              </Link>
              <Link
                href="/leaderboards"
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(45,201,122,0.25)', color: '#2DC97A' }}
              >
                Full Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── REWARD HUBS GRID ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #F0B232, #2DC97A)' }} />
          <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Your Rewards</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REWARD_HUBS.map((hub, i) => {
            const isPromos = hub.id === 'promotions';
            const inner = <HubCardContent hub={hub} />;
            const cardStyle = {
              background: 'rgba(16,28,22,0.9)',
              border: '1px solid #1A2E22',
            };
            const cls =
              'rounded-2xl p-5 flex flex-col h-full w-full text-left transition-all hover:border-[#F0B232]/25 group';

            return (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {isPromos ? (
                  <button onClick={openPromotionsDrawer} className={cls} style={cardStyle}>
                    {inner}
                  </button>
                ) : (
                  <Link href={hub.href} className={cls} style={cardStyle}>
                    {inner}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── VIP PROGRESS BANNER ──────────────────────────────── */}
      {isLoggedIn ? (
        <div
          className="relative rounded-2xl overflow-hidden p-5"
          style={{
            background: `radial-gradient(ellipse at 15% 50%, ${tierColor}14 0%, transparent 60%), #0C1812`,
            border: `1px solid ${tierColor}28`,
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${tierColor}18`, border: `1px solid ${tierColor}35` }}
              >
                {currentTier.icon}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: '#8FA899' }}>VIP Status</p>
                <p className="font-display text-lg font-bold" style={{ color: tierColor }}>
                  {getVIPName(user?.vipTier || 1)}
                </p>
                <p className="text-xs number-display" style={{ color: '#8FA899' }}>{formatXP(xp)} total XP</p>
              </div>
            </div>

            <div className="flex-1 max-w-xs w-full">
              {nextTier ? (
                <div>
                  <div className="flex justify-between text-xs mb-2" style={{ color: '#8FA899' }}>
                    <span>{currentTier.name}</span>
                    <span style={{ color: getVIPColor(nextTier.tier) }}>
                      {(nextTier.xpRequired - xp).toLocaleString()} XP to {nextTier.name}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1A2E22' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${tierColor}, ${getVIPColor(nextTier.tier)})` }}
                    />
                  </div>
                  <p className="text-right text-[10px] mt-1 number-display" style={{ color: '#8FA899' }}>
                    {progress.toFixed(1)}%
                  </p>
                </div>
              ) : (
                <p className="text-sm font-semibold" style={{ color: getVIPColor(6) }}>Maximum tier reached 🏆</p>
              )}
            </div>

            <Link
              href="/vip"
              className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity flex-shrink-0"
              style={{ color: '#F0B232' }}
            >
              VIP Club <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'rgba(12,24,18,0.9)', border: '1px solid rgba(240,178,50,0.15)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3"
            style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}
          >
            <YalaIcon name="star" size={24} />
          </div>
          <p className="font-semibold mb-1" style={{ color: '#F5E8C8' }}>Sign in to track your rewards</p>
          <p className="text-sm mb-4" style={{ color: '#8FA899' }}>Earn XP, climb VIP tiers, and unlock exclusive benefits.</p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
          >
            Create Free Account
          </button>
        </div>
      )}

      {/* ── BALANCES + RAKEBACK ──────────────────────────────── */}
      {isLoggedIn && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Rakeback */}
          <div
            className="rounded-xl p-4 flex items-center justify-between"
            style={{
              background: 'rgba(12,24,18,0.9)',
              border: `1px solid ${rakebackBalance > 0 ? 'rgba(45,201,122,0.3)' : '#1A2E22'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.2)' }}
              >
                <TrendingUp className="w-4 h-4 text-[#2DC97A]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: '#8FA899' }}>Rakeback</p>
                <p className="text-sm font-bold number-display text-[#2DC97A]">{formatGC(rakebackBalance)} GC</p>
              </div>
            </div>
            <button
              onClick={handleClaimRakeback}
              disabled={rakebackBalance <= 0 || rakeClaimed}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
              style={{
                background: rakeClaimed ? 'rgba(45,201,122,0.15)' : 'linear-gradient(135deg, #2DC97A, #10B981)',
                color: rakeClaimed ? '#2DC97A' : '#060E0A',
              }}
            >
              {rakeClaimed ? <><CheckCircle2 className="w-3 h-3" /> Claimed</> : 'Claim'}
            </button>
          </div>

          {/* Bonus */}
          <Link
            href="/wallet"
            className="rounded-xl p-4 text-center hover:border-[#F0B232]/30 transition-all group"
            style={{ background: 'rgba(12,24,18,0.9)', border: '1px solid #1A2E22' }}
          >
            <p className="text-[10px] uppercase tracking-wide mb-1.5" style={{ color: '#8FA899' }}>Bonus Balance</p>
            <p className="text-sm font-bold number-display group-hover:opacity-80" style={{ color: '#F0B232' }}>
              {formatGC(bonusBalance)} GC
            </p>
          </Link>

          {/* Vault */}
          <Link
            href="/vault"
            className="rounded-xl p-4 text-center hover:border-[#06B6D4]/30 transition-all group"
            style={{ background: 'rgba(12,24,18,0.9)', border: '1px solid #1A2E22' }}
          >
            <p className="text-[10px] uppercase tracking-wide mb-1.5" style={{ color: '#8FA899' }}>Vault Balance</p>
            <p className="text-sm font-bold number-display group-hover:opacity-80" style={{ color: '#06B6D4' }}>
              {formatGC(vaultBalance)} GC
            </p>
          </Link>
        </div>
      )}

      {/* ── ACTIVE PROMOTIONS ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Active Promotions</h2>
          <button
            onClick={openPromotionsDrawer}
            className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: '#F0B232' }}
          >
            All Promos <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-3">
          {FEATURED_PROMOS.map((promo, i) => (
            <motion.button
              key={promo.id}
              onClick={openPromotionsDrawer}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              className="w-full text-left rounded-xl p-4 flex items-center gap-4 transition-all hover:border-[#F0B232]/25"
              style={{ background: 'rgba(16,28,22,0.9)', border: '1px solid #1A2E22' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}
              >
                <YalaIcon name="gift" size={26} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#F5E8C8' }}>{promo.title}</p>
                <p className="text-xs truncate" style={{ color: '#8FA899' }}>{promo.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {promo.gcBonus ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232' }}>
                    +{(promo.gcBonus / 1000).toFixed(0)}K GC
                  </span>
                ) : null}
                {promo.scBonus ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,201,122,0.12)', color: '#2DC97A' }}>
                    +{promo.scBonus} SC
                  </span>
                ) : null}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.5)' }}>
          No Purchase Necessary · 18+ · Gold Coins have no cash value · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}

function HubCardContent({
  hub,
}: {
  hub: { icon: YalaIconName; color: string; badge: string; title: string; subtitle: string; description: string; cta: string };
}) {
  return (
    <>
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${hub.color}15`, border: `1px solid ${hub.color}28` }}
        >
          <YalaIcon name={hub.icon} size={26} />
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${hub.color}18`, color: hub.color }}
        >
          {hub.badge}
        </span>
      </div>
      <p className="font-semibold mb-0.5 group-hover:text-[#F0B232] transition-colors" style={{ color: '#F5E8C8' }}>
        {hub.title}
      </p>
      <p className="text-xs mb-2" style={{ color: hub.color }}>{hub.subtitle}</p>
      <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: '#8FA899' }}>{hub.description}</p>
      <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: hub.color }}>
        {hub.cta}
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </>
  );
}
