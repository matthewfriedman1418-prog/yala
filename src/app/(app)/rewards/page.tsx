'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { formatGC, formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { PROMOTIONS } from '@/lib/mock-data/promotions';
import {
  Gift, TrendingUp, ChevronRight, Star, RotateCw,
  Target, Trophy, Vault, Calendar
} from 'lucide-react';

const REWARD_HUBS = [
  {
    id: 'daily-bonus',
    title: 'Daily Login Bonus',
    subtitle: 'Day 4 of 7 streak',
    description: 'Claim your daily GC reward and keep your streak alive.',
    icon: Calendar,
    color: '#D6A84F',
    href: '/daily-bonus',
    cta: 'Claim Now',
    available: true,
    badge: 'Ready',
  },
  {
    id: 'rakeback',
    title: 'Rakeback',
    subtitle: 'Earns while you play',
    description: 'Claim your accumulated rakeback balance anytime.',
    icon: TrendingUp,
    color: '#10B981',
    href: '/rakeback',
    cta: 'Claim Rakeback',
    available: true,
    badge: 'Available',
  },
  {
    id: 'missions',
    title: 'Missions',
    subtitle: '3 dailies available',
    description: 'Complete missions to earn bonus GC, SC and XP.',
    icon: Target,
    color: '#8B5CF6',
    href: '/missions',
    cta: 'View Missions',
    available: true,
    badge: '3 New',
  },
  {
    id: 'leaderboards',
    title: 'Leaderboards',
    subtitle: 'Weekly race ends in 3d 14h',
    description: 'Compete for a share of the 100,000 GC weekly prize pool.',
    icon: Trophy,
    color: '#F59E0B',
    href: '/leaderboards',
    cta: 'See Rankings',
    available: true,
    badge: 'Active',
  },
  {
    id: 'vault',
    title: 'Vault',
    subtitle: '5% daily interest',
    description: 'Lock your Gold Coins and earn passive daily interest.',
    icon: Vault,
    color: '#06B6D4',
    href: '/vault',
    cta: 'Open Vault',
    available: true,
    badge: 'Earning',
  },
  {
    id: 'promotions',
    title: 'Promotions',
    subtitle: '8 active offers',
    description: 'Browse all current bonuses, reload offers and limited deals.',
    icon: Gift,
    color: '#EC4899',
    href: '/promotions',
    cta: 'View Offers',
    available: true,
    badge: '8 Active',
  },
];

const FEATURED_PROMOS = PROMOTIONS.slice(0, 3);

