'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, AdminCard, CardHeader } from '@/components/admin/primitives';
import { Field, Select, UploadBox } from '@/components/admin/controls';
import { FileSpreadsheet } from 'lucide-react';

export default function BulkAssignPage() {
  const [dryRun, setDryRun] = useState(false);
  return (
    <>
      <PageHeader title="Bulk Assign (CSV)" subtitle="Grant a promo, bonus, tag, or flag to a list of users" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard>
          <CardHeader title="Upload & configure" />
          <div className="p-4 space-y-3">
            <Field label="User list (CSV of player IDs)"><UploadBox label="Drop CSV or click to upload" /></Field>
            <Field label="Action"><Select defaultValue="promo"><option value="promo">Assign promo</option><option value="bonus">Grant bonus</option><option value="tag">Apply tag</option><option value="flag">Set flag</option><option value="status">Change status</option></Select></Field>
            <Field label="Target"><Select defaultValue=""><option value="">Select…</option><option>Welcome Pack</option><option>Weekend Reload 2×</option><option>VIP Reload</option></Select></Field>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setDryRun(true); toast('Dry run: 1,240 rows · 12 invalid'); }} className="flex-1 py-2 rounded-lg text-sm font-semibold border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8]">Dry run</button>
              <button onClick={() => toast.success('Bulk action queued for 1,228 users')} disabled={!dryRun} className="flex-1 py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)] disabled:opacity-40">Run</button>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <CardHeader title="Preview" />
          <div className="p-4">
            {dryRun ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#F5E8C8]"><FileSpreadsheet className="w-4 h-4 text-emerald-400" /> 1,240 rows parsed</div>
                <div className="flex justify-between border-b border-[#15241B] pb-1.5"><span className="text-[#8FA899]">Valid player IDs</span><span className="text-emerald-400 font-semibold">1,228</span></div>
                <div className="flex justify-between border-b border-[#15241B] pb-1.5"><span className="text-[#8FA899]">Not found</span><span className="text-amber-400 font-semibold">9</span></div>
                <div className="flex justify-between border-b border-[#15241B] pb-1.5"><span className="text-[#8FA899]">Ineligible (self-excluded)</span><span className="text-red-400 font-semibold">3</span></div>
              </div>
            ) : <p className="text-sm text-[#8FA899]">Run a dry run to preview impact before executing.</p>}
          </div>
        </AdminCard>
      </div>
    </>
  );
}
