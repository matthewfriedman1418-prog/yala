'use client';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { formatGC, formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Shield, Copy, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { isLoggedIn, user } = useAuthStore();
  const { goldCoins, sweepCoins, xp, vaultBalance } = useWalletStore();
  const { openAuthModal } = useUIStore();
  const [copied, setCopied] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-[#9CA3AF]">Login to view your profile</p>
        <button onClick={() => openAuthModal()} className="px-6 py-3 rounded-xl font-semibold text-sm text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>Login</button>
      </div>
    );
  }

  const tierColor = getVIPColor(user?.vipTier || 1);
  const tierName = getVIPName(user?.vipTier || 1);
  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress = nextTier ? Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100) : 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.referralCode || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Profile header */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${tierColor}, rgba(0,0,0,0.2))` }}
          >
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold" style={{ color: '#F5E8C8' }}>{user?.username}</h1>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold" style={{ color: tierColor }}>{tierName}</span>
                  {user?.isVerified && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />KYC Verified
                    </div>
                  )}
                </div>
              </div>
              <Link href="/kyc" className="flex items-center gap-1 text-xs border px-3 py-1.5 rounded-lg transition-colors hover:border-[#D6A84F]/50" style={{ borderColor: '#2a2a2a', color: '#9CA3AF' }}>
                <Shield className="w-3 h-3" />
                {user?.isVerified ? 'Verified' : 'Verify'}
              </Link>
            </div>

            {/* XP Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#9CA3AF' }}>{formatXP(xp)}</span>
                {nextTier && <span style={{ color: '#9CA3AF' }}>Next: {nextTier.name} ({nextTier.xpRequired.toLocaleString()} XP)</span>}
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1E1E1E' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${tierColor}, ${nextTier ? getVIPColor(nextTier.tier) : tierColor})` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Gold Coins', value: formatGC(goldCoins), color: '#D6A84F', icon: '◈' },
          { label: 'Sweep Coins', value: `${sweepCoins.toFixed(2)} SC`, color: '#10B981', icon: '◇' },
          { label: 'Vault Balance', value: formatGC(vaultBalance), color: '#3B82F6', icon: '🏛' },
          { label: 'Total Wagered', value: formatGC(user?.totalWagered || 0), color: '#8B5CF6', icon: '↩' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <p className="font-bold text-lg number-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Account Details</h3>
          {[
            { label: 'Member Since', value: user?.joinDate || '2025-01-14', icon: Calendar },
            { label: 'Country', value: user?.country || 'US', icon: Shield },
            { label: 'Rakeback Rate', value: `${currentTier.rakeback}%`, icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#9CA3AF' }}>
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </div>
                <span className="text-sm font-medium" style={{ color: '#F5E8C8' }}>{item.value}</span>
              </div>
            );
          })}
        </div>

        <div className="glass-card p-5 space-y-3">
          <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Referral Code</h3>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(214,168,79,0.1)', border: '1px solid rgba(214,168,79,0.2)' }}>
            <span className="font-mono font-bold text-lg flex-1" style={{ color: '#D6A84F' }}>{user?.referralCode}</span>
            <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/10">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#9CA3AF]" />}
            </button>
          </div>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Share this code and earn 5,000 GC per successful referral.</p>
          <Link href="/affiliate" className="block w-full text-center py-2 rounded-lg text-xs font-semibold border transition-all hover:border-[#D6A84F]/50" style={{ borderColor: '#2a2a2a', color: '#D6A84F' }}>
            View Affiliate Dashboard →
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Transaction History', href: '/profile/transactions' },
          { label: 'KYC / Verify', href: '/kyc' },
          { label: 'Responsible Gaming', href: '/responsible-gaming' },
          { label: 'VIP Club', href: '/vip' },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="glass-card p-3 text-center text-xs font-medium transition-all hover:border-[#D6A84F]/30" style={{ color: '#9CA3AF' }}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
