'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dice5, BarChart3, Zap, Gift, Tv2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { href: '/casino',     label: 'Casino',      icon: Dice5,    badge: null },
  { href: '/sportsbook', label: 'Sports',       icon: BarChart3, badge: 'BETA' },
  { href: '/originals',  label: 'Originals',    icon: Zap,      badge: 'HOT' },
  { href: '/casino?cat=live', label: 'Live',    icon: Tv2,      badge: null },
  { href: '/rewards',    label: 'Promotions',   icon: Gift,     badge: null },
];

export function TopSectionNav() {
  const pathname = usePathname();

  return (
    <div
      className="h-10 flex items-center px-2 flex-shrink-0 overflow-x-auto no-scrollbar"
      style={{ backgroundColor: '#06101C', borderBottom: '1px solid #1A2238' }}
    >
      {SECTIONS.map((s) => {
        const Icon = s.icon;
        const isActive =
          s.href === '/casino?cat=live'
            ? false
            : pathname === s.href || (s.href !== '/' && pathname.startsWith(s.href.split('?')[0]));

        return (
          <Link
            key={s.href}
            href={s.href}
            className={cn(
              'relative flex items-center gap-1.5 px-4 h-full text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0',
              isActive ? 'text-[#F5E8C8]' : 'text-[#4A5878] hover:text-[#8FA3B8]'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {s.label}
            {s.badge && (
              <span
                className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase leading-none tracking-wide"
                style={{
                  background: s.badge === 'HOT' ? 'rgba(239,68,68,0.15)' : 'rgba(96,165,250,0.15)',
                  color: s.badge === 'HOT' ? '#F87171' : '#93C5FD',
                }}
              >
                {s.badge}
              </span>
            )}
            {/* Active underline */}
            {isActive && (
              <span
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg, #2DC97A, #F0B232)' }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
