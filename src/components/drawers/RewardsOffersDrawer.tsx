'use client';

/**
 * RewardsOffersDrawer — the unified Rewards + Promotions drawer.
 *
 * One Gift icon in the header opens this. A tab strip at the top toggles
 * between the two surfaces:
 *
 *   Rewards    → VIP progress, daily streak, 3 bonus cards, redeem code.
 *   Promotions → special offers (welcome / tournament / referral), missions.
 *
 * The tabs intentionally don't share state with each other so users can switch
 * quickly. Both legacy `openRewardsDrawer` / `openPromotionsDrawer` actions
 * still work and just preselect the right tab.
 */

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore, type User } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useRewardsStore } from '@/lib/store/rewards';
import { useModalA11y } from '@/lib/hooks/useModalA11y';
import { PROMOTIONS, type Promotion } from '@/lib/mock-data/promotions';
import { PromoCard } from '@/components/rewards/PromoCard';
import { formatGC, formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { YalaIcon, type YalaIconName } from '@/components/ui/YalaIcon';
import { X, Clock, ChevronRight, Check, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// ── Constants ─────────────────────────────────────────────────────────────
const WEEKLY_BONUS_SC  = 5;
const MONTHLY_BONUS_SC = 25;
const STREAK_REWARD_GC = [1_000, 1_500, 2_000, 2_500, 3_000, 4_000, 7_500];
const STREAK_REWARD_SC = [0, 0, 0, 1, 0, 0, 5];

// Promotions filter — same as the previous PromotionsDrawer.
const SPECIAL_TYPES: Promotion['type'][] = ['welcome', 'tournament', 'referral'];

interface MissionPreview {
  id: string;
  title: string;
  desc: string;
  reward: number;
  rewardSC: number;
  progress: number;
  total: number;
  icon: YalaIconName;
}
const DAILY_MISSION_PREVIEW: MissionPreview[] = [
  { id: 'm2', title: 'Originals Run',  desc: 'Play any 3 Yala Originals games', reward: 2_000, rewardSC: 0,   progress: 2, total: 3,  icon: 'lightning' },
  { id: 'm3', title: 'Roll Call',      desc: 'Place 10 bets today',             reward: 1_500, rewardSC: 0,   progress: 7, total: 10, icon: 'dice' },
  { id: 'm5', title: 'Sweeps Sampler', desc: 'Play 5 games in SC mode',         reward:     0, rewardSC: 0.5, progress: 1, total: 5,  icon: 'cash-bill' },
];

// ──────────────────────────────────────────────────────────────────────────
export function RewardsOffersDrawer() {
  const {
    rewardsOffersDrawerOpen,
    rewardsOffersDrawerTab,
    closeRewardsOffersDrawer,
    setRewardsOffersDrawerTab,
    openAuthModal,
    openBuyCoins,
  } = useUIStore();
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
  useModalA11y(rewardsOffersDrawerOpen, closeRewardsOffersDrawer);

  // VIP progress
  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier    = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress    = nextTier
    ? Math.max(0, Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100))
    : 100;
  const tierColor   = getVIPColor(user?.vipTier || 1);

  // Streak
  const renderDay = canClaimDaily ? pendingStreakDay : (streakDay || 1);

  // Ready badges for tab dots
  const rewardsReady = (canClaimDaily ? 1 : 0) + (rakebackBalance > 0 ? 1 : 0) + (canClaimWeekly ? 1 : 0) + (canClaimMonthly ? 1 : 0);
  // Promotions: nothing is auto-claimable per se (specials need a CTA tap;
  // missions complete via gameplay). Count actionable items so the dot only
  // appears if there's at least one special or a completed-not-claimed mission.
  const specials = PROMOTIONS.filter((p) => SPECIAL_TYPES.includes(p.type));
  const completedMissions = DAILY_MISSION_PREVIEW.filter((m) => m.progress >= m.total).length;
  const promotionsReady = completedMissions;

  // ── Handlers ──────────────────────────────────────────────────────────
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
    toast.success('Weekly bonus claimed', { description: `+${WEEKLY_BONUS_SC} SC. Next claim Monday 00:00 UTC.` });
  };

  const handleClaimMonthly = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (!canClaimMonthly) return;
    addSC(MONTHLY_BONUS_SC);
    claimMonthly();
    toast.success('Monthly bonus claimed', { description: `+${MONTHLY_BONUS_SC} SC. Next claim on the 1st 00:00 UTC.` });
  };

  const handleSpecialClaim = (promo: Promotion) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (promo.type === 'welcome')    { openBuyCoins();                  closeRewardsOffersDrawer(); return; }
    if (promo.type === 'referral')   { window.location.href = '/affiliate';   closeRewardsOffersDrawer(); return; }
    if (promo.type === 'tournament') { window.location.href = '/leaderboards'; closeRewardsOffersDrawer(); return; }
    if (promo.gcBonus) addGC(promo.gcBonus);
    if (promo.scBonus) addSC(promo.scBonus);
    toast.success(`Claimed: ${promo.title}`);
    closeRewardsOffersDrawer();
  };

  // ──────────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {rewardsOffersDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 top-14 bg-black/55 z-40"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={closeRewardsOffersDrawer}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-14 bottom-0 w-[420px] max-w-[92vw] z-40 flex flex-col"
            style={{ backgroundColor: '#0C1812', borderLeft: '1px solid #1A2E22' }}
            role="dialog"
            aria-modal="true"
            aria-label="Rewards and offers"
          >
            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #1A2E22' }}>
              <div className="flex items-center gap-2">
                <YalaIcon name="gift" size={16} />
                <span className="font-display font-bold" style={{ color: '#F5E8C8' }}>Rewards &amp; Offers</span>
              </div>
              <button onClick={closeRewardsOffersDrawer} aria-label="Close" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: '#8FA899' }} />
              </button>
            </div>

            {/* ── Tab strip ──────────────────────────────────── */}
            <div className="flex-shrink-0 px-3 py-2" style={{ borderBottom: '1px solid #1A2E22', background: '#0A1410' }}>
              <div
                className="grid grid-cols-2 gap-0.5 rounded-xl p-0.5"
                style={{ background: '#07110A', border: '1px solid #1A2E22' }}
              >
                <TabButton
                  active={rewardsOffersDrawerTab === 'rewards'}
                  onClick={() => setRewardsOffersDrawerTab('rewards')}
                  label="Rewards"
                  ready={rewardsReady}
                  accent="#2DC97A"
                />
                <TabButton
                  active={rewardsOffersDrawerTab === 'promotions'}
                  onClick={() => setRewardsOffersDrawerTab('promotions')}
                  label="Promotions"
                  ready={promotionsReady}
                  accent="#F0B232"
                />
              </div>
            </div>

            {/* ── Body ───────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {rewardsOffersDrawerTab === 'rewards' ? (
                <RewardsTab
                  isLoggedIn={isLoggedIn}
                  user={user}
                  xp={xp}
                  tierColor={tierColor}
                  currentTier={currentTier}
                  nextTier={nextTier}
                  progress={progress}
                  renderDay={renderDay}
                  canClaimDaily={canClaimDaily}
                  handleClaimDaily={handleClaimDaily}
                  rakebackBalance={rakebackBalance}
                  handleClaimInstant={handleClaimInstant}
                  canClaimWeekly={canClaimWeekly}
                  handleClaimWeekly={handleClaimWeekly}
                  canClaimMonthly={canClaimMonthly}
                  handleClaimMonthly={handleClaimMonthly}
                  closeDrawer={closeRewardsOffersDrawer}
                  openAuthModal={openAuthModal}
                />
              ) : (
                <PromotionsTab
                  specials={specials}
                  missions={DAILY_MISSION_PREVIEW}
                  onClaimSpecial={handleSpecialClaim}
                  closeDrawer={closeRewardsOffersDrawer}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Tab button ────────────────────────────────────────────────────────
function TabButton({
  active, onClick, label, ready, accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  ready: number;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
      style={
        active
          ? { background: `${accent}14`, color: accent, border: `1px solid ${accent}44`, boxShadow: `0 0 12px ${accent}1F` }
          : { color: '#8FA899', border: '1px solid transparent' }
      }
    >
      {label}
      {ready > 0 && (
        <span
          className="text-[9px] font-mono font-black px-1.5 rounded-full"
          style={{
            background: active ? `${accent}26` : 'rgba(45,201,122,0.15)',
            color:      active ? accent          : '#2DC97A',
          }}
        >
          {ready}
        </span>
      )}
    </button>
  );
}

// ─── Rewards tab body ──────────────────────────────────────────────────
function RewardsTab(props: {
  isLoggedIn: boolean;
  user: User | null;
  xp: number;
  tierColor: string;
  currentTier: typeof VIP_TIERS[number];
  nextTier: typeof VIP_TIERS[number] | undefined;
  progress: number;
  renderDay: number;
  canClaimDaily: boolean;
  handleClaimDaily: () => void;
  rakebackBalance: number;
  handleClaimInstant: () => void;
  canClaimWeekly: boolean;
  handleClaimWeekly: () => void;
  canClaimMonthly: boolean;
  handleClaimMonthly: () => void;
  closeDrawer: () => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
}) {
  const {
    isLoggedIn, user, xp, tierColor, currentTier, nextTier, progress,
    renderDay, canClaimDaily, handleClaimDaily,
    rakebackBalance, handleClaimInstant,
    canClaimWeekly, handleClaimWeekly,
    canClaimMonthly, handleClaimMonthly,
    closeDrawer, openAuthModal,
  } = props;
  return (
    <>
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

      {/* Daily streak */}
      <div className="mx-4 mb-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" style={{ color: '#F0B232' }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F5E8C8' }}>Daily streak</p>
          </div>
          <Link
            href="/daily-bonus"
            onClick={closeDrawer}
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

      {/* 3 bonus cards */}
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
                toast.error('Codes are issued from in-app promotions', { description: 'Switch to the Promotions tab.' });
              }
            }}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
          />
          <button
            type="button"
            onClick={() => toast.error('Codes are issued from in-app promotions', { description: 'Switch to the Promotions tab.' })}
            className="px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#8FA899' }}
          >
            Redeem
          </button>
        </div>
      </div>

      {/* Footer: view full hub */}
      <div className="px-4 pb-5">
        <Link
          href="/rewards"
          onClick={closeDrawer}
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
    </>
  );
}

