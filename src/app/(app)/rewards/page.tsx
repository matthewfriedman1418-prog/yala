'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { PROMOTIONS } from '@/lib/mock-data/promotions';
import { ChevronRight } from 'lucide-react';
import { YalaIcon, type YalaIconName } from '@/components/ui/YalaIcon';

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
    subtitle: 'Daily race live now',
    description: 'Compete for a share of the GC prize pools — daily, weekly, monthly.',
    icon: 'trophy',
    color: '#F59E0B',
    href: '/leaderboards',
    cta: 'See Rankings',
    badge: 'Active',
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
  const { xp } = useWalletStore();
  const { openAuthModal, openPromotionsDrawer } = useUIStore();

  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier    = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress    = nextTier
    ? Math.max(0, Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100))
    : 100;
  const tierColor = getVIPColor(user?.vipTier || 1);

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

      {/* ── VIP STATUS (moved to top per request) ──────────────── */}
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
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${tierColor}18`, border: `1px solid ${tierColor}35` }}
              >
                <YalaIcon name={currentTier.icon} size={24} />
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

      {/* ── REWARD HUBS GRID (Vault removed, Daily Race moved to Leaderboards) ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #F0B232, #2DC97A)' }} />
          <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Your Rewards</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
