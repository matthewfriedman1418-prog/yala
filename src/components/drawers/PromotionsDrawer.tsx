'use client';

/**
 * PromotionsDrawer — slide-in side panel that surfaces SPECIAL offers and
 * missions only. Recurring daily / weekly / monthly bonuses live on /rewards
 * (Rewards Hub); this drawer is for the marketing-driven, limited-time stuff.
 *
 * Contents:
 *   - Hero header (gradient, "Special Offers" tagline + active count)
 *   - Special offers list (welcome / tournament / referral)
 *   - Missions preview (3 daily, link to /missions)
 *   - Legal footer
 */

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useModalA11y } from '@/lib/hooks/useModalA11y';
import { PROMOTIONS, type Promotion } from '@/lib/mock-data/promotions';
import { PromoCard } from '@/components/rewards/PromoCard';
import { YalaIcon, type YalaIconName } from '@/components/ui/YalaIcon';
import { formatGC } from '@/lib/utils';
import { X, Sparkles, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';

// Mission preview — kept small to match the drawer width. The full list
// lives on /missions; this is intentionally a teaser.
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
  { id: 'm2', title: 'Originals Run', desc: 'Play any 3 Yala Originals games', reward: 2_000, rewardSC: 0,   progress: 2, total: 3,  icon: 'lightning' },
  { id: 'm3', title: 'Roll Call',     desc: 'Place 10 bets today',             reward: 1_500, rewardSC: 0,   progress: 7, total: 10, icon: 'dice' },
  { id: 'm5', title: 'Sweeps Sampler', desc: 'Play 5 games in SC mode',        reward:     0, rewardSC: 0.5, progress: 1, total: 5,  icon: 'cash-bill' },
];

// Which PROMOTIONS belong on this drawer (special / marketing) vs which are
// recurring bonuses (live on /rewards). Daily, reload, race, cashback, and
// VIP boost are recurring → exclude. Welcome, tournament, referral → include.
const SPECIAL_TYPES: Promotion['type'][] = ['welcome', 'tournament', 'referral'];

export function PromotionsDrawer() {
  const { promotionsDrawerOpen, closePromotionsDrawer, openAuthModal, openBuyCoins } = useUIStore();
  const { isLoggedIn } = useAuthStore();
  const { addGC, addSC } = useWalletStore();
  useModalA11y(promotionsDrawerOpen, closePromotionsDrawer);

  const specials = PROMOTIONS.filter((p) => SPECIAL_TYPES.includes(p.type));

  const handleClaim = (promo: Promotion) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (promo.type === 'welcome') {
      openBuyCoins();
      closePromotionsDrawer();
      return;
    }
    if (promo.type === 'referral') {
      window.location.href = '/affiliate';
      closePromotionsDrawer();
      return;
    }
    if (promo.type === 'tournament') {
      window.location.href = '/leaderboards';
      closePromotionsDrawer();
      return;
    }
    // Fallback: credit any direct reward and close
    if (promo.gcBonus) addGC(promo.gcBonus);
    if (promo.scBonus) addSC(promo.scBonus);
    toast.success(`Claimed: ${promo.title}`);
    closePromotionsDrawer();
  };

  return (
    <AnimatePresence>
      {promotionsDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 top-14 bg-black/55 z-40"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={closePromotionsDrawer}
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
            aria-label="Promotions and missions"
          >
            {/* ── HERO HEADER ─────────────────────────────── */}
            <div
              className="relative flex-shrink-0 overflow-hidden"
              style={{
                background: `
                  radial-gradient(ellipse at 20% 0%, rgba(45,201,122,0.18) 0%, transparent 55%),
                  radial-gradient(ellipse at 80% 100%, rgba(240,178,50,0.15) 0%, transparent 50%),
                  #0C1812
                `,
                borderBottom: '1px solid rgba(240,178,50,0.25)',
              }}
            >
              <button
                onClick={closePromotionsDrawer}
                aria-label="Close"
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-4 h-4" style={{ color: '#8FA899' }} />
              </button>
              <div className="relative z-[1] px-5 py-5">
                <div className="flex items-center gap-2 mb-2">
                  <YalaIcon name="gift" size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F0B232' }}>Promotions</span>
                </div>
                <h2 className="font-display text-2xl font-black tracking-tight" style={{ color: '#F5E8C8' }}>
                  Special offers &amp; missions
                </h2>
                <p className="text-xs mt-1" style={{ color: '#8FA899' }}>
                  Limited-time drops and active tasks. Recurring bonuses live in{' '}
                  <Link href="/rewards" onClick={closePromotionsDrawer} className="underline" style={{ color: '#F0B232' }}>Rewards Hub</Link>.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(45,201,122,0.14)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.30)' }}
                  >
                    {specials.length} active offers
                  </span>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(167,139,250,0.14)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.30)' }}
                  >
                    {DAILY_MISSION_PREVIEW.length} missions ready
                  </span>
                </div>
              </div>
            </div>

            {/* ── BODY (scrollable) ───────────────────────── */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
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
                    <PromoCard key={p.id} promo={p} index={i} onClaim={handleClaim} />
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
                    onClick={closePromotionsDrawer}
                    className="text-[10px] font-bold flex items-center gap-0.5"
                    style={{ color: '#F0B232' }}
                  >
                    See all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {DAILY_MISSION_PREVIEW.map((m) => {
                    const pct = Math.min(100, (m.progress / m.total) * 100);
                    const done = m.progress >= m.total;
                    return (
                      <Link
                        key={m.id}
                        href="/missions"
                        onClick={closePromotionsDrawer}
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

              {/* Recurring rewards link */}
              <section className="px-4 pt-4">
                <Link
                  href="/rewards"
                  onClick={closePromotionsDrawer}
                  className="flex items-center justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.025]"
                  style={{ background: 'rgba(45,201,122,0.05)', border: '1px solid rgba(45,201,122,0.20)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <YalaIcon name="gift" size={18} />
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold" style={{ color: '#F5E8C8' }}>Looking for daily / weekly / monthly bonuses?</p>
                      <p className="text-[10px]" style={{ color: '#8FA899' }}>Streak, cashback, rakeback, races — all in Rewards Hub.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#2DC97A' }} />
                </Link>
              </section>

              {/* Legal */}
              <div className="px-5 py-5 mt-2 text-center">
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
