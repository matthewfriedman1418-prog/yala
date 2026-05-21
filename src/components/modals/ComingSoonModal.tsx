'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { X, Construction, Bell } from 'lucide-react';
import { useState } from 'react';

export function ComingSoonModal() {
  const { comingSoonOpen, comingSoonGame, closeComingSoon } = useUIStore();
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  if (!comingSoonOpen) return null;

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    setNotified(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={closeComingSoon}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm rounded-2xl border border-[#D6A84F]/20 overflow-hidden z-10 text-center"
          style={{ backgroundColor: '#111' }}
        >
          {/* Gold glow top */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D6A84F, transparent)' }} />

          <div className="px-8 py-8">
            <button onClick={closeComingSoon} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-[#9CA3AF]" />
            </button>

            {/* Animated icon */}
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(214,168,79,0.2), rgba(214,168,79,0.05))', border: '1px solid rgba(214,168,79,0.3)' }}
            >
              <Construction className="w-8 h-8" style={{ color: '#D6A84F' }} />
            </motion.div>

            <h2 className="font-display text-xl font-bold mb-2" style={{ color: '#F5E8C8' }}>
              {comingSoonGame}
            </h2>
            <p className="text-2xl font-bold mb-3" style={{ color: '#D6A84F' }}>Coming Soon</p>
            <p className="text-sm text-[#9CA3AF] mb-6 leading-relaxed">
              Our game architects are still laying the foundations. Leave your email and be the first into the oasis when it opens.
            </p>

            {!notified ? (
              <form onSubmit={handleNotify} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-[#2a2a2a] text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F] transition-colors text-center"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                >
                  <Bell className="w-4 h-4 inline mr-2" />
                  Notify Me
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
              >
                <p className="text-sm font-semibold text-emerald-400">You&apos;re on the list! 🌴</p>
                <p className="text-xs text-[#9CA3AF] mt-1">We&apos;ll send you an email when the game goes live.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
