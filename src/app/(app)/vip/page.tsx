'use client';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { formatXP, getVIPColor } from '@/lib/utils';
import { useUIStore } from '@/lib/store/ui';
import { Crown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_BENEFITS = {
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

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#D6A84F]/20"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(214,168,79,0.12) 0%, transparent 60%), #0A0A0A' }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4" style={{ color: '#D6A84F' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>VIP Club</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Desert Prestige</h1>
          <p className="text-sm max-w-lg" style={{ color: '#9CA3AF' }}>
            Six tiers of exclusive benefits. Every GC wagered brings you closer to the Sheikh.
          </p>
        </div>
      </div>

      {/* Current status (logged in) */}
      {isLoggedIn && (
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-black"
                style={{ background: `linear-gradient(135deg, ${getVIPColor(user?.vipTier || 1)}, rgba(0,0,0,0.2))` }}
              >
                {currentTier.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: '#9CA3AF' }}>Current Tier</p>
                <p className="font-display text-xl font-bold" style={{ color: getVIPColor(user?.vipTier || 1) }}>
                  {currentTier.name}
                </p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{formatXP(xp)} earned</p>
              </div>
            </div>
            {nextTier && (
              <div className="text-right">
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Next: <span style={{ color: getVIPColor(nextTier.tier) }}>{nextTier.name}</span></p>
                <p className="text-sm font-semibold number-display" style={{ color: '#F5E8C8' }}>
                  {(nextTier.xpRequired - xp).toLocaleString()} XP to go
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
                <span style={{ color: getVIPColor(currentTier.tier) }}>{currentTier.name}</span>
                <span style={{ color: getVIPColor(nextTier.tier) }}>{nextTier.name}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${getVIPColor(currentTier.tier)}, ${getVIPColor(nextTier.tier)})` }}
                />
              </div>
              <p className="text-xs mt-1.5 text-right" style={{ color: '#9CA3AF' }}>{progress.toFixed(1)}% progress</p>
            </div>
          )}
        </div>
      )}

      {/* All tiers */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold" style={{ color: '#F5E8C8' }}>All VIP Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIP_TIERS.map((tier, i) => {
            const isCurrentTier = user?.vipTier === tier.tier;
            const benefits = TIER_BENEFITS[tier.tier as keyof typeof TIER_BENEFITS];
            return (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'p-5 rounded-2xl border transition-all',
                  isCurrentTier ? 'shadow-lg' : ''
                )}
                style={{
                  borderColor: isCurrentTier ? tier.color : `${tier.color}30`,
                  backgroundColor: isCurrentTier ? `${tier.color}10` : 'rgba(17,17,17,0.6)',
                  boxShadow: isCurrentTier ? `0 0 30px ${tier.color}20` : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: `${tier.color}20`, border: `1px solid ${tier.color}40` }}
                    >
                      {tier.icon}
                    </div>
                    <div>
                      <p className="font-display font-bold" style={{ color: tier.color }}>{tier.name}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>
                        {tier.xpRequired === 0 ? 'Starting tier' : `${tier.xpRequired.toLocaleString()} XP`}
                      </p>
                    </div>
                  </div>
                  {isCurrentTier && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full text-black" style={{ background: tier.color }}>
                      Current
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ backgroundColor: `${tier.color}10` }}>
                  <TrendingUp className="w-4 h-4" style={{ color: tier.color }} />
                  <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.rakeback}% Rakeback</span>
                </div>

                <div className="space-y-1.5">
                  {benefits.map((benefit, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0" style={{ background: `${tier.color}20`, color: tier.color }}>✓</span>
                      {benefit}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {!isLoggedIn && (
        <div className="text-center py-8 glass-card">
          <Crown className="w-8 h-8 mx-auto mb-3" style={{ color: '#D6A84F' }} />
          <p className="font-semibold mb-1" style={{ color: '#F5E8C8' }}>Join to Start Earning VIP Status</p>
          <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>Every wager earns XP toward your next tier.</p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
          >
            Create Account
          </button>
        </div>
      )}

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Void Where Prohibited</p>
      </div>
    </div>
  );
}
