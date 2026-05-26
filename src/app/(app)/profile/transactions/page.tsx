'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { MOCK_TRANSACTIONS, type Transaction } from '@/lib/mock-data/transactions';
import { formatGC, formatSC, formatTime } from '@/lib/utils';
import {
  ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown,
  Search,
} from 'lucide-react';
import { YalaIcon, GoldCoinIcon, SweepCoinIcon, type YalaIconName } from '@/components/ui/YalaIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

// ─── Label maps ──────────────────────────────────────────────────────────────
const TX_LABEL: Record<Transaction['type'], string> = {
  buy: 'Purchase', redeem: 'Redemption', bonus: 'Bonus', rakeback: 'Rakeback',
  vault_deposit: 'Vault Deposit', vault_withdraw: 'Vault Withdraw',
  rain: 'Rain', tip: 'Tip', daily_bonus: 'Daily Bonus',
};
const TX_ICON: Partial<Record<Transaction['type'], YalaIconName>> = {
  buy: 'coin-stack',
  redeem: 'cash-bill',
  bonus: 'gift',
  rakeback: 'activity',
  vault_deposit: 'lock',
  vault_withdraw: 'lock',
  rain: 'sparkle',
  tip: 'star',
  daily_bonus: 'daily-star',
};
const CREDIT_TYPES: Transaction['type'][] = ['buy', 'bonus', 'rakeback', 'rain', 'tip', 'daily_bonus', 'vault_withdraw'];

// ─── Mock bet history ────────────────────────────────────────────────────────
interface BetEntry {
  id: number; game: string; provider: string; currency: 'GC' | 'SC';
  bet: number; multiplier: number; profit: number;
  ts: Date;
}

const NOW = Date.now();
const DAY = 86_400_000;

