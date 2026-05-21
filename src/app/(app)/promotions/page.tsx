'use client';
import { motion } from 'framer-motion';
import { PROMOTIONS } from '@/lib/mock-data/promotions';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { formatGC } from '@/lib/utils';
import { Gift, ChevronRight, Clock } from 'lucide-react';

export default function PromotionsPage() {
  const { openAuthModal, openBuyCoins } = useUIStore();
  const { isLoggedIn } = useAuthStore();

  const handleCta = (promo: typeof PROMOTIONS[0]) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (promo.type === 'welcome' || promo.type === 'reload') openBuyCoins();
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#1E1E1E]"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(214,168,79,0.1) 0%, transparent 60%), #0A0A0A' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4" style={{ color: '#D6A84F' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>Promotions</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Desert Deals</h1>
          <p className="text-sm max-w-lg" style={{ color: '#9CA3AF' }}>Exclusive offers, bonuses, and rewards — always fresh from the oasis.</p>
        </div>
      </div>

      {/* Featured promo */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 border" style={{ background: 'linear-gradient(135deg, rgba(214,168,79,0.15), rgba(16,185,129,0.05))', borderColor: 'rgba(214,168,79,0.3)' }}>
        <div className="relative z-10">
          <span className="inline-block text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide mb-3" style={{ background: 'rgba(214,168,79,0.2)', color: '#D6A84F' }}>
            🌟 Featured
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Desert Welcome Pack</h2>
          <p className="text-sm mb-4 max-w-lg" style={{ color: '#9CA3AF' }}>New to Yala? Get up to 100,000 Gold Coins + 50 Sweep Coins on your first purchase. No wagering on GC.</p>
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(214,168,79,0.1)', border: '1px solid rgba(214,168,79,0.2)' }}>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Gold Coins</p>
              <p className="font-bold number-display" style={{ color: '#D6A84F' }}>+100,000 GC</p>
            </div>
            <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Sweep Coins</p>
              <p className="font-bold number-display text-emerald-400">+50 SC</p>
            </div>
          </div>
          <button
            onClick={() => isLoggedIn ? openBuyCoins() : openAuthModal('register')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
          >
            {isLoggedIn ? 'Buy Coins' : 'Sign Up & Claim'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* All promos grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROMOTIONS.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card overflow-hidden flex flex-col"
          >
            {/* Color bar */}
            <div className={`h-1 bg-gradient-to-r ${promo.gradient}`} />

            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wide ${promo.badgeColor}`}>{promo.badge}</span>
                {promo.expiresAt !== 'Ongoing' && (
                  <div className="flex items-center gap-1 text-[10px]" style={{ color: '#9CA3AF' }}>
                    <Clock className="w-3 h-3" />
                    {promo.expiresAt}
                  </div>
                )}
              </div>

              <h3 className="font-display font-bold text-lg mb-1" style={{ color: '#F5E8C8' }}>{promo.title}</h3>
              <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>{promo.subtitle}</p>
              <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: '#9CA3AF' }}>{promo.description}</p>

              {/* Rewards */}
              <div className="flex flex-wrap gap-2 mb-4">
                {promo.gcBonus && promo.gcBonus > 0 ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold number-display" style={{ background: 'rgba(214,168,79,0.12)', color: '#D6A84F' }}>
                    ◈ {formatGC(promo.gcBonus)} GC
                  </span>
                ) : null}
                {promo.scBonus && promo.scBonus > 0 ? (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                    ◇ {promo.scBonus} SC
                  </span>
                ) : null}
              </div>

              <button
                onClick={() => handleCta(promo)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
              >
                {promo.ctaText}
              </button>

              <p className="text-[10px] mt-2" style={{ color: '#9CA3AF' }}>{promo.terms}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-[#1E1E1E] pt-6 text-center space-y-1">
        <p className="text-xs" style={{ color: '#9CA3AF' }}>18+ · No Purchase Necessary · Void Where Prohibited · Play Responsibly</p>
        <p className="text-[10px]" style={{ color: 'rgba(156,163,175,0.5)' }}>All promotions subject to full terms and conditions. Gold Coins have no cash value.</p>
      </div>
    </div>
  );
}
