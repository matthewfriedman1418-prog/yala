'use client';
import { toast } from 'sonner';
import { PageHeader, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { SEGMENTS } from '@/lib/mock-data/admin-extra';
import { Plus, Users } from 'lucide-react';

export default function SegmentsPage() {
  return (
    <>
      <PageHeader title="Segments / Audiences" subtitle="Rule-built player cohorts">
        <button onClick={() => toast('New segment (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New segment</button>
      </PageHeader>
      <Table>
        <THead><Th>Segment</Th><Th>Rule</Th><Th align="right">Size</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {SEGMENTS.map((s) => (
            <Tr key={s.id}>
              <Td className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-[#8FA899]" />{s.name}</Td>
              <Td className="text-[#8FA899] font-mono text-xs">{s.rule}</Td>
              <Td align="right" className="number-display">{fmtNum(s.size)}</Td>
              <Td align="right"><button onClick={() => toast.success(`Campaign drafted for "${s.name}"`)} className="text-xs font-semibold text-[var(--accent)]">Message →</button></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
