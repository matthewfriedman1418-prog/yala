'use client';

/**
 * AgeGate — full-screen modal shown on first visit asking the user to confirm
 * they are 18+. Required for US sweepstakes operations. Persistence is a
 * simple localStorage flag (`yala-age-confirmed`) so we don't pester repeat
 * visitors. In production this gets a server-side check too.
 *
 * If the user says "I'm under 18" they're routed to a hard-stop page rather
 * than allowed to dismiss the gate.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Calendar } from 'lucide-react';

const STORAGE_KEY = 'yala-age-confirmed';

function YalaPyramid() {
  return (
    <svg width="64" height="56" viewBox="0 0 40 34" fill="none" aria-hidden="true">
      <defs><clipPath id="pyr-gate"><polygon points="20,0 40,34 0,34" /></clipPath></defs>
      <rect x="0" y="0"    width="40" height="8.5"  fill="#F0B232" clipPath="url(#pyr-gate)" />
      <rect x="0" y="8.5"  width="40" height="8.5"  fill="#84CC16" clipPath="url(#pyr-gate)" />
      <rect x="0" y="17"   width="40" height="8.5"  fill="#2DC97A" clipPath="url(#pyr-gate)" />
      <rect x="0" y="25.5" width="40" height="8.5"  fill="#1A5C8A" clipPath="url(#pyr-gate)" />
    </svg>
  );
}

export function AgeGate() {
  const [open, setOpen]   = useState(false);
  const [denied, setDenied] = useState(false);

  // Read localStorage on mount only — SSR safe
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v !== 'true') setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const confirm = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    setOpen(false);
  };

  const deny = () => {
    setDenied(true);
    // Don't persist; if they come back tomorrow we ask again.
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(4,8,20,0.92)', backdropFilter: 'blur(8px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.98, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0F1828 0%, #08121C 100%)',
              border: '1px solid rgba(240,178,50,0.25)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(240,178,50,0.10)',
            }}
          >
            {!denied ? (
              <>
                <div className="px-6 sm:px-8 pt-8 pb-6 text-center">
                  <div className="mx-auto mb-5 flex items-center justify-center">
                    <YalaPyramid />
                  </div>
                  <h1 id="age-gate-title" className="font-display text-2xl font-black tracking-tight mb-2" style={{ color: '#F5E8C8' }}>
                    Welcome to Yala
                  </h1>
                  <p className="text-sm mb-1" style={{ color: '#8FA3B8' }}>
                    Yala is an 18+ social sweepstakes platform.
                  </p>
                  <p className="text-xs" style={{ color: '#4A5878' }}>
                    Please confirm your age to continue.
                  </p>
                </div>

                <div className="px-6 sm:px-8 pb-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={deny}
                    className="py-3 rounded-xl text-sm font-bold transition-colors hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#8FA3B8' }}
                  >
                    Under 18
                  </button>
                  <button
                    type="button"
                    onClick={confirm}
                    className="py-3 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-1.5"
                    style={{
                      background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
                      color: '#040814',
                      boxShadow: '0 4px 20px rgba(45,201,122,0.40)',
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    I&apos;m 18 or older
                  </button>
                </div>

                <div
                  className="px-6 sm:px-8 py-4 mt-2 flex items-start gap-2.5"
                  style={{ background: '#08121C', borderTop: '1px solid #1A2238' }}
                >
                  <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#2DC97A' }} />
                  <p className="text-[10px] leading-relaxed" style={{ color: '#8FA3B8' }}>
                    No Purchase Necessary · Void Where Prohibited · Gold Coins have no monetary value · Sweep Coins redemption subject to applicable law and identity verification.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto mb-5 flex items-center justify-center">
                  <YalaPyramid />
                </div>
                <h1 className="font-display text-2xl font-black tracking-tight mb-2" style={{ color: '#F5E8C8' }}>
                  Sorry — you must be 18+
                </h1>
                <p className="text-sm mb-1" style={{ color: '#8FA3B8' }}>
                  Yala is only available to adults aged 18 and over.
                </p>
                <p className="text-xs mt-4" style={{ color: '#4A5878' }}>
                  If you need help with problem gambling, contact the National Council on Problem Gambling at{' '}
                  <a href="tel:1-800-522-4700" className="font-bold" style={{ color: '#2DC97A' }}>1-800-522-4700</a>.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
