'use client';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, Badge, RiskBadge, AdminCard } from '@/components/admin/primitives';
import { DEVICE_CLUSTERS } from '@/lib/mock-data/admin-extra';
import { Smartphone, Globe, CreditCard, Mail, Users } from 'lucide-react';

const SIGNAL = { device: Smartphone, ip: Globe, payment: CreditCard, email: Mail } as const;

export default function DevicesPage() {
  return (
    <>
      <PageHeader title="Devices & Multi-account" subtitle="Linked-account detection by shared signals" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Clusters</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{DEVICE_CLUSTERS.length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Linked accounts</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{DEVICE_CLUSTERS.reduce((s, d) => s + d.accounts.length, 0)}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">High-risk</p><p className="text-xl font-extrabold text-red-400 number-display mt-1">{DEVICE_CLUSTERS.filter((d) => d.riskScore >= 70).length}</p></AdminCard>
      </div>
      <div className="space-y-3">
        {DEVICE_CLUSTERS.map((d) => {
          const Icon = SIGNAL[d.signal];
          return (
            <AdminCard key={d.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#F5E8C8]"><span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Icon className="w-4 h-4 text-[#8FA899]" /></span>{d.detail}</span>
                <div className="flex items-center gap-2"><Badge tone="gray">{d.signal}</Badge><RiskBadge score={d.riskScore} /></div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {d.accounts.map((a) => (
                  <Link key={a.username} href={`/admin/players/${a.playerId}`} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 text-[#F5E8C8] hover:bg-white/10">
                    <Users className="w-3 h-3 text-[#8FA899]" />{a.username}<span className="text-[#8FA899]">· {a.status}</span>
                  </Link>
                ))}
                <button onClick={() => toast.success('Consolidation workflow started (mock)')} className="ml-auto text-xs font-semibold text-[var(--accent)]">Consolidate →</button>
              </div>
            </AdminCard>
          );
        })}
      </div>
    </>
  );
}
