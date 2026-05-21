'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { MOCK_TRANSACTIONS, type Transaction } from '@/lib/mock-data/transactions';
import { formatGC, formatTime } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const TX_TYPE_LABELS: Record<Transaction['type'], string> = {
  buy: 'Purchase',
  redeem: 'Redemption',
  bonus: 'Bonus',
  rakeback: 'Rakeback',
  vault_deposit: 'Vault Deposit',
  vault_withdraw: 'Vault Withdraw',
  rain: 'Rain',
  tip: 'Tip',
  daily_bonus: 'Daily Bonus',
};

const CREDIT_TYPES: Transaction['type'][] = ['bonus', 'rakeback', 'rain', 'tip', 'daily_bonus'];

export default function TransactionsPage() {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [filter, setFilter] = useState<'all' | Transaction['currency']>('all');

  const filtered = MOCK_TRANSACTIONS.filter((tx) => filter === 'all' || tx.currency === filter);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p style={{ color: '#9CA3AF' }}>Login to view your transaction history</p>
        <button onClick={() => openAuthModal()} className="px-6 py-3 rounded-xl font-semibold text-sm text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>Login</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Transaction History</h1>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>All purchases, redemptions, bonuses and rewards.</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4" style={{ color: '#9CA3AF' }} />
        <div className="flex gap-2">
          {(['all', 'GC', 'SC', 'bonus'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize', filter === f ? 'text-black' : 'text-[#9CA3AF] bg-white/5 hover:text-[#F5E8C8]')}
              style={filter === f ? { background: f === 'SC' ? 'linear-gradient(135deg, #10B981, #34D399)' : f === 'bonus' ? '#F59E0B' : 'linear-gradient(135deg, #D6A84F, #F0C97A)' } : {}}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-[#1E1E1E]">
          {filtered.map((tx) => {
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
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No real money gambling · Gold Coins have no cash value</p>
      </div>
    </div>
  );
}
