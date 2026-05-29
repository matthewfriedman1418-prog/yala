'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput } from '@/components/admin/table';
import { Toggle } from '@/components/admin/controls';
import { FEATURE_FLAGS, type FeatureFlag } from '@/lib/mock-data/admin-extra';

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(FEATURE_FLAGS);
  const [q, setQ] = useState('');
  const toggle = (code: string) => setFlags((p) => p.map((f) => {
    if (f.code !== code) return f;
    toast.success(`${f.code} ${f.enabled ? 'OFF' : 'ON'}`);
    return { ...f, enabled: !f.enabled };
  }));
  const rows = flags.filter((f) => !q || f.code.includes(q.toLowerCase()) || f.description.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Feature Flags" subtitle="Toggle features & integrations live" />
      <Toolbar><SearchInput value={q} onChange={setQ} placeholder="Search flag code or description…" /></Toolbar>
      <Table>
        <THead><Th>Code</Th><Th>Description</Th><Th align="center">Status</Th></THead>
        <tbody>
          {rows.map((f) => (
            <Tr key={f.code}>
              <Td className="font-mono text-xs">{f.code}</Td>
              <Td className="text-[#8FA899]">{f.description}</Td>
              <Td align="center"><div className="flex items-center justify-center gap-2"><Badge tone={f.enabled ? 'green' : 'red'}>{f.enabled ? 'ON' : 'OFF'}</Badge><Toggle on={f.enabled} label={f.code} onClick={() => toggle(f.code)} /></div></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
