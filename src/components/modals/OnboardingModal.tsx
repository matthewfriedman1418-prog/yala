'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useWalletStore } from '@/lib/store/wallet';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
  const { onboardingOpen, closeOnboarding } = useUIStore();
  const { addGC, addSC } = useWalletStore();
  const [step, setStep] = useState<number>(0);
  const [claimed, setClaimed] = useState(false);

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
        onClick={isLast ? () => { closeOnboarding(); setStep(0); setClaimed(false); } : undefined}
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
              {/* Animated pyramid */}
              <div className="flex justify-center my-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14 }}
                >
                  <svg width="80" height="68" viewBox="0 0 40 34" fill="none">
                    <defs>
                      <clipPath id="pyr-ob">
                        <polygon points="20,0 40,34 0,34" />
                      </clipPath>
                    </defs>
                    <rect x="0" y="0" width="40" height="8.5" fill="#F0B232" clipPath="url(#pyr-ob)" />
                    <rect x="0" y="8.5" width="40" height="8.5" fill="#84CC16" clipPath="url(#pyr-ob)" />
                    <rect x="0" y="17" width="40" height="8.5" fill="#2DC97A" clipPath="url(#pyr-ob)" />
                    <rect x="0" y="25.5" width="40" height="8.5" fill="#1A5C8A" clipPath="url(#pyr-ob)" />
                  </svg>
                </motion.div>
              </div>
              <h2 className="font-display text-2xl font-black" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Welcome to Yala
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#8FA899' }}>
                You just unlocked one of the sharpest social casinos on the internet. Free to play, zero pressure, maximum fun.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                {['100+ Casino Games', 'Live Sportsbook', 'Yala Originals', 'Daily Bonuses'].map((f) => (
                  <span key={f} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.2)', color: '#2DC97A' }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Dual currency */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="text-center mb-3">
                <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Two Ways to Play</h2>
                <p className="text-xs mt-1" style={{ color: '#8FA899' }}>Switch anytime. No pressure.</p>
              </div>
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(240,178,50,0.08)', border: '1px solid rgba(240,178,50,0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">◈</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#F0B232' }}>Gold Coins</p>
                    <p className="text-xs" style={{ color: '#8FA899' }}>Play for fun. Earn through missions, bonuses, and daily rewards. Zero cash value.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">◇</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#10B981' }}>Sweep Coins</p>
                    <p className="text-xs" style={{ color: '#8FA899' }}>Play the sweepstakes mode. Eligible for redemption under sweepstakes rules. No purchase necessary to enter or win.</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-center pt-1" style={{ color: 'rgba(156,163,175,0.5)' }}>
                18+ · No Purchase Necessary · Void Where Prohibited
              </p>
            </div>
          )}

          {/* STEP 2: Claim coins */}
          {step === 2 && (
            <div className="text-center space-y-4">
              <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Your Starter Pack</h2>
              <p className="text-sm" style={{ color: '#8FA899' }}>A gift from Yala. Yours the moment you click.</p>

              <div className="space-y-3">
                <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.25)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">◈</span>
                    <span className="font-bold" style={{ color: '#F0B232' }}>250,000 Gold Coins</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,178,50,0.2)', color: '#F0B232' }}>Free</span>
                </div>
                <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">◇</span>
                    <span className="font-bold" style={{ color: '#10B981' }}>5.00 Sweep Coins</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>Free</span>
                </div>
              </div>

              {!claimed ? (
                <button
                  onClick={handleClaim}
                  className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', boxShadow: '0 0 24px rgba(45,201,122,0.35)' }}
                >
                  Claim My Free Coins
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'rgba(45,201,122,0.15)', border: '1px solid rgba(45,201,122,0.3)' }}
                >
                  <Check className="w-4 h-4" style={{ color: '#2DC97A' }} />
                  <span className="font-bold text-sm" style={{ color: '#2DC97A' }}>Coins Added to Wallet</span>
                </motion.div>
              )}
            </div>
          )}

          {/* STEP 3: Go play */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="text-5xl my-4"
              >
                🏆
              </motion.div>
              <h2 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>You&apos;re All Set</h2>
              <p className="text-sm" style={{ color: '#8FA899' }}>
                Casino, sportsbook, originals, daily bonuses. It&apos;s all right here.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/casino"
                  onClick={() => { closeOnboarding(); setStep(0); setClaimed(false); }}
                  className="py-3 rounded-xl text-sm font-bold text-black text-center"
                  style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
                >
                  Hit the Casino
                </Link>
                <Link
                  href="/sportsbook"
                  onClick={() => { closeOnboarding(); setStep(0); setClaimed(false); }}
                  className="py-3 rounded-xl text-sm font-semibold text-center border"
                  style={{ borderColor: 'rgba(45,201,122,0.35)', color: '#2DC97A' }}
                >
                  View Sportsbook
                </Link>
              </div>
              <Link
                href="/originals"
                onClick={() => { closeOnboarding(); setStep(0); setClaimed(false); }}
                className="flex items-center justify-center gap-1 text-xs transition-colors"
                style={{ color: '#8FA899' }}
              >
                Explore Yala Originals <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* CTA button */}
          {step !== 2 && (
            <button
              onClick={handleNext}
              className="w-full mt-5 py-3 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
            >
              {isLast ? 'Start Playing' : 'Next'}
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
