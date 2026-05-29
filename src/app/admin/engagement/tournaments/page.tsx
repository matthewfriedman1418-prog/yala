'use client';
import { toast } from 'sonner';
import { PageHeader, Badge, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { TOURNAMENTS } from '@/lib/mock-data/admin-extra';
import { Plus } from 'lucide-react';

const TONE = { live: 'green', scheduled: 'blue', ended: 'gray' } as const;

export default function TournamentsPage() {
  return (
    <>
      <PageHeader title="Tournaments · Races" subtitle="Competitive events & prize pools">
        <button onClick={() => toast('New tournament (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New tournament</button>
      </PageHeader>
      <Table>
        <THead><Th>Tournament</Th><Th>Game</Th><Th align="right">Prize pool</Th><Th align="right">Players</Th><Th>Window</Th><Th>Status</Th></THead>
        <tbody>
          {TOURNAMENTS.map((t) => (
            <Tr key={t.id}>
              <Td className="font-semibold">{t.name}</Td>
              <Td className="text-[#8FA899]">{t.game}</Td>
              <Td align="right" className="number-display" ><span style={{ color: '#F0B232' }}>{fmtNum(t.prizePool)} GC</span></Td>
              <Td align="right" className="number-display">{fmtNum(t.players)}</Td>
              <Td className="text-xs text-[#8FA899]">{t.start} → {t.end}</Td>
              <Td><Badge tone={TONE[t.status]}>{t.status}</Badge></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
