'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import { Gift, CheckCircle2, Lock } from 'lucide-react';

const STREAK_REWARDS = [
  { day: 1, gc: 500, sc: 0, label: 'Day 1' },
  { day: 2, gc: 750, sc: 0, label: 'Day 2' },
  { day: 3, gc: 1000, sc: 0, label: 'Day 3' },
  { day: 4, gc: 1500, sc: 0, label: 'Day 4' },
  { day: 5, gc: 2000, sc: 0.5, label: 'Day 5' },
  { day: 6, gc: 2500, sc: 0.5, label: 'Day 6' },
  { day: 7, gc: 5000, sc: 1, label: 'Day 7 🔥', special: true },
];

const WHEEL_SEGMENTS = [
  { label: '500 GC', value: 500, color: '#D6A84F', weight: 30 },
  { label: '1K GC', value: 1000, color: '#B9915A', weight: 25 },
  { label: '2K GC', value: 2000, color: '#D6A84F', weight: 18 },
  { label: '5K GC', value: 5000, color: '#F0C97A', weight: 12 },
  { label: '10K GC', value: 10000, color: '#E3C78A', weight: 8 },
  { label: '0.5 SC', value: 500, color: '#10B981', weight: 5, isSC: true },
  { label: '25K GC', value: 25000, color: '#D6A84F', weight: 1.5, special: true },
  { label: '1 SC', value: 1, color: '#34D399', weight: 0.5, isSC: true, special: true },
];

