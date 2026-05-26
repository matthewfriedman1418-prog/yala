'use client';

/**
 * /rewards — Rewards Hub. Slimmed down per simplification pass.
 *
 *   [VIP status bar]
 *   [Available now ribbon]   → conditional, only if something is claimable
 *   [Daily section]          → 3 cards · live countdown to 00:00 UTC
 *   [Weekly section]         → 3 cards · live countdown to next Monday
 *   [Monthly section]        → 3 cards · live countdown to 1st of next month
 *   [Footer link]            → "All promotions →"
 *
 * The 7-day streak calendar moved out (lives on /daily-bonus where it belongs).
 * The Special section and promo code input were removed — promo codes aren't
 * a core sweeps mechanic for us. Daily claim state is shared with /daily-bonus
 * through the rewards store so both pages stay in sync.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight, Calendar, Trophy, Crown, TrendingUp, Gift, Sparkles,
  Clock,
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

// Daily reward table — must match /daily-bonus
const DAILY_STREAK_REWARDS = [
  { day: 1, gc: 1_000,  sc: 0 },
  { day: 2, gc: 1_500,  sc: 0 },
  { day: 3, gc: 2_000,  sc: 0 },
  { day: 4, gc: 2_500,  sc: 1 },
  { day: 5, gc: 3_000,  sc: 0 },
  { day: 6, gc: 4_000,  sc: 0 },
  { day: 7, gc: 7_500,  sc: 5 },
];

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
  const { isLoggedIn, user }                = useAuthStore();
  const { xp, rakebackBalance, claimRakeback, addGC, addSC } = useWalletStore();
  const { openAuthModal, openPromotionsDrawer } = useUIStore();
  const canClaimDaily                       = useRewardsStore((s) => s.canClaimDailyToday());
  const pendingStreakDay                    = useRewardsStore((s) => s.pendingStreakDay());
  const claimDaily                          = useRewardsStore((s) => s.claimDaily);

  const dailyCountdown   = useCountdown(msUntilNextDailyResetUTC);
  const weeklyCountdown  = useCountdown(msUntilNextWeeklyResetUTC);
  const monthlyCountdown = useCountdown(msUntilNextMonthlyResetUTC);

  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier    = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress    = nextTier
    ? Math.max(0, Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100))
    : 100;
  const tierColor = getVIPColor(user?.vipTier || 1);

  const todayReward    = DAILY_STREAK_REWARDS[Math.min(pendingStreakDay - 1, 6)];
  const dailyReady     = isLoggedIn && canClaimDaily;
  const rakebackReady  = isLoggedIn && rakebackBalance > 0;
  const claimableCount = (dailyReady ? 1 : 0) + (rakebackReady ? 1 : 0);

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

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <YalaIcon name="gift" size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F0B232' }}>Rewards</span>
        </div>
        <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: '#F5E8C8' }}>Rewards Hub</h1>
        <p className="text-sm mt-1" style={{ color: '#8FA899' }}>Daily, weekly, and monthly drops · everything in one place.</p>
      </div>

      {/* VIP status bar */}
      {isLoggedIn ? (
        <div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{
            background: `radial-gradient(ellipse at 0% 50%, ${tierColor}10, transparent 60%), #0F1A14`,
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
              <p className="font-display font-bold text-sm" style={{ color: tierColor }}>
                {getVIPName(user?.vipTier || 1)}
              </p>
              <span className="text-[10px] font-mono" style={{ color: '#8FA899' }}>{formatXP(xp)} XP</span>
            </div>
            {nextTier ? (
              <>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A2E22' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${tierColor}, ${getVIPColor(nextTier.tier)})` }}
                  />
                </div>
                <p className="text-[10px] mt-1" style={{ color: '#8FA899' }}>
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
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
          >
            VIP Club <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: '#0F1A14', border: '1px solid rgba(240,178,50,0.20)' }}
        >
          <p className="font-bold mb-1" style={{ color: '#F5E8C8' }}>Sign in to claim your rewards</p>
          <p className="text-xs mb-3" style={{ color: '#8FA899' }}>Earn XP, climb tiers, unlock daily bonuses and cashback.</p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
          >
            Create free account
          </button>
        </div>
      )}

      {/* ── AVAILABLE NOW RIBBON ───────────────────────────── */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                label="Rakeback ready"
                amount={`+${formatGC(rakebackBalance)} GC`}
                onClaim={handleClaimRakeback}
                accent="#2DC97A"
              />
            )}
          </div>
        </section>
      )}

      {/* ── DAILY ──────────────────────────────────────────── */}
      <Section
        title="Daily"
        subtitle="Resets every 24 hours at 00:00 UTC"
        countdown={dailyCountdown}
        accent="#F0B232"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <RewardCard
            icon={<Calendar className="w-5 h-5" />}
            accent="#F0B232"
            title="Daily bonus"
            description={
              dailyReady
                ? `Day ${pendingStreakDay} of 7 — claim today to keep the streak.`
                : 'You\'ve claimed today. Streak resumes tomorrow.'
            }
            href="/daily-bonus"
            ready={dailyReady}
            primaryLabel={dailyReady ? 'Claim' : 'View streak'}
            primaryHref={dailyReady ? undefined : '/daily-bonus'}
            onPrimary={dailyReady ? handleClaimDaily : undefined}
          />
          <RewardCard
            icon={<Trophy className="w-5 h-5" />}
            accent="#EF4444"
            title="Daily race"
            description="Wager SC to climb the daily leaderboard. Top 100 split the prize pool."
            href="/leaderboards"
            badge="Live"
          />
          <RewardCard
            icon={<YalaIcon name="badge-star" size={20} />}
            accent="#A78BFA"
            title="Daily missions"
            description="3 quick tasks refresh every day. Each grants GC + XP."
            href="/missions"
            badge="3 open"
          />
        </div>
      </Section>

      {/* ── WEEKLY ─────────────────────────────────────────── */}
      <Section
        title="Weekly"
        subtitle="Resets every Monday at 00:00 UTC"
        countdown={weeklyCountdown}
        accent="#34D399"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <RewardCard
            icon={<TrendingUp className="w-5 h-5" />}
            accent="#2DC97A"
            title="Weekly cashback"
            description="Get back 10% of net GC losses every Monday. Auto-credited."
            href="/rakeback"
            badge="10%"
          />
          <RewardCard
            icon={<Trophy className="w-5 h-5" />}
            accent="#F0B232"
            title="Weekly race"
            description="Bigger pool, slower pace. Wager all week to climb."
            href="/leaderboards"
            badge="Open"
          />
          <RewardCard
            icon={<YalaIcon name="badge-star" size={20} />}
            accent="#A78BFA"
            title="Weekly missions"
            description="5 harder missions, refresh Monday. Bigger rewards than daily."
            href="/missions"
            badge="5 open"
          />
        </div>
      </Section>

      {/* ── MONTHLY ────────────────────────────────────────── */}
      <Section
        title="Monthly"
        subtitle="Resets on the first of each month, 00:00 UTC"
        countdown={monthlyCountdown}
        accent="#A78BFA"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <RewardCard
            icon={<TrendingUp className="w-5 h-5" />}
            accent="#2DC97A"
            title="Monthly cashback"
            description="Tier-gated cashback on net losses. Higher VIP = bigger %."
            href="/vip"
            badge={`${currentTier.rakeback}% · your tier`}
          />
          <RewardCard
            icon={<Crown className="w-5 h-5" />}
            accent="#FFD166"
            title="Level-up bonuses"
            description="Cross a VIP tier for a one-time GC + SC drop plus permanent perks."
            href="/vip"
            badge="Tier rewards"
          />
          <RewardCard
            icon={<Trophy className="w-5 h-5" />}
            accent="#EF4444"
            title="Monthly tournament"
            description="A multi-day Originals bracket with the biggest pool of the month."
            href="/leaderboards"
          />
        </div>
      </Section>

      {/* ── FOOTER LINK ────────────────────────────────────── */}
      <button
        type="button"
        onClick={openPromotionsDrawer}
        className="w-full flex items-center justify-between gap-3 rounded-2xl p-4 transition-colors hover:bg-white/[0.025] text-left"
        style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
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
            <p className="text-[11px]" style={{ color: '#8FA899' }}>Welcome pack, tournaments, referral, daily missions.</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA899' }} />
      </button>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-[11px]" style={{ color: 'rgba(143,168,153,0.5)' }}>
          No Purchase Necessary · 18+ · Gold Coins have no cash value · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function Section({
  title, subtitle, countdown, accent, children,
}: {
  title: string;
  subtitle?: string;
  countdown?: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full" style={{ background: accent }} />
          <div>
            <h2 className="font-display text-lg font-black tracking-tight leading-none" style={{ color: '#F5E8C8' }}>{title}</h2>
            {subtitle && <p className="text-[10px] mt-1" style={{ color: '#8FA899' }}>{subtitle}</p>}
          </div>
        </div>
        {countdown && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: `${accent}10`, border: `1px solid ${accent}28` }}
          >
            <Clock className="w-3 h-3" style={{ color: accent }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA899' }}>resets in</span>
            <span className="text-[11px] font-mono font-black" style={{ color: accent }}>{countdown}</span>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

function RewardCard({
  icon, accent, title, description, href, badge, ready, primaryLabel, onPrimary, primaryHref,
}: {
  icon: React.ReactNode;
  accent: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  ready?: boolean;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryHref?: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all"
      style={{
        background: '#0F1A14',
        border: `1px solid ${ready ? `${accent}55` : '#1A2E22'}`,
        boxShadow: ready ? `0 0 20px ${accent}1A` : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}14`, border: `1px solid ${accent}33`, color: accent }}
        >
          {icon}
        </div>
        {badge && (
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}33` }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: '#F5E8C8' }}>{title}</p>
        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#8FA899' }}>{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {primaryLabel && primaryHref ? (
          <Link
            href={primaryHref}
            className="flex-1 py-2 rounded-lg text-xs font-black transition-all hover:brightness-110 active:scale-[0.98] text-center"
            style={{
              background: `${accent}14`,
              color: accent,
              border: `1px solid ${accent}40`,
            }}
          >
            {primaryLabel}
          </Link>
        ) : primaryLabel ? (
          <button
            type="button"
            onClick={onPrimary}
            className="flex-1 py-2 rounded-lg text-xs font-black transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: ready ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : `${accent}14`,
              color: ready ? '#060E0A' : accent,
              border: ready ? 'none' : `1px solid ${accent}40`,
              boxShadow: ready ? `0 4px 14px ${accent}40` : 'none',
            }}
          >
            {primaryLabel}
          </button>
        ) : null}
        <Link
          href={href}
          className="flex items-center gap-1 text-[11px] font-bold px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#8FA899' }}
        >
          Details <ChevronRight className="w-3 h-3" />
        </Link>
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
      style={{ background: '#0F1A14', border: `1px solid ${accent}30` }}
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
          color: '#060E0A',
          boxShadow: `0 3px 12px ${accent}40`,
        }}
      >
        Claim
      </button>
    </div>
  );
}
