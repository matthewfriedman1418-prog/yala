'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, AdminCard, CardHeader } from '@/components/admin/primitives';
import { Field, Input, Select } from '@/components/admin/controls';

export default function AdjustmentsPage() {
  const [xp, setXp] = useState('');
  return (
    <>
      <PageHeader title="Manual Adjustments" subtitle="Set XP, promote tier, fast-track" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard>
          <CardHeader title="Set XP" sub="Overrides the player's XP balance (audited)" />
          <div className="p-4 space-y-3">
            <Field label="Username"><Input placeholder="Search player…" /></Field>
            <Field label="XP amount"><Input type="number" value={xp} onChange={(e) => setXp(e.target.value)} placeholder="555593393" /></Field>
            <button onClick={() => { toast.success(`XP set to ${Number(xp).toLocaleString()}`); }} disabled={!xp} className="w-full py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)] disabled:opacity-40">Set XP</button>
          </div>
        </AdminCard>
        <AdminCard>
          <CardHeader title="Tier & fast-track" />
          <div className="p-4 space-y-3">
            <Field label="Username"><Input placeholder="Search player…" /></Field>
            <Field label="Promote to tier"><Select defaultValue=""><option value="">Select tier…</option><option>Silver</option><option>Gold</option><option>Platinum</option><option>Ruby</option><option>Obsidian</option></Select></Field>
            <Field label="Fast-track until"><Input type="date" /></Field>
            <button onClick={() => toast.success('Tier & fast-track applied')} className="w-full py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)]">Apply</button>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
