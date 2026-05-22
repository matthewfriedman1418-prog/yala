'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dice5, Zap, BarChart3, MessageCircle, Menu } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/casino', label: 'Casino', icon: Dice5 },
  { href: '/originals', label: 'Originals', icon: Zap },
  { href: '/sportsbook', label: 'Sports', icon: BarChart3 },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleChat, chatOpen, toggleMobileMenu } = useUIStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center z-40 safe-bottom"
      style={{ backgroundColor: '#0C1812', borderTop: '1px solid #1A2E22' }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            style={{ color: isActive ? '#F0B232' : '#8FA899' }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Chat toggle */}
      <button
        onClick={toggleChat}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors"
        style={{ color: chatOpen ? '#2DC97A' : '#8FA899' }}
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <span className="text-[10px] font-medium">Chat</span>
      </button>

      {/* More — slide-up menu */}
      <button
        onClick={toggleMobileMenu}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
        style={{ color: '#8FA899' }}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] font-medium">More</span>
      </button>
    </nav>
  );
}
