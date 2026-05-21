'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data/transactions';
import { formatGC, formatSC, formatTime } from '@/lib/utils';
import { Wallet, ArrowUpRight, ArrowDownLeft, Shield, Plus, ArrowRight } from 'lucide-react';
import type { ComponentType } from 'react';

export default function WalletPage() {
  const { goldCoins, sweepCoins, bonusBalance, rakebackBalance, vaultBalance, activeCurrency } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, openBuyCoins, openRedeemModal } = useUIStore();
  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#D6A84F' : '#10B981';

  const recentTxns = MOCK_TRANSACTIONS.slice(0, 6);

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4" style={{ color: accent }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>Wallet</span>
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: '#F5E8C8' }}>Your Balances</h1>
        </div>
        {isLoggedIn && (
          <button
            onClick={openBuyCoins}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
          >
            <Plus className="w-4 h-4" /> Buy Coins
          </button>
        )}
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Gold Coins', value: formatGC(goldCoins), unit: 'GC', color: '#D6A84F', icon: '◈', href: '/wallet/buy' as string | null, action: null as (() => void) | null },
          { label: 'Sweep Coins', value: formatSC(sweepCoins), unit: 'SC', color: '#10B981', icon: '◇', href: null, action: openRedeemModal },
          { label: 'Bonus Balance', value: formatGC(bonusBalance), unit: 'Bonus', color: '#F59E0B', icon: '⊕', href: null, action: null },
          { label: 'Rakeback', value: formatGC(rakebackBalance), unit: 'GC', color: '#8B5CF6', icon: '↩', href: '/rewards' as string | null, action: null },
          { label: 'Vault', value: formatGC(vaultBalance), unit: 'GC', color: '#3B82F6', icon: '🏛', href: '/vault' as string | null, action: null },
        ].map((item) => (
          <div
            key={item.label}
            className="glass-card p-4"
            style={{ borderColor: `${item.color}20` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{item.icon}</span>
              {(item.href || item.action) && (
                item.action ? (
                  <button onClick={item.action} className="text-[#9CA3AF] hover:text-[#F5E8C8] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link href={item.href!} className="text-[#9CA3AF] hover:text-[#F5E8C8] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )
              )}
            </div>
            <p className="font-bold text-xl number-display" style={{ color: item.color }}>{item.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Buy Coins', icon: Plus, href: '/wallet/buy', action: null, primary: true },
          { label: 'Redeem SC', icon: ArrowUpRight, href: null, action: openRedeemModal, primary: false },
          { label: 'Crypto', icon: ArrowDownLeft, href: '/wallet/crypto', action: null, primary: false },
          { label: 'Vault', icon: Shield, href: '/vault', action: null, primary: false },
        ] as { label: string; icon: ComponentType<{ className?: string }>; href: string | null; action: (() => void) | null; primary: boolean }[]).map((a) => {
          const Icon = a.icon;
          const btnStyle = a.primary
            ? { background: `linear-gradient(135deg, ${accent}, ${isGC ? '#F0C97A' : '#34D399'})`, color: '#000' }
            : { background: 'rgba(255,255,255,0.05)', border: '1px solid #1E1E1E', color: '#F5E8C8' };
          const cls = 'flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90';
          return a.action ? (
            <button key={a.label} onClick={a.action} className={cls} style={btnStyle}>
              <Icon className="w-4 h-4" />{a.label}
            </button>
          ) : (
            <Link key={a.label} href={a.href!} className={cls} style={btnStyle}>
              <Icon className="w-4 h-4" />{a.label}
            </Link>
          );
        })}
      </div>

      {/* Recent transactions */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
          <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Recent Transactions</h3>
          <Link href="/profile/transactions" className="text-xs transition-colors hover:opacity-80" style={{ color: accent }}>
            View all →
          </Link>
        </div>
        <div className="divide-y divide-[#1E1E1E]">
          {isLoggedIn ? recentTxns.map((txn, i) => {
            const isCredit = ['daily_bonus', 'bonus', 'rakeback', 'rain', 'tip'].includes(txn.type);
            const currencyColor = txn.currency === 'GC' ? '#D6A84F' : txn.currency === 'SC' ? '#10B981' : '#F59E0B';
            return (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isCredit ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}
                >
                  {isCredit
                    ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    : <ArrowUpRight className="w-4 h-4 text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#F5E8C8' }}>{txn.description}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{formatTime(txn.timestamp)} · {txn.status}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold number-display" style={{ color: currencyColor }}>
                    {isCredit ? '+' : '-'}{txn.currency === 'SC' ? formatSC(txn.amount) : formatGC(txn.amount)} {txn.currency}
                  </p>
                </div>
              </motion.div>
            );
          }) : (
            <div className="py-10 text-center">
              <Wallet className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: '#9CA3AF' }} />
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Login to view your wallet</p>
              <button onClick={() => openAuthModal()} className="mt-3 px-5 py-2 rounded-lg text-sm font-semibold text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>Login</button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Gold Coins have no cash value · Void Where Prohibited</p>
      </div>
    </div>
  );
}
