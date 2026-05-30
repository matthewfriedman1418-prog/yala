'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader, StatusBadge, fmtUSD, AdminCard } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput, FilterTabs, EmptyRow, SortHeader, Pagination } from '@/components/admin/table';
import { TimeAgo } from '@/components/admin/feedback';
import { PLAYERS } from '@/lib/mock-data/admin';
import { Download, ArrowDownLeft, ArrowUpRight, Gift, RotateCcw, Lock, Coins } from 'lucide-react';

type TxType = 'buy' | 'redeem' | 'bonus' | 'daily_bonus' | 'rakeback' | 'vault_deposit';
const TYPE_META: Record<string, { icon: typeof Coins; label: string }> = {
  buy: { icon: ArrowDownLeft, label: 'Purchase' },
  redeem: { icon: ArrowUpRight, label: 'Redemption' },
  bonus: { icon: Gift, label: 'Bonus' },
  daily_bonus: { icon: Gift, label: 'Daily bonus' },
  rakeback: { icon: RotateCcw, label: 'Rakeback' },
  vault_deposit: { icon: Lock, label: 'Vault deposit' },
};
const METHODS = ['Card', 'Apple Pay', 'Crypto (USDC)', 'ACH', 'Bank Wire'];
const STATUSES = ['completed', 'completed', 'completed', 'pending', 'failed'] as const;

// Generate a believable ledger of ~140 transactions across players.
const LEDGER = Array.from({ length: 140 }, (_, i) => {
  const player = PLAYERS[(i * 7 + 3) % PLAYERS.length];
  const type = (['buy', 'buy', 'redeem', 'bonus', 'daily_bonus', 'rakeback', 'vault_deposit'] as TxType[])[(i * 3 + 1) % 7];
  const currency: 'GC' | 'SC' | 'bonus' = type === 'redeem' ? 'SC' : type === 'bonus' || type === 'rakeback' ? 'bonus' : type === 'buy' && i % 2 ? 'SC' : 'GC';
  const baseAmt = type === 'redeem' ? 25 + (i * 37) % 2400 : currency === 'SC' ? 5 + (i % 80) : 5000 + (i * 9173) % 240_000;
  const usd = currency === 'SC' ? baseAmt : baseAmt * 0.0002;
  const ts = new Date(Date.parse('2026-05-28T09:00:00Z') - i * 73 * 60_000).toISOString();
  return {
    id: `tx_${(90_000 + i * 13).toString(36)}`,
    type, currency, amount: baseAmt, usd,
    status: type === 'redeem' ? STATUSES[i % STATUSES.length] : 'completed',
    method: type === 'buy' || type === 'redeem' ? METHODS[i % METHODS.length] : undefined,
    description: TYPE_META[type].label,
    player: player.username, playerId: player.id,
    timestamp: ts,
  };
});

type Filter = 'all' | TxType;
type SortKey = 'usd' | 'timestamp';

export default function TransactionsPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'timestamp', dir: 'desc' });
  const [page, setPage] = useState(0);
  const PER = 20;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = LEDGER.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (!needle) return true;
      return t.player.toLowerCase().includes(needle) || t.id.toLowerCase().includes(needle);
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = sort.key === 'usd' ? a.usd : Date.parse(a.timestamp);
      const bv = sort.key === 'usd' ? b.usd : Date.parse(b.timestamp);
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }, [q, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PER, safePage * PER + PER);
  const toggleSort = (key: SortKey) => { setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })); setPage(0); };

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
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Purchases (window)</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{fmtUSD(totalIn)}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Redemptions (window)</p><p className="text-xl font-extrabold text-amber-400 number-display mt-1">{fmtUSD(totalOut)}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Net</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtUSD(totalIn - totalOut)}</p></AdminCard>
      </div>

      <Toolbar>
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Search player or transaction ID…" />
        <FilterTabs<Filter> value={filter} onChange={(v) => { setFilter(v); setPage(0); }} tabs={[{ value: 'all', label: 'All' }, { value: 'buy', label: 'Purchases' }, { value: 'redeem', label: 'Redemptions' }, { value: 'bonus', label: 'Bonuses' }, { value: 'daily_bonus', label: 'Daily' }, { value: 'rakeback', label: 'Rakeback' }]} />
      </Toolbar>

      <Table>
        <THead>
          <Th>Type</Th>
          <Th>Player</Th>
          <Th>Method</Th>
          <SortHeader label="Amount" align="right" active={sort.key === 'usd'} dir={sort.dir} onClick={() => toggleSort('usd')} />
          <Th align="right">≈ USD</Th>
          <Th>Status</Th>
          <SortHeader label="When" active={sort.key === 'timestamp'} dir={sort.dir} onClick={() => toggleSort('timestamp')} />
        </THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={7} /> : rows.map((t) => {
            const meta = TYPE_META[t.type] ?? { icon: Coins, label: t.type };
            const Icon = meta.icon;
            return (
              <Tr key={t.id}>
                <Td><span className="inline-flex items-center gap-2 text-sm font-medium"><span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-[#8FA899]" /></span>{meta.label}</span></Td>
                <Td><Link href={`/admin/players/${t.playerId}`} className="font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{t.player}</Link></Td>
                <Td className="text-[#8FA899] text-xs">{t.method ?? '—'}</Td>
                <Td align="right" className="number-display">{t.amount.toLocaleString()} <span className="text-[#8FA899] text-xs">{t.currency.toUpperCase()}</span></Td>
                <Td align="right" className="number-display text-[#F5E8C8]">{fmtUSD(t.usd)}</Td>
                <Td><StatusBadge status={t.status} /></Td>
                <Td className="text-xs text-[#8FA899]"><TimeAgo ts={t.timestamp} /></Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination page={safePage} pageCount={pageCount} total={filtered.length} from={safePage * PER + 1} to={safePage * PER + rows.length} onPage={setPage} />
    </>
  );
}
