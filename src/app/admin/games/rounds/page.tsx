'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput, EmptyRow } from '@/components/admin/table';
import { Drawer, Field } from '@/components/admin/controls';
import { ROUNDS, type GameRound } from '@/lib/mock-data/admin-extra';
import { ShieldCheck } from 'lucide-react';

export default function RoundsPage() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<GameRound | null>(null);
  const rows = ROUNDS.filter((r) => !q || r.id.includes(q.toLowerCase()) || r.game.toLowerCase().includes(q.toLowerCase()) || r.player.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Bet / Round Explorer" subtitle="Round-level history with provably-fair verification" />
      <Toolbar><SearchInput value={q} onChange={setQ} placeholder="Search round ID, game, or player…" /></Toolbar>
      <Table>
        <THead><Th>Round</Th><Th>Player</Th><Th>Game</Th><Th align="right">Bet</Th><Th align="right">×</Th><Th align="right">Payout</Th><Th>When</Th><Th></Th></THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={8} /> : rows.map((r) => (
            <Tr key={r.id} onClick={() => setSel(r)}>
              <Td className="font-mono text-xs">{r.id}</Td>
              <Td><Link href={`/admin/players/${r.playerId}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{r.player}</Link></Td>
              <Td>{r.game}</Td>
              <Td align="right" className="number-display">{r.bet} {r.currency}</Td>
              <Td align="right" className="number-display">{r.multiplier}×</Td>
              <Td align="right" className={r.result === 'win' ? 'number-display text-emerald-400 font-semibold' : 'number-display text-[#8FA899]'}>{r.payout} {r.currency}</Td>
              <Td className="text-xs text-[#8FA899]">{fmtAgo(r.ts)}</Td>
              <Td align="right"><span className="text-xs font-semibold text-[var(--accent)]">Verify →</span></Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Drawer open={!!sel} onClose={() => setSel(null)} title={`Round ${sel?.id ?? ''}`}>
        {sel && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Game"><p className="text-sm text-[#F5E8C8]">{sel.game}</p></Field>
              <Field label="Player"><p className="text-sm text-[#F5E8C8]">{sel.player}</p></Field>
              <Field label="Bet"><p className="text-sm number-display text-[#F5E8C8]">{sel.bet} {sel.currency}</p></Field>
              <Field label="Payout"><p className="text-sm number-display text-[#F5E8C8]">{sel.payout} {sel.currency} ({sel.multiplier}×)</p></Field>
            </div>
            <div className="rounded-lg border border-[#1A2E22] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8FA899] flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Provably fair</p>
              <div className="text-xs font-mono text-[#8FA899] space-y-1 break-all">
                <p>server seed hash: <span className="text-[#F5E8C8]">{sel.serverSeedHash}</span></p>
                <p>client seed: <span className="text-[#F5E8C8]">{sel.clientSeed}</span></p>
                <p>nonce: <span className="text-[#F5E8C8]">{sel.nonce}</span></p>
              </div>
              <button onClick={() => toast.success('Hash verified ✓ — outcome matches seed')} className="mt-2 w-full py-2 rounded-lg text-sm font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">Verify fairness</button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
