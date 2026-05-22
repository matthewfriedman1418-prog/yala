'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Dice5, Zap, Trophy, Gift, Target,
  Wallet, HelpCircle, BarChart3, Clock, Gem, Paintbrush, Plus, User, Star,
  ChevronDown,
} from 'lucide-react';

// ── Originals sub-menu ────────────────────────────────────────────────────────
const ORIGINALS_GAMES = [
  { href: '/originals/mirage-crash',           label: 'Crash' },
  { href: '/originals/oasis-plinko',           label: 'Plinko' },
  { href: '/originals/dune-mines',             label: 'Mines' },
  { href: '/originals/golden-dice',            label: 'Dice' },
  { href: '/originals/sandstorm-limbo',        label: 'Limbo' },
  { href: '/originals/emerald-wheel',          label: 'Wheel' },
  { href: '/originals/caravan-keno',           label: 'Keno' },
  { href: '/originals/night-bazaar-blackjack', label: 'Blackjack' },
  { href: '/originals/oasis-hi-lo',            label: 'Hi-Lo' },
  { href: '/originals/desert-roulette',        label: 'Roulette' },
  { href: '/originals/pharaoh-towers',         label: 'Towers' },
  { href: '/originals/scorpion-cases',         label: 'Cases' },
];

interface NavItem {
  href?: string;
  action?: () => void;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

function Crown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 20h20M4 20l2-8 6 4 4-8 4 8 2-8" />
    </svg>
  );
}

