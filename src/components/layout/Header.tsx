'use client';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC, formatSC, getVIPColor, getVIPName } from '@/lib/utils';
import { Bell, ChevronDown, LogOut, User, Wallet, Plus } from 'lucide-react';
import { useState } from 'react';
import { WalletToggle } from '../wallet/WalletToggle';

function YalaPyramidMini() {
  return (
    <svg width="22" height="19" viewBox="0 0 40 34" fill="none">
      <path d="M2 34h36L20 24z" fill="#1A7A4A"/>
      <path d="M8 24h24L20 14z" fill="#2DC97A"/>
      <path d="M13 14h14L20 6z" fill="#84CC16"/>
      <path d="M16.5 6h7L20 1z" fill="#F0B232"/>
    </svg>
  );
}

export function Header() {
  const { goldCoins, sweepCoins, bonusBalance, activeCurrency } = useWalletStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { openAuthModal, openBuyCoins } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#F0B232' : '#10B981';
  const accentLight = isGC ? '#FFD166' : '#34D399';

  return (
    <header
      className="h-14 flex items-center px-4 gap-4 flex-shrink-0 relative z-30"
      style={{
        backgroundColor: '#0C1812',
        borderBottom: '1px solid #1A2E22',
        boxShadow: '0 1px 0 rgba(45,201,122,0.06)',
      }}
    >
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2">
        <YalaPyramidMini />
        <span
          className="font-display font-black text-base tracking-wider"
          style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          YALA
        </span>
      </div>

      <div className="flex-1" />

      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          {/* Wallet toggle */}
          <WalletToggle />

          {/* Balances */}
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
              style={{ borderColor: `${accent}28`, backgroundColor: `${accent}10` }}
            >
              <span className="text-xs font-bold" style={{ color: accent }}>
                {isGC ? '◈' : '◇'}
              </span>
              <span className="text-xs font-semibold number-display" style={{ color: '#F5E8C8' }}>
                {isGC ? formatGC(goldCoins) : formatSC(sweepCoins)}
              </span>
            </div>
            {bonusBalance > 0 && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/8">
                <span className="text-xs font-bold text-amber-400">⊕</span>
                <span className="text-xs font-semibold number-display text-[#F5E8C8]">{formatGC(bonusBalance)}</span>
              </div>
            )}
          </div>

          {/* Buy button — gradient #16 style */}
          <button
            onClick={openBuyCoins}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
              color: '#060E0A',
              boxShadow: `0 0 12px ${accent}40`,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buy Coins</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell className="w-4 h-4" style={{ color: '#8FA899' }} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: `linear-gradient(135deg, ${getVIPColor(user?.vipTier || 1)}, ${accent})`,
                  color: '#060E0A',
                }}
              >
                {user?.avatar || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold" style={{ color: '#F5E8C8' }}>{user?.username}</p>
                <p className="text-[10px]" style={{ color: getVIPColor(user?.vipTier || 1) }}>
                  {getVIPName(user?.vipTier || 1)}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: '#8FA899' }} />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-2xl z-50"
                style={{ backgroundColor: '#101C16', border: '1px solid #1A2E22' }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #1A2E22' }}>
                  <p className="text-xs font-semibold" style={{ color: '#F5E8C8' }}>{user?.username}</p>
                  <p className="text-[10px]" style={{ color: '#8FA899' }}>{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors" style={{ color: '#8FA899' }} onClick={() => setProfileOpen(false)}>
                    <User className="w-4 h-4" />Profile
                  </Link>
                  <Link href="/wallet" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors" style={{ color: '#8FA899' }} onClick={() => setProfileOpen(false)}>
                    <Wallet className="w-4 h-4" />Wallet
                  </Link>
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{ border: '1px solid rgba(45,201,122,0.3)', color: '#2DC97A' }}
          >
            Login
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="px-4 py-2 text-sm font-bold rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
          >
            Sign Up
          </button>
        </div>
      )}
    </header>
  );
}
