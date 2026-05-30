'use client';
import { toast } from 'sonner';
import { PageHeader, AdminCard, fmtNum } from '@/components/admin/primitives';
import { JACKPOTS } from '@/lib/mock-data/admin-extra';
import { Trophy } from 'lucide-react';

export default function JackpotsPage() {
  return (
    <>
      <div className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-400">
        Planned feature — no live jackpot in the player app yet. Operator config shown for when it ships.
      </div>
      <PageHeader title="Jackpots" subtitle="Progressive pools & contribution rates" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {JACKPOTS.map((j) => (
          <AdminCard key={j.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center"><Trophy className="w-5 h-5 text-[var(--accent)]" /></span>
              <span className="text-[11px] text-[#8FA899]">contrib {j.contribRate}%</span>
            </div>
            <p className="text-sm font-semibold text-[#8FA899]">{j.name}</p>
            <p className="text-2xl font-extrabold text-[#F0B232] number-display mt-1">{fmtNum(j.pool)} GC</p>
            <div className="mt-3 pt-3 border-t border-[#1A2E22] text-xs text-[#8FA899] space-y-1">
              <p>Seed: <span className="text-[#F5E8C8] number-display">{fmtNum(j.seed)} GC</span></p>
              <p>Last winner: <span className="text-[#F5E8C8]">{j.lastWinner}</span> · {j.lastWonAt}</p>
            </div>
            <button onClick={() => toast('Edit jackpot config (mock)')} className="mt-3 w-full py-2 rounded-lg text-sm font-semibold border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5">Configure</button>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
