'use client';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { formatXP, getVIPColor } from '@/lib/utils';
import { useUIStore } from '@/lib/store/ui';
import { TrendingUp, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 20h20M4 20l2-8 6 4 4-8 4 8 2-8" />
    </svg>
  );
}

const TIER_BENEFITS: Record<number, string[]> = {
  1: ['5% rakeback', 'Daily bonus', 'Standard support'],
  2: ['8% rakeback', 'Daily bonus', 'Priority support', 'Weekly bonus'],
  3: ['12% rakeback', 'Daily bonus', 'Priority support', 'Weekly bonus', 'Monthly drop'],
  4: ['16% rakeback', 'Daily bonus', 'Priority VIP support', 'Weekly bonus', 'Monthly drop', 'Exclusive promotions'],
  5: ['20% rakeback', 'Daily bonus', 'Dedicated VIP host', 'Weekly bonus', 'Monthly drop', 'Exclusive access', 'Custom offers'],
  6: ['25% rakeback', 'Daily bonus', 'Personal VIP concierge', 'Weekly bonus', 'Monthly drop', 'Elite exclusives', 'Custom limits', 'Private events'],
};

export default function VIPPage() {
  const { isLoggedIn, user } = useAuthStore();
  const { xp } = useWalletStore();
  const { openAuthModal } = useUIStore();

  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress = nextTier
    ? Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100)
    : 100;
  const tierColor = getVIPColor(user?.vipTier || 1);

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 sm:p-10"
        style={{
          background: `radial-gradient(ellipse at 25% 55%, rgba(214,168,79,0.16) 0%, transparent 60%),
                       radial-gradient(ellipse at 75% 20%, rgba(45,201,122,0.08) 0%, transparent 50%),
                       #0C1812`,
          border: '1px solid rgba(214,168,79,0.2)',
          boxShadow: '0 0 40px rgba(214,168,79,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Decorative crown watermark */}
        <div className="absolute right-6 top-6 opacity-[0.05]">
          <CrownIcon className="w-32 h-32 text-[#D6A84F]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(214,168,79,0.12)', border: '1px solid rgba(214,168,79,0.25)' }}
            >
              <CrownIcon className="w-3.5 h-3.5 text-[#D6A84F]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D6A84F]">VIP Club</span>
            </div>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>
            Desert Prestige
          </h1>
          <p className="text-sm max-w-lg mb-4" style={{ color: '#8FA899' }}>
            Six tiers of exclusive benefits. Every GC wagered brings you closer to the Sheikh.
          </p>
          <div className="flex items-center gap-6 text-xs flex-wrap">
            <div className="flex items-center gap-1.5" style={{ color: '#8FA899' }}>
              <TrendingUp className="w-3.5 h-3.5 text-[#2DC97A]" />
              Up to 25% rakeback
            </div>
            <div className="flex items-center gap-1.5" style={{ color: '#8FA899' }}>
              <Zap className="w-3.5 h-3.5 text-[#F0B232]" />
              Instant coin drops
            </div>
            <div className="flex items-center gap-1.5" style={{ color: '#8FA899' }}>
              <CrownIcon className="w-3.5 h-3.5 text-[#D6A84F]" />
              Personal VIP concierge
            </div>
          </div>
        </div>
      </div>

      {/* ── CURRENT STATUS ───────────────────────────────────── */}
      {isLoggedIn && (
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: `rgba(12,24,18,0.9)`,
            border: `1px solid ${tierColor}30`,
            boxShadow: `0 0 24px ${tierColor}10`,
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${tierColor}25, ${tierColor}08)`,
                  border: `1px solid ${tierColor}40`,
                  boxShadow: `0 0 20px ${tierColor}15`,
                }}
              >
                {currentTier.icon}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: '#8FA899' }}>Current Tier</p>
                <p className="font-display text-xl font-bold" style={{ color: tierColor }}>
                  {currentTier.name}
                </p>
                <p className="text-xs number-display" style={{ color: '#8FA899' }}>{formatXP(xp)} XP earned</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(45,201,122,0.08)', border: '1px solid rgba(45,201,122,0.2)' }}
              >
                <TrendingUp className="w-4 h-4 text-[#2DC97A]" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: '#8FA899' }}>Rakeback</p>
                  <p className="text-base font-black number-display" style={{ color: '#2DC97A' }}>{currentTier.rakeback}%</p>
                </div>
              </div>
              {nextTier && (
                <Link
                  href="/rakeback"
                  className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ color: '#D6A84F' }}
                >
                  Claim rakeback <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: '#8FA899' }}>
                <span style={{ color: tierColor }}>{currentTier.name}</span>
                <span style={{ color: getVIPColor(nextTier.tier) }}>
                  {(nextTier.xpRequired - xp).toLocaleString()} XP to {nextTier.name}
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
                    className="absolute right-0 top-0 bottom-0 w-4 opacity-60"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4))' }}
                  />
                </motion.div>
              </div>
              <p className="text-[10px] mt-1.5 text-right number-display" style={{ color: '#8FA899' }}>
                {progress.toFixed(1)}% progress
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── ALL TIERS ────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #D6A84F, #2DC97A)' }} />
          <h2 className="font-display text-2xl font-bold" style={{ color: '#F5E8C8' }}>All VIP Tiers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIP_TIERS.map((tier, i) => {
            const isCurrentTier = user?.vipTier === tier.tier;
            const isUnlocked = (user?.vipTier || 1) >= tier.tier;
            const benefits = TIER_BENEFITS[tier.tier];
            return (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={cn('relative rounded-2xl p-5 transition-all', isCurrentTier ? 'shadow-lg' : '')}
                style={{
                  background: isCurrentTier
                    ? `linear-gradient(135deg, ${tier.color}12, rgba(12,24,18,0.95))`
                    : 'rgba(16,28,22,0.7)',
                  border: `1px solid ${isCurrentTier ? tier.color + '50' : tier.color + '20'}`,
                  boxShadow: isCurrentTier ? `0 0 32px ${tier.color}18` : undefined,
                }}
              >
                {isCurrentTier && (
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, ${tier.color}, transparent)` }}
                  />
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{
                        background: `${tier.color}18`,
                        border: `1px solid ${tier.color}35`,
                        boxShadow: isCurrentTier ? `0 0 16px ${tier.color}20` : undefined,
                      }}
                    >
                      {tier.icon}
                    </div>
                    <div>
                      <p className="font-display font-bold text-base" style={{ color: tier.color }}>{tier.name}</p>
                      <p className="text-[11px] number-display" style={{ color: '#8FA899' }}>
                        {tier.xpRequired === 0 ? 'Starting tier' : `${tier.xpRequired.toLocaleString()} XP`}
                      </p>
                    </div>
                  </div>
                  {isCurrentTier && (
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: tier.color, color: '#060E0A' }}
                    >
                      Current
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl"
                  style={{ background: `${tier.color}10`, border: `1px solid ${tier.color}20` }}
                >
                  <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: tier.color }} />
                  <span className="text-sm font-bold" style={{ color: tier.color }}>
                    {tier.rakeback}% Rakeback
                  </span>
                </div>

                <div className="space-y-2">
                  {benefits.map((benefit, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                        style={{
                          background: isUnlocked ? `${tier.color}25` : 'rgba(255,255,255,0.05)',
                          color: isUnlocked ? tier.color : '#4A6A55',
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ color: isUnlocked ? '#8FA899' : '#4A6A55' }}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── CTA (logged out) ─────────────────────────────────── */}
      {!isLoggedIn && (
        <div
          className="text-center py-10 rounded-2xl"
          style={{ background: 'rgba(12,24,18,0.9)', border: '1px solid rgba(214,168,79,0.2)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
            style={{ background: 'rgba(214,168,79,0.12)', border: '1px solid rgba(214,168,79,0.25)' }}
          >
            <CrownIcon className="w-7 h-7 text-[#D6A84F]" />
          </div>
          <p className="font-display font-bold text-lg mb-1" style={{ color: '#F5E8C8' }}>
            Join to Start Earning VIP Status
          </p>
          <p className="text-sm mb-5" style={{ color: '#8FA899' }}>Every wager earns XP toward your next tier.</p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-7 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0B232)', color: '#060E0A' }}
          >
            Create Free Account
          </button>
        </div>
      )}

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.5)' }}>
          18+ · No Purchase Necessary · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}
