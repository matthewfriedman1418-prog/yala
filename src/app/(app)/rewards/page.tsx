'use client';

/**
 * /rewards — Rewards Hub. Slimmed-down per feedback that the prior version had
 * too much going on. New shape:
 *
 *   1. Header
 *   2. VIP status bar (compact)
 *   3. Daily streak strip (7 circles, claim button if today is unclaimed)
 *   4. Available now ribbon — only renders if something is claimable
 *   5. Three big bonus cards: Instant Rakeback / Weekly Bonus / Monthly Bonus
 *   6. Footer link to the Promotions drawer for specials / missions
 *
 * Race / missions / level-ups / tournaments removed from this page — they have
 * their own dedicated routes (/leaderboards, /missions, /vip). The drawer +
 * "Available now" ribbon surfaces anything claimable from those flows.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight, Calendar, Sparkles, Check, TrendingUp, Clock, Gift,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { useRewardsStore } from '@/lib/store/rewards';
import { formatGC, formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { YalaIcon } from '@/components/ui/YalaIcon';
import {
  msUntilNextDailyResetUTC,
  msUntilNextWeeklyResetUTC,
  msUntilNextMonthlyResetUTC,
  formatDuration,
} from '@/lib/time';
import { toast } from 'sonner';

const DAILY_STREAK_REWARDS = [
  { day: 1, gc: 1_000, sc: 0 },
  { day: 2, gc: 1_500, sc: 0 },
  { day: 3, gc: 2_000, sc: 0 },
  { day: 4, gc: 2_500, sc: 1 },
  { day: 5, gc: 3_000, sc: 0 },
  { day: 6, gc: 4_000, sc: 0 },
  { day: 7, gc: 7_500, sc: 5 },
];

const WEEKLY_BONUS_SC  = 5;
const MONTHLY_BONUS_SC = 25;

function useCountdown(getMs: () => number): string {
  const [text, setText] = useState(() => formatDuration(getMs()));
  useEffect(() => {
    const tick = () => setText(formatDuration(getMs()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [getMs]);
  return text;
}

export default function RewardsPage() {
  const { isLoggedIn, user } = useAuthStore();
  const { xp, rakebackBalance, claimRakeback, addGC, addSC } = useWalletStore();
  const { openAuthModal, openPromotionsDrawer }              = useUIStore();
  const canClaimDaily    = useRewardsStore((s) => s.canClaimDailyToday());
  const pendingStreakDay = useRewardsStore((s) => s.pendingStreakDay());
  const streakDay        = useRewardsStore((s) => s.streakDay);
  const claimDaily       = useRewardsStore((s) => s.claimDaily);
  const canClaimWeekly   = useRewardsStore((s) => s.canClaimWeekly());
  const canClaimMonthly  = useRewardsStore((s) => s.canClaimMonthly());
  const claimWeekly      = useRewardsStore((s) => s.claimWeekly);
  const claimMonthly     = useRewardsStore((s) => s.claimMonthly);

  const dailyCountdown   = useCountdown(msUntilNextDailyResetUTC);
  const weeklyCountdown  = useCountdown(msUntilNextWeeklyResetUTC);
  const monthlyCountdown = useCountdown(msUntilNextMonthlyResetUTC);

  // VIP
  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier    = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress    = nextTier
    ? Math.max(0, Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100))
    : 100;
  const tierColor = getVIPColor(user?.vipTier || 1);

  // Streak rendering
  const renderDay = canClaimDaily ? pendingStreakDay : (streakDay || 1);
  const todayReward = DAILY_STREAK_REWARDS[Math.min(renderDay - 1, 6)];

  // Available-now rows (only ready-to-claim things — small format)
  const dailyReady    = isLoggedIn && canClaimDaily;
  const rakebackReady = isLoggedIn && rakebackBalance > 0;
  const weeklyReady   = isLoggedIn && canClaimWeekly;
  const monthlyReady  = isLoggedIn && canClaimMonthly;
  const claimableCount = [dailyReady, rakebackReady, weeklyReady, monthlyReady].filter(Boolean).length;

  // Handlers
  const handleClaimDaily = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (!canClaimDaily) return;
    if (todayReward.gc) addGC(todayReward.gc);
    if (todayReward.sc) addSC(todayReward.sc);
    const day = claimDaily();
    toast.success(`Day ${day} bonus claimed`, {
      description: `+${formatGC(todayReward.gc)} GC${todayReward.sc ? ` · +${todayReward.sc} SC` : ''}`,
    });
  };

  const handleClaimRakeback = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (rakebackBalance <= 0) return;
    const amount = rakebackBalance;
    claimRakeback();
    toast.success('Rakeback claimed', { description: `+${formatGC(amount)} GC to your bonus balance.` });
  };

  const handleClaimWeekly = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (!canClaimWeekly) return;
    addSC(WEEKLY_BONUS_SC);
    claimWeekly();
    toast.success('Weekly bonus claimed', { description: `+${WEEKLY_BONUS_SC} SC. Next claim Monday 00:00 UTC.` });
  };

  const handleClaimMonthly = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (!canClaimMonthly) return;
    addSC(MONTHLY_BONUS_SC);
    claimMonthly();
    toast.success('Monthly bonus claimed', { description: `+${MONTHLY_BONUS_SC} SC. Next claim on the 1st 00:00 UTC.` });
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <YalaIcon name="gift" size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F0B232' }}>Rewards</span>
        </div>
        <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: '#F5E8C8' }}>Rewards Hub</h1>
        <p className="text-sm mt-1" style={{ color: '#8FA3B8' }}>
          Your bonuses, all in one place.{' '}
          <button type="button" onClick={openPromotionsDrawer} className="underline" style={{ color: '#F0B232' }}>
            Special offers &amp; missions →
          </button>
        </p>
      </div>

      {/* ── VIP STATUS BAR ───────────────────────────────────── */}
      {isLoggedIn ? (
        <div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{
            background: `radial-gradient(ellipse at 0% 50%, ${tierColor}10, transparent 60%), #0F1828`,
            border: `1px solid ${tierColor}33`,
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${tierColor}18`, border: `1px solid ${tierColor}40` }}
          >
            <YalaIcon name={currentTier.icon} size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-display font-bold text-sm" style={{ color: tierColor }}>{getVIPName(user?.vipTier || 1)}</p>
              <span className="text-[10px] font-mono" style={{ color: '#8FA3B8' }}>{formatXP(xp)} XP</span>
            </div>
            {nextTier ? (
              <>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A2238' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${tierColor}, ${getVIPColor(nextTier.tier)})` }}
                  />
                </div>
                <p className="text-[10px] mt-1" style={{ color: '#8FA3B8' }}>
                  {(nextTier.xpRequired - xp).toLocaleString()} XP to {nextTier.name}
                </p>
              </>
            ) : (
              <p className="text-xs font-bold" style={{ color: getVIPColor(6) }}>Maximum tier reached 🏆</p>
            )}
          </div>
          <Link
            href="/vip"
            className="hidden sm:flex items-center gap-1 text-xs font-bold flex-shrink-0 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#F5E8C8' }}
          >
            VIP Club <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: '#0F1828', border: '1px solid rgba(240,178,50,0.20)' }}
        >
          <p className="font-bold mb-1" style={{ color: '#F5E8C8' }}>Sign in to claim your rewards</p>
          <p className="text-xs mb-3" style={{ color: '#8FA3B8' }}>Earn XP, climb tiers, unlock bonuses.</p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
          >
            Create free account
          </button>
        </div>
      )}

      {/* ── DAILY STREAK STRIP ──────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-6 rounded-full" style={{ background: '#F0B232' }} />
            <div>
              <h2 className="font-display text-lg font-black tracking-tight leading-none" style={{ color: '#F5E8C8' }}>Daily streak</h2>
              <p className="text-[10px] mt-1" style={{ color: '#8FA3B8' }}>Show up every day · resets at 00:00 UTC</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(240,178,50,0.10)', border: '1px solid rgba(240,178,50,0.28)' }}>
            <Clock className="w-3 h-3" style={{ color: '#F0B232' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA3B8' }}>resets in</span>
            <span className="text-[11px] font-mono font-black" style={{ color: '#F0B232' }}>{dailyCountdown}</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DAILY_STREAK_REWARDS.map((d) => {
            const state = d.day < renderDay
              ? 'done'
              : d.day === renderDay
                ? (canClaimDaily ? 'today' : 'done')
                : 'upcoming';
            return (
              <div
                key={d.day}
                className="rounded-lg p-2 text-center transition-all"
                style={{
                  background:
                    state === 'done'  ? 'rgba(45,201,122,0.10)' :
                    state === 'today' ? 'rgba(240,178,50,0.16)' :
                                        'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    state === 'done'  ? 'rgba(45,201,122,0.30)' :
                    state === 'today' ? 'rgba(240,178,50,0.50)' :
                                        '#1A2238'
                  }`,
                  boxShadow: state === 'today' ? '0 0 14px rgba(240,178,50,0.25)' : 'none',
                }}
              >
                <p
                  className="text-[8px] font-black uppercase tracking-widest mb-0.5"
                  style={{
                    color:
                      state === 'done'  ? '#2DC97A' :
                      state === 'today' ? '#F0B232' :
                                          '#4A5878',
                  }}
                >
                  Day {d.day}
                </p>
                <div className="flex justify-center my-1">
                  {state === 'done' ? (
                    <Check className="w-3.5 h-3.5" style={{ color: '#2DC97A' }} />
                  ) : (
                    <YalaIcon name="chip-gold" size={state === 'today' ? 18 : 14} />
                  )}
                </div>
                <p
                  className="text-[9px] font-mono font-bold"
                  style={{
                    color:
                      state === 'done'  ? '#2DC97A' :
                      state === 'today' ? '#F5E8C8' :
                                          '#4A5878',
                  }}
                >
                  {(d.gc / 1000).toFixed(d.gc < 1000 ? 1 : 0)}K
                </p>
                {d.sc > 0 && (
                  <p className="text-[9px] font-mono font-bold mt-0.5" style={{ color: state === 'today' ? '#2DC97A' : '#4A5878' }}>
                    +{d.sc} SC
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {dailyReady && (
          <button
            type="button"
            onClick={handleClaimDaily}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #F0B232, #FFD166)',
              color: '#040814',
              boxShadow: '0 4px 16px rgba(240,178,50,0.35)',
            }}
          >
            Claim Day {renderDay} · +{formatGC(todayReward.gc)} GC{todayReward.sc ? ` · +${todayReward.sc} SC` : ''}
          </button>
        )}
      </section>

      {/* ── AVAILABLE NOW (small claim rows for things that are ready) ── */}
      {claimableCount > 0 && (
        <section
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(45,201,122,0.10), rgba(240,178,50,0.06))',
            border: '1px solid rgba(45,201,122,0.30)',
            boxShadow: '0 0 24px rgba(45,201,122,0.10)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 animate-pulse" style={{ color: '#2DC97A' }} />
            <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#2DC97A' }}>
              {claimableCount} reward{claimableCount === 1 ? '' : 's'} ready
            </p>
          </div>
          <div className="space-y-2">
            {dailyReady && (
              <ClaimRow
                icon={<Calendar className="w-4 h-4" />}
                label={`Day ${pendingStreakDay} daily bonus`}
                amount={`+${formatGC(todayReward.gc)} GC${todayReward.sc ? ` · +${todayReward.sc} SC` : ''}`}
                onClaim={handleClaimDaily}
                accent="#F0B232"
              />
            )}
            {rakebackReady && (
              <ClaimRow
                icon={<TrendingUp className="w-4 h-4" />}
                label="Instant rakeback"
                amount={`+${formatGC(rakebackBalance)} GC`}
                onClaim={handleClaimRakeback}
                accent="#2DC97A"
              />
            )}
            {weeklyReady && (
              <ClaimRow
                icon={<TrendingUp className="w-4 h-4" />}
                label="Weekly bonus"
                amount={`+${WEEKLY_BONUS_SC} SC`}
                onClaim={handleClaimWeekly}
                accent="#34D399"
              />
            )}
            {monthlyReady && (
              <ClaimRow
                icon={<TrendingUp className="w-4 h-4" />}
                label="Monthly bonus"
                amount={`+${MONTHLY_BONUS_SC} SC`}
                onClaim={handleClaimMonthly}
                accent="#A78BFA"
              />
            )}
          </div>
        </section>
      )}

      {/* ── THE 3 BIG BONUS CARDS ───────────────────────────── */}
      <section>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-1 h-6 rounded-full" style={{ background: '#2DC97A' }} />
          <div>
            <h2 className="font-display text-lg font-black tracking-tight leading-none" style={{ color: '#F5E8C8' }}>Your bonuses</h2>
            <p className="text-[10px] mt-1" style={{ color: '#8FA3B8' }}>Rates scale with your VIP tier · auto-credited when ready</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <BigBonusCard
            title="Instant Rakeback"
            subtitle="Claim every 30 minutes"
            rateLabel="Tier rate"
            rate={`${currentTier.rakeback}%`}
            accent="#2DC97A"
            ready={rakebackReady}
            readyAmount={`${formatGC(rakebackBalance)} GC`}
            countdown="Live"
            onClaim={handleClaimRakeback}
            isLoggedIn={isLoggedIn}
          />
          <BigBonusCard
            title="Weekly Bonus"
            subtitle="10% of net losses · Mon 00:00 UTC"
            rateLabel="Weekly rate"
            rate="10%"
            accent="#34D399"
            ready={weeklyReady}
            readyAmount={`${WEEKLY_BONUS_SC.toFixed(2)} SC`}
            countdown={weeklyCountdown}
            onClaim={handleClaimWeekly}
            isLoggedIn={isLoggedIn}
          />
          <BigBonusCard
            title="Monthly Bonus"
            subtitle={`${currentTier.rakeback}% net losses · 1st 00:00 UTC`}
            rateLabel="Tier rate"
            rate={`${currentTier.rakeback}%`}
            accent="#A78BFA"
            ready={monthlyReady}
            readyAmount={`${MONTHLY_BONUS_SC.toFixed(2)} SC`}
            countdown={monthlyCountdown}
            onClaim={handleClaimMonthly}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </section>

      {/* ── SPECIAL OFFERS LINK ─────────────────────────────── */}
      <button
        type="button"
        onClick={openPromotionsDrawer}
        className="w-full flex items-center justify-between gap-3 rounded-2xl p-4 transition-colors hover:bg-white/[0.025] text-left"
        style={{ background: '#0F1828', border: '1px solid #1A2238' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(240,178,50,0.10)', border: '1px solid rgba(240,178,50,0.30)' }}
          >
            <Gift className="w-5 h-5" style={{ color: '#F0B232' }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Special offers &amp; missions</p>
            <p className="text-[11px]" style={{ color: '#8FA3B8' }}>Welcome pack, tournaments, referrals, daily missions.</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA3B8' }} />
      </button>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2238' }}>
        <p className="text-[11px]" style={{ color: 'rgba(143,163,184,0.5)' }}>
          No Purchase Necessary · 18+ · Gold Coins have no cash value · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function BigBonusCard({
  title, subtitle, rateLabel, rate, accent, ready, readyAmount, countdown, onClaim, isLoggedIn,
}: {
  title: string;
  subtitle: string;
  rateLabel: string;
  rate: string;
  accent: string;
  ready: boolean;
  readyAmount: string;
  countdown: string;
  onClaim: () => void;
  isLoggedIn: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all"
      style={{
        background: '#0F1828',
        border: `1px solid ${ready ? `${accent}55` : '#1A2238'}`,
        boxShadow: ready ? `0 0 20px ${accent}1A` : 'none',
      }}
    >
      <div>
        <p className="font-display font-black text-base leading-tight" style={{ color: '#F5E8C8' }}>{title}</p>
        <p className="text-[10px] mt-0.5" style={{ color: '#8FA3B8' }}>{subtitle}</p>
      </div>

      <div className="flex items-center justify-between text-[11px]" style={{ borderTop: '1px solid #1A2238', paddingTop: 10 }}>
        <span style={{ color: '#8FA3B8' }}>{rateLabel}</span>
        <span className="font-mono font-black" style={{ color: accent }}>{rate}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#8FA3B8' }}>Ready</p>
          <p className="font-mono font-black text-lg leading-tight mt-0.5" style={{ color: ready ? accent : '#4A5878' }}>
            {ready ? readyAmount : '0.00'}
          </p>
        </div>
        {ready ? (
          <button
            type="button"
            onClick={onClaim}
            className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-black transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: '#040814',
              boxShadow: `0 4px 14px ${accent}40`,
            }}
          >
            Claim
          </button>
        ) : (
          <div
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-lg text-[10px] font-mono font-bold"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2238', color: '#8FA3B8' }}
          >
            <Clock className="w-3 h-3" />
            {isLoggedIn ? countdown : '—'}
          </div>
        )}
      </div>
    </div>
  );
}

function ClaimRow({
  icon, label, amount, onClaim, accent,
}: {
  icon: React.ReactNode;
  label: string;
  amount: string;
  onClaim: () => void;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3"
      style={{ background: '#0F1828', border: `1px solid ${accent}30` }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: '#F5E8C8' }}>{label}</p>
        <p className="text-[11px] font-mono font-bold" style={{ color: accent }}>{amount}</p>
      </div>
      <button
        type="button"
        onClick={onClaim}
        className="px-3 py-2 rounded-lg text-xs font-black transition-all hover:brightness-110 active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          color: '#040814',
          boxShadow: `0 3px 12px ${accent}40`,
        }}
      >
        Claim
      </button>
    </div>
  );
}