const ALL_BET_HISTORY: BetEntry[] = [
  { id:  1, game: 'Gates of Olympus',     provider: 'Pragmatic Play', currency: 'GC', bet:   500, multiplier: 12.4,  profit:  5700,  ts: new Date(NOW -    2 * 60_000) },
  { id:  2, game: 'Mirage Crash',          provider: 'Originals',      currency: 'GC', bet:  1000, multiplier:  0,    profit: -1000,  ts: new Date(NOW -    8 * 60_000) },
  { id:  3, game: 'Sweet Bonanza',         provider: 'Pragmatic Play', currency: 'SC', bet:   1.5, multiplier:  3.2,  profit:   3.3,  ts: new Date(NOW -   15 * 60_000) },
  { id:  4, game: 'Dune Mines',            provider: 'Originals',      currency: 'GC', bet:   250, multiplier:  2.1,  profit:   275,  ts: new Date(NOW -   22 * 60_000) },
  { id:  5, game: 'Book of Dead',          provider: "Play'n GO",      currency: 'GC', bet:  2000, multiplier:  0,    profit: -2000,  ts: new Date(NOW -   35 * 60_000) },
  { id:  6, game: 'Oasis Plinko',          provider: 'Originals',      currency: 'SC', bet:     5, multiplier:  8.0,  profit:    35,  ts: new Date(NOW -   48 * 60_000) },
  { id:  7, game: 'Big Bass Bonanza',      provider: 'Pragmatic Play', currency: 'GC', bet:   750, multiplier:  1.5,  profit:   375,  ts: new Date(NOW -  1.2 * DAY) },
  { id:  8, game: 'Emerald Wheel',         provider: 'Originals',      currency: 'GC', bet:   100, multiplier:  0,    profit:  -100,  ts: new Date(NOW -  1.4 * DAY) },
  { id:  9, game: 'Starlight Princess',    provider: 'Pragmatic Play', currency: 'SC', bet:   2.5, multiplier:  5.6,  profit:  11.5,  ts: new Date(NOW -  1.6 * DAY) },
  { id: 10, game: 'Sandstorm Limbo',       provider: 'Originals',      currency: 'GC', bet:   400, multiplier:  3.14, profit:   856,  ts: new Date(NOW -  2.1 * DAY) },
  { id: 11, game: 'Wolf Gold',             provider: 'Pragmatic Play', currency: 'GC', bet:   500, multiplier:  0,    profit:  -500,  ts: new Date(NOW -  2.5 * DAY) },
  { id: 12, game: 'Caravan Keno',          provider: 'Originals',      currency: 'SC', bet:     1, multiplier:  0,    profit:    -1,  ts: new Date(NOW -  3.2 * DAY) },
  { id: 13, game: 'Dog House Megaways',    provider: 'Pragmatic Play', currency: 'GC', bet:  3000, multiplier:  0,    profit: -3000,  ts: new Date(NOW -  4.0 * DAY) },
  { id: 14, game: 'Golden Dice',           provider: 'Originals',      currency: 'GC', bet:   200, multiplier:  6.0,  profit:  1000,  ts: new Date(NOW -  4.5 * DAY) },
  { id: 15, game: 'Razor Shark',           provider: 'Push Gaming',    currency: 'SC', bet:     3, multiplier: 22.8,  profit:  65.4,  ts: new Date(NOW -  5.1 * DAY) },
  { id: 16, game: 'Oasis Hi-Lo',           provider: 'Originals',      currency: 'GC', bet:   600, multiplier:  1.9,  profit:   540,  ts: new Date(NOW -  5.8 * DAY) },
  { id: 17, game: 'Reactoonz',             provider: "Play'n GO",      currency: 'GC', bet:  1500, multiplier:  0,    profit: -1500,  ts: new Date(NOW -  6.3 * DAY) },
  { id: 18, game: 'Pharaoh Towers',        provider: 'Originals',      currency: 'SC', bet:     2, multiplier:  4.5,  profit:     7,  ts: new Date(NOW -  7.1 * DAY) },
  { id: 19, game: 'Gates of Olympus',      provider: 'Pragmatic Play', currency: 'GC', bet:  1000, multiplier:  0,    profit: -1000,  ts: new Date(NOW -  9.0 * DAY) },
  { id: 20, game: 'Scorpion Cases',        provider: 'Originals',      currency: 'GC', bet:   800, multiplier:  2.4,  profit:  1120,  ts: new Date(NOW - 10   * DAY) },
  { id: 21, game: 'Money Train 3',         provider: 'Relax Gaming',   currency: 'SC', bet:     5, multiplier:  0,    profit:    -5,  ts: new Date(NOW - 12   * DAY) },
  { id: 22, game: 'Desert Roulette',       provider: 'Originals',      currency: 'GC', bet:   400, multiplier:  0,    profit:  -400,  ts: new Date(NOW - 14   * DAY) },
  { id: 23, game: 'Deadwood',              provider: 'Nolimit City',   currency: 'GC', bet:  2500, multiplier: 14.2,  profit: 33000,  ts: new Date(NOW - 16   * DAY) },
  { id: 24, game: 'Night Bazaar BJ',       provider: 'Originals',      currency: 'SC', bet:    10, multiplier:  0,    profit:   -10,  ts: new Date(NOW - 18   * DAY) },
  { id: 25, game: 'East Coast Fishing',    provider: 'Big Time Gaming',currency: 'GC', bet:   750, multiplier:  3.8,  profit:  2100,  ts: new Date(NOW - 21   * DAY) },
];

// ─── Types & helpers ─────────────────────────────────────────────────────────
type Period   = 'today' | '7d' | '30d' | 'all';
type TabId    = 'bets' | 'transactions';
type BetCcy   = 'all' | 'GC' | 'SC';
type TxFilter = 'all' | 'GC' | 'SC' | 'bonus';

const PERIOD_LABEL: Record<Period, string> = {
  today: 'Today', '7d': '7 Days', '30d': '30 Days', all: 'All Time',
};
const PERIOD_MS: Record<Period, number> = {
  today: DAY, '7d': 7 * DAY, '30d': 30 * DAY, all: Infinity,
};