function YalaPyramid({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 40 34" fill="none">
      <defs>
        <clipPath id="pyr-sb">
          <polygon points="20,0 40,34 0,34" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="40" height="8.5" fill="#F0B232" clipPath="url(#pyr-sb)" />
      <rect x="0" y="8.5" width="40" height="8.5" fill="#84CC16" clipPath="url(#pyr-sb)" />
      <rect x="0" y="17" width="40" height="8.5" fill="#2DC97A" clipPath="url(#pyr-sb)" />
      <rect x="0" y="25.5" width="40" height="8.5" fill="#1A5C8A" clipPath="url(#pyr-sb)" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, openPromotionsDrawer, openBuyCoins } = useUIStore();
  const [originalsOpen, setOriginalsOpen] = useState(
    pathname === '/originals' || pathname.startsWith('/originals/')
  );

  const NAV_SECTIONS: NavSection[] = [
    {
      label: 'REWARDS',
      items: [
        { href: '/daily-bonus',  label: 'Daily Bonus',  icon: Gift },
        { href: '/vip',          label: 'VIP Club',     icon: Crown },
        { href: '/missions',     label: 'Missions',     icon: Target },
        { href: '/leaderboards', label: 'Leaderboards', icon: Trophy },
        { action: openPromotionsDrawer, label: 'Promotions', icon: Gem, badge: '8' },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        { href: '/wallet',               label: 'Wallet',    icon: Wallet },
        { href: '/profile/transactions', label: 'History',   icon: Clock },
        { href: '/affiliate',            label: 'Affiliate', icon: Star },
        { href: '/profile',              label: 'Profile',   icon: User },
      ],
    },
    {
      label: 'MORE',
      items: [
        { href: '/support',    label: 'Help & Support', icon: HelpCircle },
        { href: '/design-lab', label: 'Design Lab',     icon: Paintbrush, badge: 'DEV' },
      ],
    },
  ];

  const sharedCls = (isActive: boolean) =>
    cn(
      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left',
      isActive
        ? 'nav-item-active font-semibold'
        : 'text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5'
    );

  const isOriginalsActive = pathname === '/originals' || pathname.startsWith('/originals/');

  return (
    <aside
      className="w-56 h-screen flex flex-col border-r border-[#1A2E22] overflow-y-auto no-scrollbar"
      style={{ backgroundColor: '#0C1812' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-4 py-4 border-b border-[#1A2E22] flex-shrink-0">
        <YalaPyramid size={28} />
        <div>
          <span
            className="font-display text-xl font-black tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            YALA
          </span>
          <span className="text-[9px] block -mt-0.5 tracking-widest uppercase font-semibold" style={{ color: '#4A6A55' }}>
            Social Casino
          </span>
        </div>
      </Link>

      {/* Auth buttons — logged out */}
      {!isLoggedIn && (
        <div className="px-3 py-3 border-b border-[#1A2E22] space-y-2 flex-shrink-0">
          <button
            onClick={() => openAuthModal('register')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-black text-black transition-all hover:brightness-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)', boxShadow: '0 2px 16px rgba(16,185,129,0.3)' }}
          >
            Play Free Now
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-2 px-4 rounded-xl text-sm font-semibold border transition-all hover:bg-white/5"
            style={{ borderColor: 'rgba(45,201,122,0.3)', color: '#2DC97A' }}
          >
            Sign In
          </button>
        </div>
      )}

      {/* Buy Coins CTA — logged in */}
      {isLoggedIn && (
        <div className="px-3 py-3 border-b border-[#1A2E22] flex-shrink-0">
          <button
            onClick={openBuyCoins}
            className="w-full py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #10B981, #2DC97A)',
              color: '#060E0A',
              boxShadow: '0 2px 14px rgba(16,185,129,0.3)',
            }}
          >
            <Plus className="w-4 h-4" />
            Buy Coins
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-4">

        {/* ── PLAY section: Casino + Sports + Originals (expandable) ── */}
        <div>
          <p className="text-[9px] font-bold tracking-widest uppercase px-2 mb-1" style={{ color: '#4A6A55' }}>
            PLAY
          </p>
          <div className="space-y-0.5">

            {/* Casino */}
            <Link href="/casino" className={sharedCls(pathname === '/casino' || (pathname.startsWith('/casino') && pathname.length > 7))}>
              <Dice5 className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">Casino</span>
            </Link>

            {/* Sports */}
            <Link href="/sportsbook" className={sharedCls(pathname === '/sportsbook')}>
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">Sports</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-blue-500/20 text-blue-400">
                BETA
              </span>
            </Link>

            {/* Originals toggle */}
            <button
              onClick={() => setOriginalsOpen((o) => !o)}
              className={sharedCls(isOriginalsActive)}
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">Originals</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-red-500/20 text-red-400 mr-0.5">
                HOT
              </span>
              <ChevronDown
                className={cn('w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200', originalsOpen && 'rotate-180')}
                style={{ color: '#4A6A55' }}
              />
            </button>

            {/* Originals sub-list */}
            <AnimatePresence initial={false}>
              {originalsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 pl-2.5 py-1 space-y-0.5 border-l" style={{ borderColor: '#1A2E22' }}>
                    {ORIGINALS_GAMES.map((game) => {
                      const active = pathname === game.href;
                      return (
                        <Link
                          key={game.href}
                          href={game.href}
                          className={cn(
                            'flex items-center px-2.5 py-1.5 rounded-lg text-xs transition-all',
                            active
                              ? 'font-semibold nav-item-active'
                              : 'hover:text-[#F5E8C8] hover:bg-white/5'
                          )}
                          style={{ color: active ? undefined : '#6B8F7B' }}
                        >
                          {game.label}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Remaining sections */}
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-bold tracking-widest uppercase px-2 mb-1" style={{ color: '#4A6A55' }}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href
                  ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  : false;
                const cls = sharedCls(isActive);
                const inner = (
                  <>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide',
                          item.badge === 'HOT'  ? 'bg-red-500/20 text-red-400' :
                          item.badge === 'BETA' ? 'bg-blue-500/20 text-blue-400' :
                          item.badge === 'DEV'  ? 'bg-purple-500/20 text-purple-400' :
                          'bg-[#D6A84F]/20 text-[#D6A84F]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                );
                return item.action ? (
                  <button key={item.label} onClick={item.action} className={cls}>{inner}</button>
                ) : (
                  <Link key={item.href} href={item.href!} className={cls}>{inner}</Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Legal */}
      <div className="px-3 pb-4 flex-shrink-0">
        <div className="text-center">
          <p className="text-[9px] leading-tight" style={{ color: '#4A6A55' }}>18+ · Free to Play · No Real Money</p>
          <p className="text-[9px] leading-tight" style={{ color: '#4A6A55' }}>Void Where Prohibited</p>
        </div>
      </div>
    </aside>
  );
}
