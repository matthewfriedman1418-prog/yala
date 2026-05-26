'use client';

/**
 * CookieBanner — bottom slide-in shown on first visit until consent is given.
 *
 * Persists choice as `yala-cookie-consent` = 'accepted' | 'declined'. Includes
 * the CCPA-required "Do Not Sell or Share" link. Real consent management
 * platform (OneTrust / TrustArc / Osano) plugs in later — this is the visible
 * surface.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'yala-cookie-consent';
type Choice = 'accepted' | 'declined';

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as Choice | null;
      if (!v) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const choose = (c: Choice) => {
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="fixed left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-[90] rounded-2xl overflow-hidden"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
            background: 'linear-gradient(180deg, #0F1A14 0%, #0A1410 100%)',
            border: '1px solid rgba(240,178,50,0.25)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.55)',
          }}
          role="dialog"
          aria-label="Cookie preferences"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(240,178,50,0.12)', border: '1px solid rgba(240,178,50,0.28)' }}
              >
                <Cookie className="w-5 h-5" style={{ color: '#F0B232' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold mb-1" style={{ color: '#F5E8C8' }}>
                  We use cookies
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: '#8FA899' }}>
                  We use cookies to keep you signed in, remember preferences, and improve the site. You can decline non-essential cookies any time. See our{' '}
                  <Link href="/privacy" className="underline" style={{ color: '#F0B232' }}>privacy policy</Link>
                  {' · '}
                  <button
                    type="button"
                    onClick={() => choose('declined')}
                    className="underline"
                    style={{ color: '#F0B232', background: 'none', padding: 0, border: 0, cursor: 'pointer' }}
                  >
                    Do not sell or share
                  </button>.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => choose('declined')}
                className="py-2 rounded-lg text-xs font-bold transition-colors hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#8FA899' }}
              >
                Decline non-essential
              </button>
              <button
                type="button"
                onClick={() => choose('accepted')}
                className="py-2 rounded-lg text-xs font-black transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
                  color: '#060E0A',
                  boxShadow: '0 3px 12px rgba(45,201,122,0.30)',
                }}
              >
                Accept all
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
