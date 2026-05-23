'use client';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { MOCK_TRANSACTIONS, type Transaction } from '@/lib/mock-data/transactions';
import { formatGC, formatSC, formatTime } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { YalaIcon, GoldCoinIcon, SweepCoinIcon } from '@/components/ui/YalaIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
const TX_TYPE_LABELS: Record<Transaction['type'], string> = {
  buy: 'Purchase', redeem: 'Redemption', bonus: 'Bonus', rakeback: 'Rakeback',
  vault_deposit: 'Vault Deposit', vault_withdraw: 'Vault Withdraw',
  rain: 'Rain', tip: 'Tip', daily_bonus: 'Daily Bonus',
};
const CREDIT_TYPES: Transaction['type'][] = ['bonus', 'rakeback', 'rain', 'tip', 'daily_bonus'];

// ── Mock Bet History ──────────────────────────────────────────────────────────
type BetEntry = {
  id: number; game: string; provider: string; currency: 'GC' | 'SC';
  bet: number; multiplier: number; profit: number;
  ts: Date; // timestamp
};

const NOW = Date.now();
const DAY = 86_400_000;

const ALL_BET_HISTORY: BetEntry[] = [
  { id: 1,  game: 'Gates of Olympus',  provider: 'Pragmatic Play', currency: 'GC', bet: 500,   multiplier: 12.4,  profit: 5700,   ts: new Date(NOW - 2  * 60000) },
  { id: 2,  game: 'Mirage Crash',      provider: 'Originals',      currency: 'GC', bet: 1000,  multiplier: 0,     profit: -1000,  ts: new Date(NOW - 8  * 60000) },
  { id: 3,  game: 'Sweet Bonanza',     provider: 'Pragmatic Play', currency: 'SC', bet: 1.5,   multiplier: 3.2,   profit: 3.3,    ts: new Date(NOW - 15 * 60000) },
  { id: 4,  game: 'Dune Mines',        provider: 'Originals',      currency: 'GC', bet: 250,   multiplier: 2.1,   profit: 275,    ts: new Date(NOW - 22 * 60000) },
  { id: 5,  game: 'Book of Dead',      provider: "Play'n GO",      currency: 'GC', bet: 2000,  multiplier: 0,     profit: -2000,  ts: new Date(NOW - 35 * 60000) },
  { id: 6,  game: 'Oasis Plinko',      provider: 'Originals',      currency: 'SC', bet: 5,     multiplier: 8.0,   profit: 35,     ts: new Date(NOW - 48 * 60000) },
  { id: 7,  game: 'Big Bass Bonanza',  provider: 'Pragmatic Play', currency: 'GC', bet: 750,   multiplier: 1.5,   profit: 375,    ts: new Date(NOW - 1.2 * DAY) },
  { id: 8,  game: 'Emerald Wheel',     provider: 'Originals',      currency: 'GC', bet: 100,   multiplier: 0,     profit: -100,   ts: new Date(NOW - 1.4 * DAY) },
  { id: 9,  game: 'Starlight Princess',provider: 'Pragmatic Play', currency: 'SC', bet: 2.5,   multiplier: 5.6,   profit: 11.5,   ts: new Date(NOW - 1.6 * DAY) },
  { id: 10, game: 'Sandstorm Limbo',   provider: 'Originals',      currency: 'GC', bet: 400,   multiplier: 3.14,  profit: 856,    ts: new Date(NOW - 2.1 * DAY) },
  { id: 11, game: 'Wolf Gold',         provider: 'Pragmatic Play', currency: 'GC', bet: 500,   multiplier: 0,     profit: -500,   ts: new Date(NOW - 2.5 * DAY) },
  { id: 12, game: 'Caravan Keno',      provider: 'Originals',      currency: 'SC', bet: 1,     multiplier: 0,     profit: -1,     ts: new Date(NOW - 3.2 * DAY) },
  { id: 13, game: 'Dog House Megaways',provider: 'Pragmatic Play', currency: 'GC', bet: 3000,  multiplier: 0,     profit: -3000,  ts: new Date(NOW - 4.0 * DAY) },
  { id: 14, game: 'Golden Dice',       provider: 'Originals',      currency: 'GC', bet: 200,   multiplier: 6.0,   profit: 1000,   ts: new Date(NOW - 4.5 * DAY) },
  { id: 15, game: 'Razor Shark',       provider: 'Push Gaming',    currency: 'SC', bet: 3,     multiplier: 22.8,  profit: 65.4,   ts: new Date(NOW - 5.1 * DAY) },
  { id: 16, game: 'Oasis Hi-Lo',       provider: 'Originals',      currency: 'GC', bet: 600,   multiplier: 1.9,   profit: 540,    ts: new Date(NOW - 5.8 * DAY) },
  { id: 17, game: 'Reactoonz',         provider: 'Play\'n GO',     currency: 'GC', bet: 1500,  multiplier: 0,     profit: -1500,  ts: new Date(NOW - 6.3 * DAY) },
  { id: 18, game: 'Pharaoh Towers',    provider: 'Originals',      currency: 'SC', bet: 2,     multiplier: 4.5,   profit: 7,      ts: new Date(NOW - 7.1 * DAY) },
  { id: 19, game: 'Gates of Olympus',  provider: 'Pragmatic Play', currency: 'GC', bet: 1000,  multiplier: 0,     profit: -1000,  ts: new Date(NOW - 9.0 * DAY) },
  { id: 20, game: 'Scorpion Cases',    provider: 'Originals',      currency: 'GC', bet: 800,   multiplier: 2.4,   profit: 1120,   ts: new Date(NOW - 10 * DAY) },
  { id: 21, game: 'Money Train 3',     provider: 'Relax Gaming',   currency: 'SC', bet: 5,     multiplier: 0,     profit: -5,     ts: new Date(NOW - 12 * DAY) },
  { id: 22, game: 'Desert Roulette',   provider: 'Originals',      currency: 'GC', bet: 400,   multiplier: 0,     profit: -400,   ts: new Date(NOW - 14 * DAY) },
  { id: 23, game: 'Deadwood',          provider: 'Nolimit City',   currency: 'GC', bet: 2500,  multiplier: 14.2,  profit: 33000,  ts: new Date(NOW - 16 * DAY) },
  { id: 24, game: 'Night Bazaar BJ',   provider: 'Originals',      currency: 'SC', bet: 10,    multiplier: 0,     profit: -10,    ts: new Date(NOW - 18 * DAY) },
  { id: 25, game: 'East Coast Fishing',provider: 'Big Time Gaming', currency: 'GC', bet: 750,  multiplier: 3.8,   profit: 2100,   ts: new Date(NOW - 21 * DAY) },
  { id: 26, game: 'Mirage Crash',      provider: 'Originals',      currency: 'GC', bet: 500,   multiplier: 1.6,   profit: 300,    ts: new Date(NOW - 23 * DAY) },
  { id: 27, game: 'Sweet Bonanza',     provider: 'Pragmatic Play', currency: 'SC', bet: 2.5,   multiplier: 0,     profit: -2.5,   ts: new Date(NOW - 25 * DAY) },
  { id: 28, game: 'Wanted Dead or a Wild', provider: 'Nolimit City', currency: 'GC', bet: 1000, multiplier: 7.1,  profit: 6100,   ts: new Date(NOW - 28 * DAY) },
];