export default function DailyBonusPage() {
  const { addGC, addSC } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);
  const [spinDeg, setSpinDeg] = useState(0);
  const [claimedToday, setClaimedToday] = useState(false);
  const [currentStreak] = useState(7);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const handleSpin = () => {
    if (spinning || claimedToday) return;
    if (!isLoggedIn) { openAuthModal(); return; }

    setSpinning(true);
    setSpinResult(null);

    // Pick a weighted random segment
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    let result = WHEEL_SEGMENTS[0];
    for (const seg of WHEEL_SEGMENTS) {
      rand -= seg.weight;
      if (rand <= 0) { result = seg; break; }
    }

    const segIndex = WHEEL_SEGMENTS.indexOf(result);
    const segAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = 360 * 5 + (segIndex * segAngle) + (segAngle / 2);
    setSpinDeg((prev) => prev + targetAngle);

    setTimeout(() => {
      setSpinning(false);
      setSpinResult(result);
      setClaimedToday(true);
      if (result.isSC) addSC(result.value);
      else addGC(result.value);
    }, 3500);
  };

  const handleDailyClaim = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    const reward = STREAK_REWARDS[currentStreak - 1];
    addGC(reward.gc);
    if (reward.sc) addSC(reward.sc);
    setDailyClaimed(true);
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#1E1E1E]"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(214,168,79,0.12) 0%, transparent 60%), #0A0A0A' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4" style={{ color: '#D6A84F' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>Daily Bonus</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Free Daily Rewards</h1>
          <p className="text-sm max-w-lg" style={{ color: '#9CA3AF' }}>
            Log in every day to claim free Gold Coins and Sweep Coins. No purchase necessary.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak calendar */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Login Streak</h3>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(214,168,79,0.1)', border: '1px solid rgba(214,168,79,0.2)' }}>
              <span className="text-[#D6A84F] text-sm">🔥</span>
              <span className="text-sm font-bold" style={{ color: '#D6A84F' }}>{currentStreak} day streak</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {STREAK_REWARDS.map((reward) => {
              const isPast = reward.day < currentStreak;
              const isCurrent = reward.day === currentStreak;
              return (
                <div
                  key={reward.day}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all"
                  style={{
                    borderColor: isCurrent ? '#D6A84F' : isPast ? 'rgba(214,168,79,0.3)' : '#1E1E1E',
                    background: isCurrent ? 'rgba(214,168,79,0.12)' : isPast ? 'rgba(214,168,79,0.05)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#D6A84F' }} />
                  ) : isCurrent ? (
                    <Gift className="w-4 h-4" style={{ color: '#D6A84F' }} />
                  ) : (
                    <Lock className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  )}
                  <p className="text-[9px] font-medium" style={{ color: isCurrent ? '#D6A84F' : isPast ? '#D6A84F' : '#9CA3AF' }}>{reward.label}</p>
                  <p className="text-[9px] number-display" style={{ color: '#9CA3AF' }}>{formatGC(reward.gc)}</p>
                  {reward.sc > 0 && <p className="text-[9px] text-emerald-400">+{reward.sc}SC</p>}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleDailyClaim}
            disabled={dailyClaimed}
            className="w-full mt-5 py-3.5 rounded-xl font-semibold text-sm text-black disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
          >
            {dailyClaimed
              ? `✓ Day ${currentStreak} Claimed — ${formatGC(STREAK_REWARDS[currentStreak - 1].gc)} GC`
              : `Claim Day ${currentStreak} — ${formatGC(STREAK_REWARDS[currentStreak - 1].gc)} GC${STREAK_REWARDS[currentStreak - 1].sc ? ` + ${STREAK_REWARDS[currentStreak - 1].sc} SC` : ''}`}
          </button>
          <p className="text-[10px] text-center mt-2" style={{ color: '#9CA3AF' }}>Resets midnight UTC · No purchase necessary</p>
        </div>

        {/* Spin Wheel */}
        <div className="glass-card p-6 flex flex-col items-center">
          <h3 className="font-semibold mb-4 self-start" style={{ color: '#F5E8C8' }}>Daily Free Spin</h3>

          {/* Visual wheel */}
          <div className="relative w-52 h-52 mb-6">
            <motion.div
              animate={{ rotate: spinDeg }}
              transition={{ duration: 3.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full rounded-full border-4 overflow-hidden"
              style={{ borderColor: '#D6A84F', boxShadow: '0 0 30px rgba(214,168,79,0.3)' }}
            >
              {WHEEL_SEGMENTS.map((seg, i) => {
                const angle = (360 / WHEEL_SEGMENTS.length) * i;
                return (
                  <div
                    key={i}
                    className="absolute inset-0"
                    style={{
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + (360 / WHEEL_SEGMENTS.length) - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + (360 / WHEEL_SEGMENTS.length) - 90) * Math.PI / 180)}%)`,
                      background: seg.color,
                      opacity: 0.85,
                    }}
                  />
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#D6A84F] flex items-center justify-center text-xl z-10" style={{ background: '#050505' }}>
                  ◈
                </div>
              </div>
            </motion.div>
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[16px] border-l-transparent border-r-transparent" style={{ borderTopColor: '#D6A84F' }} />
            </div>
          </div>

          <AnimatePresence>
            {spinResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mb-4 px-5 py-3 rounded-xl text-center"
                style={{ background: spinResult.isSC ? 'rgba(16,185,129,0.15)' : 'rgba(214,168,79,0.15)', border: `1px solid ${spinResult.isSC ? 'rgba(16,185,129,0.4)' : 'rgba(214,168,79,0.4)'}` }}
              >
                <p className="text-lg font-bold" style={{ color: spinResult.isSC ? '#10B981' : '#D6A84F' }}>
                  🎉 You won {spinResult.label}!
                </p>
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Added to your wallet</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSpin}
            disabled={spinning || claimedToday || !isLoggedIn}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-black disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
          >
            {!isLoggedIn ? 'Login to Spin' : spinning ? 'Spinning…' : claimedToday ? '✓ Spin Used Today' : 'Free Spin!'}
          </button>

          <div className="mt-4 w-full grid grid-cols-4 gap-1">
            {WHEEL_SEGMENTS.map((seg, i) => (
              <div key={i} className="text-center py-1 rounded-lg text-[9px]" style={{ background: `${seg.color}20`, color: seg.color }}>
                {seg.label}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-center mt-3" style={{ color: '#9CA3AF' }}>One free spin per day · No purchase necessary</p>
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Void Where Prohibited · Play Responsibly</p>
      </div>
    </div>
  );
}
