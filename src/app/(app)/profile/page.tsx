'use client';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { VIP_TIERS } from '@/lib/mock-data/users';
import { formatGC, formatXP, getVIPColor, getVIPName } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Shield, Copy, Calendar, CheckCircle2, TrendingUp, Wallet, Clock, Star, Pencil, Check, X, Eye, EyeOff, Camera, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { YalaIcon } from '@/components/ui/YalaIcon';
import { YalaAvatar } from '@/components/ui/YalaAvatar';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { isLoggedIn, user, updateDisplayName, setProfilePrivate, setAvatarUrl } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large (2MB max)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) {
        setAvatarUrl(url);
        toast.success('Avatar updated');
      }
    };
    reader.onerror = () => toast.error('Could not read the image');
    reader.readAsDataURL(file);
  };
  const { xp } = useWalletStore();
  const { openAuthModal } = useUIStore();
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const handleSaveName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setEditingName(false);
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 24) {
      toast.error('Name must be 3–24 characters');
      return;
    }
    updateDisplayName(trimmed);
    setEditingName(false);
    toast.success('Display name updated', { description: 'Visible on your profile and referral card.' });
  };

  const startEditName = () => {
    setNameDraft(user?.displayName || user?.username || '');
    setEditingName(true);
  };

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
    toast.success('Referral code copied', { description: `Share ${user?.referralCode} and earn 5,000 GC per signup.` });
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

          {/* Avatar — click to upload, hover for replace/remove controls */}
          <div className="relative group flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarFile(file);
                e.target.value = ''; // allow re-selecting same file
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative block focus:outline-none focus:ring-2 focus:ring-amber-400/40 rounded-full"
              aria-label="Upload avatar"
              title="Click to upload an avatar"
            >
              {user?.avatarUrl ? (
                // Custom upload — use YalaAvatar so the tier ring + badge still show
                <YalaAvatar
                  initials={user.avatar}
                  tier={user.vipTier}
                  size={80}
                  src={user.avatarUrl}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold transition-all group-hover:brightness-110"
                  style={{ background: `linear-gradient(135deg, ${tierColor}30, ${tierColor}10)`, border: `1px solid ${tierColor}35`, color: '#F5E8C8' }}
                >
                  {user?.avatar}
                </div>
              )}
              {/* Hover overlay */}
              <div
                className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(6,14,10,0.65)' }}
              >
                <Camera className="w-5 h-5" style={{ color: '#F5E8C8' }} />
              </div>
            </button>
            {/* Remove avatar button — only when one is set */}
            {user?.avatarUrl && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setAvatarUrl(null); toast.success('Avatar removed'); }}
                aria-label="Remove avatar"
                title="Remove avatar"
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: '#EF4444', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Name + tier + progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setEditingName(false);
                      }}
                      maxLength={24}
                      className="font-display text-2xl font-bold bg-transparent border-b focus:outline-none px-1"
                      style={{ color: '#F5E8C8', borderColor: tierColor }}
                    />
                    <button
                      onClick={handleSaveName}
                      aria-label="Save name"
                      className="p-1.5 rounded-lg transition-colors hover:bg-emerald-500/10"
                      style={{ color: '#2DC97A' }}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      aria-label="Cancel"
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                      style={{ color: '#8FA899' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-0.5 group">
                    <h1 className="font-display text-2xl font-bold" style={{ color: '#F5E8C8' }}>
                      {user?.displayName || user?.username}
                    </h1>
                    <button
                      onClick={startEditName}
                      aria-label="Edit display name"
                      title="Edit display name"
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/5"
                      style={{ color: '#8FA899' }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <p className="text-sm mb-1" style={{ color: '#8FA899' }}>{user?.email}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: tierColor }}>
                    <YalaIcon name={currentTier.icon} size={14} />
                    {tierName}
                  </span>
                  {user?.isVerified && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#2DC97A' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> KYC Verified
                    </div>
                  )}
                </div>
              </div>
              <Link
                href="/kyc"
                className="flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-colors hover:border-[#2DC97A]/40"
                style={{ borderColor: '#1A2E22', color: '#8FA899' }}
              >
                <Shield className="w-3 h-3" />
                {user?.isVerified ? 'Verified' : 'Get Verified'}
              </Link>
            </div>

            {/* XP bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: '#8FA899' }}>{formatXP(xp)} XP</span>
                {nextTier && (
                  <span style={{ color: '#4A6A55' }}>
                    {(nextTier.xpRequired - xp).toLocaleString()} XP to {nextTier.name}
                  </span>
                )}
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A2E22' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${tierColor}, ${nextTier ? getVIPColor(nextTier.tier) : tierColor})` }}
                />
              </div>
              <p className="text-[10px] text-right mt-1" style={{ color: '#4A6A55' }}>{progress.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* GC / SC / Total Wagered tiles removed — balances live in the header, and
            wagered shows in the All-Time Stats card below. Keep this section
            clean so the avatar + name + XP bar is the focus. */}
      </div>

      {/* ── ALL-TIME STATS ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #F0B232, #2DC97A)' }} />
          <h3 className="font-display text-base font-bold" style={{ color: '#F5E8C8' }}>All-Time Stats</h3>
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#4A6A55' }}>since {user?.joinDate}</span>
        </div>
        {(() => {
          const wagered   = user?.totalWagered      || 0;
          const deposited = user?.totalDeposited    || 0;
          const withdrawn = user?.totalWithdrawn    || 0;
          const bonus     = user?.totalBonusReceived || 0;
          // Profit = (deposits - withdrawals) flipped + bonus → shown favorably
          const netSpend = deposited - withdrawn;          // negative = net winnings
          const adjustedProfit = -netSpend + bonus;        // higher = better
          const profitColor = adjustedProfit >= 0 ? '#2DC97A' : '#EF4444';

          const stats = [
            { label: 'Amount Wagered',  value: formatGC(wagered),       sub: 'GC + SC combined',    icon: <YalaIcon name="activity" size={20} />, color: '#A78BFA' },
            { label: 'Deposits',        value: `$${(deposited / 100).toFixed(2)}`, sub: 'lifetime',           icon: <YalaIcon name="wallet-icon" size={20} />, color: '#F0B232' },
            { label: 'Bonus Received',  value: formatGC(bonus),         sub: 'free play + promos',   icon: <YalaIcon name="gift" size={20} />,     color: '#FFD166' },
            { label: 'Profit',          value: `${adjustedProfit >= 0 ? '+' : ''}$${(adjustedProfit / 100).toFixed(2)}`, sub: 'incl. bonus value', icon: <TrendingUp className="w-5 h-5" style={{ color: profitColor }} />, color: profitColor },
          ];
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2E22' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {s.icon}
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: '#8FA899' }}>{s.label}</span>
                  </div>
                  <p className="font-display text-xl font-black number-display leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] mt-1" style={{ color: '#4A6A55' }}>{s.sub}</p>
                </div>
              ))}
            </div>
          );
        })()}
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
                <div className="flex items-center gap-2 text-sm" style={{ color: '#8FA899' }}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.label}
                </div>
                <span className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>{item.value}</span>
              </div>
            );
          })}

          {/* Privacy toggle — controls what other players see in the chat profile popover */}
          <div className="pt-3" style={{ borderTop: '1px solid #1A2E22' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                {user?.profilePrivate
                  ? <EyeOff className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#F0B232' }} />
                  : <Eye className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#8FA899' }} />
                }
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>Private profile</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#4A6A55' }}>
                    Hide your stats from other players in chat. They&apos;ll still see your name and tier.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!user?.profilePrivate}
                onClick={() => {
                  const next = !user?.profilePrivate;
                  setProfilePrivate(next);
                  toast.success(next ? 'Profile set to private' : 'Profile set to public', {
                    description: next ? 'Other players won’t see your stats.' : 'Your stats are now visible in chat.',
                  });
                }}
                className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors mt-0.5"
                style={{ background: user?.profilePrivate ? '#F0B232' : '#1A2E22' }}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full transform transition-transform"
                  style={{
                    background: user?.profilePrivate ? '#060E0A' : '#8FA899',
                    transform: user?.profilePrivate ? 'translateX(22px)' : 'translateX(2px)',
                  }}
                />
              </button>
            </div>
          </div>
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
