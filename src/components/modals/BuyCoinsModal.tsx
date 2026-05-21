'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useWalletStore } from '@/lib/store/wallet';
import { X, CreditCard, Bitcoin, Zap, CheckCircle2 } from 'lucide-react';
import { formatGC } from '@/lib/utils';

const PACKAGES = [
  { id: 'starter', name: 'Dune Starter', price: 4.99, gc: 10_000, sc: 1, bonus: 0, popular: false },
  { id: 'oasis', name: 'Oasis Pack', price: 9.99, gc: 25_000, sc: 2.5, bonus: 2_500, popular: false },
  { id: 'caravan', name: 'Caravan Bundle', price: 19.99, gc: 60_000, sc: 6, bonus: 10_000, popular: true },
  { id: 'palace', name: 'Palace Reserve', price: 49.99, gc: 175_000, sc: 17.5, bonus: 30_000, popular: false },
  { id: 'sheikh', name: "Sheikh's Fortune", price: 99.99, gc: 400_000, sc: 40, bonus: 75_000, popular: false },
];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin },
  { id: 'instant', label: 'Instant', icon: Zap },
];

export function BuyCoinsModal() {
  const { buyCoinsOpen, closeBuyCoins } = useUIStore();
  const { buyCoins, addBonus } = useWalletStore();
  const [selected, setSelected] = useState('caravan');
  const [payMethod, setPayMethod] = useState('card');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [loading, setLoading] = useState(false);

  if (!buyCoinsOpen) return null;

  const pkg = PACKAGES.find((p) => p.id === selected)!;

  const handlePurchase = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    buyCoins(pkg.gc, pkg.sc);
    if (pkg.bonus) addBonus(pkg.bonus);
    setLoading(false);
    setStep('success');
  };

  const handleClose = () => {
    closeBuyCoins();
    setStep('select');
    setSelected('caravan');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-2xl border border-[#1E1E1E] overflow-hidden z-10"
          style={{ backgroundColor: '#111', maxHeight: '90vh', overflowY: 'auto' }}
        >
          {step === 'success' ? (
            <div className="px-8 py-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="font-display text-xl font-bold text-[#F5E8C8] mb-2">Purchase Successful!</h3>
              <p className="text-sm text-[#9CA3AF] mb-1">{formatGC(pkg.gc)} Gold Coins credited to your wallet.</p>
              {pkg.sc > 0 && <p className="text-sm text-[#9CA3AF] mb-1">{pkg.sc.toFixed(2)} Sweep Coins credited.</p>}
              {pkg.bonus > 0 && <p className="text-sm text-[#9CA3AF]">{formatGC(pkg.bonus)} Bonus Gold Coins added.</p>}
              <button
                onClick={handleClose}
                className="mt-6 w-full py-3 rounded-xl font-semibold text-sm text-black"
                style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
              >
                Start Playing
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E1E1E]">
                <div>
                  <h2 className="font-display text-xl font-bold" style={{ color: '#D6A84F' }}>Buy Coins</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Gold Coins · Sweep Coins · Bonus Balance</p>
                </div>
                <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-[#9CA3AF]" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Packages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PACKAGES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p.id)}
                      className="relative text-left p-4 rounded-xl border transition-all"
                      style={{
                        borderColor: selected === p.id ? '#D6A84F' : '#1E1E1E',
                        backgroundColor: selected === p.id ? 'rgba(214,168,79,0.08)' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      {p.popular && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#D6A84F]/20 text-[#D6A84F] uppercase tracking-wide">
                          Popular
                        </span>
                      )}
                      <p className="font-semibold text-sm text-[#F5E8C8] mb-2">{p.name}</p>
                      <p className="text-xl font-bold number-display" style={{ color: '#D6A84F' }}>${p.price}</p>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs text-[#9CA3AF]">◈ {formatGC(p.gc)} Gold Coins</p>
                        <p className="text-xs text-emerald-400">◇ {p.sc.toFixed(2)} Sweep Coins</p>
                        {p.bonus > 0 && <p className="text-xs text-amber-400">⊕ {formatGC(p.bonus)} Bonus</p>}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Payment method */}
                <div>
                  <p className="text-xs font-medium text-[#9CA3AF] mb-2">Payment Method</p>
                  <div className="flex gap-2">
                    {PAYMENT_METHODS.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPayMethod(m.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all"
                          style={{
                            borderColor: payMethod === m.id ? '#D6A84F' : '#2a2a2a',
                            color: payMethod === m.id ? '#D6A84F' : '#9CA3AF',
                            backgroundColor: payMethod === m.id ? 'rgba(214,168,79,0.08)' : 'transparent',
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Crypto notice */}
                {payMethod === 'crypto' && (
                  <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-400">Crypto payments are processed via mock transaction flow. In production, wallets such as BTC, ETH, SOL, and USDT would be supported.</p>
                  </div>
                )}

                {/* Summary */}
                <div className="px-4 py-3 rounded-xl bg-white/3 border border-[#2a2a2a]">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#9CA3AF]">{pkg.name}</span>
                    <span className="text-[#F5E8C8] font-semibold">${pkg.price}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#9CA3AF]">
                    <span>Includes {formatGC(pkg.gc)} GC + {pkg.sc}SC{pkg.bonus ? ` + ${formatGC(pkg.bonus)} Bonus` : ''}</span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                >
                  {loading ? 'Processing...' : `Purchase — $${pkg.price}`}
                </button>

                <p className="text-[10px] text-center text-[#9CA3AF]/60 leading-relaxed">
                  No Purchase Necessary. Gold Coins have no cash value and cannot be exchanged for real money.<br />
                  18+ only. Void where prohibited.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
