'use client';
import { useState } from 'react';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { formatGC, getVIPColor } from '@/lib/utils';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

export default function RakebackPage() {
  const { rakebackBalance, bonusBalance, claimRakeback } = useWalletStore();
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [claimed, setClaimed] = useState(false);
  const [wagerInput, setWagerInput] = useState('100000');

  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];

  const handleClaim = () => {
    claimRakeback();
    setClaimed(true);
    setTimeout(() => setClaimed(false), 3000);
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#1E1E1E]"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.12) 0%, transparent 60%), #0A0A0A' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">Rakeback</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Your Rakeback Rewards</h1>
          <p className="text-sm max-w-lg" style={{ color: '#9CA3AF' }}>
            Every wager earns you back a % into your Bonus Balance. The higher your tier, the more you earn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claim card */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>Available to Claim</p>
              <p className="font-display text-4xl font-bold number-display text-purple-400">{formatGC(rakebackBalance)}</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Goes to Bonus Balance</p>
            </div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="text-lg">{currentTier.icon}</div>
            <div>
              <p className="text-sm font-semibold" style={{ color: getVIPColor(currentTier.tier) }}>{currentTier.name}</p>
              <p className="text-xs text-purple-400">{currentTier.rakeback}% Rakeback Rate</p>
            </div>
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleClaim}
              disabled={rakebackBalance === 0 || claimed}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-black disabled:opacity-50 transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
            >
              {claimed ? (
                <><CheckCircle2 className="w-4 h-4 text-white" /><span className="text-white">Claimed!</span></>
              ) : (
                `Claim ${formatGC(rakebackBalance)} GC Bonus`
              )}
            </button>
          ) : (
            <button onClick={() => openAuthModal()} className="w-full py-3.5 rounded-xl font-semibold text-sm text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>
              Login to Claim
            </button>
          )}

          {bonusBalance > 0 && (
            <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Current Bonus Balance</p>
              <p className="font-bold number-display text-amber-400">{formatGC(bonusBalance)} Bonus GC</p>
            </div>
          )}
        </div>

        {/* Calculator */}
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Rakeback Calculator</h3>
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: '#9CA3AF' }}>Estimated Wager Amount (GC)</label>
            <input
              type="text"
              value={wagerInput}
              onChange={(e) => setWagerInput(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-purple-400/50 transition-colors number-display"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
              placeholder="100000"
            />
          </div>

          <div className="space-y-3">
            {VIP_TIERS.map((tier) => {
              const est = Math.floor(Number(wagerInput || 0) * (tier.rakeback / 100) * 0.01);
              const isCurrentTier = tier.tier === (user?.vipTier || 1);
              return (
                <div
                  key={tier.tier}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: isCurrentTier ? `${tier.color}12` : 'rgba(255,255,255,0.02)', border: `1px solid ${isCurrentTier ? `${tier.color}30` : '#1E1E1E'}` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{tier.icon}</span>
                    <span className="text-xs font-medium" style={{ color: getVIPColor(tier.tier) }}>{tier.name}</span>
                    <span className="text-[10px]" style={{ color: '#9CA3AF' }}>({tier.rakeback}%)</span>
                  </div>
                  <span className="text-xs font-bold number-display text-purple-400">{formatGC(est)} GC</span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] leading-relaxed" style={{ color: '#9CA3AF' }}>
            Rakeback is calculated on net losses and credited daily. Rates shown are approximate. Actual rakeback depends on game type and house edge contribution.
          </p>
        </div>
      </div>

      {/* Tier progression */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: '#F5E8C8' }}>Rakeback by Tier</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {VIP_TIERS.map((tier) => (
            <div key={tier.tier} className="text-center p-3 rounded-xl border" style={{ borderColor: `${tier.color}30`, background: `${tier.color}08` }}>
              <div className="text-2xl mb-1">{tier.icon}</div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: tier.color }}>{tier.name}</p>
              <p className="text-lg font-bold number-display text-purple-400">{tier.rakeback}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Void Where Prohibited</p>
      </div>
    </div>
  );
}
