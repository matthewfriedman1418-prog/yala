'use client';
import { toast } from 'sonner';
import { PageHeader, AdminCard } from '@/components/admin/primitives';
import { REPORTS } from '@/lib/mock-data/admin-extra';
import { FileBarChart, Download, Clock } from 'lucide-react';

export default function ReportsPage() {
  const groups = [...new Set(REPORTS.map((r) => r.group))];
  return (
    <>
      <PageHeader title="Reports" subtitle="Exportable & schedulable analytics" />
      {groups.map((g) => (
        <div key={g} className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#8FA899] mb-2">{g}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPORTS.filter((r) => r.group === g).map((r) => (
              <AdminCard key={r.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center flex-shrink-0"><FileBarChart className="w-4 h-4 text-[var(--accent)]" /></span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#F5E8C8]">{r.name}</p>
                    <p className="text-xs text-[#8FA899] mt-0.5">{r.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1A2E22]">
                  <button onClick={() => toast.success(`${r.name} exported`)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]"><Download className="w-3.5 h-3.5" /> Export</button>
                  <button onClick={() => toast.success(`${r.name} scheduled`)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8FA899] hover:text-[#F5E8C8] ml-auto"><Clock className="w-3.5 h-3.5" /> Schedule</button>
                </div>
              </AdminCard>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
