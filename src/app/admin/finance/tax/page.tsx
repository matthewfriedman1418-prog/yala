'use client';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, Badge, AdminCard, fmtUSD } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { TAX_RECORDS } from '@/lib/mock-data/admin-extra';
import { Download } from 'lucide-react';

export default function TaxPage() {
  const issued = TAX_RECORDS.filter((t) => t.status === 'issued');
  const total = TAX_RECORDS.reduce((s, t) => s + t.amount, 0);
  return (
    <>
      <PageHeader title="Tax & Statements" subtitle="W-2G / 1099 reportable winnings (US sweeps)">
        <button onClick={() => toast.success('Year-end export queued')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1A2E22] text-sm font-semibold text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5"><Download className="w-4 h-4" /> Export year-end</button>
      </PageHeader>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Statements</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{TAX_RECORDS.length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Issued</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{issued.length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Reportable total</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtUSD(total)}</p></AdminCard>
      </div>
      <Table>
        <THead><Th>Player</Th><Th>Form</Th><Th align="right">Year</Th><Th align="right">Amount</Th><Th>Status</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {TAX_RECORDS.map((t) => (
            <Tr key={t.id}>
              <Td><Link href={`/admin/players/${t.playerId}`} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{t.player}</Link></Td>
              <Td><Badge tone={t.form === 'W-2G' ? 'purple' : 'blue'}>{t.form}</Badge></Td>
              <Td align="right" className="number-display">{t.year}</Td>
              <Td align="right" className="number-display">{fmtUSD(t.amount)}</Td>
              <Td><Badge tone={t.status === 'issued' ? 'green' : 'amber'}>{t.status}</Badge></Td>
              <Td align="right"><button onClick={() => toast.success(`${t.form} ${t.id} downloaded`)} className="text-xs font-semibold text-[var(--accent)]">Download</button></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