const fmtBet     = (b: BetEntry) => b.currency === 'SC' ? `${b.bet.toFixed(2)}` : formatGC(b.bet);
const fmtProfit  = (b: BetEntry) => {
  const sign = b.profit > 0 ? '+' : '';
  return b.currency === 'SC'
    ? `${sign}${b.profit.toFixed(2)}`
    : `${sign}${formatGC(b.profit)}`;
};
const fmtAgo = (ts: Date) => {
  const diff = Date.now() - ts.getTime();
  if (diff <      60_000) return 'just now';
  if (diff <   3_600_000) return `${Math.floor(diff /     60_000)}m ago`;
  if (diff <      DAY)    return `${Math.floor(diff /  3_600_000)}h ago`;
  if (diff <  3 * DAY)    return `${Math.floor(diff /         DAY)}d ago`;
  return ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── Main page ───────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const [activeTab,   setActiveTab]   = useState<TabId>('bets');
  const [betPeriod,   setBetPeriod]   = useState<Period>('7d');
  const [betCurrency, setBetCurrency] = useState<BetCcy>('all');
  const [txFilter,    setTxFilter]    = useState<TxFilter>('all');
  const [search,      setSearch]      = useState('');

  const filteredBets = useMemo(() => {
    const cutoff = Date.now() - PERIOD_MS[betPeriod];
    const q = search.trim().toLowerCase();
    return ALL_BET_HISTORY.filter((b) => {
      if (b.ts.getTime() < cutoff) return false;
      if (betCurrency !== 'all' && b.currency !== betCurrency) return false;
      if (q && !b.game.toLowerCase().includes(q) && !b.provider.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [betPeriod, betCurrency, search]);

  const filteredTx = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((t) => {
      if (txFilter === 'all') return true;
      if (txFilter === 'GC') return t.currency === 'GC';
      if (txFilter === 'SC') return t.currency === 'SC';
      if (txFilter === 'bonus') return t.currency === 'bonus' || t.type === 'bonus' || t.type === 'rakeback';
      return true;
    });
  }, [txFilter]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <EmptyState
          icon="activity"
          title="Sign in to see your history"
          body="Your bet history, deposits, redemptions, and rewards all live here."
          ctaLabel="Sign in"
          ctaOnClick={() => openAuthModal()}
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">

      {/* ── HEADER ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.22)' }}
          >
            <YalaIcon name="activity" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0B232]">History</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Your activity</h1>
        <p style={{ color: '#8FA3B8' }}>Bets, purchases, redemptions, and bonuses — all in one place.</p>
      </div>

      {/* ── TAB SWITCHER ── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
        {([
          { id: 'bets'         as const, label: 'Bet History',   icon: 'dice'        as const, count: ALL_BET_HISTORY.length },
          { id: 'transactions' as const, label: 'Transactions',  icon: 'wallet-icon' as const, count: MOCK_TRANSACTIONS.length },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={activeTab === t.id
              ? { background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.28)' }
              : { color: '#8FA3B8', border: '1px solid transparent' }
            }
          >
            <YalaIcon name={t.icon} size={14} />
            {t.label}
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.06)', color: activeTab === t.id ? '#F0B232' : '#8FA3B8' }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── BET HISTORY TAB ── */}
      {activeTab === 'bets' && (
        <div className="space-y-5">
          {/* Filters row */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#4A5878' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search game or provider…"
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs focus:outline-none transition-colors"
                style={{ background: '#0F1828', border: '1px solid #1A2238', color: '#F5E8C8' }}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Currency */}
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
                {(['all', 'GC', 'SC'] as BetCcy[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setBetCurrency(c)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all"
                    style={betCurrency === c
                      ? c === 'SC'
                        ? { background: 'rgba(45,201,122,0.15)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.35)' }
                        : { background: 'rgba(240,178,50,0.15)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.35)' }
                      : { color: '#8FA3B8', border: '1px solid transparent' }
                    }
                  >
                    {c === 'GC' && <GoldCoinIcon size={11} />}
                    {c === 'SC' && <SweepCoinIcon size={13} />}
                    {c === 'all' ? 'All' : c}
                  </button>
                ))}
              </div>

              {/* Period */}
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
                {(['today', '7d', '30d', 'all'] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setBetPeriod(p)}
                    className="px-2.5 py-1 rounded-md text-xs font-bold transition-all"
                    style={betPeriod === p
                      ? { background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.28)' }
                      : { color: '#8FA3B8', border: '1px solid transparent' }
                    }
                  >
                    {PERIOD_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary stats — only when there's data */}
          {filteredBets.length > 0 && <BetSummary bets={filteredBets} />}

          {/* Bet table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
            <div
              className="hidden sm:grid text-[10px] font-bold uppercase tracking-widest px-5 py-3"
              style={{ gridTemplateColumns: '2.2fr 0.8fr 1fr 0.8fr 1.2fr', color: '#8FA3B8', borderBottom: '1px solid #1A2238' }}
            >
              <span>Game</span>
              <span>Currency</span>
              <span className="text-right">Bet</span>
              <span className="text-right">Multi</span>
              <span className="text-right">Profit</span>
            </div>

            {filteredBets.length === 0 ? (
              <div className="py-10">
                <EmptyState
                  icon="dice"
                  title="No bets in this window"
                  body="Try a longer time range or different currency."
                  size="sm"
                />
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#1A2238' }}>
                {filteredBets.map((b) => {
                  const won = b.profit > 0;
                  const profitColor = won ? '#2DC97A' : '#EF4444';
                  return (
                    <div
                      key={b.id}
                      className="grid grid-cols-2 sm:grid-cols-[2.2fr_0.8fr_1fr_0.8fr_1.2fr] items-center gap-2 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Game + provider */}
                      <div className="min-w-0 col-span-2 sm:col-span-1">
                        <p className="text-sm font-semibold truncate" style={{ color: '#F5E8C8' }}>{b.game}</p>
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: '#4A5878' }}>
                          {b.provider} · {fmtAgo(b.ts)}
                        </p>
                      </div>
                      {/* Currency */}
                      <div className="flex items-center gap-1.5 sm:justify-start">
                        {b.currency === 'GC' ? <GoldCoinIcon size={13} /> : <SweepCoinIcon size={15} />}
                        <span className="text-[10px] font-bold" style={{ color: b.currency === 'GC' ? '#F0B232' : '#2DC97A' }}>
                          {b.currency}
                        </span>
                      </div>
                      {/* Bet */}
                      <p className="text-xs font-mono text-right" style={{ color: '#8FA3B8' }}>{fmtBet(b)}</p>
                      {/* Multi */}
                      <p className="text-xs font-mono text-right" style={{ color: b.multiplier > 1 ? '#F0B232' : '#4A5878' }}>
                        {b.multiplier > 0 ? `${b.multiplier.toFixed(2)}×` : '—'}
                      </p>
                      {/* Profit */}
                      <div className="flex items-center justify-end gap-1">
                        {won
                          ? <TrendingUp className="w-3 h-3" style={{ color: profitColor }} />
                          : <TrendingDown className="w-3 h-3" style={{ color: profitColor }} />
                        }
                        <p className="text-xs font-bold font-mono" style={{ color: profitColor }}>{fmtProfit(b)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-[10px] text-center" style={{ color: '#4A5878' }}>
            Showing <span style={{ color: '#8FA3B8' }}>{filteredBets.length}</span> of {ALL_BET_HISTORY.length} bets ·
            {' '}{PERIOD_LABEL[betPeriod]}{betCurrency !== 'all' ? ` · ${betCurrency} only` : ''}
          </p>
        </div>
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {activeTab === 'transactions' && (
        <div className="space-y-5">
          {/* Filter pills */}
          <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
            {([
              { id: 'all'   as const, label: 'All'           },
              { id: 'GC'    as const, label: 'Gold Coins'    },
              { id: 'SC'    as const, label: 'Sweep Coins'   },
              { id: 'bonus' as const, label: 'Bonuses'       },
            ]).map((f) => (
              <button
                key={f.id}
                onClick={() => setTxFilter(f.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                style={txFilter === f.id
                  ? f.id === 'SC'
                    ? { background: 'rgba(45,201,122,0.15)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.35)' }
                    : { background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.28)' }
                  : { color: '#8FA3B8', border: '1px solid transparent' }
                }
              >
                {f.id === 'GC' && <GoldCoinIcon size={11} />}
                {f.id === 'SC' && <SweepCoinIcon size={13} />}
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
            {filteredTx.length === 0 ? (
              <EmptyState
                icon="activity"
                title={txFilter === 'all' ? 'No transactions yet' : `No ${txFilter} transactions`}
                body={txFilter === 'all'
                  ? "Your activity will show up here once you've made a deposit, redemption, or claimed a bonus."
                  : 'Try a different filter to see more.'}
                ctaLabel={txFilter === 'all' ? 'Buy your first coins' : undefined}
                ctaHref={txFilter === 'all' ? '/wallet' : undefined}
              />
            ) : (
              <div className="divide-y" style={{ borderColor: '#1A2238' }}>
                {filteredTx.map((tx) => {
                  const isCredit = CREDIT_TYPES.includes(tx.type);
                  const iconName: YalaIconName = TX_ICON[tx.type] ?? 'activity';
                  return (
                    <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isCredit ? 'rgba(45,201,122,0.08)' : 'rgba(239,68,68,0.06)',
                          border: `1px solid ${isCredit ? 'rgba(45,201,122,0.22)' : 'rgba(239,68,68,0.22)'}`,
                        }}
                      >
                        <YalaIcon name={iconName} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#F5E8C8' }}>{tx.description}</p>
                        <div className="flex items-center gap-2 text-[10px] mt-0.5" style={{ color: '#8FA3B8' }}>
                          <span className="uppercase tracking-wide font-bold">{TX_LABEL[tx.type]}</span>
                          <span style={{ color: '#4A5878' }}>·</span>
                          <span>{formatTime(tx.timestamp)}</span>
                          {tx.method && (<><span style={{ color: '#4A5878' }}>·</span><span>{tx.method}</span></>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isCredit
                          ? <ArrowDownLeft className="w-3.5 h-3.5" style={{ color: '#2DC97A' }} />
                          : <ArrowUpRight  className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                        }
                        <div className="text-right">
                          <p
                            className="text-sm font-bold number-display"
                            style={{ color: isCredit ? '#2DC97A' : '#EF4444' }}
                          >
                            {isCredit ? '+' : '−'}
                            {tx.currency === 'SC' ? `${tx.amount.toFixed(2)} SC` : `${formatGC(tx.amount)} ${tx.currency}`}
                          </p>
                          <p
                            className="text-[10px] mt-0.5 font-bold uppercase tracking-wider"
                            style={{
                              color: tx.status === 'completed' ? '#2DC97A' :
                                     tx.status === 'pending'   ? '#F59E0B' : '#EF4444',
                            }}
                          >
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2238' }}>
        <p className="text-xs" style={{ color: 'rgba(143,163,184,0.5)' }}>
          18+ · No real money gambling · Gold Coins have no cash value · <Link href="/sweepstakes-rules" className="underline transition-colors hover:opacity-80">Sweepstakes Rules</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Bet summary strip ───────────────────────────────────────────────────────
function BetSummary({ bets }: { bets: BetEntry[] }) {
  const wins      = bets.filter((b) => b.profit > 0).length;
  const totalBet  = bets.reduce((s, b) => s + (b.currency === 'GC' ? b.bet : 0), 0);
  const totalProf = bets.reduce((s, b) => s + (b.currency === 'GC' ? b.profit : 0), 0);
  const winRate   = bets.length ? Math.round((wins / bets.length) * 100) : 0;
  const profitColor = totalProf >= 0 ? '#2DC97A' : '#EF4444';

  const cells = [
    { label: 'Total bets',   value: bets.length.toString(),                              color: '#F5E8C8' },
    { label: 'Win rate',     value: `${winRate}%`,                                       color: winRate >= 50 ? '#2DC97A' : '#EF4444' },
    { label: 'GC wagered',   value: formatGC(totalBet),                                  color: '#F0B232' },
    { label: 'GC net P&L',   value: `${totalProf >= 0 ? '+' : ''}${formatGC(totalProf)}`, color: profitColor },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-xl p-4"
          style={{ background: '#0F1828', border: '1px solid #1A2238' }}
        >
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA3B8' }}>{c.label}</p>
          <p className="font-display text-xl font-black number-display leading-none mt-1.5" style={{ color: c.color }}>
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
