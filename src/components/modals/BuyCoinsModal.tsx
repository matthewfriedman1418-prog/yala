'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useWalletStore } from '@/lib/store/wallet';
import { X, CreditCard, Bitcoin, CheckCircle2, Copy, Check } from 'lucide-react';
import { formatGC } from '@/lib/utils';
import { GoldCoinIcon, YalaIcon } from '@/components/ui/YalaIcon';

const PACKAGES = [
  { id: 'starter', name: 'Dune Starter', price: 4.99, gc: 10_000, sc: 1, bonus: 0, popular: false },
  { id: 'oasis', name: 'Oasis Pack', price: 9.99, gc: 25_000, sc: 2.5, bonus: 2_500, popular: false },
  { id: 'caravan', name: 'Caravan Bundle', price: 19.99, gc: 60_000, sc: 6, bonus: 10_000, popular: true },
  { id: 'palace', name: 'Palace Reserve', price: 49.99, gc: 175_000, sc: 17.5, bonus: 30_000, popular: false },
  { id: 'sheikh', name: "Sheikh's Fortune", price: 99.99, gc: 400_000, sc: 40, bonus: 75_000, popular: false },
];

const CRYPTO_COINS = [
  { symbol: 'BTC', label: 'Bitcoin', address: 'bc1qmockaddressyala1234567890abcdef' },
  { symbol: 'ETH', label: 'Ethereum', address: '0xMockYalaAddress1234567890AbCdEf0123' },
  { symbol: 'SOL', label: 'Solana', address: 'MockYalaSolAddressABCDEF1234567890xyz' },
  { symbol: 'USDT', label: 'Tether', address: '0xMockYalaUSDTAddress9876543210FEDCBA' },
];

