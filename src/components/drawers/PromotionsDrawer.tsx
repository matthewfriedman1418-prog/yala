'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { PROMOTIONS } from '@/lib/mock-data/promotions';
import { formatGC } from '@/lib/utils';
import { X, Gift, Clock, ChevronRight } from 'lucide-react';

export function PromotionsDrawer() {
  const { promotionsDrawerOpen, closePromotionsDrawer, openAuthModal, openBuyCoins } = useUIStore();
  const { isLoggedIn } = useAuthStore();

  const handleCta = (promo: typeof PROMOTIONS[0]) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (promo.type === 'welcome' || promo.type === 'reload') openBuyCoins();
    closePromotionsDrawer();
  };

  return (
    <AnimatePresence>
      {promotionsDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 top-14 bg-black/50 z-40"
            onClick={closePromotionsDrawer}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-14 bottom-9 w-96 max-w-[92vw] z-40 flex flex-col"
            style={{ backgroundColor: '#0C1812', borderLeft: '1px solid #1A2E22' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #1A2E22' }}>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" style={{ color: '#F0B232' }} />
                <span className="font-display font-bold" style={{ color: '#F5E8C8' }}>Desert Deals</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232' }}>
                  {PROMOTIONS.length} Active
                </span>
              </div>
              <button onClick={closePromotionsDrawer} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: '#8FA899' }} />
              </button>
            </div>

            {/* Promo list */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="p-4 space-y-3">
                {PROMOTIONS.map((promo, i) => (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: '#1E1E1E', backgroundColor: 'rgba(255,255,255,0.02)' }}
                  >
                    {/* Color accent bar */}
                    <div className={`h-0.5 bg-gradient-to-r ${promo.gradient}`} />

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold uppercase tracking-wide ${promo.badgeColor}`}>
                              {promo.badge}
                            </span>
                            {promo.expiresAt !== 'Ongoing' && (
                              <div className="flex items-center gap-1 text-[9px]" style={{ color: '#9CA3AF' }}>
                                <Clock className="w-2.5 h-2.5" />
                                {promo.expiresAt}
                              </div>
                            )}
                          </div>
                          <p className="font-semibold text-sm" style={{ color: '#F5E8C8' }}>{promo.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{promo.subtitle}</p>
                        </div>

                        {/* Reward pills */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {promo.gcBonus && promo.gcBonus > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full number-display" style={{ background: 'rgba(214,168,79,0.12)', color: '#D6A84F' }}>
                              +{formatGC(promo.gcBonus)} GC
                            </span>
                          ) : null}
                          {promo.scBonus && promo.scBonus > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                              +{promo.scBonus} SC
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCta(promo)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-black transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                      >
                        {promo.ctaText}
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <p className="text-[9px] mt-1.5 leading-tight" style={{ color: 'rgba(156,163,175,0.6)' }}>
                        {promo.terms}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 pb-6 text-center">
                <p className="text-[10px]" style={{ color: 'rgba(156,163,175,0.5)' }}>
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
