'use client';
import { toast } from 'sonner';
import { PageHeader, Badge } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { CMS_PAGES } from '@/lib/mock-data/admin-extra';
import { Plus } from 'lucide-react';

export default function CmsPagesPage() {
  return (
    <>
      <PageHeader title="CMS — Pages" subtitle="Legal & informational pages">
        <button onClick={() => toast('New page (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New page</button>
      </PageHeader>
      <Table>
        <THead><Th>ID</Th><Th>Title</Th><Th>Slug</Th><Th>Status</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {CMS_PAGES.map((p) => (
            <Tr key={p.id}>
              <Td className="font-mono text-xs text-[#8FA899]">{p.id}</Td>
              <Td className="font-semibold">{p.title}</Td>
              <Td className="font-mono text-xs text-[#8FA899]">/{p.slug}</Td>
              <Td><Badge tone={p.status === 'active' ? 'green' : 'gray'}>{p.status}</Badge></Td>
              <Td align="right"><button onClick={() => toast('Edit page (mock)')} className="text-xs font-semibold text-[var(--accent)]">Edit</button></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
