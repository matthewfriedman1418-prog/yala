'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useModalA11y } from '@/lib/hooks/useModalA11y';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { GoldCoinIcon, SweepCoinIcon } from '@/components/ui/YalaIcon';

const STEPS = [
  {
    key: 'welcome',
    title: 'Welcome to Yala',
    subtitle: "You're in. Time to play.",
  },
  {
    key: 'currency',
    title: 'Two ways to play',
    subtitle: 'Pick your coin, set your pace.',
  },
  {
    key: 'coins',
    title: 'Your starter pack',
    subtitle: "On us. No strings attached.",
  },
  {
    key: 'go',
    title: "Let's go",
    subtitle: 'The oasis is yours.',
  },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

export function OnboardingModal() {
  const { onboardingOpen, closeOnboarding, markOnboardingSeen, openOnboarding } = useUIStore();
  const { addGC, addSC } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  useModalA11y(onboardingOpen, closeOnboarding);
  const [step, setStep] = useState<number>(0);
  const [claimed, setClaimed] = useState(false);

  /**
   * Auto-fire trigger:
   *   - User must be signed in (no point granting a starter pack to nobody)
   *   - Must not have completed onboarding yet (persisted flag)
   *   - Wait a tick after mount/login so Zustand persist has rehydrated
   *
   * Effect re-runs when isLoggedIn flips (so registering or logging in fires
   * onboarding for a fresh user without a full page reload).
   *
   * Note: the AuthModal calls `resetOnboardingSeen()` on successful register
   * so newly-created accounts always see the welcome flow even if the device
   * has been used by a different account before.
   */
  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setTimeout(() => {
      if (!useUIStore.getState().onboardingSeen) {
        openOnboarding();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoggedIn, openOnboarding]);

  // Persist the seen flag when the user dismisses or completes
  const dismissAndRemember = () => {
    markOnboardingSeen();
    closeOnboarding();
    setStep(0);
    setClaimed(false);
  };

  if (!onboardingOpen) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleClaim = () => {
    if (claimed) return;
    addGC(250_000);
    addSC(5);
    setClaimed(true);
  };

  const handleNext = () => {
    if (isLast) {
      closeOnboarding();
      setStep(0);
      setClaimed(false);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={isLast ? dismissAndRemember : undefined}
      />

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="relative w-full max-w-sm rounded-2xl overflow-hidden z-10"
        style={{ backgroundColor: '#101C16', border: '1px solid #1A2E22', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
      >
        {/* Shimmer top bar */}
        <div
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, #2DC97A, #F0B232, #84CC16, #2DC97A)',
            backgroundSize: '300% auto',
            animation: 'shimmer 3s linear infinite',
          }}
        />

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                backgroundColor: i === step ? '#F0B232' : i < step ? '#2DC97A' : '#1A2E22',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 pb-6 pt-3">
          {/* STEP 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-4">
              {/* Animated pyramid with glow */}
              <div className="relative flex justify-center my-6">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14 }}
                  className="relative"
                >
                  <div
                    className="absolute inset-0 blur-2xl"
                    style={{ background: 'radial-gradient(circle, rgba(240,178,50,0.45) 0%, transparent 65%)' }}
                  />
                  <svg width="92" height="78" viewBox="0 0 40 34" fill="none" className="relative">
                    <defs>
                      <clipPath id="pyr-ob">
                        <polygon points="20,0 40,34 0,34" />
                      </clipPath>
                    </defs>
                    <rect x="0" y="0"    width="40" height="8.5"  fill="#F0B232" clipPath="url(#pyr-ob)" />
                    <rect x="0" y="8.5"  width="40" height="8.5"  fill="#84CC16" clipPath="url(#pyr-ob)" />
                    <rect x="0" y="17"   width="40" height="8.5"  fill="#2DC97A" clipPath="url(#pyr-ob)" />
                    <rect x="0" y="25.5" width="40" height="8.5"  fill="#1A5C8A" clipPath="url(#pyr-ob)" />
                  </svg>
                </motion.div>
              </div>
              <h2 className="font-display text-3xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Welcome to Yala
              </h2>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: '#8FA899' }}>
                A free-to-play sweepstakes casino with games <span className="font-bold" style={{ color: '#F5E8C8' }}>built in-house</span> and{' '}
                <span className="font-bold" style={{ color: '#F5E8C8' }}>real cash prizes</span> on Sweep Coins.
              </p>
              <p className="text-[10px]" style={{ color: '#4A6A55' }}>4 quick steps · about 30 seconds</p>
            </div>
          )}

          {/* STEP 1: Dual currency */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="text-center mb-3">
                <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Two ways to play</h2>
                <p className="text-xs mt-1" style={{ color: '#8FA899' }}>Switch any time with the toggle in the header.</p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(240,178,50,0.10), rgba(240,178,50,0.04))',
                  border: '1px solid rgba(240,178,50,0.30)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <GoldCoinIcon size={28} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-black text-base" style={{ color: '#F0B232' }}>Gold Coins</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F0B232' }}>Play for fun</p>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: '#8FA899' }}>
                  Virtual play currency. Free from daily bonuses, missions, and rewards. <span className="font-bold" style={{ color: '#F5E8C8' }}>No cash value.</span>
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(45,201,122,0.10), rgba(45,201,122,0.04))',
                  border: '1px solid rgba(45,201,122,0.30)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <SweepCoinIcon size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-black text-base" style={{ color: '#2DC97A' }}>Sweep Coins</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2DC97A' }}>Play for prizes</p>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: '#8FA899' }}>
                  Sweepstakes currency. Redeemable for cash prizes after identity verification. <span className="font-bold" style={{ color: '#F5E8C8' }}>1 SC = $1 USD</span>.
                </p>
              </div>
              <p className="text-[10px] text-center pt-1" style={{ color: 'rgba(143,168,153,0.5)' }}>
                No Purchase Necessary · 18+ · Void Where Prohibited
              </p>
            </div>
          )}

          {/* STEP 2: Claim coins */}
          {step === 2 && (
            <div className="text-center space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Your starter pack</h2>
                <p className="text-xs mt-1" style={{ color: '#8FA899' }}>On us. No strings, no card required.</p>
              </div>

              <div className="space-y-2">
                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{
                    background: 'linear-gradient(135deg, rgba(240,178,50,0.14), rgba(240,178,50,0.06))',
                    border: '1px solid rgba(240,178,50,0.35)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <GoldCoinIcon size={28} />
                    <div className="text-left">
                      <p className="font-display font-black text-lg leading-tight" style={{ color: '#F0B232' }}>250,000</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F0B232' }}>Gold Coins</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,178,50,0.20)', color: '#F0B232' }}>Free</span>
                </div>
                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,201,122,0.14), rgba(45,201,122,0.06))',
                    border: '1px solid rgba(45,201,122,0.35)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <SweepCoinIcon size={32} />
                    <div className="text-left">
                      <p className="font-display font-black text-lg leading-tight" style={{ color: '#2DC97A' }}>5.00</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2DC97A' }}>Sweep Coins</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,201,122,0.20)', color: '#2DC97A' }}>Free</span>
                </div>
              </div>

              {!claimed ? (
                <button
                  onClick={handleClaim}
                  className="w-full py-3 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
                    color: '#060E0A',
                    boxShadow: '0 4px 24px rgba(45,201,122,0.45)',
                  }}
                >
                  Claim my starter pack
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14 }}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'rgba(45,201,122,0.15)', border: '1px solid rgba(45,201,122,0.45)' }}
                >
                  <Check className="w-4 h-4" style={{ color: '#2DC97A' }} />
                  <span className="font-bold text-sm" style={{ color: '#2DC97A' }}>Added to your wallet</span>
                </motion.div>
              )}
            </div>
          )}

          {/* STEP 3: Pick where to start */}
          {step === 3 && (
            <div className="text-center space-y-3">
              <div>
                <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Where to next?</h2>
                <p className="text-xs mt-1" style={{ color: '#8FA899' }}>Pick anywhere — you can always come back.</p>
              </div>

              <div className="space-y-2 pt-1">
                {[
                  {
                    href: '/originals',
                    title: 'Yala Originals',
                    sub: 'Trail, Caravan Cross, Mirage Auction — built in-house, provably fair.',
                    accent: '#F0B232',
                    accentSec: '#FFD166',
                    badge: '3 playable',
                  },
                  {
                    href: '/casino',
                    title: 'Casino',
                    sub: 'Slots, live dealer, table games from 12 studios.',
                    accent: '#2DC97A',
                    accentSec: '#34D399',
                    badge: '1,000+ games',
                  },
                  {
                    href: '/sportsbook',
                    title: 'Sportsbook',
                    sub: 'NFL, NBA, MMA, soccer. Singles + parlays.',
                    accent: '#60A5FA',
                    accentSec: '#818CF8',
                    badge: 'Live now',
                  },
                ].map((dest) => (
                  <Link
                    key={dest.href}
                    href={dest.href}
                    onClick={dismissAndRemember}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/[0.025]"
                    style={{
                      background: `linear-gradient(135deg, ${dest.accent}12, ${dest.accent}06)`,
                      border: `1px solid ${dest.accent}33`,
                    }}
                  >
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-black text-sm" style={{ color: dest.accent }}>{dest.title}</p>
                        <span
                          className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                          style={{ background: `${dest.accent}1A`, color: dest.accent, border: `1px solid ${dest.accent}33` }}
                        >
                          {dest.badge}
                        </span>
                      </div>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#8FA899' }}>{dest.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: dest.accent }} />
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={dismissAndRemember}
                className="text-[11px] underline opacity-70 hover:opacity-100 transition-opacity pt-1"
                style={{ color: '#8FA899' }}
              >
                Skip — I&apos;ll explore
              </button>
            </div>
          )}

          {/* CTA button — hidden on steps 2 (claim) and 3 (destination picker) */}
          {step !== 2 && step !== 3 && (
            <button
              onClick={handleNext}
              className="w-full mt-5 py-3 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleNext}
              disabled={!claimed}
              className="w-full mt-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-30"
              style={{ color: '#8FA899' }}
            >
              {claimed ? 'Continue' : 'Claim your coins to proceed'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
