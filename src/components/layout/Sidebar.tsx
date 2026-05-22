'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';
import {
  Dice5, Zap, Trophy, Star, Gift, Target,
  Users, Wallet, Shield, HelpCircle,
  BarChart3, Layers, Clock, Gem, Paintbrush
} from 'lucide-react';

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

/** Yala pyramid icon — solid triangle clipped into 4 horizontal color bands (logo #16) */
function YalaPyramid({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 40 34" fill="none">
      <defs>
        <clipPath id="pyr-sb">
          <polygon points="20,0 40,34 0,34" />
        </clipPath>
      </defs>
      {/* gold top */}
      <rect x="0" y="0" width="40" height="8.5" fill="#F0B232" clipPath="url(#pyr-sb)" />
      {/* lime */}
      <rect x="0" y="8.5" width="40" height="8.5" fill="#84CC16" clipPath="url(#pyr-sb)" />
      {/* teal */}
      <rect x="0" y="17" width="40" height="8.5" fill="#2DC97A" clipPath="url(#pyr-sb)" />
      {/* ocean blue base */}
      <rect x="0" y="25.5" width="40" height="8.5" fill="#1A5C8A" clipPath="url(#pyr-sb)" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, openPromotionsDrawer } = useUIStore();

  const NAV_SECTIONS: NavSection[] = [
    {
      label: 'PLAY',
      items: [
        { href: '/casino', label: 'Casino', icon: Dice5 },
        { href: '/originals', label: 'Yala Originals', icon: Zap, badge: 'HOT' },
        { href: '/sportsbook', label: 'Sportsbook', icon: BarChart3, badge: 'BETA' },
      ],
    },
    {
      label: 'REWARDS',
      items: [
        { href: '/vip', label: 'VIP Club', icon: Crown },
        { href: '/rewards', label: 'Rewards Hub', icon: Star },
        { href: '/daily-bonus', label: 'Daily Bonus', icon: Gift },
        { href: '/missions', label: 'Missions', icon: Target },
        { href: '/leaderboards', label: 'Leaderboards', icon: Trophy },
        { action: openPromotionsDrawer, label: 'Promotions', icon: Gem, badge: '8' },
      ],
    },
    {
      label: 'SOCIAL',
      items: [
        { href: '/rooms', label: 'Rooms', icon: Users },
        { href: '/affiliate', label: 'Affiliate', icon: Layers },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        { href: '/wallet', label: 'Wallet', icon: Wallet },
        { href: '/vault', label: 'Vault', icon: Shield },
        { href: '/profile/transactions', label: 'History', icon: Clock },
      ],
    },
    {
      label: 'INFO',
      items: [
        { href: '/responsible-gaming', label: 'Responsible Gaming', icon: Shield },
        { href: '/support', label: 'Help & Support', icon: HelpCircle },
        { href: '/providers', label: 'Providers', icon: Layers },
        { href: '/design-lab', label: 'Design Lab', icon: Paintbrush, badge: 'DEV' },
      ],
    },
  ];

  return (
    <aside className="w-60 h-screen flex flex-col border-r border-[#1A2E22] overflow-y-auto no-scrollbar" style={{ backgroundColor: '#0C1812' }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-4 py-4 border-b border-[#1A2E22] flex-shrink-0">
        <YalaPyramid size={30} />
        <div>
          <span className="font-display text-xl font-black tracking-wider" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>YALA</span>
          <span className="text-[10px] block -mt-0.5 tracking-widest uppercase" style={{ color: '#8FA899' }}>Desert Casino</span>
        </div>
      </Link>

      {/* Auth buttons (logged out) */}
      {!isLoggedIn && (
        <div className="px-4 py-4 border-b border-[#1A2E22] space-y-2 flex-shrink-0">
          <button
            onClick={() => openAuthModal('register')}
            className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-black transition-all"
            style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
          >
            Sign Up
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-2 px-4 rounded-lg text-sm font-semibold border transition-all"
            style={{ borderColor: 'rgba(45,201,122,0.3)', color: '#2DC97A' }}
          >
            Login
          </button>
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 py-3 px-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-[#9CA3AF] tracking-widest uppercase px-2 mb-1">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href
                  ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  : false;

                const sharedClass = cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left',
                  isActive
                    ? 'nav-item-active font-medium'
                    : 'text-[#9CA3AF] hover:text-[#F5E8C8] hover:bg-white/5'
                );

                const inner = (
                  <>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide',
                        item.badge === 'HOT' ? 'bg-red-500/20 text-red-400' :
                        item.badge === 'BETA' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-[#D6A84F]/20 text-[#D6A84F]'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </>
                );

                return item.action ? (
                  <button key={item.label} onClick={item.action} className={sharedClass}>
                    {inner}
                  </button>
                ) : (
                  <Link key={item.href} href={item.href!} className={sharedClass}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Legal strip */}
      <div className="px-3 pb-4 flex-shrink-0">
        <div className="text-center">
          <p className="text-[9px] text-[#9CA3AF]/60 leading-tight">18+ | No Real Money Gambling</p>
          <p className="text-[9px] text-[#9CA3AF]/60 leading-tight">Void Where Prohibited</p>
        </div>
      </div>
    </aside>
  );
}
