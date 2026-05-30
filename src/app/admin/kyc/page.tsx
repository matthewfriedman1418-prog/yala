'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, StatusBadge, RiskBadge, AdminCard, CardHeader, Avatar, fmtAgo } from '@/components/admin/primitives';
import { FilterTabs } from '@/components/admin/table';
import { KYC_CASES, type KycCase } from '@/lib/mock-data/admin';
import { confirm } from '@/components/admin/confirm';
import { Check, X, FileText, Camera, MapPin, ShieldCheck, ScanFace } from 'lucide-react';

type Filter = 'all' | 'pending' | 'in_review' | 'approved' | 'rejected';

export default function KycPage() {
  const [cases, setCases] = useState<KycCase[]>(KYC_CASES);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string>(KYC_CASES[0]?.id ?? '');

  const list = cases.filter((c) => filter === 'all' || c.status === filter);
  const selected = cases.find((c) => c.id === selectedId) ?? list[0];

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      const r = await confirm({ title: `Reject KYC ${id}?`, message: 'The player stays unverified and cannot redeem. They can re-submit documents.', danger: true, requireReason: true, reasonOptions: ['Document authenticity fail', 'Face/selfie mismatch', 'Address proof missing', 'Sanctions / PEP hit', 'Underage', 'Other'] });
      if (!r.confirmed) return;
      setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      toast.error(`KYC ${id} rejected · ${r.reason}`);
      return;
    }
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success(`KYC ${id} approved`);
  };

  const counts = cases.reduce((acc, c) => { acc[c.status] = (acc[c.status] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <>
      <PageHeader title="KYC Queue" subtitle="Identity & document verification review" />

      <div className="mb-4">
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'All', count: cases.length },
            { value: 'pending', label: 'Pending', count: counts.pending },
            { value: 'in_review', label: 'In review', count: counts.in_review },
            { value: 'approved', label: 'Approved', count: counts.approved },
            { value: 'rejected', label: 'Rejected', count: counts.rejected },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Case list */}
        <div className="space-y-2">
          {list.length === 0 && <p className="text-sm text-[#8FA899] py-8 text-center">No cases.</p>}
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${selected?.id === c.id ? 'border-[var(--accent)] bg-white/[0.04]' : 'border-[#1A2E22] bg-[#0C1812] hover:bg-white/[0.02]'}`}
            >
              <div className="flex items-center gap-3">
                <Avatar initials={c.player.slice(0, 2).toUpperCase()} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#F5E8C8] truncate">{c.player}</p>
                  <p className="text-[11px] text-[#8FA899]">{c.docType} · {c.country} · {fmtAgo(c.submittedAt)}</p>
                </div>
                <RiskBadge score={c.riskScore} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[11px] text-[#8FA899]">{c.id}</span>
                <StatusBadge status={c.status} />
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <AdminCard className="p-10 text-center text-[#8FA899]">Select a case to review.</AdminCard>
          ) : (
            <AdminCard>
              <CardHeader
                title={`${selected.player} · ${selected.id}`}
                sub={`${selected.docType} · ${selected.country} · submitted ${fmtAgo(selected.submittedAt)}`}
                action={<RiskBadge score={selected.riskScore} />}
              />
              <div className="p-4 space-y-4">
                {/* Document placeholders */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[1.6] rounded-lg border border-dashed border-[#1A2E22] bg-[#101C16] flex flex-col items-center justify-center text-[#8FA899]">
                    <FileText className="w-6 h-6 mb-1" />
                    <span className="text-xs">{selected.docType}</span>
                    <span className="text-[10px]">document.jpg</span>
                  </div>
                  <div className="aspect-[1.6] rounded-lg border border-dashed border-[#1A2E22] bg-[#101C16] flex flex-col items-center justify-center text-[#8FA899]">
                    <ScanFace className="w-6 h-6 mb-1" />
                    <span className="text-xs">Selfie</span>
                    <span className="text-[10px]">liveness.jpg</span>
                  </div>
                </div>

                {/* Automated checks */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8FA899] mb-2">Automated checks</p>
                  <div className="space-y-1.5">
                    {selected.checks.map((chk) => {
                      const Icon = chk.label.includes('Face') ? Camera : chk.label.includes('Address') ? MapPin : chk.label.includes('Sanctions') ? ShieldCheck : FileText;
                      return (
                        <div key={chk.label} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                          <span className="flex items-center gap-2 text-sm text-[#F5E8C8]"><Icon className="w-4 h-4 text-[#8FA899]" />{chk.label}</span>
                          {chk.pass === null
                            ? <span className="text-xs font-semibold text-amber-400">Pending</span>
                            : chk.pass
                              ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400"><Check className="w-3.5 h-3.5" />Pass</span>
                              : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400"><X className="w-3.5 h-3.5" />Fail</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                {(selected.status === 'pending' || selected.status === 'in_review') ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => decide(selected.id, 'approved')}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                    >
                      <Check className="w-4 h-4" /> Approve verification
                    </button>
                    <button
                      onClick={() => decide(selected.id, 'rejected')}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm text-[#8FA899]">Decision recorded:</span>
                    <StatusBadge status={selected.status} />
                    <Link href={`/admin/players/${selected.playerId}`} className="ml-auto text-xs font-semibold text-[var(--accent)]">View player →</Link>
                  </div>
                )}
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </>
  );
}
