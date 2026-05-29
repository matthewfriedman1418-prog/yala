'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, AdminCard, fmtUSD, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Toggle } from '@/components/admin/controls';
import { PACKAGES, type CoinPackage } from '@/lib/mock-data/admin-extra';
import { Plus, Star } from 'lucide-react';

export default function PackagesPage() {
  const [pkgs, setPkgs] = useState<CoinPackage[]>(PACKAGES);
  const update = (id: string, patch: Partial<CoinPackage>, msg: string) => { setPkgs((p) => p.map((x) => x.id === id ? { ...x, ...patch } : x)); toast.success(msg); };
  const revenue = pkgs.reduce((s, p) => s + p.priceUSD * p.sold30d, 0);

  return (
    <>
      <PageHeader title="Packages & Pricing" subtitle="Coin store — what players can buy">
        <button onClick={() => toast('New package (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Plus className="w-4 h-4" /> New package</button>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Active packages</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{pkgs.filter((p) => p.active).length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Units sold (30d)</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtNum(pkgs.reduce((s, p) => s + p.sold30d, 0))}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Revenue (30d)</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{fmtUSD(revenue, { compact: true })}</p></AdminCard>
      </div>

      <Table>
        <THead><Th>Package</Th><Th align="right">Price</Th><Th align="right">Gold Coins</Th><Th align="right">Bonus SC</Th><Th align="center">Best value</Th><Th align="right">Sold 30d</Th><Th align="center">Active</Th></THead>
        <tbody>
          {pkgs.map((p) => (
            <Tr key={p.id} className={!p.active ? 'opacity-55' : ''}>
              <Td className="font-semibold flex items-center gap-2">{p.name}{p.bestValue && <Star className="w-3.5 h-3.5 text-[#F0B232] fill-[#F0B232]" />}</Td>
              <Td align="right" className="number-display">{fmtUSD(p.priceUSD)}</Td>
              <Td align="right" className="number-display"><span style={{ color: '#F0B232' }}>{fmtNum(p.gc)}</span></Td>
              <Td align="right" className="number-display text-emerald-400">{p.bonusSC}</Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={p.bestValue} label="best value" onClick={() => update(p.id, { bestValue: !p.bestValue }, `${p.name} best-value ${p.bestValue ? 'off' : 'on'}`)} /></div></Td>
              <Td align="right" className="number-display text-[#8FA899]">{p.active ? fmtNum(p.sold30d) : '—'}</Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={p.active} label="active" onClick={() => update(p.id, { active: !p.active }, `${p.name} ${p.active ? 'disabled' : 'enabled'}`)} /></div></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
