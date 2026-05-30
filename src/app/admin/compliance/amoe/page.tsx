'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, StatusBadge, AdminCard } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, EmptyRow } from '@/components/admin/table';
import { TimeAgo } from '@/components/admin/feedback';
import { Drawer, Field, Input, Modal } from '@/components/admin/controls';
import { confirm } from '@/components/admin/confirm';
import { AMOE_ENTRIES, type AmoeEntry } from '@/lib/mock-data/admin-extra';
import { Mail, Plus, Check, X } from 'lucide-react';

// Validation checks an AMOE entry runs before SC can be granted.
function checksFor(e: AmoeEntry) {
  return [
    { label: 'Legible & complete handwritten entry', pass: e.status !== 'rejected' },
    { label: 'Matches a registered account', pass: !!e.playerId },
    { label: 'Not a duplicate this period (1/day cap)', pass: e.id !== 'amoe_4' },
    { label: 'Postmark within entry window', pass: true },
  ];
}

export default function AmoePage() {
  const [items, setItems] = useState<AmoeEntry[]>(AMOE_ENTRIES);
  const [viewing, setViewing] = useState<AmoeEntry | null>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intake, setIntake] = useState({ name: '', player: '' });

  const setStatus = (id: string, status: AmoeEntry['status'], msg: string) => { setItems((p) => p.map((x) => x.id === id ? { ...x, status } : x)); toast.success(msg); };

  const grant = async (e: AmoeEntry) => {
    const r = await confirm({ title: `Grant ${e.scGranted} SC to ${e.player}?`, message: 'Issues free Sweep Coins per the posted AMOE value. Writes a ledger entry.', confirmLabel: 'Grant SC' });
    if (r.confirmed) { setStatus(e.id, 'granted', `Granted ${e.scGranted} SC to ${e.player}`); setViewing(null); }
  };
  const reject = async (e: AmoeEntry) => {
    const r = await confirm({ title: `Reject entry ${e.id}?`, danger: true, requireReason: true, reasonOptions: ['No account match', 'Duplicate (over daily cap)', 'Illegible / incomplete', 'Outside entry window', 'Other'] });
    if (r.confirmed) { setStatus(e.id, 'rejected', `${e.id} rejected · ${r.reason}`); setViewing(null); }
  };

  const logIntake = () => {
    const id = `amoe_${100 + items.length}`;
    setItems((p) => [{ id, name: intake.name || `Postcard #${4822 + items.length}`, player: intake.player || '(no match)', playerId: intake.player ? 'usr_pending' : '', received: '2026-05-28T09:30:00Z', status: 'pending', scGranted: 5 }, ...p]);
    toast.success('Mail-in entry logged');
    setIntake({ name: '', player: '' });
    setIntakeOpen(false);
  };

  return (
    <>
      <PageHeader title="AMOE — Mail-in Entries" subtitle="Free Sweep Coin entry path (no purchase necessary)">
        <button onClick={() => setIntakeOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> Log entry</button>
      </PageHeader>
      <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 mb-5 text-sm text-[#F5E8C8] flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" /> The legally-required free entry method. Each valid request grants SC at the posted sweeps value. Limit one per person per day.</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Awaiting review</p><p className="text-xl font-extrabold text-amber-400 number-display mt-1">{items.filter((e) => e.status === 'pending' || e.status === 'validated').length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Granted (window)</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{items.filter((e) => e.status === 'granted').length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">SC issued</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{items.filter((e) => e.status === 'granted').reduce((s, e) => s + e.scGranted, 0)} SC</p></AdminCard>
      </div>

      <Table>
        <THead><Th>Entry</Th><Th>Matched player</Th><Th>Received</Th><Th align="right">SC</Th><Th>Status</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {items.length === 0 ? <EmptyRow colSpan={6} /> : items.map((e) => (
            <Tr key={e.id} onClick={() => setViewing(e)}>
              <Td className="font-mono text-xs">{e.name}</Td>
              <Td>{e.playerId && e.playerId !== 'usr_pending' ? <Link href={`/admin/players/${e.playerId}`} onClick={(ev) => ev.stopPropagation()} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{e.player}</Link> : <span className="text-[#8FA899] italic">{e.player}</span>}</Td>
              <Td className="text-xs text-[#8FA899]"><TimeAgo ts={e.received} /></Td>
              <Td align="right" className="number-display text-emerald-400">{e.scGranted || '—'}</Td>
              <Td><StatusBadge status={e.status === 'validated' ? 'in_review' : e.status === 'granted' ? 'approved' : e.status === 'rejected' ? 'rejected' : 'pending'} /></Td>
              <Td align="right"><span className="text-xs font-semibold text-[var(--accent)]">Review →</span></Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {/* Review drawer */}
      <Drawer open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Review ${viewing.name}` : ''}>
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Matched player"><p className="text-sm text-[#F5E8C8]">{viewing.player}</p></Field>
              <Field label="SC value"><p className="text-sm text-emerald-400 number-display">{viewing.scGranted} SC</p></Field>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#8FA899] mb-2">Validation</p>
              <div className="space-y-1.5">
                {checksFor(viewing).map((c) => (
                  <div key={c.label} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-sm">
                    <span className="text-[#F5E8C8]">{c.label}</span>
                    {c.pass ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400"><Check className="w-3.5 h-3.5" />Pass</span> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400"><X className="w-3.5 h-3.5" />Fail</span>}
                  </div>
                ))}
              </div>
            </div>
            {(viewing.status === 'pending' || viewing.status === 'validated') && (
              <div className="flex gap-2 pt-1">
                <button onClick={() => grant(viewing)} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">Grant SC</button>
                <button onClick={() => reject(viewing)} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25">Reject</button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Intake modal */}
      <Modal open={intakeOpen} onClose={() => setIntakeOpen(false)} title="Log mail-in entry"
        footer={<div className="flex gap-2"><button onClick={() => setIntakeOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold border border-[#1A2E22] text-[#8FA899]">Cancel</button><button onClick={logIntake} className="flex-1 py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)]">Log entry</button></div>}>
        <div className="space-y-3">
          <Field label="Entry reference" hint="e.g. envelope / postcard number"><Input value={intake.name} onChange={(e) => setIntake({ ...intake, name: e.target.value })} placeholder="Postcard #4822" /></Field>
          <Field label="Claimed username / email"><Input value={intake.player} onChange={(e) => setIntake({ ...intake, player: e.target.value })} placeholder="Search to match an account…" /></Field>
          <p className="text-xs text-[#8FA899]">Logging runs the dedupe + account-match checks. Grant SC after review.</p>
        </div>
      </Modal>
    </>
  );
}
