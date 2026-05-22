'use client';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC, formatSC, getVIPColor, getVIPName } from '@/lib/utils';
import { Bell, ChevronDown, LogOut, User, Wallet, Plus, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { WalletToggle } from '../wallet/WalletToggle';

function YalaPyramidMini() {
  return (
    <svg width="22" height="19" viewBox="0 0 40 34" fill="none">
      <defs>
        <clipPath id="pyr-hd">
          <polygon points="20,0 40,34 0,34" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="40" height="8.5" fill="#F0B232" clipPath="url(#pyr-hd)" />
      <rect x="0" y="8.5" width="40" height="8.5" fill="#84CC16" clipPath="url(#pyr-hd)" />
      <rect x="0" y="17" width="40" height="8.5" fill="#2DC97A" clipPath="url(#pyr-hd)" />
      <rect x="0" y="25.5" width="40" height="8.5" fill="#1A5C8A" clipPath="url(#pyr-hd)" />
    </svg>
  );
}

export function Header() {
  const { goldCoins, sweepCoins, bonusBalance, activeCurrency } = useWalletStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { openAuthModal, openBuyCoins, toggleChat, chatOpen } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#F0B232' : '#10B981';
  const accentLight = isGC ? '#FFD166' : '#34D399';

  return (
    <header
      className="h-16 flex items-center px-5 gap-4 flex-shrink-0 relative z-30"
      style={{
        background: 'linear-gradient(180deg, #0E1E15 0%, #0C1812 100%)',
        borderBottom: '1px solid #1A2E22',
        boxShadow: '0 1px 0 rgba(45,201,122,0.06), 0 4px 16px rgba(0,0,0,0.3)',
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${accent}14, ${accent}08)`,
                border: `1px solid ${accent}30`,
                boxShadow: `0 0 12px ${accent}18`,
              }}
            >
              <span className="text-sm font-bold" style={{ color: accent }}>{isGC ? '◈' : '◇'}</span>
              <div>
                <p className="text-[9px] uppercase tracking-widest leading-none mb-0.5" style={{ color: `${accent}80` }}>Balance</p>
                <p className="text-sm font-black number-display leading-none" style={{ color: '#F5E8C8' }}>
                  {isGC ? formatGC(goldCoins) : formatSC(sweepCoins)}
                </p>
              </div>
            </div>
            {bonusBalance > 0 && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(240,178,50,0.08)', border: '1px solid rgba(240,178,50,0.2)' }}>
                <span className="text-xs font-bold" style={{ color: '#F0B232' }}>⊕</span>
                <span className="text-xs font-semibold number-display" style={{ color: '#F5E8C8' }}>{formatGC(bonusBalance)}</span>
              </div>
            )}
          </div>

          {/* Buy button */}
          <button
            onClick={openBuyCoins}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
              color: '#060E0A',
              boxShadow: `0 2px 16px ${accent}45, inset 0 1px 0 rgba(255,255,255,0.25)`,
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

          {/* Chat toggle — desktop only (mobile uses bottom nav) */}
          <button
            onClick={toggleChat}
            className="hidden lg:flex relative p-2 rounded-lg hover:bg-white/5 transition-colors items-center justify-center"
            style={{ color: chatOpen ? '#2DC97A' : '#8FA899' }}
            aria-label="Toggle live chat"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
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
