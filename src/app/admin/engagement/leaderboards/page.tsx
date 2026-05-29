'use client';
import { toast } from 'sonner';
import { PageHeader } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Plus } from 'lucide-react';

const BOARDS = [
  { name: 'Monthly Night Riders Leaderboard', type: 'leaderboard', room: 'NightRiders', start: '2026-05-02', end: '2026-05-31' },
  { name: 'AlexJJ Monthly Leaderboard', type: 'leaderboard', room: 'AlexJJ', start: '2026-05-02', end: '2026-05-31' },
  { name: 'Vibe Meter', type: 'leaderboard', room: 'Vibequeenslots', start: '2026-05-02', end: '2026-05-31' },
  { name: 'Sweeps Showdown', type: 'leaderboard', room: 'SweepsGuy', start: '2026-05-02', end: '2026-05-31' },
  { name: '$1,000 Monthly Leaderboard', type: 'leaderboard', room: 'MacWinz', start: '2026-05-02', end: '2026-05-31' },
  { name: 'May Slots Race', type: 'race', room: 'Global', start: '2026-05-01', end: '2026-05-31' },
];

export default function LeaderboardsPage() {
  return (
    <>
      <PageHeader title="Leaderboards" subtitle="Per-room & global ranked competitions">
        <button onClick={() => toast('New leaderboard (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New leaderboard</button>
      </PageHeader>
      <Table>
        <THead><Th>Name</Th><Th>Type</Th><Th>Room</Th><Th>Start</Th><Th>End</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {BOARDS.map((b) => (
            <Tr key={b.name}>
              <Td className="font-semibold">{b.name}</Td>
              <Td className="text-[#8FA899]">{b.type}</Td>
              <Td>{b.room}</Td>
              <Td className="text-xs text-[#8FA899]">{b.start}</Td>
              <Td className="text-xs text-[#8FA899]">{b.end}</Td>
              <Td align="right"><button onClick={() => toast.success('Leaderboard ID copied')} className="text-xs font-semibold text-[var(--accent)]">Copy ID</button></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
