'use client';

/**
 * /rewards — Rewards Hub.
 *
 * Restructured around the pattern every major sweeps / crypto casino converges
 * on (Stake, Roobet, Rainbet, Chumba, BC.Game):
 *
 *   [VIP status header]
 *   [Available now ribbon]      → things claimable RIGHT NOW
 *   [Daily section]              → streak calendar + daily race + missions
 *   [Weekly section]             → weekly cashback timer + weekly race
 *   [Monthly section]            → monthly cashback % + level-up + tournament
 *   [Special / promotions]       → promo code redeem + featured promos
 *
 * Each time-anchored section shows a countdown to its reset so the user knows
 * how long they have to act.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight, Calendar, Trophy, Crown, TrendingUp, Gift, Sparkles,
  Clock, Check, Tag, Users,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { formatGC, formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { PROMOTIONS, type Promotion } from '@/lib/mock-data/promotions';
import { PromoCard } from '@/components/rewards/PromoCard';
import { YalaIcon } from '@/components/ui/YalaIcon';
import {
  msUntilNextDailyResetUTC,
  msUntilNextWeeklyResetUTC,
  msUntilNextMonthlyResetUTC,
  formatDuration,
} from '@/lib/time';
import { toast } from 'sonner';

// Hook: updates a live countdown to a given reset every second.
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

const DAILY_STREAK_REWARDS = [
  { day: 1, gc: 1_000 },
  { day: 2, gc: 1_500 },
  { day: 3, gc: 2_000 },
  { day: 4, gc: 2_500, sc: 1 },
  { day: 5, gc: 3_000 },
  { day: 6, gc: 4_000 },
  { day: 7, gc: 7_500, sc: 5 },
];

const DEMO_STREAK_DAY = 4; // Mock — assume the user is on day 4 of their 7-day streak.

export default function RewardsPage() {
  const { isLoggedIn, user }                = useAuthStore();
  const { xp, rakebackBalance, claimRakeback, addGC, addSC } = useWalletStore();
  const { openAuthModal }                   = useUIStore();
  const [claimed, setClaimed]               = useState<Record<string, boolean>>({});
  const [code, setCode]                     = useState('');

  const dailyCountdown   = useCountdown(msUntilNextDailyResetUTC);
  const weeklyCountdown  = useCountdown(msUntilNextWeeklyResetUTC);
  const monthlyCountdown = useCountdown(msUntilNextMonthlyResetUTC);

  // VIP progress
  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier    = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress    = nextTier
    ? Math.max(0, Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100))
    : 100;
  const tierColor = getVIPColor(user?.vipTier || 1);

  // Things claimable right now
  const dailyReady    = !claimed.daily;
  const rakebackReady = rakebackBalance > 0 && !claimed.rakeback;
  const claimableCount = (dailyReady ? 1 : 0) + (rakebackReady ? 1 : 0);

  // Active promos for the bottom row
  const featuredPromos: Promotion[] = useMemo(() => PROMOTIONS.slice(0, 3), []);

  const handleClaimDaily = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    const reward = DAILY_STREAK_REWARDS[DEMO_STREAK_DAY - 1];
    if (reward.gc) addGC(reward.gc);
    if (reward.sc) addSC(reward.sc);
    setClaimed((c) => ({ ...c, daily: true }));
    toast.success(`Day ${DEMO_STREAK_DAY} bonus claimed`, {
      description: `+${formatGC(reward.gc)} GC${reward.sc ? ` · +${reward.sc} SC` : ''}`,
    });
  };

  const handleClaimRakeback = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (rakebackBalance <= 0) return;
    const amount = rakebackBalance;
    claimRakeback();
    setClaimed((c) => ({ ...c, rakeback: true }));
    toast.success('Rakeback claimed', { description: `+${formatGC(amount)} GC to your bonus balance.` });
  };

  const handlePromoClaim = (promo: Promotion) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (promo.gcBonus) addGC(promo.gcBonus);
    if (promo.scBonus) addSC(promo.scBonus);
    toast.success(`Claimed: ${promo.title}`);
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* ── HEADER + VIP STATUS ───────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <YalaIcon name="gift" size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F0B232' }}>Rewards</span>
        </div>
        <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: '#F5E8C8' }}>Rewards Hub</h1>
        <p className="text-sm mt-1" style={{ color: '#8FA899' }}>Daily, weekly, and monthly drops. Everything you&apos;ve earned in one place.</p>
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
      {isLoggedIn && claimableCount > 0 && (
        <section
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(45,201,122,0.10), rgba(240,178,50,0.06))',
            border: '1px solid rgba(45,201,122,0.30)',
            boxShadow: '0 0 24px rgba(45,201,122,0.10)',
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" style={{ color: '#2DC97A' }} />
              <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#2DC97A' }}>
                {claimableCount} reward{claimableCount === 1 ? '' : 's'} ready
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dailyReady && (
              <ClaimRow
                icon={<Calendar className="w-4 h-4" />}
                label={`Day ${DEMO_STREAK_DAY} daily bonus`}
                amount={`+${formatGC(DAILY_STREAK_REWARDS[DEMO_STREAK_DAY - 1].gc)} GC${DAILY_STREAK_REWARDS[DEMO_STREAK_DAY - 1].sc ? ` · +${DAILY_STREAK_REWARDS[DEMO_STREAK_DAY - 1].sc} SC` : ''}`}
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

      {/* ── DAILY SECTION ──────────────────────────────────── */}
      <Section
        title="Daily"
        subtitle="Resets every 24 hours at 00:00 UTC"
        countdown={dailyCountdown}
        countdownLabel="resets in"
        accent="#F0B232"
      >
        {/* Streak calendar */}
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {DAILY_STREAK_REWARDS.map((d) => {
            const state = d.day < DEMO_STREAK_DAY ? 'done' : d.day === DEMO_STREAK_DAY ? 'today' : 'upcoming';
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
                                        '#1A2E22'
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
                                          '#4A6A55',
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
                                          '#4A6A55',
                  }}
                >
                  {(d.gc / 1000).toFixed(d.gc < 1000 ? 1 : 0)}K
                </p>
                {d.sc && (
                  <p className="text-[9px] font-mono font-bold mt-0.5" style={{ color: state === 'today' ? '#2DC97A' : '#4A6A55' }}>
                    +{d.sc} SC
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RewardCard
            icon={<Calendar className="w-5 h-5" />}
            accent="#F0B232"
            title="Daily login bonus"
            description={`Day ${DEMO_STREAK_DAY} of 7 — claim today to keep your streak alive.`}
            href="/daily-bonus"
            ready={dailyReady}
            primaryLabel={dailyReady ? 'Claim today' : 'Claimed today'}
            onPrimary={handleClaimDaily}
            primaryDisabled={!dailyReady}
          />
          <RewardCard
            icon={<Trophy className="w-5 h-5" />}
            accent="#EF4444"
            title="Daily race"
            description="Wager GC to climb the daily leaderboard. Top 100 split a 500K GC pool."
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
          <RewardCard
            icon={<TrendingUp className="w-5 h-5" />}
            accent="#2DC97A"
            title="Instant rakeback"
            description="A small slice of every wager is returned to your bonus balance, immediately."
            href="/rakeback"
            badge={rakebackBalance > 0 ? `${formatGC(rakebackBalance)} ready` : undefined}
            ready={rakebackReady}
            primaryLabel={rakebackReady ? 'Claim' : 'How it works'}
            onPrimary={rakebackReady ? handleClaimRakeback : undefined}
          />
        </div>
      </Section>

      {/* ── WEEKLY SECTION ────────────────────────────────── */}
      <Section
        title="Weekly"
        subtitle="Resets every Monday at 00:00 UTC"
        countdown={weeklyCountdown}
        countdownLabel="resets in"
        accent="#34D399"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RewardCard
            icon={<TrendingUp className="w-5 h-5" />}
            accent="#2DC97A"
            title="Weekly cashback"
            description="Get back 10% of net GC losses every Monday. Calculated automatically."
            href="/rakeback"
            badge="10%"
          />
          <RewardCard
            icon={<Trophy className="w-5 h-5" />}
            accent="#F0B232"
            title="Weekly race"
            description="A bigger pool, slower pace. Wager all week to climb the standings."
            href="/leaderboards"
            badge="Open"
          />
          <RewardCard
            icon={<YalaIcon name="badge-star" size={20} />}
            accent="#A78BFA"
            title="Weekly mission pack"
            description="5 harder missions that refresh every Monday. Higher rewards than daily."
            href="/missions"
            badge="5 open"
          />
          <RewardCard
            icon={<Gift className="w-5 h-5" />}
            accent="#FB923C"
            title="Weekend reload"
            description="+20% bonus on any GC purchase Friday through Sunday."
            href="/wallet/buy"
            badge="Fri–Sun"
          />
        </div>
      </Section>

      {/* ── MONTHLY SECTION ───────────────────────────────── */}
      <Section
        title="Monthly"
        subtitle="Resets on the first of each month, 00:00 UTC"
        countdown={monthlyCountdown}
        countdownLabel="resets in"
        accent="#A78BFA"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RewardCard
            icon={<TrendingUp className="w-5 h-5" />}
            accent="#2DC97A"
            title="Monthly cashback"
            description="Tier-gated cashback on net losses. Higher VIP = bigger %. Auto-credited."
            href="/vip"
            badge={`${currentTier.rakeback}% your tier`}
          />
          <RewardCard
            icon={<Crown className="w-5 h-5" />}
            accent="#FFD166"
            title="Level-up bonuses"
            description="Cross a VIP tier and unlock a one-time GC + SC drop, plus permanent perk upgrades."
            href="/vip"
            badge="Tier rewards"
          />
          <RewardCard
            icon={<Trophy className="w-5 h-5" />}
            accent="#EF4444"
            title="Monthly tournament"
            description="A multi-day Originals bracket with the biggest prize pool of the month."
            href="/leaderboards"
          />
          <RewardCard
            icon={<Sparkles className="w-5 h-5" />}
            accent="#F472B6"
            title="Birthday bonus"
            description="Tell us your birthday in profile — we&apos;ll send a bonus drop that morning."
            href="/profile"
            badge="Set in profile"
          />
        </div>
      </Section>

      {/* ── SPECIAL / PROMO CODE ──────────────────────────── */}
      <Section
        title="Special"
        subtitle="One-off offers, codes, and referrals"
        accent="#60A5FA"
      >
        <div
          className="rounded-2xl p-4 mb-3"
          style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.30)' }}
              >
                <Tag className="w-4 h-4" style={{ color: '#60A5FA' }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Have a promo code?</p>
                <p className="text-[11px]" style={{ color: '#8FA899' }}>Redeem on the Promotions page for instant GC / SC.</p>
              </div>
            </div>
            <div className="flex items-stretch gap-2 sm:w-[360px]">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm font-mono font-bold tracking-wider uppercase focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
              />
              <Link
                href={code ? `/promotions?code=${encodeURIComponent(code)}` : '/promotions'}
                className="px-4 py-2.5 rounded-xl text-sm font-black transition-colors hover:brightness-110 flex items-center"
                style={{ background: 'rgba(96,165,250,0.14)', border: '1px solid rgba(96,165,250,0.40)', color: '#60A5FA' }}
              >
                Open <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RewardCard
            icon={<Users className="w-5 h-5" />}
            accent="#60A5FA"
            title="Refer a friend"
            description="Send your code. Earn 5,000 GC when they make their first purchase. No cap."
            href="/affiliate"
            badge="Evergreen"
          />
          <RewardCard
            icon={<Gift className="w-5 h-5" />}
            accent="#F0B232"
            title="All promotions"
            description="Browse every active offer — reload, race, cashback, VIP, referral, more."
            href="/promotions"
            badge={`${PROMOTIONS.length} active`}
          />
        </div>
      </Section>

      {/* ── FEATURED PROMOTIONS ──────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #F0B232, #2DC97A)' }} />
            <h2 className="font-display text-lg font-bold" style={{ color: '#F5E8C8' }}>Featured promotions</h2>
          </div>
          <Link
            href="/promotions"
            className="text-[11px] font-bold flex items-center gap-0.5"
            style={{ color: '#F0B232' }}
          >
            See all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featuredPromos.map((p, i) => (
            <PromoCard key={p.id} promo={p} index={i} onClaim={handlePromoClaim} />
          ))}
        </div>
      </section>

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
  title, subtitle, countdown, countdownLabel, accent, children,
}: {
  title: string;
  subtitle?: string;
  countdown?: string;
  countdownLabel?: string;
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
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA899' }}>
              {countdownLabel ?? 'in'}
            </span>
            <span className="text-[11px] font-mono font-black" style={{ color: accent }}>{countdown}</span>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

function RewardCard({
  icon, accent, title, description, href, badge, ready, primaryLabel, onPrimary, primaryDisabled,
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
  primaryDisabled?: boolean;
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
        {primaryLabel ? (
          <button
            type="button"
            disabled={primaryDisabled}
            onClick={onPrimary}
            className="flex-1 py-2 rounded-lg text-xs font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
