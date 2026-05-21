'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { CloudRain, X } from 'lucide-react';

export function RainBanner() {
  const { rainActive, rainAmount, dismissRain, triggerRain } = useUIStore();

  // Simulate a rain event after 10s for demo purposes
  useEffect(() => {
    const t = setTimeout(() => triggerRain(5000), 10_000);
    return () => clearTimeout(t);
  }, [triggerRain]);

  return (
    <AnimatePresence>
      {rainActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(214,168,79,0.15), rgba(214,168,79,0.05))',
            borderColor: 'rgba(214,168,79,0.4)',
            backgroundColor: '#111',
          }}
          onClick={dismissRain}
        >
          <CloudRain className="w-5 h-5 flex-shrink-0" style={{ color: '#D6A84F' }} />
          <div>
            <p className="text-sm font-semibold text-[#F5E8C8]">
              🌧️ Rain! <span style={{ color: '#D6A84F' }}>GoldDuneKing</span> dropped {rainAmount?.toLocaleString()} GC
            </p>
            <p className="text-xs text-[#9CA3AF]">Tap to claim your share</p>
          </div>
          <button onClick={dismissRain} className="ml-2">
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
