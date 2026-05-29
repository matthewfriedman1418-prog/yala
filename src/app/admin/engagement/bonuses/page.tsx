'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Toggle, Drawer, Field, Input, Select, RichText, UploadBox } from '@/components/admin/controls';
import { BONUSES, type Bonus } from '@/lib/mock-data/admin-extra';
import { Plus, Pencil } from 'lucide-react';

export default function BonusesPage() {
  const [bonuses, setBonuses] = useState<Bonus[]>(BONUSES);
  const [editing, setEditing] = useState<Bonus | null>(null);
  const toggle = (id: number) => setBonuses((p) => p.map((b) => {
    if (b.id !== id) return b;
    toast.success(`"${b.title}" ${b.active ? 'deactivated' : 'activated'}`);
    return { ...b, active: !b.active };
  }));
  return (
    <>
      <PageHeader title="Bonuses" subtitle="Typed bonus library">
        <button onClick={() => setEditing({ id: 0, title: '', type: 'welcome', gcAmount: 0, scAmount: 0, isPercentage: false, active: true, validity: '', eligibility: '' })} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New bonus</button>
      </PageHeader>
      <Table>
        <THead><Th>ID</Th><Th>Title</Th><Th>Type</Th><Th align="right">GC</Th><Th align="right">SC</Th><Th>Mode</Th><Th align="center">Active</Th><Th align="right">Edit</Th></THead>
        <tbody>
          {bonuses.map((b) => (
            <Tr key={b.id} className={!b.active ? 'opacity-55' : ''}>
              <Td className="font-mono text-xs text-[#8FA899]">{b.id}</Td>
              <Td className="font-semibold">{b.title}</Td>
              <Td><Badge tone="blue">{b.type.replace('_', ' ')}</Badge></Td>
              <Td align="right" className="number-display">{b.isPercentage ? '—' : fmtNum(b.gcAmount)}</Td>
              <Td align="right" className="number-display text-emerald-400">{b.isPercentage ? '—' : b.scAmount}</Td>
              <Td><Badge tone={b.isPercentage ? 'purple' : 'gray'}>{b.isPercentage ? '% of activity' : 'flat'}</Badge></Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={b.active} label={b.title} onClick={() => toggle(b.id)} /></div></Td>
              <Td align="right"><button onClick={() => setEditing(b)} className="text-[#8FA899] hover:text-[var(--accent)]"><Pencil className="w-4 h-4" /></button></Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Drawer
        open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? `Edit ${editing.title}` : 'New bonus'}
        footer={<button onClick={() => { toast.success('Bonus saved'); setEditing(null); }} className="w-full py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)]">Save bonus</button>}
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Promotion title"><Input defaultValue={editing.title} placeholder="Weekly Commission Bonus" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bonus type"><Select defaultValue={editing.type}><option value="welcome">Welcome</option><option value="weekly_commission">Weekly commission</option><option value="weekly_cashback">Weekly cashback</option><option value="birthday">Birthday</option><option value="referral">Referral</option><option value="boost">Boost</option><option value="reload">Reload</option></Select></Field>
              <Field label="Amount in %"><div className="pt-1.5"><Toggle on={editing.isPercentage} label="percentage" onClick={() => setEditing({ ...editing, isPercentage: !editing.isPercentage })} /></div></Field>
              <Field label="GC amount"><Input type="number" defaultValue={editing.gcAmount} /></Field>
              <Field label="SC amount"><Input type="number" defaultValue={editing.scAmount} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Desktop image"><UploadBox label="Upload desktop" /></Field>
              <Field label="Mobile image"><UploadBox label="Upload mobile" /></Field>
            </div>
            <Field label="Terms & conditions"><RichText defaultValue={`• Validity: ${editing.validity}\n• Eligibility: ${editing.eligibility}`} /></Field>
          </div>
        )}
      </Drawer>
    </>
  );
}
