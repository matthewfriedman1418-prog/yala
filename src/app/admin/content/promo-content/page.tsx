'use client';
import { toast } from 'sonner';
import { PageHeader, AdminCard, CardHeader } from '@/components/admin/primitives';
import { Field, Input, Select, Toggle, UploadBox, RichText } from '@/components/admin/controls';
import { useState } from 'react';

export default function PromoContentPage() {
  const [redirect, setRedirect] = useState(true);
  return (
    <>
      <PageHeader title="Promo Content" subtitle="Marketing promotion pages (multilingual)" />
      <AdminCard className="max-w-3xl">
        <CardHeader title="Create promotion" action={<button onClick={() => toast.success('Promotion content saved')} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)]">Save</button>} />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><Select defaultValue=""><option value="">Select category…</option><option>Casino Promotion</option><option>Sponsorship</option></Select></Field>
            <Field label="Slug"><Input placeholder="weekend-reload" /></Field>
          </div>
          <Field label="Promotion card image (mobile)"><UploadBox /></Field>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><span className="text-xs font-semibold text-[#8FA899] uppercase">Status</span><Toggle on label="status" onClick={() => {}} /></div>
            <div className="flex items-center gap-2"><span className="text-xs font-semibold text-[#8FA899] uppercase">Redirect</span><Toggle on={redirect} label="redirect" onClick={() => setRedirect(!redirect)} /></div>
          </div>
          {redirect && <Field label="Redirect URL"><Input placeholder="/wallet/buy" /></Field>}
          <div className="flex gap-2 border-b border-[#1A2E22]"><span className="px-3 py-1.5 text-sm font-semibold border-b-2 border-[var(--accent)] text-[#F5E8C8]">EN</span><span className="px-3 py-1.5 text-sm text-[#8FA899]">ES</span><span className="px-3 py-1.5 text-sm text-[#8FA899]">PT</span></div>
          <Field label="Title"><Input placeholder="Promotion title" /></Field>
          <Field label="Content"><RichText /></Field>
        </div>
      </AdminCard>
    </>
  );
}
