'use client';
import { toast } from 'sonner';
import { PageHeader, Badge, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { CAMPAIGNS } from '@/lib/mock-data/admin-extra';
import { Plus, Mail, Bell, MessageSquare } from 'lucide-react';

const CHANNEL = { email: Mail, push: Bell, in_app: MessageSquare } as const;
const TONE = { sent: 'green', scheduled: 'blue', draft: 'gray' } as const;

export default function CampaignsPage() {
  return (
    <>
      <PageHeader title="Campaigns" subtitle="Email · push · in-app messaging">
        <button onClick={() => toast('New campaign (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New campaign</button>
      </PageHeader>
      <Table>
        <THead><Th>Campaign</Th><Th>Channel</Th><Th>Segment</Th><Th align="right">Sent</Th><Th align="right">Open rate</Th><Th>Status</Th></THead>
        <tbody>
          {CAMPAIGNS.map((c) => {
            const Icon = CHANNEL[c.channel];
            return (
              <Tr key={c.id}>
                <Td className="font-semibold">{c.name}</Td>
                <Td><span className="inline-flex items-center gap-1.5 text-[#8FA899] text-sm"><Icon className="w-4 h-4" />{c.channel.replace('_', '-')}</span></Td>
                <Td className="text-[#8FA899]">{c.segment}</Td>
                <Td align="right" className="number-display">{c.sent ? fmtNum(c.sent) : '—'}</Td>
                <Td align="right" className="number-display">{c.openRate ? `${c.openRate}%` : '—'}</Td>
                <Td><Badge tone={TONE[c.status]}>{c.status}</Badge></Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
