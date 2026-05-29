'use client';
import { toast } from 'sonner';
import { PageHeader, AdminCard, fmtNum } from '@/components/admin/primitives';
import { VIP_TIER_CONFIG } from '@/lib/mock-data/admin-extra';
import { Crown, Pencil } from 'lucide-react';

export default function VipTiersPage() {
  return (
    <>
      <PageHeader title="VIP Tiers & Benefits" subtitle="Wagering thresholds → rewards" />
      <div className="space-y-3">
        {VIP_TIER_CONFIG.map((t) => (
          <AdminCard key={t.level} className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${t.color}22` }}><Crown className="w-5 h-5" style={{ color: t.color }} /></span>
                <div>
                  <p className="font-bold text-[#F5E8C8]">{t.name} <span className="text-xs font-semibold text-[#8FA899]">· Level {t.level} · Tier ID {t.tierId}</span></p>
                  <p className="text-[11px] text-[#8FA899]">Wagering threshold: <span className="number-display text-[#F5E8C8]">{fmtNum(t.wagerThreshold)} GC</span></p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-center"><p className="text-[10px] uppercase tracking-wide text-[#8FA899]">Cash</p><p className="font-bold text-[#F5E8C8] number-display">{t.cashReward} SC</p></div>
                <div className="text-center"><p className="text-[10px] uppercase tracking-wide text-[#8FA899]">Commission</p><p className="font-bold text-[#F5E8C8] number-display">{t.commissionPct}%</p></div>
                <div className="text-center"><p className="text-[10px] uppercase tracking-wide text-[#8FA899]">Rakeback</p><p className="font-bold text-[#F5E8C8] number-display">{t.rakebackPct}%</p></div>
                <button onClick={() => toast('Edit tier (mock)')} className="p-2 rounded-lg border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5"><Pencil className="w-4 h-4" /></button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
