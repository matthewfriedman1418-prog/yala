'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, AdminCard, CardHeader, fmtUSD } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import { Field, Input } from '@/components/admin/controls';
import { PNL_SAMPLE } from '@/lib/mock-data/admin-extra';
import { ngr as computeNgr } from '@/lib/admin/finance';

export default function PnlPage() {
  const [username, setUsername] = useState('DesertFox88');
  const [marginTarget, setMarginTarget] = useState('0.4');
  const [bonusAdj, setBonusAdj] = useState('0.6');
  const [searched, setSearched] = useState(true);

  // Canonical model: NGR = GGR − Bonuses (profit). Withdrawals back out of
  // NGR = Deposits − Withdrawals. Potential bonus = safe slice of NGR headroom.
  const rows = PNL_SAMPLE.map((r) => {
    const ngrVal = computeNgr(r.ggr, r.bonus);
    const withdrawals = r.deposits - ngrVal;
    const margin = r.ggr ? (ngrVal / r.ggr) * 100 : 0;
    const headroom = Math.max(0, ngrVal * (1 - Number(marginTarget)));
    const potential = Math.round(headroom * Number(bonusAdj));
    return { ...r, withdrawals, ngr: ngrVal, margin, potential, adjusted: Math.round(potential * 0.9) };
  });

  return (
    <>
      <PageHeader title="Player PNL Calculator" subtitle="How much bonus a player earns without going negative" />
      <AdminCard className="mb-5">
        <CardHeader title="Inputs" />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <Field label="Username"><Input value={username} onChange={(e) => setUsername(e.target.value)} /></Field>
          <Field label="Margin target"><Input value={marginTarget} onChange={(e) => setMarginTarget(e.target.value)} /></Field>
          <Field label="Bonus adjustment"><Input value={bonusAdj} onChange={(e) => setBonusAdj(e.target.value)} /></Field>
          <button onClick={() => { setSearched(true); toast.success(`PNL computed for ${username}`); }} className="py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)]">Calculate</button>
        </div>
      </AdminCard>

      {searched && (
        <AdminCard>
          <CardHeader title={`PNL — ${username}`} sub="Per time range" />
          <Table>
            <THead><Th>Range</Th><Th align="right">Deposits</Th><Th align="right">Withdrawals</Th><Th align="right">Bonuses</Th><Th align="right">GGR</Th><Th align="right">NGR (profit)</Th><Th align="right">Margin</Th><Th align="right">Potential bonus</Th></THead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.range}>
                  <Td className="font-semibold">{r.range}</Td>
                  <Td align="right" className="number-display">{fmtUSD(r.deposits)}</Td>
                  <Td align="right" className="number-display text-amber-400">{fmtUSD(r.withdrawals)}</Td>
                  <Td align="right" className="number-display text-purple-400">{fmtUSD(r.bonus)}</Td>
                  <Td align="right" className="number-display"><span style={{ color: '#F0B232' }}>{fmtUSD(r.ggr)}</span></Td>
                  <Td align="right" className={r.ngr >= 0 ? 'number-display text-emerald-400 font-semibold' : 'number-display text-red-400 font-semibold'}>{fmtUSD(r.ngr)}</Td>
                  <Td align="right" className={r.margin >= 0 ? 'number-display' : 'number-display text-red-400'}>{r.margin.toFixed(1)}%</Td>
                  <Td align="right" className="number-display font-semibold"><span style={{ color: '#F0B232' }}>{r.potential > 0 ? fmtUSD(r.potential) : '—'}</span></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <div className="p-4 border-t border-[#1A2E22] flex items-center justify-between">
            <p className="text-sm text-[#8FA899]">Recommended grant (14d headroom): <span className="font-bold text-[#F0B232]">{fmtUSD(rows[2].adjusted)}</span></p>
            <button onClick={() => toast.success('Bonus grant queued')} className="px-4 py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)]">Grant recommended bonus</button>
          </div>
        </AdminCard>
      )}
    </>
  );
}
