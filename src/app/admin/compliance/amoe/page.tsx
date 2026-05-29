'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, StatusBadge, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, EmptyRow } from '@/components/admin/table';
import { AMOE_ENTRIES, type AmoeEntry } from '@/lib/mock-data/admin-extra';
import { Mail } from 'lucide-react';

export default function AmoePage() {
  const [items, setItems] = useState<AmoeEntry[]>(AMOE_ENTRIES);
  const act = (id: string, status: AmoeEntry['status'], msg: string) => { setItems((p) => p.map((x) => x.id === id ? { ...x, status } : x)); toast.success(msg); };
  return (
    <>
      <PageHeader title="AMOE — Mail-in Entries" subtitle="Free Sweep Coin entry path (no purchase necessary)" />
      <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 mb-5 text-sm text-[#F5E8C8] flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" /> The legally-required free entry method. Each valid request grants SC at the posted sweeps value.</div>
      <Table>
        <THead><Th>Entry</Th><Th>Matched player</Th><Th>Received</Th><Th align="right">SC</Th><Th>Status</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {items.length === 0 ? <EmptyRow colSpan={6} /> : items.map((e) => (
            <Tr key={e.id}>
              <Td className="font-mono text-xs">{e.name}</Td>
              <Td>{e.playerId ? <Link href={`/admin/players/${e.playerId}`} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{e.player}</Link> : <span className="text-[#8FA899] italic">{e.player}</span>}</Td>
              <Td className="text-xs text-[#8FA899]">{fmtAgo(e.received)}</Td>
              <Td align="right" className="number-display text-emerald-400">{e.scGranted || '—'}</Td>
              <Td><StatusBadge status={e.status === 'validated' ? 'in_review' : e.status === 'granted' ? 'approved' : e.status === 'rejected' ? 'rejected' : 'pending'} /></Td>
              <Td align="right">
                {(e.status === 'pending' || e.status === 'validated') ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => act(e.id, 'granted', `Granted ${e.scGranted} SC`)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">Grant SC</button>
                    <button onClick={() => act(e.id, 'rejected', `${e.id} rejected`)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25">Reject</button>
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
