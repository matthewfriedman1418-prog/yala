'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge, AdminCard, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Toggle } from '@/components/admin/controls';
import { FRAUD_RULES, type FraudRule } from '@/lib/mock-data/admin-extra';
import { Plus } from 'lucide-react';

const ACTION_TONE = { flag: 'amber', hold: 'blue', withdraw_only: 'purple', ban: 'red' } as const;

export default function FraudPage() {
  const [rules, setRules] = useState<FraudRule[]>(FRAUD_RULES);
  const toggle = (id: string) => setRules((p) => p.map((r) => {
    if (r.id !== id) return r;
    toast.success(`Rule "${r.name}" ${r.enabled ? 'disabled' : 'enabled'}`);
    return { ...r, enabled: !r.enabled };
  }));

  return (
    <>
      <PageHeader title="Fraud & Risk Rules" subtitle="Automated detection → action">
        <button onClick={() => toast('New rule (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New rule</button>
      </PageHeader>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Active rules</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{rules.filter((r) => r.enabled).length}/{rules.length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Hits (30d)</p><p className="text-xl font-extrabold text-amber-400 number-display mt-1">{fmtNum(rules.reduce((s, r) => s + r.hits30d, 0))}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Auto-bans (30d)</p><p className="text-xl font-extrabold text-red-400 number-display mt-1">{rules.filter((r) => r.action === 'ban').reduce((s, r) => s + r.hits30d, 0)}</p></AdminCard>
      </div>
      <Table>
        <THead><Th>Rule</Th><Th>Condition</Th><Th>Action</Th><Th align="right">Hits 30d</Th><Th align="center">Enabled</Th></THead>
        <tbody>
          {rules.map((r) => (
            <Tr key={r.id} className={!r.enabled ? 'opacity-55' : ''}>
              <Td className="font-semibold">{r.name}</Td>
              <Td className="text-[#8FA899]">{r.condition}</Td>
              <Td><Badge tone={ACTION_TONE[r.action]}>{r.action.replace('_', ' ')}</Badge></Td>
              <Td align="right" className="number-display">{fmtNum(r.hits30d)}</Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={r.enabled} label={r.name} onClick={() => toggle(r.id)} /></div></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
