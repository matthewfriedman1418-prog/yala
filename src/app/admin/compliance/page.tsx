'use client';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, StatusBadge, Badge, AdminCard, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, FilterTabs, EmptyRow } from '@/components/admin/table';
import { RG_RECORDS, RG_LABELS, type RgRecord, type RgType } from '@/lib/mock-data/admin';
import { confirm } from '@/components/admin/confirm';
import { Check, ShieldAlert, UserX, Clock } from 'lucide-react';

type Filter = 'all' | 'requested' | 'active' | 'expired' | 'self_exclusion';

const SET_BY_TONE = { player: 'blue', operator: 'purple', auto: 'amber' } as const;

export default function CompliancePage() {
  const [records, setRecords] = useState<RgRecord[]>(RG_RECORDS);
  const [filter, setFilter] = useState<Filter>('all');

  const enforce = async (r: RgRecord) => {
    const res = await confirm({ title: `Enforce self-exclusion for ${r.player}?`, message: `${r.detail} exclusion. This is irreversible for the full term — the player cannot play or deposit until it ends.`, danger: true, confirmLabel: 'Confirm & enforce' });
    if (res.confirmed) {
      setRecords((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: 'active' } : x)));
      toast.success('Self-exclusion confirmed & enforced');
    }
  };

  const rows = useMemo(() => records.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'self_exclusion') return r.type === 'self_exclusion';
    return r.status === filter;
  }), [records, filter]);

  const requested = records.filter((r) => r.status === 'requested').length;
  const activeExclusions = records.filter((r) => r.type === 'self_exclusion' && r.status === 'active').length;
  const activeLimits = records.filter((r) => r.type !== 'self_exclusion' && r.status === 'active').length;

  return (
    <>
      <PageHeader title="Compliance" subtitle="Responsible-gaming controls & self-exclusions" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center"><ShieldAlert className="w-5 h-5" /></span>
          <div><p className="text-xl font-extrabold text-[#F5E8C8] number-display">{requested}</p><p className="text-[11px] text-[#8FA899]">Awaiting confirmation</p></div>
        </AdminCard>
        <AdminCard className="p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center"><UserX className="w-5 h-5" /></span>
          <div><p className="text-xl font-extrabold text-[#F5E8C8] number-display">{activeExclusions}</p><p className="text-[11px] text-[#8FA899]">Active self-exclusions</p></div>
        </AdminCard>
        <AdminCard className="p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Clock className="w-5 h-5" /></span>
          <div><p className="text-xl font-extrabold text-[#F5E8C8] number-display">{activeLimits}</p><p className="text-[11px] text-[#8FA899]">Active player limits</p></div>
        </AdminCard>
      </div>

      <Toolbar>
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'All', count: records.length },
            { value: 'requested', label: 'Requested', count: requested },
            { value: 'active', label: 'Active' },
            { value: 'self_exclusion', label: 'Self-exclusions' },
            { value: 'expired', label: 'Expired' },
          ]}
        />
      </Toolbar>

      <Table>
        <THead>
          <Th>Player</Th>
          <Th>Control</Th>
          <Th>Detail</Th>
          <Th>Set by</Th>
          <Th>Started</Th>
          <Th>Ends</Th>
          <Th>Status</Th>
          <Th align="right">Action</Th>
        </THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={8} /> : rows.map((r) => (
            <Tr key={r.id}>
              <Td><Link href={`/admin/players/${r.playerId}`} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{r.player}</Link></Td>
              <Td>
                <span className={r.type === 'self_exclusion' ? 'text-purple-400 font-semibold' : 'text-[#F5E8C8]'}>
                  {RG_LABELS[r.type as RgType]}
                </span>
              </Td>
              <Td className="text-[#8FA899]">{r.detail}</Td>
              <Td><Badge tone={SET_BY_TONE[r.setBy]}>{r.setBy}</Badge></Td>
              <Td className="text-xs text-[#8FA899]">{fmtAgo(r.startedAt)}</Td>
              <Td className="text-xs text-[#8FA899]">{r.endsAt ? new Date(r.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Permanent'}</Td>
              <Td><StatusBadge status={r.status} /></Td>
              <Td align="right">
                {r.status === 'requested' ? (
                  <button onClick={() => enforce(r)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">
                    <Check className="w-3.5 h-3.5" /> Confirm
                  </button>
                ) : <span className="text-xs text-[#8FA899]">—</span>}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <p className="text-xs text-[#8FA899] mt-4 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5" /> Self-exclusion is irreversible for its full duration once confirmed. NCPG helpline: 1-800-522-4700.
      </p>
    </>
  );
}