export default function RewardsPage() {
  const { isLoggedIn, user } = useAuthStore();
  const { xp, rakebackBalance, bonusBalance, vaultBalance } = useWalletStore();
  const { openAuthModal } = useUIStore();

  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress = nextTier
    ? Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100)
    : 100;

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-4 h-4" style={{ color: '#D6A84F' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>Rewards</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Rewards Hub</h1>
        <p style={{ color: '#9CA3AF' }}>Everything you&apos;ve earned. All in one place.</p>
      </div>

      {/* VIP Progress Banner (logged in) */}
      {isLoggedIn ? (
        <div
          className="relative rounded-2xl overflow-hidden p-5 border"
          style={{
            background: `radial-gradient(ellipse at 20% 50%, ${getVIPColor(user?.vipTier || 1)}18 0%, transparent 60%), #0D0D0D`,
            borderColor: `${getVIPColor(user?.vipTier || 1)}30`,
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: `${getVIPColor(user?.vipTier || 1)}20`, border: `1px solid ${getVIPColor(user?.vipTier || 1)}40` }}
              >
                {currentTier.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: '#9CA3AF' }}>VIP Status</p>
                <p className="font-display text-lg font-bold" style={{ color: getVIPColor(user?.vipTier || 1) }}>
                  {getVIPName(user?.vipTier || 1)}
                </p>
                <p className="text-xs number-display" style={{ color: '#9CA3AF' }}>{formatXP(xp)} total XP</p>
              </div>
            </div>

            <div className="flex-1 max-w-xs w-full">
              {nextTier ? (
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
                    <span>{currentTier.name}</span>
                    <span style={{ color: getVIPColor(nextTier.tier) }}>
                      {(nextTier.xpRequired - xp).toLocaleString()} XP to {nextTier.name}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${getVIPColor(currentTier.tier)}, ${getVIPColor(nextTier.tier)})` }}
                    />
                  </div>
                  <p className="text-right text-xs mt-1" style={{ color: '#9CA3AF' }}>{progress.toFixed(1)}%</p>
                </div>
              ) : (
                <p className="text-sm font-semibold" style={{ color: getVIPColor(6) }}>Maximum tier reached 🏆</p>
              )}
            </div>

            <Link href="/vip" className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: '#D6A84F' }}>
              VIP Club <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-3" style={{ color: '#D6A84F' }} />
          <p className="font-semibold mb-1" style={{ color: '#F5E8C8' }}>Sign in to track your rewards</p>
          <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>Earn XP, climb VIP tiers, and unlock exclusive benefits.</p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
          >
            Create Free Account
          </button>
        </div>
      )}

      {/* Quick balances (logged in) */}
      {isLoggedIn && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Rakeback', value: formatGC(rakebackBalance), color: '#10B981', href: '/rakeback' },
            { label: 'Bonus', value: formatGC(bonusBalance), color: '#D6A84F', href: '/wallet' },
            { label: 'Vault', value: formatGC(vaultBalance), color: '#06B6D4', href: '/vault' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="glass-card p-4 text-center hover:border-[#D6A84F]/30 transition-all group"
            >
              <p className="text-xs mb-1.5 group-hover:opacity-80 transition-opacity" style={{ color: '#9CA3AF' }}>{item.label}</p>
              <p className="text-sm font-bold number-display group-hover:opacity-80 transition-opacity" style={{ color: item.color }}>{item.value}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Reward hubs grid */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: '#F5E8C8' }}>Your Rewards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REWARD_HUBS.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={hub.href}
                  className="glass-card p-5 flex flex-col h-full hover:border-[#D6A84F]/25 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${hub.color}18`, border: `1px solid ${hub.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: hub.color }} />
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${hub.color}20`, color: hub.color }}
                    >
                      {hub.badge}
                    </span>
                  </div>

                  <p className="font-semibold mb-0.5 group-hover:text-[#D6A84F] transition-colors" style={{ color: '#F5E8C8' }}>{hub.title}</p>
                  <p className="text-xs mb-2" style={{ color: hub.color }}>{hub.subtitle}</p>
                  <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: '#9CA3AF' }}>{hub.description}</p>

                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: hub.color }}>
                    {hub.cta}
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Featured promotions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Active Promotions</h2>
          <Link href="/promotions" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#D6A84F' }}>
            All Promos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {FEATURED_PROMOS.map((promo, i) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              className="glass-card p-4 flex items-center gap-4 hover:border-[#D6A84F]/25 transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(214,168,79,0.1)', border: '1px solid rgba(214,168,79,0.2)' }}
              >
                <Gift className="w-5 h-5" style={{ color: '#D6A84F' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#F5E8C8' }}>{promo.title}</p>
                <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{promo.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {promo.gcBonus ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(214,168,79,0.15)', color: '#D6A84F' }}>
                    +{(promo.gcBonus / 1000).toFixed(0)}K GC
                  </span>
                ) : null}
                {promo.scBonus ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                    +{promo.scBonus} SC
                  </span>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spin widget teaser */}
      <div
        className="rounded-2xl p-6 border flex flex-col sm:flex-row items-center gap-6"
        style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <RotateCw className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-display font-bold text-lg mb-1" style={{ color: '#F5E8C8' }}>Free Daily Spin</p>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Spin the Emerald Wheel once per day — no purchase required. Win up to 10,000 GC or bonus SC.
          </p>
        </div>
        <Link
          href="/daily-bonus"
          className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-black"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
        >
          Spin Now
        </Link>
      </div>

      {/* Legal */}
      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">
          No Purchase Necessary · 18+ · Gold Coins have no cash value · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}
