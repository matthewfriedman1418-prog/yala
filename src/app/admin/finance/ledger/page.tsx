'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader, Badge, AdminCard, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput, FilterTabs, EmptyRow } from '@/components/admin/table';
import { useLedgerStore, type EntryType } from '@/lib/admin/ledger';
import { PLAYERS } from '@/lib/mock-data/admin';

const nameById = (id: string) => PLAYERS.find((p) => p.id === id)?.username ?? id;
type Filter = 'all' | EntryType;

export default function LedgerPage() {
  const entries = useLedgerStore((s) => s.entries);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries
      .filter((e) => filter === 'all' || e.type === filter)
      .filter((e) => !needle || nameById(e.playerId).toLowerCase().includes(needle) || e.reason.toLowerCase().includes(needle) || e.playerId.includes(needle))
      .sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
      .slice(0, 80);
  }, [entries, q, filter]);

  const adjustments = entries.filter((e) => e.type === 'adjustment').length;

  return (
    <>
      <PageHeader title="Ledger & Reconciliation" subtitle="Append-only double-entry · balances are derived, never set">
        <button className="px-3 py-2 rounded-lg border border-[#1A2E22] text-sm font-semibold text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5">Run reconciliation</button>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Total entries</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{entries.length.toLocaleString()}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Manual adjustments</p><p className="text-xl font-extrabold text-purple-400 number-display mt-1">{adjustments}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Recon breaks</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">0</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Last recon</p><p className="text-sm font-semibold text-[#F5E8C8] mt-2">{fmtAgo('2026-05-28T06:00:00Z')}</p></AdminCard>
      </div>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search player or reason…" />
        <FilterTabs<Filter> value={filter} onChange={setFilter} tabs={[{ value: 'all', label: 'All' }, { value: 'purchase', label: 'Purchase' }, { value: 'redeem', label: 'Redeem' }, { value: 'bet', label: 'Bet' }, { value: 'win', label: 'Win' }, { value: 'bonus_grant', label: 'Bonus' }, { value: 'adjustment', label: 'Adjustment' }]} />
      </Toolbar>

      <Table>
        <THead><Th>Type</Th><Th>Player</Th><Th>Reason</Th><Th align="right">Amount</Th><Th>Counter</Th><Th>By</Th><Th>When</Th></THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={7} /> : rows.map((e) => (
            <Tr key={e.id}>
              <Td><Badge tone={e.type === 'adjustment' ? 'purple' : e.type === 'redeem' ? 'amber' : e.amount >= 0 ? 'green' : 'gray'}>{e.type}</Badge></Td>
              <Td><Link href={`/admin/players/${e.playerId}`} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{nameById(e.playerId)}</Link></Td>
              <Td className="text-[#8FA899] max-w-[240px] truncate">{e.reason}</Td>
              <Td align="right" className={e.amount >= 0 ? 'number-display text-emerald-400 font-semibold' : 'number-display text-red-400 font-semibold'}>{e.amount >= 0 ? '+' : ''}{e.amount.toLocaleString()} {e.currency}</Td>
              <Td className="text-xs text-[#8FA899] font-mono">{e.counter}</Td>
              <Td className="text-xs text-[#8FA899]">{e.operator ? e.operator.split('@')[0] : 'system'}</Td>
              <Td className="text-xs text-[#8FA899]">{fmtAgo(e.ts)}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
