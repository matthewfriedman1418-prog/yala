'use client';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC, formatSC, getVIPColor, getVIPName } from '@/lib/utils';
import { Bell, ChevronDown, LogOut, User, Wallet, Plus } from 'lucide-react';
import { useState } from 'react';
import { WalletToggle } from '../wallet/WalletToggle';

export function Header() {
  const { goldCoins, sweepCoins, bonusBalance, activeCurrency } = useWalletStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { openAuthModal, openBuyCoins } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#D6A84F' : '#10B981';

  return (
    <header className="h-14 border-b border-[#1E1E1E] flex items-center px-4 gap-4 flex-shrink-0 relative z-30" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D6A84F, #A07830)' }}>
          <span className="text-black font-bold text-xs font-display">Y</span>
        </div>
        <span className="font-display font-bold text-base tracking-wide" style={{ color: '#D6A84F' }}>YALA</span>
      </div>

      <div className="flex-1" />

      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          {/* Wallet toggle */}
          <WalletToggle />

          {/* Balances */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border" style={{ borderColor: `${accent}30`, backgroundColor: `${accent}10` }}>
              <span className="text-xs font-bold" style={{ color: accent }}>
                {isGC ? '◈' : '◇'}
              </span>
              <span className="text-xs font-semibold number-display" style={{ color: '#F5E8C8' }}>
                {isGC ? formatGC(goldCoins) : formatSC(sweepCoins)}
              </span>
            </div>
            {bonusBalance > 0 && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10">
                <span className="text-xs font-bold text-amber-400">⊕</span>
                <span className="text-xs font-semibold number-display text-[#F5E8C8]">{formatGC(bonusBalance)}</span>
              </div>
            )}
          </div>

          {/* Buy button */}
          <button
            onClick={openBuyCoins}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-black transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${accent}, ${isGC ? '#F0C97A' : '#34D399'})` }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buy Coins</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell className="w-4 h-4 text-[#9CA3AF]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                style={{ background: `linear-gradient(135deg, ${getVIPColor(user?.vipTier || 1)}, ${accent})` }}
              >
                {user?.avatar || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#F5E8C8]">{user?.username}</p>
                <p className="text-[10px]" style={{ color: getVIPColor(user?.vipTier || 1) }}>
                  {getVIPName(user?.vipTier || 1)}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[#1E1E1E] overflow-hidden shadow-2xl z-50" style={{ backgroundColor: '#111' }}>
                <div className="px-4 py-3 border-b border-[#1E1E1E]">
                  <p className="text-xs font-semibold text-[#F5E8C8]">{user?.username}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-[#9CA3AF] hover:bg-white/5 hover:text-[#F5E8C8]" onClick={() => setProfileOpen(false)}>
                    <User className="w-4 h-4" />Profile
                  </Link>
                  <Link href="/wallet" className="flex items-center gap-3 px-4 py-2 text-sm text-[#9CA3AF] hover:bg-white/5 hover:text-[#F5E8C8]" onClick={() => setProfileOpen(false)}>
                    <Wallet className="w-4 h-4" />Wallet
                  </Link>
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
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
            className="px-4 py-2 text-sm font-medium border border-[#D6A84F]/30 text-[#D6A84F] rounded-lg hover:bg-[#D6A84F]/10 transition-all"
          >
            Login
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="px-4 py-2 text-sm font-semibold text-black rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
          >
            Sign Up
          </button>
        </div>
      )}
    </header>
  );
}
