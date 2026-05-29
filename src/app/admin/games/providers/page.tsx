'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge, AdminCard, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Toggle } from '@/components/admin/controls';
import { PROVIDERS, AGGREGATORS, type Provider } from '@/lib/mock-data/admin-extra';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>(PROVIDERS);
  const toggle = (id: number) => setProviders((p) => p.map((x) => {
    if (x.id !== id) return x;
    toast.success(`${x.name} ${x.status === 'active' ? 'disabled' : 'enabled'}`);
    return { ...x, status: x.status === 'active' ? 'disabled' : 'active' };
  }));
  return (
    <>
      <PageHeader title="Providers & Aggregators" subtitle="Game integrations" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {AGGREGATORS.map((a) => (
          <AdminCard key={a.id} className="p-4 flex items-center justify-between">
            <div><p className="font-semibold text-[#F5E8C8]">{a.name}</p><p className="text-[11px] text-[#8FA899]">{a.providers} providers</p></div>
            <Badge tone={a.status === 'active' ? 'green' : 'gray'}>{a.status}</Badge>
          </AdminCard>
        ))}
      </div>
      <Table>
        <THead><Th>ID</Th><Th>Provider</Th><Th>Aggregator</Th><Th align="right">Games</Th><Th align="center">Enabled</Th></THead>
        <tbody>
          {providers.map((p) => (
            <Tr key={p.id} className={p.status !== 'active' ? 'opacity-55' : ''}>
              <Td className="font-mono text-xs text-[#8FA899]">{p.id}</Td>
              <Td className="font-semibold">{p.name}</Td>
              <Td className="text-[#8FA899]">{p.aggregator}</Td>
              <Td align="right" className="number-display">{fmtNum(p.games)}</Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={p.status === 'active'} label={p.name} onClick={() => toggle(p.id)} /></div></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
