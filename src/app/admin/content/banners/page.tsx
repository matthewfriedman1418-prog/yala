'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Toggle } from '@/components/admin/controls';
import { ADMIN_BANNERS, type AdminBanner } from '@/lib/mock-data/admin-extra';
import { Upload, ImageIcon } from 'lucide-react';

export default function BannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([...ADMIN_BANNERS].sort((a, b) => a.priority - b.priority));
  const toggle = (id: number) => setBanners((p) => p.map((b) => {
    if (b.id !== id) return b;
    toast.success(`Banner "${b.type}" ${b.enabled ? 'disabled' : 'enabled'}`);
    return { ...b, enabled: !b.enabled };
  }));
  return (
    <>
      <PageHeader title="Banners" subtitle="Player-app placements & priority">
        <button onClick={() => toast('Upload banner (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Upload className="w-4 h-4" /> Upload</button>
      </PageHeader>
      <Table>
        <THead><Th>Banner</Th><Th>Placement</Th><Th>Redirect</Th><Th align="right">Priority</Th><Th align="center">Enabled</Th></THead>
        <tbody>
          {banners.map((b) => (
            <Tr key={b.id} className={!b.enabled ? 'opacity-55' : ''}>
              <Td><span className="flex items-center gap-2"><span className="w-10 h-7 rounded bg-[#101C16] border border-[#1A2E22] flex items-center justify-center"><ImageIcon className="w-3.5 h-3.5 text-[#4A6A55]" /></span><span className="font-semibold">{b.type}</span></span></Td>
              <Td><Badge tone="blue">{b.placement}</Badge></Td>
              <Td className="font-mono text-xs text-[#8FA899]">{b.redirect}</Td>
              <Td align="right" className="number-display">{b.priority}</Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={b.enabled} label={b.type} onClick={() => toggle(b.id)} /></div></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
