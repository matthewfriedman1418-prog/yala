'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Menu } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui';
import { YalaIcon } from '@/components/ui/YalaIcon';

const NAV_ITEMS = [
  { href: '/casino',     label: 'Casino',    icon: 'slot-reels'  as const },
  { href: '/originals',  label: 'Originals', icon: 'lightning'   as const },
  { href: '/sportsbook', label: 'Sports',    icon: 'sports-ball' as const },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleChat, chatOpen, toggleMobileMenu } = useUIStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 flex items-center z-40 safe-bottom"
      style={{
        backgroundColor: '#0A101C',
        borderTop: '1px solid #1A2238',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors"
            style={{ color: isActive ? '#F0B232' : '#8FA3B8' }}
          >
            <YalaIcon name={item.icon} size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {isActive && (
              <span
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: '#F0B232', boxShadow: '0 0 6px rgba(240,178,50,0.8)' }}
              />
            )}
          </Link>
        );
      })}

      {/* Chat toggle */}
      <button
        onClick={toggleChat}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors"
        style={{ color: chatOpen ? '#2DC97A' : '#8FA3B8' }}
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{ background: '#2DC97A', boxShadow: '0 0 4px rgba(45,201,122,0.8)' }}
          />
        </div>
        <span className="text-[10px] font-medium">Chat</span>
        {chatOpen && (
          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: '#2DC97A', boxShadow: '0 0 6px rgba(45,201,122,0.8)' }} />
        )}
      </button>

      {/* More */}
      <button
        onClick={toggleMobileMenu}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
        style={{ color: '#8FA3B8' }}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] font-medium">More</span>
      </button>
    </nav>
  );
}
