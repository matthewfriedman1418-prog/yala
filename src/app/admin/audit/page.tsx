'use client';
import { useState } from 'react';
import { PageHeader, Avatar, Badge, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput, FilterTabs } from '@/components/admin/table';
import { AUDIT_LOG, type AuditEntry } from '@/lib/mock-data/admin';

type Filter = 'all' | AuditEntry['kind'];
const TONE: Record<AuditEntry['kind'], 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gray'> = {
  payment: 'green', kyc: 'blue', player: 'purple', config: 'amber', security: 'red', support: 'gray',
};

export default function AuditPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const rows = AUDIT_LOG
    .filter((e) => filter === 'all' || e.kind === filter)
    .filter((e) => !q || e.actor.toLowerCase().includes(q.toLowerCase()) || e.action.toLowerCase().includes(q.toLowerCase()) || e.target.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Audit Log" subtitle="Immutable record of every operator & system action" />
      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search actor, action, or target…" />
        <FilterTabs<Filter> value={filter} onChange={setFilter} tabs={[{ value: 'all', label: 'All' }, { value: 'payment', label: 'Payment' }, { value: 'kyc', label: 'KYC' }, { value: 'security', label: 'Security' }, { value: 'config', label: 'Config' }, { value: 'player', label: 'Player' }, { value: 'support', label: 'Support' }]} />
      </Toolbar>
      <Table>
        <THead><Th>Actor</Th><Th>Action</Th><Th>Target</Th><Th>Kind</Th><Th>When</Th></THead>
        <tbody>
          {rows.map((e) => (
            <Tr key={e.id}>
              <Td><span className="flex items-center gap-2"><Avatar size={26} initials={e.actor === 'auto' ? 'SYS' : e.actor.split(' ').map((w) => w[0]).join('')} hue={e.actor === 'auto' ? '#8B5CF6' : '#2DC97A'} /><span className="font-semibold text-[#F5E8C8]">{e.actor === 'auto' ? 'System' : e.actor}</span></span></Td>
              <Td>{e.action}</Td>
              <Td className="text-[#8FA899] font-mono text-xs">{e.target}</Td>
              <Td><Badge tone={TONE[e.kind]}>{e.kind}</Badge></Td>
              <Td className="text-xs text-[#8FA899]">{fmtAgo(e.ts)}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
