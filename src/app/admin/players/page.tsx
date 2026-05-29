'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader, StatusBadge, Avatar, Badge, fmtUSD } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput, FilterTabs, EmptyRow } from '@/components/admin/table';
import { TimeAgo } from '@/components/admin/feedback';
import { confirm } from '@/components/admin/confirm';
import { PLAYERS, type PlayerStatus, type AdminPlayer } from '@/lib/mock-data/admin';
import { Download, Flag, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Filter = 'all' | PlayerStatus;
type SortKey = 'username' | 'totalDeposited' | 'netRevenue' | 'lastSeen' | 'vipTier';
const PER_PAGE = 12;

// Module-level so it isn't recreated each render (react-hooks/static-components).
function SortHeader({ label, active, dir, onClick, align }: {
  label: string; active: boolean; dir: 'asc' | 'desc'; onClick: () => void; align?: 'right' | 'left';
}) {
  return (
    <Th align={align}>
      <button onClick={onClick} className={cn('inline-flex items-center gap-1 hover:text-[#F5E8C8]', align === 'right' && 'flex-row-reverse')}>
        {label}
        {active && (dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </button>
    </Th>
  );
}

export default function PlayersPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'netRevenue', dir: 'desc' });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PLAYERS.length };
    for (const p of PLAYERS) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = PLAYERS.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (!needle) return true;
      return p.username.toLowerCase().includes(needle) || p.email.toLowerCase().includes(needle) || p.id.toLowerCase().includes(needle);
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sort.key as keyof AdminPlayer] as string | number;
      const bv = b[sort.key as keyof AdminPlayer] as string | number;
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }, [q, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
    setPage(0);
  };

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.add(r.id));
      return next;
    });
  };
  const toggleOne = (id: string) => setSelected((prev) => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const bulkAction = async (label: string) => {
    const r = await confirm({ title: `${label} ${selected.size} player${selected.size > 1 ? 's' : ''}?`, requireReason: label.includes('Suspend'), danger: label.includes('Suspend') });
    if (r.confirmed) { toast.success(`${label} applied to ${selected.size} players${r.reason ? ` · ${r.reason}` : ''}`); setSelected(new Set()); }
  };

  return (
    <>
      <PageHeader title="Players" subtitle={`${PLAYERS.length.toLocaleString()} registered accounts`}>
        <button onClick={() => toast.success('Export queued (CSV)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1A2E22] text-sm font-semibold text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5">
          <Download className="w-4 h-4" /> Export
        </button>
      </PageHeader>

      <Toolbar>
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Search username, email, or ID…" />
        <FilterTabs<Filter>
          value={filter} onChange={(v) => { setFilter(v); setPage(0); }}
          tabs={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'active', label: 'Active', count: counts.active },
            { value: 'flagged', label: 'Flagged', count: counts.flagged },
            { value: 'banned', label: 'Banned', count: counts.banned },
            { value: 'self_excluded', label: 'Excluded', count: counts.self_excluded },
            { value: 'dormant', label: 'Dormant', count: counts.dormant },
          ]}
        />
      </Toolbar>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2">
          <span className="text-sm font-semibold text-[#F5E8C8]">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={() => bulkAction('Apply tag to')} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-[#F5E8C8] hover:bg-white/20">Apply tag</button>
            <button onClick={() => bulkAction('Grant bonus to')} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-[#F5E8C8] hover:bg-white/20">Grant bonus</button>
            <button onClick={() => bulkAction('Suspend')} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25">Suspend</button>
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[#8FA899] hover:text-[#F5E8C8]" aria-label="Clear selection"><X className="w-4 h-4" /></button>
        </div>
      )}

      <Table>
        <THead>
          <Th><input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} aria-label="Select all on page" className="accent-[var(--accent)]" /></Th>
          <SortHeader label="Player" active={sort.key === 'username'} dir={sort.dir} onClick={() => toggleSort('username')} />
          <Th>Status</Th>
          <Th>KYC</Th>
          <SortHeader label="VIP" active={sort.key === 'vipTier'} dir={sort.dir} onClick={() => toggleSort('vipTier')} />
          <SortHeader label="Deposited" align="right" active={sort.key === 'totalDeposited'} dir={sort.dir} onClick={() => toggleSort('totalDeposited')} />
          <SortHeader label="NGR" align="right" active={sort.key === 'netRevenue'} dir={sort.dir} onClick={() => toggleSort('netRevenue')} />
          <SortHeader label="Last seen" active={sort.key === 'lastSeen'} dir={sort.dir} onClick={() => toggleSort('lastSeen')} />
          <Th></Th>
        </THead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={9} title="No players found" message="Try a different search or filter." />
          ) : rows.map((p) => (
            <Tr key={p.id} onClick={() => router.push(`/admin/players/${p.id}`)}>
              <Td><input type="checkbox" checked={selected.has(p.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleOne(p.id)} aria-label={`Select ${p.username}`} className="accent-[var(--accent)]" /></Td>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar initials={p.avatar} />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#F5E8C8] flex items-center gap-1.5">{p.username}{p.flags.length > 0 && <Flag className="w-3 h-3 text-amber-400" />}</p>
                    <p className="text-xs text-[#8FA899]">{p.country} · {p.id}</p>
                  </div>
                </div>
              </Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td><StatusBadge status={p.kyc} /></Td>
              <Td><Badge tone="gray">T{p.vipTier} · {p.vipName}</Badge></Td>
              <Td align="right" className="number-display">{fmtUSD(p.totalDeposited)}</Td>
              <Td align="right" className={cn('number-display font-semibold', p.netRevenue >= 0 ? 'text-emerald-400' : 'text-red-400')}>{fmtUSD(p.netRevenue)}</Td>
              <Td className="text-[#8FA899] text-xs"><TimeAgo ts={p.lastSeen} /></Td>
              <Td align="right"><span className="text-[var(--accent)] text-xs font-semibold">View →</span></Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-[#8FA899]">Showing {rows.length ? safePage * PER_PAGE + 1 : 0}–{safePage * PER_PAGE + rows.length} of {filtered.length}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={safePage === 0} className="p-1.5 rounded-lg border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-[#8FA899] px-2">Page {safePage + 1} / {pageCount}</span>
          <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1} className="p-1.5 rounded-lg border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </>
  );
}
