'use client';
import { useWalletStore } from '@/lib/store/wallet';
import { motion } from 'framer-motion';

export function WalletToggle() {
  const { activeCurrency, toggleCurrency } = useWalletStore();
  const isGC = activeCurrency === 'GC';

  return (
    <button
      onClick={toggleCurrency}
      className="relative flex items-center h-8 w-20 rounded-full p-1 transition-all duration-300 border"
      style={{
        backgroundColor: isGC ? 'rgba(214,168,79,0.15)' : 'rgba(16,185,129,0.15)',
        borderColor: isGC ? 'rgba(214,168,79,0.4)' : 'rgba(16,185,129,0.4)',
      }}
      aria-label={`Switch to ${isGC ? 'Sweep Coins' : 'Gold Coins'}`}
    >
      {/* Track labels */}
      <span className="absolute left-2 text-[9px] font-bold" style={{ color: isGC ? '#D6A84F' : 'rgba(214,168,79,0.3)' }}>GC</span>
      <span className="absolute right-2 text-[9px] font-bold" style={{ color: !isGC ? '#10B981' : 'rgba(16,185,129,0.3)' }}>SC</span>

      {/* Sliding knob */}
      <motion.div
        layout
        animate={{ x: isGC ? 0 : 44 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg"
        style={{ background: isGC ? 'linear-gradient(135deg, #D6A84F, #F0C97A)' : 'linear-gradient(135deg, #10B981, #34D399)' }}
      >
        {isGC ? '◈' : '◇'}
      </motion.div>
    </button>
  );
}
