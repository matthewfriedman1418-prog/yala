'use client';
import { PageHeader, AdminCard, CardHeader } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { ADMIN_GAMES } from '@/lib/mock-data/admin';

const WINDOWS = [
  { label: 'All time', value: 95.0 },
  { label: 'Daily', value: 94.2 },
  { label: 'Weekly', value: 94.07 },
  { label: 'Bi-weekly', value: 98.91 },
  { label: 'Monthly', value: 95.6 },
];

export default function RtpPage() {
  return (
    <>
      <PageHeader title="RTP & Game Weighting" subtitle="Weighted return-to-player and playthrough contribution" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {WINDOWS.map((w) => (
          <AdminCard key={w.label} className="p-4">
            <p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">{w.label}</p>
            <p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{w.value.toFixed(2)}%</p>
          </AdminCard>
        ))}
      </div>
      <AdminCard>
        <CardHeader title="Per-game RTP & playthrough weight" sub="Weight = how much wagering on this game counts toward bonus playthrough" />
        <Table>
          <THead><Th>Game</Th><Th>Provider</Th><Th align="right">RTP</Th><Th align="right">Playthrough weight</Th><Th align="right">House edge</Th></THead>
          <tbody>
            {ADMIN_GAMES.filter((g) => g.enabled).map((g) => {
              const weight = g.category === 'Live' ? 10 : g.category === 'Originals' ? 100 : g.rtp > 97 ? 50 : 100;
              return (
                <Tr key={g.id}>
                  <Td className="font-semibold">{g.name}</Td>
                  <Td className="text-[#8FA899]">{g.provider}</Td>
                  <Td align="right" className="number-display">{g.rtp.toFixed(1)}%</Td>
                  <Td align="right" className="number-display">{weight}%</Td>
                  <Td align="right" className="number-display text-[#8FA899]">{(100 - g.rtp).toFixed(1)}%</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </AdminCard>
    </>
  );
}
