'use client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { formatGC, formatSC, getVIPColor, getVIPName } from '@/lib/utils';
import {
  X, Users, HelpCircle, LogOut
} from 'lucide-react';
import { YalaIcon } from '@/components/ui/YalaIcon';
import { YalaAvatar } from '@/components/ui/YalaAvatar';

// Icon wrapper for YalaIcon in mobile menu lists
function YI({ name, ...rest }: { name: Parameters<typeof YalaIcon>[0]['name']; className?: string }) {
  return <YalaIcon name={name} size={16} {...rest} />;
}

const MENU_SECTIONS = [
  {
    label: 'Rewards',
    items: [
      { href: '/vip',          label: 'VIP Club',     renderIcon: () => <YI name="ticket"    /> },
      { href: '/rewards',      label: 'Rewards Hub',  renderIcon: () => <YI name="gift"/> },
      { href: '/daily-bonus',  label: 'Daily Bonus',  renderIcon: () => <YI name="chip-gold"/>, badge: 'NEW' },
      { href: '/missions',     label: 'Missions',     renderIcon: () => <YI name="crown"     /> },
      { href: '/leaderboards', label: 'Leaderboards', renderIcon: () => <YI name="trophy"    /> },
    ],
  },
  {
    label: 'Social',
    items: [
      { href: '/rooms',     label: 'Rooms',     renderIcon: () => <Users    className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA3B8' }} /> },
      { href: '/affiliate', label: 'Affiliate', renderIcon: () => <YI name="star" /> },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/vault',                label: 'Vault',     renderIcon: () => <YI name="lock"     /> },
      { href: '/wallet',               label: 'Wallet',    renderIcon: () => <YI name="wallet-icon" /> },
      { href: '/profile/transactions', label: 'History',   renderIcon: () => <YI name="activity" /> },
      { href: '/providers',            label: 'Providers', renderIcon: () => <YI name="slot-reels" /> },
      { href: '/notifications',        label: 'Notifications', renderIcon: () => <YI name="badge-star" /> },
      { href: '/settings',             label: 'Settings',  renderIcon: () => <YI name="lock" /> },
      { href: '/responsible-gaming',   label: 'Responsible Gaming', renderIcon: () => <YI name="shield" /> },
      { href: '/support',              label: 'Help',      renderIcon: () => <HelpCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA3B8' }} /> },
    ],
  },
] as const;

export function MobileSideMenu() {
  const { mobileMenuOpen, closeMobileMenu, openAuthModal, openBuyCoins, openPromotionsDrawer } = useUIStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { goldCoins, sweepCoins, activeCurrency } = useWalletStore();

  const handleClose = () => closeMobileMenu();

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Slide-up panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed left-0 right-0 bottom-0 z-50 rounded-t-2xl overflow-hidden"
            style={{
              backgroundColor: '#0A101C',
              border: '1px solid #1A2238',
              maxHeight: '85vh',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#1A2238' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #1A2238' }}>
              <div className="flex items-center gap-2.5">
                {isLoggedIn && user ? (
                  <>
                    <YalaAvatar
                      initials={user.username?.slice(0, 2) || user.avatar || 'U'}
                      tier={user.vipTier || 1}
                      size={40}
                    />
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>{user.username}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: getVIPColor(user.vipTier || 1) }}>
                        {getVIPName(user.vipTier || 1)} · Tier {user.vipTier || 1}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>Menu</p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" style={{ color: '#8FA3B8' }} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
              {/* Balance bar (if logged in) */}
              {isLoggedIn && (
                <div className="mx-4 mt-4 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(45,201,122,0.06)', border: '1px solid rgba(45,201,122,0.12)' }}>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: '#8FA3B8' }}>Balance</p>
                    <p className="text-base font-bold number-display" style={{ color: activeCurrency === 'GC' ? '#F0B232' : '#10B981' }}>
                      {activeCurrency === 'GC' ? formatGC(goldCoins) : formatSC(sweepCoins)}
                    </p>
                  </div>
                  <button
                    onClick={() => { openBuyCoins(); handleClose(); }}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-black"
                    style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
                  >
                    Add Coins
                  </button>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-2 px-4 mt-4">
                {[
                  { label: 'Promotions', color: '#F0B232', action: () => { openPromotionsDrawer(); handleClose(); }, iconEl: <YalaIcon name="gift" size={22} /> },
                  { label: 'Sportsbook', color: '#2DC97A', href: '/sportsbook', iconEl: <YalaIcon name="sports-ball" size={22} /> },
                  { label: 'Originals',  color: '#84CC16', href: '/originals',  iconEl: <YalaIcon name="lightning" size={22} /> },
                ].map((item) => {
                  const content = (
                    <>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
                        style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
                      >
                        {item.iconEl}
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: '#8FA3B8' }}>{item.label}</span>
                    </>
                  );
                  if ('action' in item && item.action) {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.action}
                        className="flex flex-col items-center py-3 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        {content}
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      onClick={handleClose}
                      className="flex flex-col items-center py-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>

              {/* Nav sections */}
              <div className="px-4 pb-4 mt-4 space-y-4">
                {MENU_SECTIONS.map((section) => (
                  <div key={section.label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: '#8FA3B8' }}>
                      {section.label}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleClose}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <span className="flex-shrink-0" style={{ color: '#8FA3B8' }}>
                            {item.renderIcon()}
                          </span>
                          <span className="text-sm flex-1" style={{ color: '#F5E8C8' }}>{item.label}</span>
                          {'badge' in item && item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-amber-500/20 text-amber-400">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Auth actions */}
                <div style={{ borderTop: '1px solid #1A2238', paddingTop: 16 }}>
                  {isLoggedIn ? (
                    <button
                      onClick={() => { logout(); handleClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => { openAuthModal('register'); handleClose(); }}
                        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-black"
                        style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
                      >
                        Create Account
                      </button>
                      <button
                        onClick={() => { openAuthModal('login'); handleClose(); }}
                        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border"
                        style={{ borderColor: 'rgba(45,201,122,0.3)', color: '#2DC97A' }}
                      >
                        Log In
                      </button>
                    </div>
                  )}
                </div>

                {/* Legal */}
                <p className="text-[9px] text-center pb-2" style={{ color: 'rgba(156,163,175,0.5)' }}>
                  18+ · No Real Money Gambling · Void Where Prohibited
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
