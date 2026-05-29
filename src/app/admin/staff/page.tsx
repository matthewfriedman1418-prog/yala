'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, StatusBadge, Badge, AdminCard, CardHeader, Avatar, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { STAFF, ROLE_LABELS, type AdminRole } from '@/lib/mock-data/admin';
import { ShieldCheck, ShieldOff, UserPlus, Mail } from 'lucide-react';

const ROLE_TONE: Record<AdminRole, 'purple' | 'blue' | 'green' | 'amber' | 'gray'> = {
  owner: 'purple', admin: 'blue', finance: 'green', compliance: 'amber', support: 'gray',
};

// Capability matrix shown on the right — purely informational in the mock.
const PERMISSIONS: { area: string; roles: AdminRole[] }[] = [
  { area: 'View dashboard & reports', roles: ['owner', 'admin', 'support', 'compliance', 'finance'] },
  { area: 'Manage players (ban / adjust)', roles: ['owner', 'admin'] },
  { area: 'Approve redemptions', roles: ['owner', 'finance'] },
  { area: 'Review KYC', roles: ['owner', 'compliance'] },
  { area: 'Manage games & promotions', roles: ['owner', 'admin'] },
  { area: 'Handle support tickets', roles: ['owner', 'admin', 'support'] },
  { area: 'Manage staff & roles', roles: ['owner'] },
];

export default function StaffPage() {
  const [staff, setStaff] = useState(STAFF);

  const toggle2fa = (id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, twoFactor: !s.twoFactor } : s)));
    toast.success('2FA requirement updated');
  };

  return (
    <>
      <PageHeader title="Staff & Roles" subtitle={`${staff.filter((s) => s.status === 'active').length} active operators`}>
        <button onClick={() => toast('Invite operator (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110">
          <UserPlus className="w-4 h-4" /> Invite operator
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Table>
            <THead>
              <Th>Operator</Th>
              <Th>Role</Th>
              <Th>2FA</Th>
              <Th>Last active</Th>
              <Th>Status</Th>
            </THead>
            <tbody>
              {staff.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar initials={s.avatar} hue={s.role === 'owner' ? '#8B5CF6' : '#2DC97A'} />
                      <div>
                        <p className="font-semibold text-[#F5E8C8]">{s.name}</p>
                        <p className="text-[11px] text-[#8FA899] flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td><Badge tone={ROLE_TONE[s.role]}>{ROLE_LABELS[s.role]}</Badge></Td>
                  <Td>
                    <button onClick={() => toggle2fa(s.id)} className="inline-flex items-center gap-1 text-xs font-semibold">
                      {s.twoFactor
                        ? <span className="inline-flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-4 h-4" />On</span>
                        : <span className="inline-flex items-center gap-1 text-[#8FA899]"><ShieldOff className="w-4 h-4" />Off</span>}
                    </button>
                  </Td>
                  <Td className="text-xs text-[#8FA899]">{fmtAgo(s.lastActive)}</Td>
                  <Td><StatusBadge status={s.status} /></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>

        <AdminCard>
          <CardHeader title="Role permissions" sub="What each role can do" />
          <div className="divide-y divide-[#15241B]">
            {PERMISSIONS.map((p) => (
              <div key={p.area} className="px-4 py-3">
                <p className="text-sm text-[#F5E8C8] mb-1.5">{p.area}</p>
                <div className="flex flex-wrap gap-1">
                  {p.roles.map((r) => <Badge key={r} tone={ROLE_TONE[r]}>{ROLE_LABELS[r]}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </>
  );
}
