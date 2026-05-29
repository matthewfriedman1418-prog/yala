'use client';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, Badge, AdminCard, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { AFFILIATES } from '@/lib/mock-data/admin';

// Creators = the streamer/affiliate program viewed through the host lens.
export default function CreatorsPage() {
  return (
    <>
      <PageHeader title="Creator / Host Program" subtitle="Streamers & hosts with assigned player books" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Creators</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{AFFILIATES.length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Total reach</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtNum(AFFILIATES.reduce((s, a) => s + a.referrals, 0))}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">VIP partners</p><p className="text-xl font-extrabold text-purple-400 number-display mt-1">{AFFILIATES.filter((a) => a.tier === 'VIP Partner').length}</p></AdminCard>
      </div>
      <Table>
        <THead><Th>Creator</Th><Th>Code</Th><Th>Tier</Th><Th align="right">Book size</Th><Th align="right">Active</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {AFFILIATES.map((a) => (
            <Tr key={a.id}>
              <Td className="font-semibold">{a.name}</Td>
              <Td className="font-mono text-xs text-[var(--accent)]">{a.code}</Td>
              <Td><Badge tone={a.tier === 'VIP Partner' ? 'purple' : a.tier === 'Partner' ? 'blue' : 'gray'}>{a.tier}</Badge></Td>
              <Td align="right" className="number-display">{fmtNum(a.referrals)}</Td>
              <Td align="right" className="number-display text-[#8FA899]">{fmtNum(a.activeReferrals)}</Td>
              <Td align="right"><button onClick={() => toast.success(`Host assigned to ${a.name}`)} className="text-xs font-semibold text-[var(--accent)]">Assign host</button></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <p className="text-xs text-[#8FA899] mt-3">Full payout & commission management lives in <Link href="/admin/affiliates" className="text-[var(--accent)] font-semibold">Referrals & Affiliates</Link>.</p>
    </>
  );
}
