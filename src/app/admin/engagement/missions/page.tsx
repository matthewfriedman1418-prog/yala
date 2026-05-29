'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Toggle } from '@/components/admin/controls';
import { MISSIONS, type Mission } from '@/lib/mock-data/admin-extra';
import { Plus } from 'lucide-react';

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>(MISSIONS);
  const toggle = (id: string) => setMissions((p) => p.map((m) => {
    if (m.id !== id) return m;
    toast.success(`"${m.name}" ${m.active ? 'paused' : 'activated'}`);
    return { ...m, active: !m.active };
  }));
  return (
    <>
      <PageHeader title="Missions / Quests" subtitle="Objective-based player rewards">
        <button onClick={() => toast('New mission (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New mission</button>
      </PageHeader>
      <Table>
        <THead><Th>Mission</Th><Th>Objective</Th><Th>Reward</Th><Th align="center">Active</Th></THead>
        <tbody>
          {missions.map((m) => (
            <Tr key={m.id} className={!m.active ? 'opacity-55' : ''}>
              <Td className="font-semibold">{m.name}</Td>
              <Td className="text-[#8FA899]">{m.objective}</Td>
              <Td><Badge tone="green">{m.reward}</Badge></Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={m.active} label={m.name} onClick={() => toggle(m.id)} /></div></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
