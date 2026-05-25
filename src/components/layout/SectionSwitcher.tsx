'use client';

/**
 * SectionSwitcher — the Casino vs Sports vs Originals primary product
 * toggle. Lives in the header (left side on desktop, below header on mobile).
 *
 * This mirrors the Stake / Rainbet pattern where the two halves of the
 * product (casino + sportsbook) are surfaced as the top-most navigational
 * affordance — distinct from the contextual sidebar.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dice5, BarChart3, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  href: string;
  label: string;
  icon: typeof Dice5;
  /** Which path prefixes count as "active" for this section. */
  matches: (path: string) => boolean;
  /** Visual hue when active. */
  hue: string;
}

const SECTIONS: Section[] = [
  {
    href: '/casino',
    label: 'Casino',
    icon: Dice5,
    matches: (p) => p === '/casino' || p.startsWith('/casino/'),
    hue: '#F0B232',
  },
  {
    href: '/originals',
    label: 'Originals',
    icon: Zap,
    matches: (p) => p === '/originals' || p.startsWith('/originals/'),
    hue: '#2DC97A',
  },
  {
    href: '/sportsbook',
    label: 'Sports',
    icon: BarChart3,
    matches: (p) => p === '/sportsbook' || p.startsWith('/sportsbook/'),
    hue: '#60A5FA',
  },
];

export function SectionSwitcher({ compact }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl p-1 gap-0.5',
        compact && 'p-0.5',
      )}
      style={{
        background: '#07110A',
        border: '1px solid #1A2E22',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
      }}
    >
      {SECTIONS.map((s) => {
        const active = s.matches(pathname);
        const Icon = s.icon;
        return (
          <Link
            key={s.href}
            href={s.href}
            className={cn(
              'flex items-center gap-1.5 rounded-lg font-bold transition-all',
              compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
            )}
            style={
              active
                ? {
                    background: `linear-gradient(135deg, ${s.hue}24, ${s.hue}10)`,
                    color: s.hue,
                    border: `1px solid ${s.hue}44`,
                    boxShadow: `0 0 14px ${s.hue}22`,
                  }
                : { color: '#8FA899', border: '1px solid transparent' }
            }
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
