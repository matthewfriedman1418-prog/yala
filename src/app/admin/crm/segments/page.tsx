'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, fmtNum, Avatar, StatusBadge } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Drawer, Field, Input, Textarea } from '@/components/admin/controls';
import { SEGMENTS, type Segment } from '@/lib/mock-data/admin-extra';
import { PLAYERS } from '@/lib/mock-data/admin';
import { Plus, Users, Pencil } from 'lucide-react';

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>(SEGMENTS);
  const [viewing, setViewing] = useState<Segment | null>(null);
  const [editing, setEditing] = useState<Segment | null>(null);

  // A deterministic sample of "matching" players for the preview.
  const membersFor = (seg: Segment) => PLAYERS.filter((_, i) => (i * 7 + seg.id.length) % 3 === 0).slice(0, 8);

  const saveCriteria = () => {
    if (!editing) return;
    setSegments((s) => s.map((x) => (x.id === editing.id ? editing : x)));
    toast.success('Segment criteria updated · audience recalculated');
    setEditing(null);
  };

  return (
    <>
      <PageHeader title="Segments / Audiences" subtitle="Rule-built player cohorts">
        <button onClick={() => toast('New segment (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New segment</button>
      </PageHeader>
      <Table>
        <THead><Th>Segment</Th><Th>Rule</Th><Th align="right">Size</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {segments.map((s) => (
            <Tr key={s.id}>
              <Td className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-[#8FA899]" />{s.name}</Td>
              <Td className="text-[#8FA899] font-mono text-xs">{s.rule}</Td>
              <Td align="right" className="number-display">{fmtNum(s.size)}</Td>
              <Td align="right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setViewing(s)} className="text-xs font-semibold text-[var(--accent)]">View members</button>
                  <button onClick={() => setEditing({ ...s })} className="text-[#8FA899] hover:text-[#F5E8C8]" title="Edit criteria"><Pencil className="w-3.5 h-3.5" /></button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {/* Members list */}
      <Drawer open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `${viewing.name} — members` : ''} width="max-w-2xl"
        footer={viewing && <button onClick={() => { toast.success(`Campaign drafted for ${fmtNum(viewing.size)} players`); setViewing(null); }} className="w-full py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)]">Message this segment</button>}>
        {viewing && (
          <div className="space-y-3">
            <p className="text-sm text-[#8FA899]"><span className="font-bold text-[#F5E8C8] number-display">{fmtNum(viewing.size)}</span> players match · <span className="font-mono text-xs">{viewing.rule}</span></p>
            <Table>
              <THead><Th>Player</Th><Th>Status</Th><Th align="right">Deposited</Th></THead>
              <tbody>
                {membersFor(viewing).map((p) => (
                  <Tr key={p.id}>
                    <Td><Link href={`/admin/players/${p.id}`} className="flex items-center gap-2 font-semibold text-[#F5E8C8] hover:text-[var(--accent)]"><Avatar initials={p.avatar} size={26} />{p.username}</Link></Td>
                    <Td><StatusBadge status={p.status} /></Td>
                    <Td align="right" className="number-display">${p.totalDeposited.toLocaleString()}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <p className="text-xs text-[#8FA899]">Showing 8 of {fmtNum(viewing.size)} — full list paginates once wired to the backend.</p>
          </div>
        )}
      </Drawer>

      {/* Edit criteria */}
      <Drawer open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.name}` : ''}
        footer={<button onClick={saveCriteria} className="w-full py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)]">Save & recalculate audience</button>}>
        {editing && (
          <div className="space-y-4">
            <Field label="Segment name"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Criteria (rule expression)" hint="e.g. deposited ≥ 1 AND inactive 14d AND kyc = verified"><Textarea rows={3} value={editing.rule} onChange={(e) => setEditing({ ...editing, rule: e.target.value })} /></Field>
            <div className="rounded-lg border border-[#1A2E22] bg-white/[0.02] px-3 py-2 text-sm text-[#8FA899]">Estimated audience: <span className="font-bold text-[#F5E8C8] number-display">{fmtNum(editing.size)}</span> players</div>
          </div>
        )}
      </Drawer>
    </>
  );
}
