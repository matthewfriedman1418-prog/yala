'use client';
import { toast } from 'sonner';
import { PageHeader, Badge, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { JOBS } from '@/lib/mock-data/admin-extra';
import { RotateCw } from 'lucide-react';

const TONE = { ok: 'green', degraded: 'amber', failed: 'red' } as const;

export default function JobsPage() {
  return (
    <>
      <PageHeader title="Jobs & Monitors" subtitle="Cron & queue health" />
      <Table>
        <THead><Th>Job</Th><Th>Schedule</Th><Th>Last run</Th><Th align="right">Duration</Th><Th>Status</Th><Th align="right">Actions</Th></THead>
        <tbody>
          {JOBS.map((j) => (
            <Tr key={j.name}>
              <Td className="font-mono text-xs">{j.name}</Td>
              <Td className="font-mono text-xs text-[#8FA899]">{j.schedule}</Td>
              <Td className="text-xs text-[#8FA899]">{fmtAgo(j.lastRun)}</Td>
              <Td align="right" className="number-display text-[#8FA899]">{j.durationMs ? `${(j.durationMs / 1000).toFixed(1)}s` : '—'}</Td>
              <Td><Badge tone={TONE[j.status]}>{j.status}</Badge></Td>
              <Td align="right"><button onClick={() => toast.success(`${j.name} re-run queued`)} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]"><RotateCw className="w-3.5 h-3.5" /> Run now</button></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
