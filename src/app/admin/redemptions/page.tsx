'use client';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, StatusBadge, RiskBadge, AdminCard, fmtUSD, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, FilterTabs, EmptyRow } from '@/components/admin/table';
import { REDEMPTIONS, type Redemption, type RedemptionStatus } from '@/lib/mock-data/admin';
import { confirm } from '@/components/admin/confirm';
import { Check, X, AlertTriangle } from 'lucide-react';

// Redemptions at or above this USD value require a second approver (dual control).
const DUAL_CONTROL_THRESHOLD = 2000;

type Filter = 'all' | RedemptionStatus;

export default function RedemptionsPage() {
  // Local copy so approve/reject mutate the view (mock — no backend).
  const [items, setItems] = useState<Redemption[]>(REDEMPTIONS);
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const r of items) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [items]);

  const rows = items.filter((r) => filter === 'all' || r.status === filter);

  const pendingValue = items.filter((r) => r.status === 'pending' || r.status === 'in_review').reduce((s, r) => s + r.usd, 0);

  const act = (id: string, status: RedemptionStatus, msg: string) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (status === 'rejected') toast.error(msg);
    else toast.success(msg);
  };

  return (
    <>
      <PageHeader title="Redemptions" subtitle="Sweep Coin payout requests — review and approve" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Awaiting action</p>
          <p className="text-xl font-extrabold text-amber-400 number-display mt-1">{(counts.pending ?? 0) + (counts.in_review ?? 0)}</p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Pending value</p>
          <p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtUSD(pendingValue)}</p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">High-risk holds</p>
          <p className="text-xl font-extrabold text-red-400 number-display mt-1">{items.filter((r) => r.riskScore >= 70 && (r.status === 'pending' || r.status === 'in_review')).length}</p>
        </AdminCard>
      </div>

      <Toolbar>
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'pending', label: 'Pending', count: counts.pending },
            { value: 'in_review', label: 'In review', count: counts.in_review },
            { value: 'approved', label: 'Approved', count: counts.approved },
            { value: 'paid', label: 'Paid', count: counts.paid },
            { value: 'rejected', label: 'Rejected', count: counts.rejected },
          ]}
        />
      </Toolbar>

      <Table>
        <THead>
          <Th>Request</Th>
          <Th>Player</Th>
          <Th align="right">Amount</Th>
          <Th>Method</Th>
          <Th>KYC</Th>
          <Th>Risk</Th>
          <Th>Status</Th>
          <Th align="right">Actions</Th>
        </THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={8} /> : rows.map((r) => {
            const actionable = r.status === 'pending' || r.status === 'in_review';
            return (
              <Tr key={r.id}>
                <Td>
                  <p className="font-mono text-xs text-[#F5E8C8]">{r.id}</p>
                  <p className="text-[11px] text-[#8FA899]">{fmtAgo(r.requestedAt)}</p>
                  {r.note && <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5"><AlertTriangle className="w-3 h-3" />{r.note}</p>}
                </Td>
                <Td><Link href={`/admin/players/${r.playerId}`} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{r.player}</Link></Td>
                <Td align="right" className="number-display font-semibold">{fmtUSD(r.usd)}<span className="block text-[11px] text-[#8FA899]">{r.amountSC.toFixed(2)} SC</span></Td>
                <Td className="text-xs text-[#8FA899]">{r.method}</Td>
                <Td><StatusBadge status={r.kyc} /></Td>
                <Td><RiskBadge score={r.riskScore} /></Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td align="right">
                  {actionable ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={async () => {
                          const dual = r.usd >= DUAL_CONTROL_THRESHOLD;
                          const res = await confirm({
                            title: `Approve ${fmtUSD(r.usd)} to ${r.player}?`,
                            message: `Payout via ${r.method}.${dual ? '' : ' This releases funds immediately.'}`,
                            dualControl: dual,
                            confirmLabel: dual ? 'Send for 2nd approval' : 'Approve payout',
                          });
                          if (res.confirmed) act(r.id, dual ? 'in_review' : 'approved', dual ? `${r.id} sent for second approval` : `Approved ${r.id} · ${fmtUSD(r.usd)}`);
                        }}
                        disabled={r.kyc !== 'verified'}
                        title={r.kyc !== 'verified' ? 'KYC must be verified first' : 'Approve'}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={async () => {
                          const res = await confirm({ title: `Reject redemption ${r.id}?`, message: `${fmtUSD(r.usd)} for ${r.player}. Funds return to the player's withdrawable balance.`, danger: true, requireReason: true, reasonOptions: ['Failed KYC', 'Fraud / risk', 'Playthrough not met', 'Duplicate request', 'Other'] });
                          if (res.confirmed) act(r.id, 'rejected', `Rejected ${r.id} · ${res.reason}`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[#8FA899]">—</span>
                  )}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
