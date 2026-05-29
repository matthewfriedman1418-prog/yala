'use client';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Sparkline } from './charts';
import type { Kpi } from '@/lib/mock-data/admin';

// ── Formatting helpers (admin-local) ─────────────────────────────────────────
export function fmtUSD(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  }
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}
export function fmtNum(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}
export function fmtAgo(ts: string): string {
  if (!ts || ts === '—') return '—';
  const then = new Date(ts).getTime();
  const now = new Date('2026-05-28T09:30:00Z').getTime();
  const m = Math.floor((now - then) / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ACCENT_HEX: Record<Kpi['accent'], string> = {
  gold: '#F0B232', teal: '#2DC97A', blue: '#3B82F6', purple: '#8B5CF6', amber: '#F59E0B',
};

// ── Surface card ─────────────────────────────────────────────────────────────
export function AdminCard({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-[#1A2E22] bg-[#0C1812]', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action, sub }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[#1A2E22]">
      <div>
        <h3 className="text-sm font-bold text-[#F5E8C8]">{title}</h3>
        {sub && <p className="text-xs text-[#8FA899] mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── KPI stat card ────────────────────────────────────────────────────────────
export function StatCard({ kpi }: { kpi: Kpi }) {
  const hex = ACCENT_HEX[kpi.accent];
  const positive = kpi.delta >= 0;
  const good = positive === kpi.upIsGood;
  return (
    <AdminCard className="p-4 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: hex, opacity: 0.7 }} />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8FA899]">{kpi.label}</p>
      <div className="flex items-end justify-between gap-2 mt-1.5">
        <p className="text-2xl font-extrabold text-[#F5E8C8] number-display">{kpi.value}</p>
        <Sparkline data={kpi.spark} color={hex} />
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded',
            good ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10',
          )}
        >
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(kpi.delta)}%
        </span>
        <span className="text-[11px] text-[#8FA899]">vs prev. 30d</span>
      </div>
    </AdminCard>
  );
}

// ── Status / pill badges ─────────────────────────────────────────────────────
type Tone = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gray';
const TONE_CLS: Record<Tone, string> = {
  green: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25',
  amber: 'bg-amber-500/12 text-amber-400 border-amber-500/25',
  red: 'bg-red-500/12 text-red-400 border-red-500/25',
  blue: 'bg-blue-500/12 text-blue-400 border-blue-500/25',
  purple: 'bg-purple-500/12 text-purple-400 border-purple-500/25',
  gray: 'bg-white/5 text-[#8FA899] border-white/10',
};

export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap', TONE_CLS[tone], className)}>
      {children}
    </span>
  );
}

// Maps any known status string to a tone + label.
const STATUS_MAP: Record<string, { tone: Tone; label: string }> = {
  // players
  active: { tone: 'green', label: 'Active' },
  flagged: { tone: 'amber', label: 'Flagged' },
  banned: { tone: 'red', label: 'Banned' },
  self_excluded: { tone: 'purple', label: 'Self-excluded' },
  dormant: { tone: 'gray', label: 'Dormant' },
  // kyc
  verified: { tone: 'green', label: 'Verified' },
  pending: { tone: 'amber', label: 'Pending' },
  unverified: { tone: 'gray', label: 'Unverified' },
  rejected: { tone: 'red', label: 'Rejected' },
  in_review: { tone: 'blue', label: 'In review' },
  approved: { tone: 'green', label: 'Approved' },
  paid: { tone: 'green', label: 'Paid' },
  // tickets
  open: { tone: 'blue', label: 'Open' },
  resolved: { tone: 'green', label: 'Resolved' },
  closed: { tone: 'gray', label: 'Closed' },
  // generic
  expired: { tone: 'gray', label: 'Expired' },
  requested: { tone: 'amber', label: 'Requested' },
  review: { tone: 'amber', label: 'In review' },
  paused: { tone: 'gray', label: 'Paused' },
  invited: { tone: 'blue', label: 'Invited' },
  suspended: { tone: 'red', label: 'Suspended' },
};

export function StatusBadge({ status }: { status: string }) {
  const m = STATUS_MAP[status] ?? { tone: 'gray' as Tone, label: status };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: 'low' | 'normal' | 'high' | 'urgent' }) {
  const map = { low: 'gray', normal: 'blue', high: 'amber', urgent: 'red' } as const;
  return <Badge tone={map[priority]}>{priority[0].toUpperCase() + priority.slice(1)}</Badge>;
}

// Risk score 0-100 → colored pill.
export function RiskBadge({ score }: { score: number }) {
  const tone: Tone = score >= 70 ? 'red' : score >= 40 ? 'amber' : 'green';
  return <Badge tone={tone}>Risk {score}</Badge>;
}

// ── Page header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5E8C8] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#8FA899] mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
    </div>
  );
}

// ── Avatar chip ──────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 32, hue = '#2DC97A' }: { initials: string; size?: number; hue?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 text-[#060E0A]"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${hue}, #F0B232)` }}
    >
      {initials}
    </span>
  );
}