// ─── Promotions tab body ──────────────────────────────────────────────
function PromotionsTab({
  specials, missions, onClaimSpecial, closeDrawer,
}: {
  specials: Promotion[];
  missions: MissionPreview[];
  onClaimSpecial: (promo: Promotion) => void;
  closeDrawer: () => void;
}) {
  return (
    <>
      {/* Special offers */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#F0B232' }} />
          <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F5E8C8' }}>
            Special offers
          </h3>
        </div>
        <div className="space-y-3">
          {specials.map((p, i) => (
            <PromoCard key={p.id} promo={p} index={i} onClaim={onClaimSpecial} />
          ))}
        </div>
      </section>

      {/* Missions preview */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <YalaIcon name="badge-star" size={14} />
            <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F5E8C8' }}>
              Today&apos;s missions
            </h3>
          </div>
          <Link
            href="/missions"
            onClick={closeDrawer}
            className="text-[10px] font-bold flex items-center gap-0.5"
            style={{ color: '#F0B232' }}
          >
            See all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {missions.map((m) => {
            const pct = Math.min(100, (m.progress / m.total) * 100);
            const done = m.progress >= m.total;
            return (
              <Link
                key={m.id}
                href="/missions"
                onClick={closeDrawer}
                className="block rounded-xl p-3 transition-colors hover:bg-white/[0.025]"
                style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: done ? 'rgba(45,201,122,0.14)' : 'rgba(167,139,250,0.10)',
                      border:     `1px solid ${done ? 'rgba(45,201,122,0.30)' : 'rgba(167,139,250,0.28)'}`,
                      color:      done ? '#2DC97A' : '#A78BFA',
                    }}
                  >
                    {done ? <Check className="w-4 h-4" /> : <YalaIcon name={m.icon} size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[12px] font-bold leading-tight" style={{ color: '#F5E8C8' }}>{m.title}</p>
                      <div className="flex flex-col items-end flex-shrink-0">
                        {m.reward > 0 && (
                          <span className="text-[10px] font-mono font-bold" style={{ color: '#F0B232' }}>
                            +{formatGC(m.reward)} GC
                          </span>
                        )}
                        {m.rewardSC > 0 && (
                          <span className="text-[10px] font-mono font-bold" style={{ color: '#2DC97A' }}>
                            +{m.rewardSC} SC
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] mb-1.5" style={{ color: '#8FA899' }}>{m.desc}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#1A2E22' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: done ? '#2DC97A' : '#A78BFA' }}
                        />
                      </div>
                      <span className="text-[10px] font-mono flex-shrink-0" style={{ color: '#4A6A55' }}>
                        {m.progress}/{m.total}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="px-5 py-6 mt-2 text-center">
        <p className="text-[10px]" style={{ color: 'rgba(143,168,153,0.45)' }}>
          18+ · No Purchase Necessary · Void Where Prohibited
        </p>
      </div>
    </>
  );
}

// ─── Bonus card ────────────────────────────────────────────────────────
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
