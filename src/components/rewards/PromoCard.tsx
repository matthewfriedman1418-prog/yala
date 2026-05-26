'use client';

/**
 * PromoCard — single visual treatment used on /promotions, /rewards, and the
 * PromotionsDrawer so they all look consistent. Type-aware accent colors and
 * iconography; "Ready" badge for things claimable RIGHT NOW.
 */

import { motion } from 'framer-motion';
import {
  Gift, Calendar, RefreshCw, TrendingUp, Trophy, Crown, Users, Sparkles, Clock, ChevronRight,
} from 'lucide-react';
import type { Promotion } from '@/lib/mock-data/promotions';
import { formatGC } from '@/lib/utils';

const TYPE_META: Record<
  Promotion['type'],
  { icon: typeof Gift; accent: string; bg: string; label: string }
> = {
  welcome:    { icon: Sparkles,   accent: '#34D399', bg: 'rgba(52,211,153,0.12)',  label: 'Welcome' },
  daily:      { icon: Calendar,   accent: '#F0B232', bg: 'rgba(240,178,50,0.12)',  label: 'Daily' },
  reload:     { icon: RefreshCw,  accent: '#FB923C', bg: 'rgba(251,146,60,0.12)',  label: 'Reload' },
  race:       { icon: Trophy,     accent: '#EF4444', bg: 'rgba(239,68,68,0.12)',   label: 'Race' },
  vip:        { icon: Crown,      accent: '#A78BFA', bg: 'rgba(167,139,250,0.12)', label: 'VIP' },
  cashback:   { icon: TrendingUp, accent: '#2DC97A', bg: 'rgba(45,201,122,0.12)',  label: 'Cashback' },
  tournament: { icon: Trophy,     accent: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  label: 'Tournament' },
  referral:   { icon: Users,      accent: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  label: 'Referral' },
};

interface Props {
  promo: Promotion;
  index?: number;
  ready?: boolean;
  onClaim?: (promo: Promotion) => void;
  /** Compact variant for sidebars and the rewards-hub featured strip. */
  compact?: boolean;
}

export function PromoCard({ promo, index = 0, ready, onClaim, compact }: Props) {
  const meta = TYPE_META[promo.type];
  const Icon = meta.icon;

  if (compact) {
    return (
      <motion.button
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => onClaim?.(promo)}
        className="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-all hover:bg-white/[0.025]"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2238' }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: meta.bg, border: `1px solid ${meta.accent}33`, color: meta.accent }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold truncate" style={{ color: '#F5E8C8' }}>{promo.title}</p>
          <p className="text-[10px] truncate" style={{ color: '#8FA3B8' }}>{promo.subtitle}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {promo.gcBonus ? (
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232' }}>
              +{(promo.gcBonus / 1000).toFixed(0)}K GC
            </span>
          ) : null}
          {promo.scBonus ? (
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(45,201,122,0.12)', color: '#2DC97A' }}>
              +{promo.scBonus} SC
            </span>
          ) : null}
          <ChevronRight className="w-3.5 h-3.5" style={{ color: '#4A5878' }} />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{ background: '#0F1828', border: `1px solid ${ready ? `${meta.accent}55` : '#1A2238'}` }}
    >
      {/* Type accent stripe along the top */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${meta.accent}, transparent)` }} />

      <div className="p-4 flex flex-col flex-1">
        {/* Header — type pill + countdown */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{ background: meta.bg, border: `1px solid ${meta.accent}33` }}
          >
            <Icon className="w-3 h-3" style={{ color: meta.accent }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: meta.accent }}>
              {meta.label}
            </span>
          </div>
          {ready ? (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(45,201,122,0.14)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.30)' }}
            >
              · Ready
            </span>
          ) : (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: '#4A5878' }}>
              <Clock className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{promo.expiresAt}</span>
            </div>
          )}
        </div>

        {/* Title + subtitle */}
        <h3 className="font-display font-black text-base leading-tight mb-1" style={{ color: '#F5E8C8' }}>
          {promo.title}
        </h3>
        <p className="text-[11px] mb-2" style={{ color: meta.accent }}>{promo.subtitle}</p>
        <p className="text-[12px] leading-relaxed mb-3 flex-1" style={{ color: '#8FA3B8' }}>{promo.description}</p>

        {/* Reward chips */}
        {(promo.gcBonus || promo.scBonus) ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {promo.gcBonus && promo.gcBonus > 0 ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-black" style={{ background: 'rgba(240,178,50,0.10)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.28)' }}>
                +{formatGC(promo.gcBonus)} GC
              </span>
            ) : null}
            {promo.scBonus && promo.scBonus > 0 ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-black" style={{ background: 'rgba(45,201,122,0.10)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.28)' }}>
                +{promo.scBonus} SC
              </span>
            ) : null}
          </div>
        ) : null}

        {/* CTA */}
        <button
          type="button"
          onClick={() => onClaim?.(promo)}
          className="w-full py-2 rounded-xl text-xs font-black transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-1.5"
          style={{
            background: ready
              ? `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`
              : `${meta.bg}`,
            color: ready ? '#040814' : meta.accent,
            border: ready ? 'none' : `1px solid ${meta.accent}44`,
            boxShadow: ready ? `0 4px 16px ${meta.accent}40` : 'none',
          }}
        >
          {promo.ctaText}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <p className="text-[9px] mt-2 leading-relaxed" style={{ color: '#4A5878' }}>{promo.terms}</p>
      </div>
    </motion.div>
  );
}

export { TYPE_META as PROMO_TYPE_META };
