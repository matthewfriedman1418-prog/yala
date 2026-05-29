'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, Inbox } from 'lucide-react';
import type { ComponentType } from 'react';

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = Inbox, title, message, action }: {
  icon?: ComponentType<{ className?: string }>; title: string; message?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <span className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-[#1A2E22] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[#8FA899]" />
      </span>
      <p className="text-sm font-semibold text-[#F5E8C8]">{title}</p>
      {message && <p className="text-xs text-[#8FA899] mt-1 max-w-xs">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Skeleton primitives ──────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-white/[0.05] animate-pulse', className)} />;
}

export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-[#1A2E22] bg-[#0C1812] overflow-hidden">
      <div className="flex gap-4 px-4 py-3 border-b border-[#1A2E22] bg-[#101C16]">
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-3 flex-1" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3.5 border-b border-[#15241B] last:border-0">
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className={cn('h-4', c === 0 ? 'flex-[1.6]' : 'flex-1')} />)}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[#1A2E22] bg-[#0C1812] p-4">
          <Skeleton className="h-3 w-2/3 mb-3" /><Skeleton className="h-6 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ── Relative time with absolute on hover ─────────────────────────────────────
const NOW = Date.parse('2026-05-28T09:30:00Z');
export function TimeAgo({ ts, className }: { ts: string; className?: string }) {
  if (!ts || ts === '—') return <span className={className}>—</span>;
  const then = Date.parse(ts);
  const m = Math.floor((NOW - then) / 60_000);
  let label: string;
  if (m < 1) label = 'just now';
  else if (m < 60) label = `${m}m ago`;
  else if (m < 1440) label = `${Math.floor(m / 60)}h ago`;
  else if (m < 43_200) label = `${Math.floor(m / 1440)}d ago`;
  else label = new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const abs = new Date(ts).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) + ' UTC';
  return <span className={cn('cursor-help', className)} title={abs}>{label}</span>;
}

// ── Breadcrumbs (derived from the path) ──────────────────────────────────────
const SEG_LABELS: Record<string, string> = {
  admin: 'Admin', players: 'Players', transactions: 'Transactions', redemptions: 'Redemptions',
  finance: 'Finance', ledger: 'Ledger', packages: 'Packages', chargebacks: 'Chargebacks', tax: 'Tax',
  compliance: 'Compliance', kyc: 'KYC', aml: 'AML', fraud: 'Fraud', devices: 'Devices', geo: 'Geo', amoe: 'AMOE',
  games: 'Games', providers: 'Providers', categories: 'Categories', rtp: 'RTP', rounds: 'Rounds', jackpots: 'Jackpots', monitors: 'Monitors',
  engagement: 'Engagement', bonuses: 'Bonuses', promotions: 'Promotions', tags: 'Tags', 'spin-wheel': 'Spin Wheel', missions: 'Missions', tournaments: 'Tournaments', leaderboards: 'Leaderboards', affiliates: 'Affiliates',
  vip: 'VIP', tiers: 'Tiers', pnl: 'PNL Calculator', adjustments: 'Adjustments', creators: 'Creators',
  crm: 'CRM', segments: 'Segments', campaigns: 'Campaigns', 'bulk-assign': 'Bulk Assign',
  content: 'Content', pages: 'Pages', banners: 'Banners', 'promo-content': 'Promo Content',
  support: 'Support', system: 'System', flags: 'Feature Flags', jobs: 'Jobs', webhooks: 'Webhooks', health: 'Health',
  staff: 'Staff', audit: 'Audit Log', reports: 'Reports',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length <= 1) return null; // hide on /admin root
  const crumbs = segs.map((s, i) => ({
    href: '/' + segs.slice(0, i + 1).join('/'),
    label: SEG_LABELS[s] ?? (s.length > 14 ? s.slice(0, 10) + '…' : s),
    last: i === segs.length - 1,
  }));
  return (
    <nav className="flex items-center gap-1 text-xs text-[#8FA899] mb-4 flex-wrap">
      {crumbs.map((c) => (
        <span key={c.href} className="flex items-center gap-1">
          {c.last ? <span className="text-[#F5E8C8] font-medium">{c.label}</span>
            : <Link href={c.href} className="hover:text-[#F5E8C8]">{c.label}</Link>}
          {!c.last && <ChevronRight className="w-3 h-3" />}
        </span>
      ))}
    </nav>
  );
}