type Period = 'today' | '7d' | '30d' | 'all';
type TabId = 'transactions' | 'bets';
type BetCurrency = 'all' | 'GC' | 'SC';

function periodLabel(p: Period) {
  return p === 'today' ? 'Today' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time';
}
function periodMs(p: Period) {
  return p === 'today' ? DAY : p === '7d' ? 7 * DAY : p === '30d' ? 30 * DAY : Infinity;
}

function fmtBet(b: BetEntry) {
  return b.currency === 'SC' ? `${b.bet.toFixed(2)} SC` : `${formatGC(b.bet)} GC`;
}
function fmtProfit(b: BetEntry) {
  return b.currency === 'SC'
    ? `${b.profit >= 0 ? '+' : ''}${b.profit.toFixed(2)} SC`
    : `${b.profit >= 0 ? '+' : ''}${formatGC(b.profit)} GC`;
}
function fmtTimeSince(ts: Date) {
  const diff = Date.now() - ts.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Bet Stats summary ─────────────────────────────────────────────────────────
function BetStats({ bets }: { bets: BetEntry[] }) {
  const wins = bets.filter(b => b.profit > 0).length;
  const totalBet = bets.reduce((s, b) => s + (b.currency === 'GC' ? b.bet : 0), 0);
  const totalProfit = bets.reduce((s, b) => s + (b.currency === 'GC' ? b.profit : 0), 0);
  const winRate = bets.length ? Math.round((wins / bets.length) * 100) : 0;

  const stats = [
    { label: 'Total Bets', value: bets.length.toString() },
    { label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? '#2DC97A' : '#EF4444' },
    { label: 'Total Wagered', value: `${formatGC(totalBet)} GC`, color: '#F0B232' },
    { label: 'Net P&L', value: `${totalProfit >= 0 ? '+' : ''}${formatGC(totalProfit)} GC`, color: totalProfit >= 0 ? '#2DC97A' : '#EF4444' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#4A6A55' }}>{s.label}</p>
          <p className="text-base font-black number-display leading-none" style={{ color: s.color ?? '#F5E8C8' }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const [activeTab, setActiveTab] = useState<TabId>('bets');
  const [txFilter, setTxFilter] = useState<'all' | Transaction['currency']>('all');
  const [betPeriod, setBetPeriod] = useState<Period>('7d');
  const [betCurrency, setBetCurrency] = useState<BetCurrency>('all');

  const filteredTx = MOCK_TRANSACTIONS.filter(tx => txFilter === 'all' || tx.currency === txFilter);

  const filteredBets = useMemo(() => {
    const cutoff = Date.now() - periodMs(betPeriod);
    return ALL_BET_HISTORY.filter(b => {
      const inPeriod = b.ts.getTime() > cutoff;
      const inCurrency = betCurrency === 'all' || b.currency === betCurrency;
      return inPeriod && inCurrency;
    });
  }, [betPeriod, betCurrency]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <YalaIcon name="activity" size={36} />
        <p style={{ color: '#9CA3AF' }}>Login to view your history</p>
        <button onClick={() => openAuthModal()} className="px-6 py-3 rounded-xl font-semibold text-sm text-black" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}>
          <YalaIcon name="activity" size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: '#F5E8C8' }}>History</h1>
          <p className="text-xs" style={{ color: '#8FA899' }}>Bets, transactions, bonuses and rewards</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex border-b" style={{ borderColor: '#1A2E22' }}>
        {([
          { id: 'bets' as TabId, label: 'Bet History', icon: 'dice' as const },
          { id: 'transactions' as TabId, label: 'Transactions', icon: 'wallet-icon' as const },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all relative"
            style={{
              color: activeTab === tab.id ? '#F0B232' : '#8FA899',
              borderBottom: activeTab === tab.id ? '2px solid #F0B232' : '2px solid transparent',
            }}
          >
            <YalaIcon name={tab.icon} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BET HISTORY TAB ── */}
      {activeTab === 'bets' && (
        <div className="space-y-4">

          {/* Filters row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Period pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
              {(['today', '7d', '30d', 'all'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setBetPeriod(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: betPeriod === p ? 'linear-gradient(135deg, #2DC97A, #F0B232)' : 'transparent',
                    color: betPeriod === p ? '#060E0A' : '#8FA899',
                  }}
                >
                  {periodLabel(p)}
                </button>
              ))}
            </div>

            {/* Currency filter */}
            <div className="flex items-center gap-1.5">
              {(['all', 'GC', 'SC'] as BetCurrency[]).map(c => (
                <button
                  key={c}
                  onClick={() => setBetCurrency(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: betCurrency === c
                      ? c === 'SC' ? 'rgba(45,201,122,0.15)' : 'rgba(240,178,50,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${betCurrency === c ? (c === 'SC' ? 'rgba(45,201,122,0.4)' : 'rgba(240,178,50,0.4)') : '#1A2E22'}`,
                    color: betCurrency === c ? (c === 'SC' ? '#2DC97A' : '#F0B232') : '#8FA899',
                  }}
                >
                  {c === 'GC' && <GoldCoinIcon size={13} />}
                  {c === 'SC' && <SweepCoinIcon size={13} />}
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          {filteredBets.length > 0 && <BetStats bets={filteredBets} />}

          {/* Bet table */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1A2E22' }}>
            {/* Table header */}
            <div
              className="grid text-[10px] font-bold uppercase tracking-wider px-4 py-2.5"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1fr', background: '#0C1812', color: '#4A6A55', borderBottom: '1px solid #1A2E22' }}
            >
              <span>Game</span>
              <span>Currency</span>
              <span className="text-right">Bet</span>
              <span className="text-right">Multi</span>
              <span className="text-right">Profit</span>
            </div>

            {filteredBets.length === 0 ? (
              <div className="py-12 text-center" style={{ background: '#0A1510' }}>
                <YalaIcon name="dice" size={32} className="mx-auto mb-3" />
                <p className="text-sm" style={{ color: '#8FA899' }}>No bets in this period</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1A2E22]" style={{ background: '#080F0C' }}>
                {filteredBets.map((b, i) => {
                  const won = b.profit > 0;
                  return (
                    <div
                      key={b.id}
                      className="grid items-center px-4 py-3 transition-colors hover:bg-white/[0.02]"
                      style={{ gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1fr' }}
                    >
                      {/* Game */}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#F5E8C8' }}>{b.game}</p>
                        <p className="text-[9px] mt-0.5 truncate" style={{ color: '#4A6A55' }}>
                          {b.provider} · {fmtTimeSince(b.ts)}
                        </p>
                      </div>
                      {/* Currency */}
                      <div className="flex items-center gap-1">
                        {b.currency === 'GC' ? <GoldCoinIcon size={13} /> : <SweepCoinIcon size={13} />}
                        <span className="text-[10px] font-bold" style={{ color: b.currency === 'GC' ? '#F0B232' : '#2DC97A' }}>{b.currency}</span>
                      </div>
                      {/* Bet */}
                      <p className="text-xs font-mono text-right" style={{ color: '#8FA899' }}>{fmtBet(b)}</p>
                      {/* Multiplier */}
                      <p className="text-xs font-mono text-right" style={{ color: b.multiplier > 1 ? '#2DC97A' : '#4A6A55' }}>
                        {b.multiplier > 0 ? `${b.multiplier.toFixed(2)}×` : '—'}
                      </p>
                      {/* Profit */}
                      <div className="flex items-center justify-end gap-1">
                        {won
                          ? <TrendingUp className="w-3 h-3" style={{ color: '#2DC97A' }} />
                          : <TrendingDown className="w-3 h-3" style={{ color: '#EF4444' }} />
                        }
                        <p className="text-xs font-bold font-mono" style={{ color: won ? '#2DC97A' : '#EF4444' }}>
                          {fmtProfit(b)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <p className="text-[10px] text-center" style={{ color: '#4A6A55' }}>
            Showing {filteredBets.length} bets · {periodLabel(betPeriod)} · All figures in display currency
          </p>
        </div>
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: '#8FA899' }} />
            <div className="flex gap-2">
              {(['all', 'GC', 'SC', 'bonus'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', txFilter === f ? 'text-black' : 'text-[#9CA3AF] bg-white/5 hover:text-[#F5E8C8]')}
                  style={txFilter === f ? {
                    background: f === 'SC' ? 'linear-gradient(135deg, #10B981, #34D399)' :
                                f === 'bonus' ? '#F59E0B' :
                                'linear-gradient(135deg, #D6A84F, #F0C97A)'
                  } : {}}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            {filteredTx.length === 0 ? (
              <EmptyState
                icon="activity"
                title={txFilter === 'all' ? 'No transactions yet' : `No ${txFilter} transactions`}
                body={txFilter === 'all'
                  ? "Your transaction history will show up here once you've made a deposit, bet, or claim."
                  : 'Try a different filter to see more of your activity.'}
                ctaLabel={txFilter === 'all' ? 'Buy your first coins' : undefined}
                ctaHref={txFilter === 'all' ? '/wallet' : undefined}
              />
            ) : (
            <div className="divide-y divide-[#1E1E1E]">
              {filteredTx.map((tx) => {
                const isCredit = CREDIT_TYPES.includes(tx.type) || tx.type === 'vault_withdraw';
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: isCredit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}
                    >
                      {isCredit
                        ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        : <ArrowUpRight className="w-4 h-4 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#F5E8C8' }}>{tx.description}</p>
                      <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                        <span>{TX_TYPE_LABELS[tx.type]}</span>
                        <span>·</span>
                        <span>{formatTime(tx.timestamp)}</span>
                        {tx.method && <><span>·</span><span>{tx.method}</span></>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold number-display" style={{ color: isCredit ? '#10B981' : '#EF4444' }}>
                        {isCredit ? '+' : '-'}{tx.currency === 'SC' ? `${tx.amount.toFixed(2)} SC` : `${formatGC(tx.amount)} ${tx.currency}`}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: tx.status === 'completed' ? '#10B981' : tx.status === 'pending' ? '#F59E0B' : '#EF4444' }}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>

          <div className="border-t pt-4 text-center" style={{ borderColor: '#1E1E1E' }}>
            <p className="text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>18+ · No real money gambling · Gold Coins have no cash value</p>
          </div>
        </div>
      )}
    </div>
  );
}
