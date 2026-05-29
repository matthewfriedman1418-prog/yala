'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, StatusBadge, AdminCard, fmtUSD, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, EmptyRow } from '@/components/admin/table';
import { CHARGEBACKS, type Chargeback } from '@/lib/mock-data/admin-extra';
import { confirm } from '@/components/admin/confirm';

export default function ChargebacksPage() {
  const [items, setItems] = useState<Chargeback[]>(CHARGEBACKS);
  const act = (id: string, status: Chargeback['status'], msg: string) => { setItems((p) => p.map((x) => x.id === id ? { ...x, status } : x)); toast.success(msg); };
  const exposure = items.filter((c) => c.status === 'new' || c.status === 'representing').reduce((s, c) => s + c.amount, 0);

  return (
    <>
      <PageHeader title="Chargebacks & Disputes" subtitle="Represent or accept payment disputes" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Open disputes</p><p className="text-xl font-extrabold text-amber-400 number-display mt-1">{items.filter((c) => c.status === 'new' || c.status === 'representing').length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Exposure</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtUSD(exposure)}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Won rate</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">63%</p></AdminCard>
      </div>
      <Table>
        <THead><Th>Case</Th><Th>Player</Th><Th align="right">Amount</Th><Th>Reason</Th><Th>Processor</Th><Th>Status</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {items.length === 0 ? <EmptyRow colSpan={7} /> : items.map((c) => (
            <Tr key={c.id}>
              <Td><p className="font-mono text-xs">{c.id}</p><p className="text-[11px] text-[#8FA899]">{fmtAgo(c.opened)}</p></Td>
              <Td><Link href={`/admin/players/${c.playerId}`} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{c.player}</Link></Td>
              <Td align="right" className="number-display">{fmtUSD(c.amount)}</Td>
              <Td className="text-[#8FA899] max-w-[220px]">{c.reason}</Td>
              <Td className="text-xs text-[#8FA899]">{c.processor}</Td>
              <Td><StatusBadge status={c.status === 'new' ? 'requested' : c.status === 'representing' ? 'in_review' : c.status === 'won' ? 'approved' : 'rejected'} /></Td>
              <Td align="right">
                {(c.status === 'new' || c.status === 'representing') ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => act(c.id, 'representing', `Representing ${c.id}`)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25">Represent</button>
                    <button onClick={async () => { const r = await confirm({ title: `Accept chargeback ${c.id}?`, message: `Forfeits ${fmtUSD(c.amount)} and counts as a loss. Use only when the dispute isn't worth contesting.`, danger: true }); if (r.confirmed) act(c.id, 'lost', `Accepted ${c.id}`); }} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-[#8FA899] hover:text-[#F5E8C8]">Accept</button>
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