type PayMethod = 'card' | 'apple' | 'google' | 'crypto';

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function BuyCoinsModal() {
  const { buyCoinsOpen, closeBuyCoins } = useUIStore();
  const { buyCoins, addBonus } = useWalletStore();

  const [selected, setSelected] = useState('caravan');
  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [step, setStep] = useState<'select' | 'success'>('select');
  const [loading, setLoading] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Crypto state
  const [cryptoCoin, setCryptoCoin] = useState('BTC');
  const [copied, setCopied] = useState(false);

  if (!buyCoinsOpen) return null;
  const pkg = PACKAGES.find((p) => p.id === selected)!;
  const cryptoAddr = CRYPTO_COINS.find((c) => c.symbol === cryptoCoin)!;

  const handlePurchase = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    buyCoins(pkg.gc, pkg.sc);
    if (pkg.bonus) addBonus(pkg.bonus);
    setLoading(false);
    setStep('success');
  };

  const handleClose = () => {
    closeBuyCoins();
    setStep('select');
    setSelected('caravan');
    setCardNumber(''); setCardExpiry(''); setCardCvv(''); setCardName('');
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cryptoAddr.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-2xl border border-[#1E1E1E] overflow-hidden z-10"
          style={{ backgroundColor: '#111', maxHeight: '92vh', overflowY: 'auto' }}
        >
          {step === 'success' ? (
            <div className="px-8 py-10 text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
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
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E1E1E]">
                <div>
                  <h2 className="font-display text-xl font-bold" style={{ color: '#D6A84F' }}>Buy Coins</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Gold Coins · Sweep Coins · Bonus Balance</p>
                </div>
                <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-[#9CA3AF]" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Packages */}
                <div>
                  <p className="text-xs font-medium text-[#9CA3AF] mb-2">Select Package</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                        <p className="font-semibold text-sm text-[#F5E8C8] mb-1.5">{p.name}</p>
                        <p className="text-xl font-bold number-display" style={{ color: '#D6A84F' }}>${p.price}</p>
                        <div className="mt-2 space-y-0.5">
                          <p className="text-xs text-[#9CA3AF] flex items-center gap-1"><GoldCoinIcon size={12} /> {formatGC(p.gc)} Gold Coins</p>
                          <p className="text-xs text-emerald-400 flex items-center gap-1"><YalaIcon name="chip-green" size={12} /> {p.sc.toFixed(2)} Sweep Coins</p>
                          {p.bonus > 0 && <p className="text-xs text-amber-400">⊕ {formatGC(p.bonus)} Bonus</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment method tabs */}
                <div>
                  <p className="text-xs font-medium text-[#9CA3AF] mb-2">Payment Method</p>
                  <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid #1E1E1E' }}>
                    {([
                      { id: 'card' as PayMethod, label: 'Card', icon: '💳' },
                      { id: 'apple' as PayMethod, label: 'Apple Pay', icon: '' },
                      { id: 'google' as PayMethod, label: 'Google Pay', icon: '' },
                      { id: 'crypto' as PayMethod, label: 'Crypto', icon: '₿' },
                    ]).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        className="flex flex-col items-center justify-center py-2.5 px-1 rounded-lg text-[10px] font-semibold transition-all"
                        style={{
                          backgroundColor: payMethod === m.id ? 'rgba(214,168,79,0.15)' : 'transparent',
                          color: payMethod === m.id ? '#D6A84F' : '#9CA3AF',
                          border: payMethod === m.id ? '1px solid rgba(214,168,79,0.3)' : '1px solid transparent',
                        }}
                      >
                        {m.id === 'apple' ? (
                          <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                        ) : m.id === 'google' ? (
                          <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        ) : (
                          <span className="text-base mb-0.5 leading-none">{m.icon}</span>
                        )}
                        <span className="leading-tight text-center">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment method content */}
                <AnimatePresence mode="wait">
                  {payMethod === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="space-y-3"
                    >
                      {/* Card number */}
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 pr-10 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 transition-colors number-display"
                          style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                        />
                        <CreditCard className="absolute right-3 top-3.5 w-4 h-4 text-[#9CA3AF]" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 transition-colors number-display"
                          style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="CVV"
                          className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 transition-colors number-display"
                          style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                        />
                      </div>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                      />
                      <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                      >
                        {loading ? 'Processing...' : `Pay $${pkg.price}`}
                      </button>
                    </motion.div>
                  )}

                  {payMethod === 'apple' && (
                    <motion.div
                      key="apple"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    >
                      <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #333' }}
                      >
                        {loading ? 'Processing...' : (
                          <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            Pay ${pkg.price}
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-center mt-2" style={{ color: '#9CA3AF' }}>
                        Authenticate with Face ID or Touch ID
                      </p>
                    </motion.div>
                  )}

                  {payMethod === 'google' && (
                    <motion.div
                      key="google"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    >
                      <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: '#fff', color: '#3c4043', border: '1px solid #dadce0' }}
                      >
                        {loading ? 'Processing...' : (
                          <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <span className="font-medium">G Pay · ${pkg.price}</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-center mt-2" style={{ color: '#9CA3AF' }}>
                        Complete with your Google account
                      </p>
                    </motion.div>
                  )}

                  {payMethod === 'crypto' && (
                    <motion.div
                      key="crypto"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="space-y-3"
                    >
                      {/* Coin selector */}
                      <div className="grid grid-cols-4 gap-2">
                        {CRYPTO_COINS.map((c) => (
                          <button
                            key={c.symbol}
                            onClick={() => setCryptoCoin(c.symbol)}
                            className="py-2 rounded-lg text-xs font-bold transition-all"
                            style={{
                              borderColor: cryptoCoin === c.symbol ? '#D6A84F' : '#2a2a2a',
                              backgroundColor: cryptoCoin === c.symbol ? 'rgba(214,168,79,0.12)' : 'rgba(255,255,255,0.03)',
                              color: cryptoCoin === c.symbol ? '#D6A84F' : '#9CA3AF',
                              border: `1px solid ${cryptoCoin === c.symbol ? '#D6A84F' : '#2a2a2a'}`,
                            }}
                          >
                            {c.symbol}
                          </button>
                        ))}
                      </div>

                      {/* Address */}
                      <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: '#2a2a2a', background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>
                          Send <span className="font-semibold text-[#F5E8C8]">{cryptoCoin}</span> to this address:
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="flex-1 text-xs font-mono break-all" style={{ color: '#D6A84F' }}>{cryptoAddr.address}</p>
                          <button
                            onClick={handleCopy}
                            className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/10"
                          >
                            {copied
                              ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                              : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />
                            }
                          </button>
                        </div>
                        <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
                          Demo only: no real blockchain transaction required
                        </p>
                      </div>

                      <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                      >
                        <Bitcoin className="w-4 h-4" />
                        {loading ? 'Confirming...' : `I've Sent Payment: $${pkg.price}`}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Order summary */}
                <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1E1E1E' }}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#9CA3AF]">{pkg.name}</span>
                    <span className="text-[#F5E8C8] font-semibold">${pkg.price}</span>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">
                    {formatGC(pkg.gc)} GC + {pkg.sc} SC{pkg.bonus ? ` + ${formatGC(pkg.bonus)} Bonus` : ''}
                  </p>
                </div>

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
