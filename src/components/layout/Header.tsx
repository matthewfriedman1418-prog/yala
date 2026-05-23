'use client';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC, formatSC, getVIPColor, getVIPName } from '@/lib/utils';
import { Bell, ChevronDown, LogOut, User, Plus, MessageCircle, Zap } from 'lucide-react';
import { useState } from 'react';
import { WalletToggle } from '../wallet/WalletToggle';
import { GoldCoinIcon, YalaIcon } from '@/components/ui/YalaIcon';

function YalaPyramidMini() {
  return (
    <svg width="20" height="17" viewBox="0 0 40 34" fill="none">
      <defs><clipPath id="pyr-hd"><polygon points="20,0 40,34 0,34" /></clipPath></defs>
      <rect x="0" y="0"    width="40" height="8.5"  fill="#F0B232" clipPath="url(#pyr-hd)" />
      <rect x="0" y="8.5"  width="40" height="8.5"  fill="#84CC16" clipPath="url(#pyr-hd)" />
      <rect x="0" y="17"   width="40" height="8.5"  fill="#2DC97A" clipPath="url(#pyr-hd)" />
      <rect x="0" y="25.5" width="40" height="8.5"  fill="#1A5C8A" clipPath="url(#pyr-hd)" />
    </svg>
  );
}

function YalaWordmarkMini() {
  return (
    <svg width="56" height="20" viewBox="0 0 130 50" aria-label="YALA">
      <defs>
        <radialGradient id="wm-hd" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0%"   stopColor="#FFF4D0" />
          <stop offset="40%"  stopColor="#FFE08A" />
          <stop offset="75%"  stopColor="#F0B232" />
          <stop offset="100%" stopColor="#8a5a14" />
        </radialGradient>
      </defs>
      <text x="65" y="43" textAnchor="middle" fontFamily="Archivo Black,sans-serif" fontSize="46" fill="url(#wm-hd)" letterSpacing="5">YALA</text>
    </svg>
  );
}

export function Header() {
  const { goldCoins, sweepCoins, activeCurrency } = useWalletStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { openAuthModal, openBuyCoins, toggleChat, chatOpen } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#F0B232' : '#10B981';

  return (
    <header
      className="h-16 flex items-center px-5 flex-shrink-0 relative z-30"
      style={{
        background: 'linear-gradient(180deg, #0E1E15 0%, #0C1812 100%)',
        borderBottom: '1px solid #1A2E22',
        boxShadow: '0 1px 0 rgba(45,201,122,0.06), 0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── LEFT: mobile logo only (desktop logo is in sidebar) ── */}
      <div className="flex-1 flex items-center">
        <div className="lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <YalaPyramidMini />
            <YalaWordmarkMini />
          </Link>
        </div>
      </div>

      {/* ── CENTER: currency toggle + balance + BIG buy button ── */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            {/* GC / SC toggle pill */}
            <WalletToggle />

            {/* Balance display */}
            <div
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${accent}14, ${accent}08)`,
                border: `1px solid ${accent}30`,
              }}
            >
              {isGC
                ? <GoldCoinIcon size={20} />
                : <YalaIcon name="chip-green" size={20} />
              }
              <div>
                <p className="text-[9px] uppercase tracking-widest leading-none mb-0.5" style={{ color: `${accent}80` }}>
                  {isGC ? 'Gold Coins' : 'Sweep Coins'}
                </p>
                <p className="text-sm font-black number-display leading-none" style={{ color: '#F5E8C8' }}>
                  {isGC ? formatGC(goldCoins) : formatSC(sweepCoins)}
                </p>
              </div>
            </div>

            {/* BIG green Buy Coins button */}
            <button
              onClick={openBuyCoins}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-95 whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #10B981, #2DC97A)',
                color: '#060E0A',
                boxShadow: '0 2px 20px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
                letterSpacing: '0.01em',
              }}
            >
              <Plus className="w-4 h-4" />
              Buy Coins
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => openAuthModal('login')}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all hover:opacity-80"
              style={{ border: '1px solid rgba(45,201,122,0.3)', color: '#2DC97A' }}
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-black rounded-xl transition-all hover:brightness-110 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #10B981, #2DC97A)',
                color: '#060E0A',
                boxShadow: '0 2px 20px rgba(16,185,129,0.35)',
              }}
            >
              <Zap className="w-4 h-4" />
              Play Free
            </button>
          </>
        )}
      </div>

      {/* ── RIGHT: utility icons + profile ── */}
      <div className="flex-1 flex items-center justify-end gap-1">
        {isLoggedIn && (
          <>
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Bell className="w-4 h-4" style={{ color: '#8FA899' }} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>

            {/* Chat — desktop only */}
            <button
              onClick={toggleChat}
              className="hidden lg:flex relative p-2 rounded-lg hover:bg-white/5 transition-colors items-center justify-center"
              style={{ color: chatOpen ? '#2DC97A' : '#8FA899' }}
              aria-label="Toggle live chat"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
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
                  <p className="text-xs font-semibold leading-none" style={{ color: '#F5E8C8' }}>{user?.username}</p>
                  <p className="text-[10px] leading-none mt-0.5" style={{ color: getVIPColor(user?.vipTier || 1) }}>
                    {getVIPName(user?.vipTier || 1)}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 hidden md:block" style={{ color: '#8FA899' }} />
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
                      <YalaIcon name="wallet-icon" size={16} />Wallet
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
          </>
        )}
      </div>
    </header>
  );
}
