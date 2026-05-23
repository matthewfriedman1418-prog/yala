'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatSC } from '@/lib/utils';
import { Lock, Unlock, Info } from 'lucide-react';
import { YalaIcon } from '@/components/ui/YalaIcon';

const ACCENT      = '#2DC97A';
const ACCENT_DARK = '#1A7A4A';
const ACCENT_BG   = 'rgba(45,201,122,0.08)';
const ACCENT_BG_2 = 'rgba(45,201,122,0.18)';
const ACCENT_BORDER = 'rgba(45,201,122,0.28)';

export default function VaultPage() {
  const { sweepCoins, vaultBalance, depositVault, withdrawVault } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [msg, setMsg] = useState('');

  const totalCoins = sweepCoins + vaultBalance;
  const vaultPct = totalCoins > 0 ? Math.round((vaultBalance / totalCoins) * 100) : 0;

  const parseAmount = (s: string) => Number(s.replace(/,/g, '')) || 0;

  const handleDeposit = () => {
    const amt = parseAmount(depositAmount);
    if (!amt || amt > sweepCoins || amt <= 0) return;
    depositVault(amt);
    setMsg(`✓ ${formatSC(amt)} SC moved to Vault`);
    setDepositAmount('');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleWithdraw = () => {
    const amt = parseAmount(withdrawAmount);
    if (!amt || amt > vaultBalance || amt <= 0) return;
    withdrawVault(amt);
    setMsg(`✓ ${formatSC(amt)} SC returned to wallet`);
    setWithdrawAmount('');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">

      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}` }}>
            <YalaIcon name="lock" size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Sweep Coin Vault</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>The Vault</h1>
        <p style={{ color: '#8FA899' }}>
          Lock away Sweep Coins you don&apos;t want to spend. Your vault balance won&apos;t be used while playing — keeping your prize-eligible balance safe.
        </p>
      </div>

      {/* ── BALANCE STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}` }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#8FA899' }}>Vault Balance</p>
          <p className="font-display text-3xl font-black number-display" style={{ color: ACCENT }}>{formatSC(vaultBalance)}</p>
          <p className="text-xs mt-1" style={{ color: ACCENT }}>SC protected</p>
        </div>
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#8FA899' }}>Available to Play</p>
          <p className="font-display text-3xl font-black number-display" style={{ color: '#F5E8C8' }}>{formatSC(sweepCoins)}</p>
          <p className="text-xs mt-1" style={{ color: '#4A6A55' }}>SC in wallet</p>
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
              style={{ width: `${vaultPct}%`, background: `linear-gradient(90deg, ${ACCENT_DARK}, ${ACCENT})` }}
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
                ? { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`, color: '#060E0A' }
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
                  <span className="text-xs" style={{ color: '#4A6A55' }}>Wallet: {formatSC(sweepCoins)} SC</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="Enter SC amount"
                  className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-colors number-display"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1A2E22', color: '#F5E8C8' }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(String(amt))}
                    className="py-1.5 rounded-lg text-xs border transition-all"
                    style={{ borderColor: '#1A2E22', color: '#8FA899' }}
                  >
                    {amt} SC
                  </button>
                ))}
              </div>
              {isLoggedIn ? (
                <button
                  onClick={handleDeposit}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`, color: '#060E0A' }}
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
                  <span className="text-xs" style={{ color: '#4A6A55' }}>Vault: {formatSC(vaultBalance)} SC</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="Enter SC amount"
                  className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-emerald-400/50 transition-colors number-display"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1A2E22', color: '#F5E8C8' }}
                />
              </div>
              <button
                onClick={() => setWithdrawAmount(String(vaultBalance))}
                className="w-full py-1.5 rounded-xl text-xs border transition-all"
                style={{ borderColor: ACCENT_BORDER, color: ACCENT, background: ACCENT_BG }}
              >
                Unlock All — {formatSC(vaultBalance)} SC
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
              className="mt-3 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
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
            <Info className="w-4 h-4" style={{ color: ACCENT }} />
            <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>How the Vault Works</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                title: 'Protect your prize balance',
                desc: 'Sweep Coins in the Vault can\'t be wagered. Set aside what you want to redeem for cash prizes.',
                yala: 'shield' as const,
                color: ACCENT,
              },
              {
                title: 'Unlock anytime',
                desc: 'Move SC back to your wallet whenever you want. No lock periods, no waiting.',
                yala: 'check' as const,
                color: '#10B981',
              },
              {
                title: 'Sweep Coins only',
                desc: 'The Vault holds Sweep Coins only — your prize-eligible currency. Gold Coins stay in your main balance.',
                yala: 'cash-bill' as const,
                color: ACCENT,
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${item.color}14`, border: `1px solid ${item.color}28` }}
                >
                  <YalaIcon name={item.yala} size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: '#F5E8C8' }}>{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B8F7B' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div
            className="p-4 rounded-xl"
            style={{ background: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}` }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: ACCENT }}>💡 Tip</p>
            <p className="text-xs" style={{ color: '#6B8F7B' }}>
              Lock away SC after a winning session so you can&apos;t accidentally wager it back. Sweep Coins are the only currency redeemable for prizes.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.4)' }}>
          18+ · Sweep Coins are redeemable for prizes · No Purchase Necessary · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}
