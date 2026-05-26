'use client';

/**
 * RewardsDrawer — slide-in panel that surfaces the three bonus tiers
 * (Instant Rakeback / Weekly Bonus / Monthly Bonus) plus the daily login
 * streak. Anchored to the Gift icon next to the bell in the header.
 *
 * Style mirrors Shuffle's reward drawer: VIP progress on top, then the
 * three bonus cards stacked, then a redeem-code stub and a link out to the
 * full Rewards Hub.
 */

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useRewardsStore } from '@/lib/store/rewards';
import { useModalA11y } from '@/lib/hooks/useModalA11y';
import { formatGC, formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { YalaIcon } from '@/components/ui/YalaIcon';
import {
  X, Clock, ChevronRight, Check, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const WEEKLY_BONUS_SC  = 5;
const MONTHLY_BONUS_SC = 25;

// Mock the 7-day reward ladder so the streak strip can show "what you get today".
const STREAK_REWARD_GC = [1_000, 1_500, 2_000, 2_500, 3_000, 4_000, 7_500];
const STREAK_REWARD_SC = [0, 0, 0, 1, 0, 0, 5];

export function RewardsDrawer() {
  const { rewardsDrawerOpen, closeRewardsDrawer, openAuthModal } = useUIStore();
  const { isLoggedIn, user } = useAuthStore();
  const { xp, rakebackBalance, claimRakeback, addGC, addSC } = useWalletStore();
  const canClaimDaily    = useRewardsStore((s) => s.canClaimDailyToday());
  const pendingStreakDay = useRewardsStore((s) => s.pendingStreakDay());
  const streakDay        = useRewardsStore((s) => s.streakDay);
  const claimDaily       = useRewardsStore((s) => s.claimDaily);
  const canClaimWeekly   = useRewardsStore((s) => s.canClaimWeekly());
  const canClaimMonthly  = useRewardsStore((s) => s.canClaimMonthly());
  const claimWeekly      = useRewardsStore((s) => s.claimWeekly);
  const claimMonthly     = useRewardsStore((s) => s.claimMonthly);
  useModalA11y(rewardsDrawerOpen, closeRewardsDrawer);

  // Stable day of streak for rendering (whether claiming or already claimed today)
  const renderDay = canClaimDaily ? pendingStreakDay : (streakDay || 1);

  // VIP progress
  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier    = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress    = nextTier
    ? Math.max(0, Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100))
    : 100;
  const tierColor = getVIPColor(user?.vipTier || 1);

  const handleClaimDaily = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (!canClaimDaily) return;
    const gc = STREAK_REWARD_GC[renderDay - 1];
    const sc = STREAK_REWARD_SC[renderDay - 1];
    if (gc) addGC(gc);
    if (sc) addSC(sc);
    const day = claimDaily();
    toast.success(`Day ${day} bonus claimed`, {
      description: `+${formatGC(gc)} GC${sc ? ` · +${sc} SC` : ''}`,
    });
  };

  const handleClaimInstant = () => {
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
    toast.success('Weekly bonus claimed', { description: `+${WEEKLY_BONUS_SC} SC. Next claim available Monday 00:00 UTC.` });
  };

  const handleClaimMonthly = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (!canClaimMonthly) return;
    addSC(MONTHLY_BONUS_SC);
    claimMonthly();
    toast.success('Monthly bonus claimed', { description: `+${MONTHLY_BONUS_SC} SC. Next claim on the 1st 00:00 UTC.` });
  };

  return (
    <AnimatePresence>
      {rewardsDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 top-14 bg-black/55 z-40"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={closeRewardsDrawer}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-14 bottom-0 w-[420px] max-w-[92vw] z-40 flex flex-col"
            style={{ backgroundColor: '#0C1812', borderLeft: '1px solid #1A2E22' }}
            role="dialog"
            aria-modal="true"
            aria-label="Rewards"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #1A2E22' }}>
              <div className="flex items-center gap-2">
                <YalaIcon name="gift" size={16} />
                <span className="font-display font-bold" style={{ color: '#F5E8C8' }}>Rewards</span>
              </div>
              <button onClick={closeRewardsDrawer} aria-label="Close" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: '#8FA899' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {/* VIP progress */}
              {isLoggedIn ? (
                <div
                  className="m-4 rounded-2xl p-4"
                  style={{
                    background: `radial-gradient(ellipse at 0% 50%, ${tierColor}14, transparent 65%), #0F1A14`,
                    border: `1px solid ${tierColor}33`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${tierColor}18`, border: `1px solid ${tierColor}40` }}
                    >
                      <YalaIcon name={currentTier.icon} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA899' }}>Your VIP Progress</p>
                      <p className="font-display font-bold text-sm" style={{ color: tierColor }}>{getVIPName(user?.vipTier || 1)}</p>
                    </div>
                    <span className="font-mono font-black text-sm flex-shrink-0" style={{ color: tierColor }}>
                      {progress.toFixed(2)}%
                    </span>
                  </div>
                  {nextTier ? (
                    <>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A2E22' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${tierColor}, ${getVIPColor(nextTier.tier)})` }}
                        />
                      </div>
                      <p className="text-[10px] mt-1.5 flex items-center justify-between" style={{ color: '#8FA899' }}>
                        <span>{formatXP(xp)} XP</span>
                        <span>{(nextTier.xpRequired - xp).toLocaleString()} XP to {nextTier.name}</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-xs font-bold text-center" style={{ color: getVIPColor(6) }}>Maximum tier reached 🏆</p>
                  )}
                </div>
              ) : (
                <div
                  className="m-4 rounded-2xl p-5 text-center"
                  style={{ background: '#0F1A14', border: '1px solid rgba(240,178,50,0.20)' }}
                >
                  <p className="font-bold mb-1" style={{ color: '#F5E8C8' }}>Sign in to claim rewards</p>
                  <p className="text-[11px] mb-3" style={{ color: '#8FA899' }}>Earn XP, climb tiers, unlock bonuses.</p>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
                  >
                    Create free account
                  </button>
                </div>
              )}

              {/* Daily streak strip */}
              <div className="mx-4 mb-2">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" style={{ color: '#F0B232' }} />
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F5E8C8' }}>
                      Daily streak
                    </p>
                  </div>
                  <Link
                    href="/daily-bonus"
                    onClick={closeRewardsDrawer}
                    className="text-[10px] font-bold flex items-center gap-0.5"
                    style={{ color: '#F0B232' }}
                  >
                    Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex items-center justify-between gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                    const state = d < renderDay
                      ? 'done'
                      : d === renderDay
                        ? (canClaimDaily ? 'today' : 'done')
                        : 'upcoming';
                    return (
                      <div
                        key={d}
                        className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg"
                        style={{
                          background:
                            state === 'done'  ? 'rgba(45,201,122,0.08)' :
                            state === 'today' ? 'rgba(240,178,50,0.14)' :
                                                'transparent',
                          border: `1px solid ${
                            state === 'done'  ? 'rgba(45,201,122,0.28)' :
                            state === 'today' ? 'rgba(240,178,50,0.45)' :
                                                'transparent'
                          }`,
                          boxShadow: state === 'today' ? '0 0 12px rgba(240,178,50,0.22)' : 'none',
                        }}
                      >
                        <span
                          className="text-[8px] font-black uppercase"
                          style={{
                            color:
                              state === 'done'  ? '#2DC97A' :
                              state === 'today' ? '#F0B232' :
                                                  '#4A6A55',
                          }}
                        >
                          {d}
                        </span>
                        {state === 'done' ? (
                          <Check className="w-3 h-3" style={{ color: '#2DC97A' }} />
                        ) : (
                          <YalaIcon name="chip-gold" size={state === 'today' ? 14 : 10} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {canClaimDaily && (
                  <button
                    type="button"
                    onClick={handleClaimDaily}
                    className="w-full mt-2 py-2 rounded-lg text-[11px] font-black transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #F0B232, #FFD166)',
                      color: '#060E0A',
                      boxShadow: '0 3px 12px rgba(240,178,50,0.35)',
                    }}
                  >
                    Claim Day {renderDay} · +{formatGC(STREAK_REWARD_GC[renderDay - 1])} GC{STREAK_REWARD_SC[renderDay - 1] ? ` · +${STREAK_REWARD_SC[renderDay - 1]} SC` : ''}
                  </button>
                )}
              </div>

              {/* The 3 main bonus cards */}
              <div className="mx-4 mt-4 space-y-3">
                <BonusCard
                  title="Instant Rakeback"
                  subtitle="Claim every 30 minutes"
                  rateText={`${currentTier.rakeback}% your tier`}
                  ready={rakebackBalance > 0}
                  readyAmount={`${formatGC(rakebackBalance)} GC`}
                  countdown="Live"
                  onClaim={handleClaimInstant}
                  accent="#2DC97A"
                />
                <BonusCard
                  title="Weekly Bonus"
                  subtitle="10% of net losses · Mon 00:00 UTC"
                  rateText="10% rate"
                  ready={canClaimWeekly}
                  readyAmount={`${WEEKLY_BONUS_SC.toFixed(2)} SC`}
                  countdown="Resets weekly"
                  onClaim={handleClaimWeekly}
                  accent="#34D399"
                />
                <BonusCard
                  title="Monthly Bonus"
                  subtitle={`${currentTier.rakeback}% net losses · 1st 00:00 UTC`}
                  rateText={`${currentTier.rakeback}% tier rate`}
                  ready={canClaimMonthly}
                  readyAmount={`${MONTHLY_BONUS_SC.toFixed(2)} SC`}
                  countdown="Resets monthly"
                  onClaim={handleClaimMonthly}
                  accent="#A78BFA"
                />
              </div>

              {/* Redeem code stub */}
              <div className="m-4 rounded-2xl p-4" style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#F5E8C8' }}>Redeem code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        toast.error('Codes are issued from in-app promotions', { description: 'Watch the Promotions drawer for new ones.' });
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
                  />
                  <button
                    type="button"
                    onClick={() => toast.error('Codes are issued from in-app promotions', { description: 'Watch the Promotions drawer for new ones.' })}
                    className="px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#8FA899' }}
                  >
                    Redeem
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 pb-5">
                <Link
                  href="/rewards"
                  onClick={closeRewardsDrawer}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-black transition-colors hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
                    color: '#060E0A',
                    boxShadow: '0 4px 16px rgba(45,201,122,0.35)',
                  }}
                >
                  View full Rewards Hub <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="px-5 pb-6 text-center">
                <p className="text-[10px]" style={{ color: 'rgba(143,168,153,0.45)' }}>
                  18+ · No Purchase Necessary · Void Where Prohibited
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function BonusCard({
  title, subtitle, rateText, ready, readyAmount, countdown, onClaim, accent,
}: {
  title: string;
  subtitle: string;
  rateText: string;
  ready: boolean;
  readyAmount: string;
  countdown: string;
  onClaim: () => void;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: '#0F1A14',
        border: `1px solid ${ready ? `${accent}55` : '#1A2E22'}`,
        boxShadow: ready ? `0 0 20px ${accent}1A` : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-display font-black text-base leading-tight" style={{ color: '#F5E8C8' }}>{title}</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#8FA899' }}>{subtitle}</p>
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}33` }}
        >
          {rateText}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#8FA899' }}>Ready</p>
          <p className="font-mono font-black text-xl leading-tight mt-0.5" style={{ color: ready ? accent : '#4A6A55' }}>
            {ready ? readyAmount : '0.00'}
          </p>
        </div>
        {ready ? (
          <button
            type="button"
            onClick={onClaim}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: '#060E0A',
              boxShadow: `0 4px 16px ${accent}40`,
            }}
          >
            Claim
          </button>
        ) : (
          <div
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 rounded-xl text-[11px] font-bold"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22', color: '#8FA899' }}
          >
            <Clock className="w-3 h-3" />
            {countdown}
          </div>
        )}
      </div>
    </div>
  );
}
