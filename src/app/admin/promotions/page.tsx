'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, AdminCard, Badge, fmtNum } from '@/components/admin/primitives';
import { PROMOTIONS, type Promotion } from '@/lib/mock-data/promotions';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Coins } from 'lucide-react';

interface PromoState extends Promotion { active: boolean; }

const TYPE_TONE: Record<string, 'green' | 'amber' | 'blue' | 'purple' | 'gray'> = {
  welcome: 'green', daily: 'amber', reload: 'blue', race: 'purple', vip: 'purple', cashback: 'blue', tournament: 'purple', referral: 'green',
};

export default function PromotionsPage() {
  const [promos, setPromos] = useState<PromoState[]>(
    PROMOTIONS.map((p, i) => ({ ...p, active: i % 5 !== 4 })),
  );

  const toggle = (id: string) => {
    setPromos((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      toast.success(`"${p.title}" ${p.active ? 'paused' : 'activated'}`);
      return { ...p, active: !p.active };
    }));
  };

  const activeCount = promos.filter((p) => p.active).length;

  return (
    <>
      <PageHeader title="Promotions" subtitle={`${activeCount} active campaigns`}>
        <button onClick={() => toast('Create campaign flow (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110">
          <Plus className="w-4 h-4" /> Create campaign
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {promos.map((p) => (
          <AdminCard key={p.id} className={cn('overflow-hidden flex flex-col', !p.active && 'opacity-60')}>
            <div className={cn('h-1.5 bg-gradient-to-r', p.gradient)} />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-[#F5E8C8]">{p.title}</h3>
                  <p className="text-xs text-[#8FA899]">{p.subtitle}</p>
                </div>
                <Badge tone={p.active ? 'green' : 'gray'}>{p.active ? 'Active' : 'Paused'}</Badge>
              </div>

              <p className="text-sm text-[#8FA899] mt-2 flex-1">{p.description}</p>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge tone={TYPE_TONE[p.type] ?? 'gray'}>{p.type}</Badge>
                {p.gcBonus ? <span className="inline-flex items-center gap-1 text-xs text-[#F0B232] font-semibold"><Coins className="w-3 h-3" />{fmtNum(p.gcBonus)} GC</span> : null}
                {p.scBonus ? <span className="text-xs text-emerald-400 font-semibold">+{p.scBonus} SC</span> : null}
              </div>

              <p className="text-[11px] text-[#8FA899] mt-2">{p.expiresAt}</p>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1A2E22]">
                <button onClick={() => toast(`Edit "${p.title}" (mock)`)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => toggle(p.id)} className={cn('ml-auto px-3 py-1.5 rounded-lg text-xs font-bold', p.active ? 'bg-white/5 text-[#8FA899] hover:text-[#F5E8C8]' : 'bg-[var(--accent)] text-[#060E0A]')}>
                  {p.active ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
