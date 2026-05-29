'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, Badge, RiskBadge, AdminCard, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, FilterTabs, EmptyRow } from '@/components/admin/table';
import { AML_CASES, type AmlCase } from '@/lib/mock-data/admin-extra';

type Filter = 'all' | 'open' | 'escalated' | 'cleared' | 'sar_filed';
const TYPE_TONE = { sanctions: 'red', pep: 'purple', structuring: 'amber', velocity: 'blue' } as const;

export default function AmlPage() {
  const [cases, setCases] = useState<AmlCase[]>(AML_CASES);
  const [filter, setFilter] = useState<Filter>('all');
  const act = (id: string, status: AmlCase['status'], msg: string) => { setCases((p) => p.map((c) => c.id === id ? { ...c, status } : c)); toast.success(msg); };
  const rows = cases.filter((c) => filter === 'all' || c.status === filter);

  return (
    <>
      <PageHeader title="AML · Sanctions · PEP" subtitle="Screening hits & case management" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Open</p><p className="text-xl font-extrabold text-amber-400 number-display mt-1">{cases.filter((c) => c.status === 'open').length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Escalated</p><p className="text-xl font-extrabold text-red-400 number-display mt-1">{cases.filter((c) => c.status === 'escalated').length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">SARs filed</p><p className="text-xl font-extrabold text-purple-400 number-display mt-1">{cases.filter((c) => c.status === 'sar_filed').length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Cleared</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{cases.filter((c) => c.status === 'cleared').length}</p></AdminCard>
      </div>
      <Toolbar><FilterTabs<Filter> value={filter} onChange={setFilter} tabs={[{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'escalated', label: 'Escalated' }, { value: 'sar_filed', label: 'SAR filed' }, { value: 'cleared', label: 'Cleared' }]} /></Toolbar>
      <Table>
        <THead><Th>Case</Th><Th>Player</Th><Th>Type</Th><Th>Detail</Th><Th>Risk</Th><Th>Status</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={7} /> : rows.map((c) => (
            <Tr key={c.id}>
              <Td><p className="font-mono text-xs">{c.id}</p><p className="text-[11px] text-[#8FA899]">{fmtAgo(c.opened)}</p></Td>
              <Td><Link href={`/admin/players/${c.playerId}`} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{c.player}</Link></Td>
              <Td><Badge tone={TYPE_TONE[c.type]}>{c.type}</Badge></Td>
              <Td className="text-[#8FA899] max-w-[260px]">{c.detail}</Td>
              <Td><RiskBadge score={c.riskScore} /></Td>
              <Td><Badge tone={c.status === 'cleared' ? 'green' : c.status === 'escalated' ? 'red' : c.status === 'sar_filed' ? 'purple' : 'amber'}>{c.status.replace('_', ' ')}</Badge></Td>
              <Td align="right">
                {(c.status === 'open' || c.status === 'escalated') ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => act(c.id, 'cleared', `${c.id} cleared`)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">Clear</button>
                    <button onClick={() => act(c.id, 'sar_filed', `SAR filed for ${c.id}`)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 hover:bg-purple-500/25">File SAR</button>
                  </div>
                ) : <span className="text-xs text-[#8FA899]">—</span>}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
