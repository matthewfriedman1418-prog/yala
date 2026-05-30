'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, AdminCard, fmtNum } from '@/components/admin/primitives';
import { Drawer, Field, Input } from '@/components/admin/controls';
import { VIP_TIER_CONFIG, type VipTierConfig } from '@/lib/mock-data/admin-extra';
import { Crown, Pencil } from 'lucide-react';

export default function VipTiersPage() {
  const [tiers, setTiers] = useState<VipTierConfig[]>(VIP_TIER_CONFIG);
  const [editing, setEditing] = useState<VipTierConfig | null>(null);
  const [draft, setDraft] = useState<VipTierConfig | null>(null);

  const open = (t: VipTierConfig) => { setEditing(t); setDraft({ ...t }); };
  const save = () => {
    if (!draft) return;
    setTiers((ts) => ts.map((t) => (t.level === draft.level ? draft : t)));
    toast.success(`${draft.name} tier updated`);
    setEditing(null);
  };
  const num = (k: keyof VipTierConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => (d ? { ...d, [k]: Number(e.target.value) } : d));

  return (
    <>
      <PageHeader title="VIP Tiers & Benefits" subtitle="Wagering thresholds → rewards · click edit to change" />
      <div className="space-y-3">
        {tiers.map((t) => (
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
                <button onClick={() => open(t)} className="p-2 rounded-lg border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5"><Pencil className="w-4 h-4" /></button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <Drawer
        open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.name} tier` : ''}
        footer={<div className="flex gap-2"><button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-lg text-sm font-semibold border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8]">Cancel</button><button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)]">Save tier</button></div>}
      >
        {draft && (
          <div className="space-y-4">
            <Field label="Wagering threshold (GC)" hint="Lifetime wager required to reach this tier"><Input type="number" value={draft.wagerThreshold} onChange={num('wagerThreshold')} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Cash reward (SC)"><Input type="number" value={draft.cashReward} onChange={num('cashReward')} /></Field>
              <Field label="Commission %"><Input type="number" value={draft.commissionPct} onChange={num('commissionPct')} /></Field>
              <Field label="Rakeback %"><Input type="number" value={draft.rakebackPct} onChange={num('rakebackPct')} /></Field>
            </div>
            <p className="text-xs text-[#8FA899]">Tier changes apply to all players at this level on the next reward cycle.</p>
          </div>
        )}
      </Drawer>
    </>
  );
}
