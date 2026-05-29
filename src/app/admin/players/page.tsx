'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, StatusBadge, Avatar, Badge, fmtUSD, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput, FilterTabs, EmptyRow } from '@/components/admin/table';
import { PLAYERS, type PlayerStatus } from '@/lib/mock-data/admin';
import { Download, Flag } from 'lucide-react';

type Filter = 'all' | PlayerStatus;

export default function PlayersPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PLAYERS.length };
    for (const p of PLAYERS) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PLAYERS.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (!needle) return true;
      return p.username.toLowerCase().includes(needle) || p.email.toLowerCase().includes(needle) || p.id.toLowerCase().includes(needle);
    });
  }, [q, filter]);

  return (
    <>
      <PageHeader title="Players" subtitle={`${PLAYERS.length.toLocaleString()} registered accounts`}>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1A2E22] text-sm font-semibold text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5">
          <Download className="w-4 h-4" /> Export
        </button>
      </PageHeader>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search username, email, or ID…" />
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
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

      <Table>
        <THead>
          <Th>Player</Th>
          <Th>Status</Th>
          <Th>KYC</Th>
          <Th>VIP</Th>
          <Th align="right">Deposited</Th>
          <Th align="right">Net rev.</Th>
          <Th>Last seen</Th>
          <Th></Th>
        </THead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={8} message="No players match your filters." />
          ) : rows.map((p) => (
            <Tr key={p.id} onClick={() => router.push(`/admin/players/${p.id}`)}>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar initials={p.avatar} />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#F5E8C8] flex items-center gap-1.5">
                      {p.username}
                      {p.flags.length > 0 && <Flag className="w-3 h-3 text-amber-400" />}
                    </p>
                    <p className="text-xs text-[#8FA899]">{p.country} · {p.id}</p>
                  </div>
                </div>
              </Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td><StatusBadge status={p.kyc} /></Td>
              <Td><Badge tone="gray">T{p.vipTier} · {p.vipName}</Badge></Td>
              <Td align="right" className="number-display">{fmtUSD(p.totalDeposited)}</Td>
              <Td align="right" className="number-display font-semibold text-emerald-400">{fmtUSD(p.netRevenue)}</Td>
              <Td className="text-[#8FA899] text-xs">{fmtAgo(p.lastSeen)}</Td>
              <Td align="right"><span className="text-[var(--accent)] text-xs font-semibold">View →</span></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <p className="text-xs text-[#8FA899] mt-3">Showing {rows.length} of {PLAYERS.length} players</p>
    </>
  );
}
