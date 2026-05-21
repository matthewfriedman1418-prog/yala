'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dice5, Zap, BarChart3, Wallet, Menu } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/casino', label: 'Casino', icon: Dice5 },
  { href: '/originals', label: 'Originals', icon: Zap },
  { href: '/sportsbook', label: 'Sports', icon: BarChart3 },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleMobileMenu } = useUIStore();

  return (
    <nav className="fixed bottom-9 left-0 right-0 h-16 flex items-center z-40" style={{ backgroundColor: '#0C1812', borderTop: '1px solid #1A2E22' }}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors',
              isActive ? '' : ''
            )}
            style={{ color: isActive ? '#F0B232' : '#8FA899' }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
      <button
        onClick={toggleMobileMenu}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2" style={{ color: '#8FA899' }}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] font-medium">More</span>
      </button>
    </nav>
  );
}
