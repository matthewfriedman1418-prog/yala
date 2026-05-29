'use client';
import { toast } from 'sonner';
import { PageHeader, Badge, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { WEBHOOKS } from '@/lib/mock-data/admin-extra';

const TONE = { delivered: 'green', failed: 'red', retrying: 'amber' } as const;

export default function WebhooksPage() {
  return (
    <>
      <PageHeader title="Webhooks" subtitle="Inbound provider events & delivery log" />
      <Table>
        <THead><Th>Source</Th><Th>Event</Th><Th>Status</Th><Th>When</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {WEBHOOKS.map((w) => (
            <Tr key={w.id}>
              <Td className="font-semibold">{w.source}</Td>
              <Td className="font-mono text-xs text-[#8FA899]">{w.event}</Td>
              <Td><Badge tone={TONE[w.status]}>{w.status}</Badge></Td>
              <Td className="text-xs text-[#8FA899]">{fmtAgo(w.ts)}</Td>
              <Td align="right">{w.status !== 'delivered' ? <button onClick={() => toast.success(`Replayed ${w.event}`)} className="text-xs font-semibold text-[var(--accent)]">Replay</button> : <span className="text-xs text-[#8FA899]">—</span>}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
