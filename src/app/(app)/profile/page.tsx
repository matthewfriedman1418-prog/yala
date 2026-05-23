'use client';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { formatGC, formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Shield, Copy, Calendar, CheckCircle2, TrendingUp, Wallet, Clock, Star } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { GoldCoinIcon, SweepCoinIcon, YalaIcon } from '@/components/ui/YalaIcon';

export default function ProfilePage() {
  const { isLoggedIn, user } = useAuthStore();
  const { goldCoins, sweepCoins, xp } = useWalletStore();
  const { openAuthModal } = useUIStore();
  const [copied, setCopied] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p style={{ color: '#8FA899' }}>Sign in to view your profile</p>
        <button
          onClick={() => openAuthModal()}
          className="px-6 py-3 rounded-xl font-semibold text-sm text-black"
          style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)' }}
        >
          Sign In
        </button>
      </div>
    );
  }

  const tierColor = getVIPColor(user?.vipTier || 1);
  const tierName  = getVIPName(user?.vipTier || 1);
  const currentTier = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1)) || VIP_TIERS[0];
  const nextTier    = VIP_TIERS.find((t) => t.tier === (user?.vipTier || 1) + 1);
  const progress    = nextTier
    ? Math.max(0, Math.min(100, ((xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)) * 100))
    : 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.referralCode || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">

      {/* ── TOP ROW: Avatar + VIP + stats ── */}
      <div
        className="relative rounded-2xl overflow-hidden p-6"
        style={{
          background: `radial-gradient(ellipse at 10% 50%, ${tierColor}12 0%, transparent 55%), #0C1812`,
          border: `1px solid ${tierColor}25`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">

          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${tierColor}30, ${tierColor}10)`, border: `1px solid ${tierColor}35` }}
          >
            {user?.avatar}
          </div>

          {/* Name + tier + compact XP bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-bold mb-0.5" style={{ color: '#F5E8C8' }}>{user?.username}</h1>
                <p className="text-sm mb-1.5" style={{ color: '#6B8F7B' }}>{user?.email}</p>

                {/* Tier + KYC chip */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-sm font-bold" style={{ color: tierColor }}>{currentTier.icon} {tierName}</span>
                  {user?.isVerified && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#2DC97A' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> KYC Verified
                    </div>
                  )}
                </div>

                {/* Compact XP bar — sits right under the tier name */}
                <div className="max-w-[280px]">
                  <div className="flex justify-between text-[10px] mb-1 font-mono">
                    <span style={{ color: tierColor }}>{formatXP(xp)} XP</span>
                    {nextTier && (
                      <span style={{ color: '#4A6A55' }}>
                        {(nextTier.xpRequired - xp).toLocaleString()} to {nextTier.name}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1A2E22' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${tierColor}, ${nextTier ? getVIPColor(nextTier.tier) : tierColor})` }}
                    />
                  </div>
                </div>
              </div>

              <Link
                href="/kyc"
                className="flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-colors hover:border-[#2DC97A]/40 flex-shrink-0"
                style={{ borderColor: '#1A2E22', color: '#8FA899' }}
              >
                <Shield className="w-3 h-3" />
                {user?.isVerified ? 'Verified' : 'Get Verified'}
              </Link>
            </div>
          </div>
        </div>

        {/* Coin balances inline — Vault removed, real YalaIcons replacing the ◈/◇ glyphs */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5" style={{ borderTop: '1px solid #1A2E22' }}>
          <div className="text-center">
            <div className="flex justify-center mb-1.5"><GoldCoinIcon size={22} /></div>
            <p className="font-black text-lg number-display" style={{ color: '#F0B232' }}>{formatGC(goldCoins)}</p>
            <p className="text-[10px]" style={{ color: '#4A6A55' }}>Gold Coins</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1.5"><SweepCoinIcon size={24} /></div>
            <p className="font-black text-lg number-display" style={{ color: '#2DC97A' }}>{sweepCoins.toFixed(2)} SC</p>
            <p className="text-[10px]" style={{ color: '#4A6A55' }}>Sweep Coins</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1.5"><YalaIcon name="activity" size={22} /></div>
            <p className="font-black text-lg number-display" style={{ color: '#A78BFA' }}>{formatGC(user?.totalWagered || 0)}</p>
            <p className="text-[10px]" style={{ color: '#4A6A55' }}>Total Wagered</p>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID: account info + referral + quick links ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Account Details */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#F5E8C8' }}>Account Details</h3>
          {[
            { label: 'Member Since', value: user?.joinDate || '2025-01-14', icon: Calendar },
            { label: 'Country',       value: user?.country || 'US',         icon: Shield },
            { label: 'Rakeback Rate', value: `${currentTier.rakeback}%`,    icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#6B8F7B' }}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.label}
                </div>
                <span className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>{item.value}</span>
              </div>
            );
          })}
        </div>

        {/* Referral Code */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#F0B232]" />
            <h3 className="font-semibold text-sm" style={{ color: '#F5E8C8' }}>Referral Code</h3>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-3.5 rounded-xl cursor-pointer group"
            style={{ background: 'rgba(240,178,50,0.06)', border: '1px solid rgba(240,178,50,0.2)' }}
            onClick={handleCopy}
          >
            <span className="font-mono font-black text-xl flex-1" style={{ color: '#F0B232' }}>{user?.referralCode}</span>
            <button className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
              {copied ? <CheckCircle2 className="w-4 h-4 text-[#2DC97A]" /> : <Copy className="w-4 h-4" style={{ color: '#4A6A55' }} />}
            </button>
          </div>
          <p className="text-xs" style={{ color: '#4A6A55' }}>Share this code and earn 5,000 GC per successful referral.</p>
          <Link
            href="/affiliate"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold border transition-all hover:border-[#F0B232]/40"
            style={{ borderColor: 'rgba(240,178,50,0.2)', color: '#F0B232' }}
          >
            Open Affiliate Dashboard →
          </Link>
        </div>

        {/* Quick Links */}
        <div className="rounded-2xl p-5 space-y-2" style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: '#F5E8C8' }}>Quick Links</h3>
          {[
            { label: 'Transaction History', href: '/profile/transactions', icon: Clock,   color: '#8FA899' },
            { label: 'Wallet',              href: '/wallet',               icon: Wallet,  color: '#F0B232' },
            { label: 'VIP Club',            href: '/vip',                  icon: Star,    color: '#A78BFA' },
            { label: 'KYC / Verify',        href: '/kyc',                  icon: Shield,  color: '#2DC97A' },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
                style={{ color: '#8FA899' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: link.color }} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
