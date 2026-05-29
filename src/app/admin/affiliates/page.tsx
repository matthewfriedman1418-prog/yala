'use client';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PageHeader, StatusBadge, Badge, AdminCard, fmtUSD, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput, FilterTabs, EmptyRow } from '@/components/admin/table';
import { AFFILIATES, type Affiliate } from '@/lib/mock-data/admin';
import { Check, Ban, DollarSign } from 'lucide-react';

type Filter = 'all' | 'active' | 'review' | 'paused';
const TIER_TONE = { Creator: 'gray', Partner: 'blue', 'VIP Partner': 'purple' } as const;

export default function AffiliatesPage() {
  const [affs, setAffs] = useState<Affiliate[]>(AFFILIATES);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return affs.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (needle && !a.name.toLowerCase().includes(needle) && !a.code.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [affs, q, filter]);

  const setStatus = (id: string, status: Affiliate['status'], msg: string) => {
    setAffs((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    toast.success(msg);
  };

  const totals = {
    referrals: affs.reduce((s, a) => s + a.referrals, 0),
    earnings: affs.reduce((s, a) => s + a.earningsUSD, 0),
    unpaid: affs.reduce((s, a) => s + a.unpaidUSD, 0),
  };

  return (
    <>
      <PageHeader title="Affiliates" subtitle="Creator & partner program oversight" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Affiliates</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{affs.length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Total referrals</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtNum(totals.referrals)}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Lifetime payouts</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{fmtUSD(totals.earnings, { compact: true })}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Unpaid</p><p className="text-xl font-extrabold text-amber-400 number-display mt-1">{fmtUSD(totals.unpaid, { compact: true })}</p></AdminCard>
      </div>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search name or code…" />
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'review', label: 'In review' },
            { value: 'paused', label: 'Paused' },
          ]}
        />
      </Toolbar>

      <Table>
        <THead>
          <Th>Affiliate</Th>
          <Th>Tier</Th>
          <Th align="right">Referrals</Th>
          <Th align="right">Active</Th>
          <Th align="right">Rate</Th>
          <Th align="right">Earnings</Th>
          <Th align="right">Unpaid</Th>
          <Th>Status</Th>
          <Th align="right">Actions</Th>
        </THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={9} /> : rows.map((a) => (
            <Tr key={a.id}>
              <Td>
                <p className="font-semibold text-[#F5E8C8]">{a.name}</p>
                <p className="text-[11px] font-mono text-[var(--accent)]">{a.code}</p>
              </Td>
              <Td><Badge tone={TIER_TONE[a.tier]}>{a.tier}</Badge></Td>
              <Td align="right" className="number-display">{fmtNum(a.referrals)}</Td>
              <Td align="right" className="number-display text-[#8FA899]">{fmtNum(a.activeReferrals)}</Td>
              <Td align="right" className="number-display">{a.commissionRate}%</Td>
              <Td align="right" className="number-display text-emerald-400">{fmtUSD(a.earningsUSD, { compact: true })}</Td>
              <Td align="right" className="number-display text-amber-400">{a.unpaidUSD > 0 ? fmtUSD(a.unpaidUSD, { compact: true }) : '—'}</Td>
              <Td><StatusBadge status={a.status} /></Td>
              <Td align="right">
                <div className="flex items-center justify-end gap-1.5">
                  {a.unpaidUSD > 0 && (
                    <button onClick={() => { setAffs((p) => p.map((x) => x.id === a.id ? { ...x, unpaidUSD: 0 } : x)); toast.success(`Paid ${fmtUSD(a.unpaidUSD)} to ${a.name}`); }} title="Pay out" className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">
                      <DollarSign className="w-3.5 h-3.5" /> Pay
                    </button>
                  )}
                  {a.status === 'review' && (
                    <button onClick={() => setStatus(a.id, 'active', `${a.name} approved`)} title="Approve" className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {a.status !== 'paused' ? (
                    <button onClick={() => setStatus(a.id, 'paused', `${a.name} paused`)} title="Pause" className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25">
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button onClick={() => setStatus(a.id, 'active', `${a.name} reactivated`)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-[#8FA899] hover:text-[#F5E8C8]">Reactivate</button>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
