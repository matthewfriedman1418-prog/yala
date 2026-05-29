'use client';
import { toast } from 'sonner';
import { PageHeader, AdminCard, CardHeader } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { SPIN_WHEEL } from '@/lib/mock-data/admin-extra';

export default function SpinWheelPage() {
  const total = SPIN_WHEEL.reduce((s, w) => s + w.weight, 0);
  return (
    <>
      <PageHeader title="Spin Wheel" subtitle="Daily wheel reward table & odds">
        <button onClick={() => toast.success('Wheel config saved')} className="px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110">Save config</button>
      </PageHeader>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AdminCard className="lg:col-span-2">
          <CardHeader title="Segments" sub={`${SPIN_WHEEL.length} segments · weights sum to ${total}`} />
          <Table>
            <THead><Th>Reward</Th><Th align="right">Weight</Th><Th align="right">Probability</Th></THead>
            <tbody>
              {SPIN_WHEEL.map((w) => (
                <Tr key={w.label}>
                  <Td className="font-semibold">{w.reward}</Td>
                  <Td align="right" className="number-display">{w.weight}</Td>
                  <Td align="right" className="number-display text-[#8FA899]">{((w.weight / total) * 100).toFixed(1)}%</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </AdminCard>
        <AdminCard className="p-5">
          <CardHeader title="Expected value" />
          <div className="p-4 text-center">
            <p className="text-3xl font-extrabold text-[var(--accent)] number-display">≈ 1,640 GC</p>
            <p className="text-xs text-[#8FA899] mt-1">per spin (weighted)</p>
            <p className="text-2xl font-extrabold text-emerald-400 number-display mt-4">≈ 0.32 SC</p>
            <p className="text-xs text-[#8FA899] mt-1">per spin (weighted)</p>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
