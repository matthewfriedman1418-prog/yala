'use client';
import { useState, useMemo } from 'react';
import { PageHeader, StatusBadge, fmtUSD, fmtAgo, AdminCard } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput, FilterTabs, EmptyRow } from '@/components/admin/table';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data/transactions';
import { PLAYERS } from '@/lib/mock-data/admin';
import { Download, ArrowDownLeft, ArrowUpRight, Gift, RotateCcw, Lock, Coins } from 'lucide-react';

// Enrich the player-facing transactions with operator-facing fields: an
// attributed player and an approximate USD value (GC ≈ $0.0002, SC ≈ $1).
const LEDGER = MOCK_TRANSACTIONS.map((t, i) => {
  const player = PLAYERS[(i * 5 + 3) % PLAYERS.length];
  const usd = t.currency === 'SC' ? t.amount : t.currency === 'GC' ? t.amount * 0.0002 : t.amount * 0.0002;
  return { ...t, player: player.username, playerId: player.id, usd };
});

type Filter = 'all' | 'buy' | 'redeem' | 'bonus' | 'daily_bonus';

const TYPE_META: Record<string, { icon: typeof Coins; label: string }> = {
  buy: { icon: ArrowDownLeft, label: 'Purchase' },
  redeem: { icon: ArrowUpRight, label: 'Redemption' },
  bonus: { icon: Gift, label: 'Bonus' },
  daily_bonus: { icon: Gift, label: 'Daily bonus' },
  rakeback: { icon: RotateCcw, label: 'Rakeback' },
  vault_deposit: { icon: Lock, label: 'Vault deposit' },
  vault_withdraw: { icon: Lock, label: 'Vault withdraw' },
  rain: { icon: Coins, label: 'Rain' },
  tip: { icon: Coins, label: 'Tip' },
};

export default function TransactionsPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LEDGER.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (!needle) return true;
      return t.player.toLowerCase().includes(needle) || t.id.toLowerCase().includes(needle) || t.description.toLowerCase().includes(needle);
    });
  }, [q, filter]);

  const totalIn = LEDGER.filter((t) => t.type === 'buy').reduce((s, t) => s + t.usd, 0);
  const totalOut = LEDGER.filter((t) => t.type === 'redeem').reduce((s, t) => s + t.usd, 0);

  return (
    <>
      <PageHeader title="Transactions" subtitle="Unified money & coin ledger">
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1A2E22] text-sm font-semibold text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Purchases (window)</p>
          <p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{fmtUSD(totalIn)}</p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Redemptions (window)</p>
          <p className="text-xl font-extrabold text-amber-400 number-display mt-1">{fmtUSD(totalOut)}</p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Net</p>
          <p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtUSD(totalIn - totalOut)}</p>
        </AdminCard>
      </div>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search player, ID, or description…" />
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'All' },
            { value: 'buy', label: 'Purchases' },
            { value: 'redeem', label: 'Redemptions' },
            { value: 'bonus', label: 'Bonuses' },
            { value: 'daily_bonus', label: 'Daily' },
          ]}
        />
      </Toolbar>

      <Table>
        <THead>
          <Th>Type</Th>
          <Th>Player</Th>
          <Th>Description</Th>
          <Th>Method</Th>
          <Th align="right">Amount</Th>
          <Th align="right">≈ USD</Th>
          <Th>Status</Th>
          <Th>When</Th>
        </THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={8} /> : rows.map((t) => {
            const meta = TYPE_META[t.type] ?? { icon: Coins, label: t.type };
            const Icon = meta.icon;
            return (
              <Tr key={t.id}>
                <Td>
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-[#8FA899]" /></span>
                    {meta.label}
                  </span>
                </Td>
                <Td className="font-semibold">{t.player}</Td>
                <Td className="text-[#8FA899] max-w-[260px] truncate">{t.description}</Td>
                <Td className="text-[#8FA899] text-xs">{t.method ?? '—'}</Td>
                <Td align="right" className="number-display">
                  {t.amount.toLocaleString()} <span className="text-[#8FA899] text-xs">{t.currency.toUpperCase()}</span>
                </Td>
                <Td align="right" className="number-display text-[#F5E8C8]">{fmtUSD(t.usd)}</Td>
                <Td><StatusBadge status={t.status} /></Td>
                <Td className="text-xs text-[#8FA899]">{fmtAgo(t.timestamp)}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
