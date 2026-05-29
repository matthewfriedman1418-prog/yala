'use client';
import { toast } from 'sonner';
import { PageHeader } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Plus } from 'lucide-react';

const TAGS = [
  { name: '10 Free Spins on Le Pharaoh', color: 'FF4455', border: 'FF8B96', label: 'FREE SPINS' },
  { name: '10 Free Spins on Time Spinners', color: '2278E1', border: '73BCFF', label: 'FREE SPINS' },
  { name: 'Launch Leaderboard', color: 'FF4455', border: 'FF8B96', label: 'LEADERBOARD' },
  { name: '20% Flash Bonus', color: '009334', border: '68CC58', label: '20% OFF' },
  { name: '20% Off Special Offer', color: '009334', border: '68CC58', label: '20% OFF' },
  { name: 'VIP Reload', color: '8B5CF6', border: 'C4B5FD', label: 'VIP' },
];

export default function TagsPage() {
  return (
    <>
      <PageHeader title="Tags & Widgets" subtitle="Promo badges shown in the player lobby (80×80)">
        <button onClick={() => toast('New tag (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New tag</button>
      </PageHeader>
      <Table>
        <THead><Th>Name</Th><Th>Tag colors</Th><Th align="center">Widget (80×80)</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {TAGS.map((t) => (
            <Tr key={t.name}>
              <Td className="font-semibold">{t.name}</Td>
              <Td>
                <div className="space-y-1 text-xs text-[#8FA899]">
                  <div className="flex items-center gap-2">Color #{t.color}<span className="w-4 h-4 rounded" style={{ background: `#${t.color}` }} /></div>
                  <div className="flex items-center gap-2">Border #{t.border}<span className="w-4 h-4 rounded" style={{ background: `#${t.border}` }} /></div>
                </div>
              </Td>
              <Td align="center">
                <div className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg text-[8px] font-black text-white" style={{ background: `#${t.color}`, border: `2px solid #${t.border}` }}>
                  <span className="leading-tight text-center px-1">{t.label}</span>
                </div>
              </Td>
              <Td align="right"><button onClick={() => toast.success('Tag ID copied')} className="text-xs font-semibold text-[var(--accent)]">Copy ID</button></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
