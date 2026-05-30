'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Toggle, Drawer, Field, Input, Select, RichText, UploadBox } from '@/components/admin/controls';
import { BONUSES, type Bonus, type BonusFrequency, type PercentBasis } from '@/lib/mock-data/admin-extra';
import { Plus, Pencil } from 'lucide-react';

const FREQ_LABEL: Record<BonusFrequency, string> = { one_time: 'One-time', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', event: 'Event' };
const BASIS_LABEL: Record<PercentBasis, string> = { deposit: 'deposit', net_losses: 'net losses', wager: 'wager' };

function blankBonus(): Bonus {
  return { id: 0, title: '', type: '', frequency: 'one_time', isPercentage: false, percent: 0, percentBasis: 'deposit', gcAmount: 0, scAmount: 0, active: true, validity: '', eligibility: '' };
}

export default function BonusesPage() {
  const [bonuses, setBonuses] = useState<Bonus[]>(BONUSES);
  const [draft, setDraft] = useState<Bonus | null>(null);

  const toggle = (id: number) => setBonuses((p) => p.map((b) => {
    if (b.id !== id) return b;
    toast.success(`"${b.title}" ${b.active ? 'deactivated' : 'activated'}`);
    return { ...b, active: !b.active };
  }));

  const save = () => {
    if (!draft) return;
    setBonuses((list) => {
      if (draft.id) return list.map((b) => (b.id === draft.id ? draft : b));
      return [{ ...draft, id: Math.max(0, ...list.map((b) => b.id)) + 1 }, ...list];
    });
    toast.success(draft.id ? 'Bonus saved' : 'Bonus created');
    setDraft(null);
  };
  const set = <K extends keyof Bonus>(k: K, v: Bonus[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  return (
    <>
      <PageHeader title="Bonuses" subtitle="Typed bonus library — create any cadence (monthly, seasonal, anything)">
        <button onClick={() => setDraft(blankBonus())} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New bonus</button>
      </PageHeader>
      <Table>
        <THead><Th>ID</Th><Th>Title</Th><Th>Type</Th><Th>Frequency</Th><Th align="right">Award</Th><Th align="center">Active</Th><Th align="right">Edit</Th></THead>
        <tbody>
          {bonuses.map((b) => (
            <Tr key={b.id} className={!b.active ? 'opacity-55' : ''}>
              <Td className="font-mono text-xs text-[#8FA899]">{b.id}</Td>
              <Td className="font-semibold">{b.title}</Td>
              <Td><Badge tone="blue">{b.type.replace(/_/g, ' ')}</Badge></Td>
              <Td><Badge tone="gray">{FREQ_LABEL[b.frequency]}</Badge></Td>
              <Td align="right" className="number-display">
                {b.isPercentage
                  ? <span className="text-purple-400">{b.percent}% of {BASIS_LABEL[b.percentBasis]}</span>
                  : <span>{b.gcAmount ? `${fmtNum(b.gcAmount)} GC` : ''}{b.gcAmount && b.scAmount ? ' + ' : ''}{b.scAmount ? <span className="text-emerald-400">{b.scAmount} SC</span> : ''}</span>}
              </Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={b.active} label={b.title} onClick={() => toggle(b.id)} /></div></Td>
              <Td align="right"><button onClick={() => setDraft({ ...b })} className="text-[#8FA899] hover:text-[var(--accent)]"><Pencil className="w-4 h-4" /></button></Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Drawer
        open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? `Edit ${draft.title}` : 'New bonus'}
        footer={<button onClick={save} disabled={!draft?.title} className="w-full py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)] disabled:opacity-40">{draft?.id ? 'Save bonus' : 'Create bonus'}</button>}
      >
        {draft && (
          <div className="space-y-4">
            <Field label="Promotion title"><Input value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Monthly Loyalty Bonus" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type (free-form)" hint="Invent any key — monthly_loyalty, summer_drop…"><Input value={draft.type} onChange={(e) => set('type', e.target.value.replace(/\s+/g, '_').toLowerCase())} placeholder="monthly_loyalty" /></Field>
              <Field label="Frequency"><Select value={draft.frequency} onChange={(e) => set('frequency', e.target.value as BonusFrequency)}>{(Object.keys(FREQ_LABEL) as BonusFrequency[]).map((f) => <option key={f} value={f}>{FREQ_LABEL[f]}</option>)}</Select></Field>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#1A2E22] px-3 py-2.5">
              <div><p className="text-sm font-semibold text-[#F5E8C8]">Amount in %</p><p className="text-[11px] text-[#8FA899]">{draft.isPercentage ? 'Award is a percentage of a basis' : 'Award is a flat coin amount'}</p></div>
              <Toggle on={draft.isPercentage} label="amount in percent" onClick={() => set('isPercentage', !draft.isPercentage)} />
            </div>

            {draft.isPercentage ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Percent"><Input type="number" value={draft.percent} onChange={(e) => set('percent', Number(e.target.value))} placeholder="15" /></Field>
                <Field label="Of"><Select value={draft.percentBasis} onChange={(e) => set('percentBasis', e.target.value as PercentBasis)}>{(Object.keys(BASIS_LABEL) as PercentBasis[]).map((b) => <option key={b} value={b}>{BASIS_LABEL[b]}</option>)}</Select></Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="GC amount"><Input type="number" value={draft.gcAmount} onChange={(e) => set('gcAmount', Number(e.target.value))} /></Field>
                <Field label="SC amount"><Input type="number" value={draft.scAmount} onChange={(e) => set('scAmount', Number(e.target.value))} /></Field>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Validity"><Input value={draft.validity} onChange={(e) => set('validity', e.target.value)} placeholder="1st of each month" /></Field>
              <Field label="Eligibility"><Input value={draft.eligibility} onChange={(e) => set('eligibility', e.target.value)} placeholder="Active players" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Desktop image"><UploadBox label="Upload desktop" /></Field>
              <Field label="Mobile image"><UploadBox label="Upload mobile" /></Field>
            </div>
            <Field label="Terms & conditions"><RichText /></Field>
          </div>
        )}
      </Drawer>
    </>
  );
}
