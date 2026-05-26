'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { formatXP, getVIPColor } from '@/lib/utils';
import { TrendingUp, Check, Lock as LockIcon } from 'lucide-react';
import { YalaIcon } from '@/components/ui/YalaIcon';
import { YalaReferralCard } from '@/components/affiliate/YalaReferralCard';

// Tier perks. 'Daily bonus' removed — that's available to everyone, not
// a VIP exclusive. Each tier adds on top of the previous one.
const TIER_BENEFITS: Record<number, string[]> = {
  1: ['5% rakeback',  'Standard support'],
  2: ['8% rakeback',  'Priority chat',     'Birthday bonus'],
  3: ['12% rakeback', 'Weekly bonus',      'Monthly cashback',     'Faster withdrawals'],
  4: ['16% rakeback', 'Weekly bonus',      'Monthly cashback',     'Exclusive promotions', 'Higher daily limits'],
  5: ['20% rakeback', 'Dedicated VIP host','Weekly bonus',         'Custom offers',         'Private tournaments'],
  6: ['25% rakeback', 'Personal concierge','Custom withdrawal limits','Private events',     'Hall of fame'],
};

export default function VIPPage() {
  const { isLoggedIn, user } = useAuthStore();
  const { xp } = useWalletStore();
  const { openAuthModal } = useUIStore();

  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier    = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress    = nextTier
    ? Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100)
    : 100;
  const tierColor   = getVIPColor(user?.vipTier || 1);

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">

      {/* ── HERO ───────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{
          background: 'radial-gradient(ellipse at 20% 70%, rgba(240,178,50,0.16) 0%, transparent 55%), radial-gradient(ellipse at 90% 0%, rgba(45,201,122,0.10) 0%, transparent 55%), linear-gradient(180deg, #0F1A14 0%, #0A1410 100%)',
          border: '1px solid rgba(240,178,50,0.22)',
        }}
      >
        {/* Decorative VIP card watermark — anchors the "members only" vibe better than a crown. */}
        <div
          className="absolute -right-10 -bottom-12 opacity-[0.22] pointer-events-none hidden sm:block"
          style={{ transform: 'rotate(-10deg)', width: 320 }}
          aria-hidden
        >
          <YalaReferralCard
            code={user?.referralCode || 'DESERT88'}
            displayName={user?.displayName || user?.username || 'DesertFox88'}
            variant={user?.cardVariant === 'rotate' ? 8 : (user?.cardVariant ?? 8)}
          />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(240,178,50,0.12)', border: '1px solid rgba(240,178,50,0.28)' }}
            >
              <YalaIcon name="crown" size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0B232]">VIP Club</span>
            </div>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>
            Six tiers. <span className="gold-shimmer">Real perks.</span>
          </h1>
          <p className="text-sm max-w-lg mb-5" style={{ color: '#8FA899' }}>
            Every GC you wager earns XP toward the next tier. Higher tiers unlock bigger rakeback, faster cashouts, and custom offers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            <HeroPerkStat icon="trending" value="25%" label="Max rakeback" />
            <HeroPerkStat icon="trophy"   value="6"   label="Prestige tiers" />
            <HeroPerkStat icon="crown"    value="VIP" label="Personal concierge" />
          </div>
        </div>
      </div>

      {/* ── CURRENT STATUS ─────────────────────────────────── */}
      {isLoggedIn && (
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: '#0F1A14',
            border: `1px solid ${tierColor}38`,
            boxShadow: `0 0 32px ${tierColor}12`,
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${tierColor}25, ${tierColor}08)`,
                  border: `1px solid ${tierColor}45`,
                  boxShadow: `0 0 18px ${tierColor}18`,
                }}
              >
                <YalaIcon name={currentTier.icon} size={28} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#8FA899' }}>
                  Your tier
                </p>
                <p className="font-display text-xl font-bold" style={{ color: tierColor }}>
                  {currentTier.name}
                </p>
                <p className="text-xs number-display mt-0.5" style={{ color: '#8FA899' }}>
                  {formatXP(xp)} XP earned
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(45,201,122,0.08)', border: '1px solid rgba(45,201,122,0.25)' }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: '#2DC97A' }} />
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#8FA899' }}>Rakeback rate</p>
                <p className="text-lg font-black number-display leading-none" style={{ color: '#2DC97A' }}>
                  {currentTier.rakeback}%
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {nextTier ? (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold" style={{ color: tierColor }}>{currentTier.name}</span>
                <span style={{ color: '#8FA899' }}>
                  <span className="font-mono font-bold" style={{ color: '#F5E8C8' }}>
                    {(nextTier.xpRequired - xp).toLocaleString()}
                  </span> XP to <span className="font-bold" style={{ color: getVIPColor(nextTier.tier) }}>{nextTier.name}</span>
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#1A2E22' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full relative"
                  style={{ background: `linear-gradient(90deg, ${tierColor}, ${getVIPColor(nextTier.tier)})` }}
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 opacity-70"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4))' }}
                  />
                </motion.div>
              </div>
              <p className="text-[10px] mt-1.5 text-right number-display" style={{ color: '#8FA899' }}>
                {progress.toFixed(1)}% progress
              </p>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(240,178,50,0.06)', border: '1px solid rgba(240,178,50,0.22)' }}
            >
              <YalaIcon name="trophy" size={20} />
              <p className="text-sm font-bold" style={{ color: '#F0B232' }}>
                Max tier reached — welcome to the top.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── ALL TIERS ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #F0B232, #2DC97A)' }} />
          <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>All VIP tiers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VIP_TIERS.map((tier, i) => {
            const isCurrent  = user?.vipTier === tier.tier;
            const isUnlocked = (user?.vipTier || 0) >= tier.tier;
            const benefits   = TIER_BENEFITS[tier.tier];
            return (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn('relative rounded-2xl p-5 transition-all', isCurrent ? '' : '')}
                style={{
                  background: isCurrent
                    ? `linear-gradient(135deg, ${tier.color}14, transparent)`
                    : '#0F1A14',
                  border: `1px solid ${isCurrent ? `${tier.color}55` : `${tier.color}22`}`,
                  boxShadow: isCurrent ? `0 0 28px ${tier.color}1A` : undefined,
                }}
              >
                {/* Tier header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${tier.color}18`,
                        border: `1px solid ${tier.color}38`,
                        boxShadow: isCurrent ? `0 0 16px ${tier.color}25` : undefined,
                      }}
                    >
                      <YalaIcon name={tier.icon} size={22} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-base leading-none" style={{ color: tier.color }}>
                        {tier.name}
                      </p>
                      <p className="text-[11px] number-display mt-1" style={{ color: '#8FA899' }}>
                        {tier.xpRequired === 0 ? 'Starting tier' : `${tier.xpRequired.toLocaleString()} XP`}
                      </p>
                    </div>
                  </div>
                  {isCurrent
                    ? <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: tier.color, color: '#060E0A' }}>
                        Current
                      </span>
                    : isUnlocked
                      ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(45,201,122,0.12)', color: '#2DC97A' }}>
                          <Check className="w-3 h-3" strokeWidth={3} /> Reached
                        </span>
                      : <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: '#4A6A55' }}>
                          <LockIcon className="w-3 h-3" /> Locked
                        </span>
                  }
                </div>

                {/* Rakeback strip */}
                <div
                  className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
                  style={{ background: `${tier.color}10`, border: `1px solid ${tier.color}22` }}
                >
                  <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tier.color }} />
                  <span className="text-sm font-bold" style={{ color: tier.color }}>
                    {tier.rakeback}% rakeback
                  </span>
                </div>

                {/* Benefits list */}
                <ul className="space-y-1.5">
                  {benefits
                    .filter((b) => !b.endsWith(' rakeback'))  // rakeback shown above as its own strip
                    .map((benefit, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-px"
                        style={{
                          background: isUnlocked ? `${tier.color}22` : 'rgba(255,255,255,0.04)',
                          border: isUnlocked ? `1px solid ${tier.color}40` : '1px solid #1A2E22',
                        }}
                      >
                        {isUnlocked
                          ? <Check className="w-2.5 h-2.5" style={{ color: tier.color }} strokeWidth={3} />
                          : <LockIcon className="w-2 h-2" style={{ color: '#4A6A55' }} strokeWidth={3} />
                        }
                      </span>
                      <span style={{ color: isUnlocked ? '#F5E8C8' : '#8FA899' }}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── CTA (logged out only) ──────────────────────────── */}
      {!isLoggedIn && (
        <div
          className="text-center py-10 rounded-2xl"
          style={{ background: '#0F1A14', border: '1px solid rgba(240,178,50,0.25)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
            style={{ background: 'rgba(240,178,50,0.12)', border: '1px solid rgba(240,178,50,0.28)' }}
          >
            <YalaIcon name="crown" size={30} />
          </div>
          <p className="font-display font-bold text-lg mb-1" style={{ color: '#F5E8C8' }}>
            Start earning VIP tier
          </p>
          <p className="text-sm mb-5" style={{ color: '#8FA899' }}>Every wager earns XP toward your next tier.</p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-7 py-3 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
              color: '#060E0A',
              boxShadow: '0 4px 20px rgba(45,201,122,0.35)',
            }}
          >
            Create free account
          </button>
        </div>
      )}

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.5)' }}>
          18+ · No Purchase Necessary · Void Where Prohibited · <Link href="/sweepstakes-rules" className="underline transition-colors hover:opacity-80">Sweepstakes Rules</Link>
        </p>
      </div>
    </div>
  );
}

function HeroPerkStat({ icon, value, label }: { icon: 'trending' | 'trophy' | 'crown'; value: string; label: string }) {
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 flex items-center gap-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.22)' }}
      >
        {icon === 'trending'
          ? <TrendingUp className="w-4 h-4" style={{ color: '#2DC97A' }} />
          : <YalaIcon name={icon === 'trophy' ? 'trophy' : 'crown'} size={18} />
        }
      </div>
      <div>
        <p className="font-display text-base font-black leading-none" style={{ color: '#F5E8C8' }}>{value}</p>
        <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: '#8FA899' }}>{label}</p>
      </div>
    </div>
  );
}
