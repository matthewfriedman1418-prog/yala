'use client';
import { useWalletStore } from '@/lib/store/wallet';
import { motion } from 'framer-motion';

/**
 * GC/SC currency switcher.
 *
 * Layout fix: the previous knob used an SVG coin with its own gold stroke,
 * which collided with the track's gold border (ring-on-ring overlap).
 * This version uses a plain monogram inside a gradient circle — no nested
 * stroke — and widens the track so the inactive label has clear space.
 *
 * Track 88×34 with 3px padding. Knob 30px slides 0 → 52px. The off-side
 * label sits ~12px from the opposite edge, well clear of the knob.
 */
export function WalletToggle() {
  const { activeCurrency, toggleCurrency } = useWalletStore();
  const isGC = activeCurrency === 'GC';

  return (
    <button
      onClick={toggleCurrency}
      aria-label={`Switch to ${isGC ? 'Sweep Coins' : 'Gold Coins'}`}
      className="relative flex items-center h-[34px] w-[88px] rounded-full p-[3px] transition-colors duration-300"
      style={{
        backgroundColor: '#0A1410',
        border: `1px solid ${isGC ? 'rgba(240,178,50,0.45)' : 'rgba(45,201,122,0.45)'}`,
      }}
    >
      {/* Inactive label — shown on the side opposite the knob */}
      <span
        className="absolute text-[10px] font-black tracking-wider pointer-events-none transition-colors duration-300"
        style={{
          left: isGC ? 'auto' : 12,
          right: isGC ? 12 : 'auto',
          color: isGC ? 'rgba(45,201,122,0.55)' : 'rgba(240,178,50,0.4)',
        }}
      >
        {isGC ? 'SC' : 'GC'}
      </span>

      {/* Sliding knob — gradient sphere with letter monogram */}
      <motion.div
        layout
        animate={{ x: isGC ? 0 : 52 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-[28px] h-[28px] rounded-full flex items-center justify-center"
        style={{
          background: isGC
            ? 'radial-gradient(circle at 32% 28%, #FFE9A8 0%, #F0B232 60%, #6B4910 100%)'
            : 'radial-gradient(circle at 32% 28%, #B0F7D0 0%, #2DC97A 55%, #0a3a22 100%)',
          boxShadow: isGC
            ? '0 2px 6px rgba(240,178,50,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
            : '0 2px 6px rgba(45,201,122,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}
      >
        <span
          style={{
            fontFamily: 'Archivo Black,sans-serif',
            fontSize: 14,
            lineHeight: 1,
            color: isGC ? '#6B4910' : '#0a3a22',
            letterSpacing: '-0.02em',
          }}
        >
          {isGC ? 'Y' : '$'}
        </span>
      </motion.div>
    </button>
  );
}
