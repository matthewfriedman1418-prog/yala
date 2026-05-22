'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import { Shield, Lock, Unlock, Info } from 'lucide-react';

export default function VaultPage() {
  const { goldCoins, vaultBalance, depositVault, withdrawVault } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [msg, setMsg] = useState('');

  const totalCoins = goldCoins + vaultBalance;
  const vaultPct = totalCoins > 0 ? Math.round((vaultBalance / totalCoins) * 100) : 0;

  const handleDeposit = () => {
    const amt = Number(depositAmount.replace(/,/g, ''));
    if (!amt || amt > goldCoins || amt <= 0) return;
    depositVault(amt);
    setMsg(`✓ ${formatGC(amt)} GC moved to Vault`);
    setDepositAmount('');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount.replace(/,/g, ''));
    if (!amt || amt > vaultBalance || amt <= 0) return;
    withdrawVault(amt);
    setMsg(`✓ ${formatGC(amt)} GC returned to wallet`);
    setWithdrawAmount('');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">

      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Vault</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>The Vault</h1>
        <p style={{ color: '#8FA899' }}>
          Lock away Gold Coins you don&apos;t want to spend. Your vault balance won&apos;t be used while playing.
        </p>
      </div>

      {/* ── BALANCE STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#8FA899' }}>Vault Balance</p>
          <p className="font-display text-3xl font-black number-display text-blue-400">{formatGC(vaultBalance)}</p>
          <p className="text-xs mt-1 text-blue-400">GC protected</p>
        </div>
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#8FA899' }}>Available to Play</p>
          <p className="font-display text-3xl font-black number-display" style={{ color: '#F0B232' }}>{formatGC(goldCoins)}</p>
          <p className="text-xs mt-1" style={{ color: '#4A6A55' }}>in wallet</p>
        </div>
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#8FA899' }}>% Protected</p>
          <p className="font-display text-3xl font-black number-display" style={{ color: '#F5E8C8' }}>{vaultPct}%</p>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#1A2E22' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${vaultPct}%`, background: 'linear-gradient(90deg, #3B82F6, #60A5FA)' }}
            />
          </div>
        </div>
      </div>

      {/* ── ACTION + INFO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Action panel */}
        <div
          className="rounded-2xl p-6"
          style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
        >
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveAction('deposit')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeAction === 'deposit'
                ? { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: '#8FA899' }}
            >
              <Lock className="w-4 h-4" /> Lock Coins
            </button>
            <button
              onClick={() => setActiveAction('withdraw')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeAction === 'withdraw'
                ? { background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: '#8FA899' }}
            >
              <Unlock className="w-4 h-4" /> Unlock Coins
            </button>
          </div>

          {activeAction === 'deposit' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: '#8FA899' }}>Amount to Lock</label>
                  <span className="text-xs" style={{ color: '#4A6A55' }}>Wallet: {formatGC(goldCoins)} GC</span>
                </div>
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter GC amount"
                  className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-blue-400/50 transition-colors number-display"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1A2E22', color: '#F5E8C8' }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(String(amt))}
                    className="py-1.5 rounded-lg text-xs border transition-all hover:border-blue-400/50"
                    style={{ borderColor: '#1A2E22', color: '#8FA899' }}
                  >
                    {formatGC(amt)}
                  </button>
                ))}
              </div>
              {isLoggedIn ? (
                <button
                  onClick={handleDeposit}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
                >
                  <Lock className="w-4 h-4 inline mr-2" />Lock in Vault
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-black"
                  style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)' }}
                >
                  Sign In to Use Vault
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: '#8FA899' }}>Amount to Unlock</label>
                  <span className="text-xs" style={{ color: '#4A6A55' }}>Vault: {formatGC(vaultBalance)} GC</span>
                </div>
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter GC amount"
                  className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-emerald-400/50 transition-colors number-display"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1A2E22', color: '#F5E8C8' }}
                />
              </div>
              <button
                onClick={() => setWithdrawAmount(String(vaultBalance))}
                className="w-full py-1.5 rounded-xl text-xs border transition-all"
                style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#2DC97A', background: 'rgba(16,185,129,0.04)' }}
              >
                Unlock All — {formatGC(vaultBalance)} GC
              </button>
              <button
                onClick={handleWithdraw}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
              >
                <Unlock className="w-4 h-4 inline mr-2" />Return to Wallet
              </button>
            </div>
          )}

          {msg && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-4 py-2.5 rounded-xl text-sm text-[#2DC97A]"
              style={{ background: 'rgba(45,201,122,0.08)', border: '1px solid rgba(45,201,122,0.2)' }}
            >
              {msg}
            </motion.div>
          )}
        </div>

        {/* Info panel */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>How the Vault Works</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                title: 'Protect from spending',
                desc: 'Coins in the Vault can\'t be wagered in games. Use it to set aside coins you want to keep.',
                icon: Shield,
                color: '#3B82F6',
              },
              {
                title: 'Unlock anytime',
                desc: 'Move coins back to your wallet whenever you want. No lock periods, no waiting.',
                icon: Unlock,
                color: '#2DC97A',
              },
              {
                title: 'Gold Coins only',
                desc: 'The Vault holds Gold Coins only. Sweep Coins stay in your main balance.',
                icon: Lock,
                color: '#F0B232',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: '#F5E8C8' }}>{item.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B8F7B' }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(240,178,50,0.04)', border: '1px solid rgba(240,178,50,0.12)' }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: '#F0B232' }}>💡 Tip</p>
            <p className="text-xs" style={{ color: '#6B8F7B' }}>
              Lock away your winnings after a big session so you don&apos;t accidentally give them back.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.4)' }}>
          18+ · Gold Coins have no cash value · No Purchase Necessary · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}
