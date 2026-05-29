'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge, AdminCard, fmtNum } from '@/components/admin/primitives';
import { Toggle } from '@/components/admin/controls';
import { CATEGORIES, type Category } from '@/lib/mock-data/admin-extra';
import { GripVertical, ArrowUp, ArrowDown, Plus } from 'lucide-react';

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([...CATEGORIES].sort((a, b) => a.order - b.order));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= cats.length) return;
    const next = [...cats];
    [next[i], next[j]] = [next[j], next[i]];
    setCats(next);
    toast.success('Order updated');
  };
  const toggle = (id: number) => setCats((p) => p.map((c) => {
    if (c.id !== id) return c;
    toast.success(`${c.name} ${c.status === 'active' ? 'hidden' : 'shown'}`);
    return { ...c, status: c.status === 'active' ? 'inactive' : 'active' };
  }));
  return (
    <>
      <PageHeader title="Categories" subtitle="Lobby category ordering & visibility">
        <button onClick={() => toast('Add category (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> Add category</button>
      </PageHeader>
      <AdminCard>
        <div className="divide-y divide-[#15241B]">
          {cats.map((c, i) => (
            <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${c.status !== 'active' ? 'opacity-55' : ''}`}>
              <GripVertical className="w-4 h-4 text-[#4A6A55]" />
              <span className="w-6 text-center text-sm font-bold text-[#8FA899]">{i + 1}</span>
              <div className="flex-1"><p className="font-semibold text-[#F5E8C8]">{c.name}</p><p className="text-[11px] text-[#8FA899]">{fmtNum(c.games)} games</p></div>
              <Badge tone={c.status === 'active' ? 'green' : 'gray'}>{c.status}</Badge>
              <Toggle on={c.status === 'active'} label={c.name} onClick={() => toggle(c.id)} />
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-[#8FA899] hover:text-[#F5E8C8] disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => move(i, 1)} disabled={i === cats.length - 1} className="text-[#8FA899] hover:text-[#F5E8C8] disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
