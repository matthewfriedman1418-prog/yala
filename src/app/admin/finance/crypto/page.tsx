'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, Badge, AdminCard, fmtUSD } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, FilterTabs, EmptyRow } from '@/components/admin/table';
import { TimeAgo } from '@/components/admin/feedback';
import { confirm } from '@/components/admin/confirm';
import { CRYPTO_DEPOSITS, type CryptoDeposit } from '@/lib/mock-data/admin-extra';
import { Bitcoin } from 'lucide-react';

const TONE = { pending: 'amber', confirming: 'blue', credited: 'green', failed: 'red' } as const;
type Filter = 'all' | CryptoDeposit['status'];

export default function CryptoPage() {
  const [items, setItems] = useState<CryptoDeposit[]>(CRYPTO_DEPOSITS);
  const [filter, setFilter] = useState<Filter>('all');
  const rows = items.filter((d) => filter === 'all' || d.status === filter);

  const credit = async (d: CryptoDeposit) => {
    const r = await confirm({ title: `Force-credit ${d.asset} deposit?`, message: `Credits ${fmtUSD(d.usd)} to ${d.player} before full confirmations. Use only for stuck-but-verified chains.`, danger: true, requireReason: true, reasonOptions: ['Manually verified on-chain', 'Chain reorg resolved', 'Support escalation', 'Other'] });
    if (r.confirmed) { setItems((p) => p.map((x) => x.id === d.id ? { ...x, status: 'credited', confirmations: x.required } : x)); toast.success(`${d.asset} deposit credited · ${r.reason}`); }
  };

  const pendingUsd = items.filter((d) => d.status !== 'credited' && d.status !== 'failed').reduce((s, d) => s + d.usd, 0);

  return (
    <>
      <PageHeader title="Crypto Deposits" subtitle="On-chain deposits & confirmations" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Awaiting confirmation</p><p className="text-xl font-extrabold text-amber-400 number-display mt-1">{items.filter((d) => d.status === 'pending' || d.status === 'confirming').length}</p></AdminCard>
      <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Pending value</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtUSD(pendingUsd)}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Credited (window)</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{items.filter((d) => d.status === 'credited').length}</p></AdminCard>
      </div>

      <div className="mb-3"><FilterTabs<Filter> value={filter} onChange={setFilter} tabs={[{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'confirming', label: 'Confirming' }, { value: 'credited', label: 'Credited' }, { value: 'failed', label: 'Failed' }]} /></div>

      <Table>
        <THead><Th>Asset</Th><Th>Player</Th><Th align="right">Amount</Th><Th align="right">≈ USD</Th><Th>Confirmations</Th><Th>Tx</Th><Th>Status</Th><Th align="right">When</Th><Th></Th></THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={9} /> : rows.map((d) => (
            <Tr key={d.id}>
              <Td><span className="inline-flex items-center gap-2 font-semibold"><span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><Bitcoin className="w-3.5 h-3.5 text-[#F0B232]" /></span>{d.asset}</span></Td>
              <Td><Link href={`/admin/players/${d.playerId}`} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{d.player}</Link></Td>
              <Td align="right" className="number-display">{d.amount} {d.asset}</Td>
              <Td align="right" className="number-display">{fmtUSD(d.usd)}</Td>
              <Td><span className={d.confirmations >= d.required ? 'text-emerald-400 number-display' : 'text-amber-400 number-display'}>{d.confirmations}/{d.required}</span></Td>
              <Td className="font-mono text-xs text-[#8FA899]">{d.txHash}</Td>
              <Td><Badge tone={TONE[d.status]}>{d.status}</Badge></Td>
              <Td align="right" className="text-xs text-[#8FA899]"><TimeAgo ts={d.receivedAt} /></Td>
              <Td align="right">{(d.status === 'confirming' || d.status === 'pending') ? <button onClick={() => credit(d)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">Credit now</button> : <span className="text-xs text-[#8FA899]">—</span>}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
