'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge, AdminCard } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Select } from '@/components/admin/controls';
import { GEO_RULES, type GeoRule } from '@/lib/mock-data/admin-extra';

const TONE = { allowed: 'green', blocked: 'red', sc_blocked: 'amber' } as const;
const LABEL = { allowed: 'Allowed', blocked: 'Blocked', sc_blocked: 'GC only' } as const;

export default function GeoPage() {
  const [rules, setRules] = useState<GeoRule[]>(GEO_RULES);
  const setStatus = (code: string, status: GeoRule['status']) => { setRules((p) => p.map((r) => r.code === code ? { ...r, status } : r)); toast.success(`${code} → ${LABEL[status]}`); };
  return (
    <>
      <PageHeader title="Geo & Jurisdiction" subtitle="State / region eligibility & geo-block rules" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Allowed</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{rules.filter((r) => r.status === 'allowed').length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Blocked</p><p className="text-xl font-extrabold text-red-400 number-display mt-1">{rules.filter((r) => r.status === 'blocked').length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">GC-only</p><p className="text-xl font-extrabold text-amber-400 number-display mt-1">{rules.filter((r) => r.status === 'sc_blocked').length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">VPN/proxy block</p><p className="text-sm font-semibold text-emerald-400 mt-2">Enabled</p></AdminCard>
      </div>
      <Table>
        <THead><Th>Code</Th><Th>Jurisdiction</Th><Th>Status</Th><Th>Note</Th><Th align="right">Change</Th></THead>
        <tbody>
          {rules.map((r) => (
            <Tr key={r.code}>
              <Td className="font-mono">{r.code}</Td>
              <Td className="font-semibold">{r.name}</Td>
              <Td><Badge tone={TONE[r.status]}>{LABEL[r.status]}</Badge></Td>
              <Td className="text-[#8FA899]">{r.note || '—'}</Td>
              <Td align="right"><div className="flex justify-end"><Select value={r.status} onChange={(e) => setStatus(r.code, e.target.value as GeoRule['status'])} className="w-28 py-1.5 text-xs"><option value="allowed">Allowed</option><option value="sc_blocked">GC only</option><option value="blocked">Blocked</option></Select></div></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
