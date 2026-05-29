'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Toggle } from '@/components/admin/controls';
import { FEATURE_FLAGS, type FeatureFlag } from '@/lib/mock-data/admin-extra';

// Provider monitors are the abandoned_bets:* family of flags.
export default function MonitorsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(FEATURE_FLAGS.filter((f) => f.code.startsWith('abandoned_bets')));
  const toggle = (code: string) => setFlags((p) => p.map((f) => {
    if (f.code !== code) return f;
    toast.success(`${f.code} ${f.enabled ? 'OFF' : 'ON'}`);
    return { ...f, enabled: !f.enabled };
  }));
  return (
    <>
      <PageHeader title="Provider Monitors" subtitle="Abandoned-bet reconciliation per provider" />
      <Table>
        <THead><Th>Code</Th><Th>Description</Th><Th align="center">Status</Th></THead>
        <tbody>
          {flags.map((f) => (
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
