'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import { Shield, Lock, Unlock, Info } from 'lucide-react';

export default function VaultPage() {
  const { goldCoins, vaultBalance, vaultInterestRate, depositVault, withdrawVault } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [msg, setMsg] = useState('');

  const dailyEarnings = Math.floor(vaultBalance * vaultInterestRate);
  const weeklyEarnings = dailyEarnings * 7;

  const handleDeposit = () => {
    const amt = Number(depositAmount.replace(/,/g, ''));
    if (!amt || amt > goldCoins || amt <= 0) return;
    depositVault(amt);
    setMsg(`✓ Deposited ${formatGC(amt)} GC into the Vault`);
    setDepositAmount('');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount.replace(/,/g, ''));
    if (!amt || amt > vaultBalance || amt <= 0) return;
    withdrawVault(amt);
    setMsg(`✓ Withdrew ${formatGC(amt)} GC from the Vault`);
    setWithdrawAmount('');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#3B82F6]/20"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.12) 0%, transparent 60%), #0A0A0A' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Vault</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>The Desert Vault</h1>
          <p className="text-sm max-w-lg" style={{ color: '#9CA3AF' }}>
            Lock your Gold Coins in the Vault and earn {(vaultInterestRate * 100).toFixed(0)}% daily interest. Withdraw anytime.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>Vault Balance</p>
          <p className="font-display text-3xl font-bold number-display text-blue-400">{formatGC(vaultBalance)}</p>
          <p className="text-xs mt-1 text-blue-400">GC Locked</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>Daily Earnings</p>
          <p className="font-display text-3xl font-bold number-display" style={{ color: '#D6A84F' }}>+{formatGC(dailyEarnings)}</p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>At {(vaultInterestRate * 100).toFixed(0)}%/day</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#9CA3AF' }}>Weekly Projection</p>
          <p className="font-display text-3xl font-bold number-display text-emerald-400">+{formatGC(weeklyEarnings)}</p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>7-day estimate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action panel */}
        <div className="glass-card p-6">
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setActiveAction('deposit')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={activeAction === 'deposit' ? { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: '#9CA3AF' }}
            >
              <Lock className="w-4 h-4" /> Deposit
            </button>
            <button
              onClick={() => setActiveAction('withdraw')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={activeAction === 'withdraw' ? { background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: '#9CA3AF' }}
            >
              <Unlock className="w-4 h-4" /> Withdraw
            </button>
          </div>

          {activeAction === 'deposit' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Amount to Deposit</label>
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>Wallet: {formatGC(goldCoins)} GC</span>
                </div>
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter GC amount"
                  className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-blue-400/50 transition-colors number-display"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                />
              </div>
              <div className="flex gap-2">
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <button key={amt} onClick={() => setDepositAmount(String(amt))} className="flex-1 py-1.5 rounded-lg text-xs border transition-all hover:border-blue-400/50" style={{ borderColor: '#2a2a2a', color: '#9CA3AF' }}>
                    {formatGC(amt)}
                  </button>
                ))}
              </div>
              {isLoggedIn ? (
                <button onClick={handleDeposit} className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
                  <Lock className="w-4 h-4 inline mr-2" />Lock in Vault
                </button>
              ) : (
                <button onClick={() => openAuthModal()} className="w-full py-3 rounded-xl font-semibold text-sm text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>
                  Login to Use Vault
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Amount to Withdraw</label>
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>Vault: {formatGC(vaultBalance)} GC</span>
                </div>
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter GC amount"
                  className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-emerald-400/50 transition-colors number-display"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                />
              </div>
              <button onClick={() => setWithdrawAmount(String(vaultBalance))} className="w-full py-1.5 rounded-lg text-xs border transition-all hover:border-emerald-400/50 text-emerald-400" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
                Withdraw All ({formatGC(vaultBalance)} GC + Interest)
              </button>
              <button onClick={handleWithdraw} className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                <Unlock className="w-4 h-4 inline mr-2" />Withdraw from Vault
              </button>
            </div>
          )}

          {msg && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 px-4 py-2 rounded-lg text-sm text-emerald-400" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              {msg}
            </motion.div>
          )}
        </div>

        {/* Info panel */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>How the Vault Works</h3>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Daily Interest', desc: `Earn ${(vaultInterestRate * 100).toFixed(0)}% of your Vault balance every day at midnight UTC.` },
              { title: 'No Lock Period', desc: 'Withdraw your GC at any time, with no penalties or waiting periods.' },
              { title: 'Compounding', desc: 'Interest is added to your Vault balance daily, compounding over time.' },
              { title: 'Bonus Only', desc: 'Vault is available for Gold Coins only. Sweep Coins are not eligible for Vault storage.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-blue-400" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>{item.title}</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Growth chart (static illustration) */}
          <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>If you deposited 50,000 GC today:</p>
            <div className="space-y-1.5">
              {[
                { period: '1 Day', amount: 52500 },
                { period: '7 Days', amount: 70710 },
                { period: '30 Days', amount: 216_097 },
              ].map((row) => (
                <div key={row.period} className="flex justify-between text-xs">
                  <span style={{ color: '#9CA3AF' }}>{row.period}</span>
                  <span className="number-display font-semibold text-blue-400">{formatGC(row.amount)} GC</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-2" style={{ color: '#9CA3AF' }}>*Mock illustration only. Not financial advice.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Gold Coins have no cash value · Void Where Prohibited</p>
      </div>
    </div>
  );
}
