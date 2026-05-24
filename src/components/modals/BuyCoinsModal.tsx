'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useWalletStore } from '@/lib/store/wallet';
import { useModalA11y } from '@/lib/hooks/useModalA11y';
import { X, CreditCard, CheckCircle2, Copy, Check, Lock } from 'lucide-react';
import { formatGC } from '@/lib/utils';
import { GoldCoinIcon, SweepCoinIcon, YalaIcon } from '@/components/ui/YalaIcon';
import { toast } from 'sonner';

interface Package {
  id: string;
  name: string;
  price: number;
  gc: number;
  sc: number;
  bonus: number;
  badge: 'POPULAR' | 'BEST VALUE' | 'STARTER' | null;
}

const PACKAGES: Package[] = [
  { id: 'starter', name: 'Starter',      price:  4.99, gc:  10_000, sc:  1,    bonus:      0, badge: 'STARTER' },
  { id: 'oasis',   name: 'Oasis Pack',   price:  9.99, gc:  25_000, sc:  2.5,  bonus:  2_500, badge: null },
  { id: 'caravan', name: 'Caravan',      price: 19.99, gc:  60_000, sc:  6,    bonus: 10_000, badge: 'POPULAR' },
  { id: 'palace',  name: 'Palace',       price: 49.99, gc: 175_000, sc: 17.5,  bonus: 30_000, badge: 'BEST VALUE' },
  { id: 'sheikh',  name: 'Sheikh',       price: 99.99, gc: 400_000, sc: 40,    bonus: 75_000, badge: null },
];

const CRYPTO_COINS = [
  { symbol: 'BTC',  label: 'Bitcoin',  address: 'bc1qmockaddressyala1234567890abcdef',   network: 'Bitcoin' },
  { symbol: 'ETH',  label: 'Ethereum', address: '0xMockYalaAddress1234567890AbCdEf0123', network: 'ERC-20' },
  { symbol: 'SOL',  label: 'Solana',   address: 'MockYalaSolAddressABCDEF1234567890xyz', network: 'Solana' },
  { symbol: 'USDT', label: 'Tether',   address: '0xMockYalaUSDTAddress9876543210FEDCBA', network: 'ERC-20' },
] as const;

type PayMethod = 'card' | 'apple' | 'google' | 'crypto';
type CryptoSym = typeof CRYPTO_COINS[number]['symbol'];

const fmtCard   = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const fmtExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export function BuyCoinsModal() {
  const { buyCoinsOpen, closeBuyCoins } = useUIStore();
  const { buyCoins, addBonus } = useWalletStore();
  useModalA11y(buyCoinsOpen, closeBuyCoins);

  // ALL HOOKS must run before any early return — don't reorder.
  const [selected,   setSelected]   = useState<string>('caravan');
  const [payMethod,  setPayMethod]  = useState<PayMethod>('card');
  const [step,       setStep]       = useState<'select' | 'success'>('select');
  const [loading,    setLoading]    = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv,    setCardCvv]    = useState('');
  const [cardName,   setCardName]   = useState('');

  const [cryptoCoin, setCryptoCoin] = useState<CryptoSym>('BTC');
  const [copied,     setCopied]     = useState(false);

  const pkg         = useMemo(() => PACKAGES.find((p) => p.id === selected) ?? PACKAGES[2], [selected]);
  const cryptoAddr  = useMemo(() => CRYPTO_COINS.find((c) => c.symbol === cryptoCoin) ?? CRYPTO_COINS[0], [cryptoCoin]);

  if (!buyCoinsOpen) return null;

  const handlePurchase = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    buyCoins(pkg.gc, pkg.sc);
    if (pkg.bonus) addBonus(pkg.bonus);
    setLoading(false);
    setStep('success');
    toast.success(`${pkg.name} Pack unlocked`, {
      description: `${formatGC(pkg.gc)} GC + ${pkg.sc} SC credited.`,
    });
  };

  const reset = () => {
    setStep('select');
    setSelected('caravan');
    setCardNumber(''); setCardExpiry(''); setCardCvv(''); setCardName('');
    setCopied(false);
  };

  const handleClose = () => { closeBuyCoins(); reset(); };

  const handleCopy = () => {
    navigator.clipboard.writeText(cryptoAddr.address).catch(() => {});
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-xl rounded-2xl overflow-hidden z-10"
          style={{
            backgroundColor: '#0F1A14',
            border: '1px solid #1A2E22',
            boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(240,178,50,0.04)',
            maxHeight: '92vh',
          }}
        >
          {/* shimmer rule */}
          <div className="h-[2px] w-full" style={{
            background: 'linear-gradient(90deg, #2DC97A, #F0B232, #2DC97A)',
            backgroundSize: '200% auto',
            animation: 'shimmer 4s linear infinite',
          }} />

          {step === 'success'
            ? <SuccessView pkg={pkg} onClose={handleClose} />
            : (
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 2px)' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <YalaIcon name="coin-stack" size={28} />
                    <div>
                      <h2 className="font-display text-lg font-bold" style={{ color: '#F5E8C8' }}>Get Coins</h2>
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: '#8FA899' }}>
                        Gold Coins · Sweep Coins · Weekend reload active
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  >
                    <X className="w-4 h-4" style={{ color: '#8FA899' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-5">
                  {/* ── PACKAGES ── */}
                  <section>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#8FA899' }}>
                      Choose a package
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PACKAGES.map((p) => (
                        <PackageCard
                          key={p.id}
                          pkg={p}
                          selected={selected === p.id}
                          onSelect={() => setSelected(p.id)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* ── PAYMENT METHOD ── */}
                  <section>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#8FA899' }}>
                      Payment method
                    </p>
                    <div
                      className="grid grid-cols-4 gap-1 p-1 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}
                    >
                      {([
                        { id: 'card'   as PayMethod, label: 'Card' },
                        { id: 'apple'  as PayMethod, label: 'Apple' },
                        { id: 'google' as PayMethod, label: 'Google' },
                        { id: 'crypto' as PayMethod, label: 'Crypto' },
                      ]).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPayMethod(m.id)}
                          className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all"
                          style={payMethod === m.id
                            ? { background: 'rgba(240,178,50,0.15)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.3)' }
                            : { color: '#8FA899', border: '1px solid transparent' }
                          }
                        >
                          <PayMethodIcon method={m.id} active={payMethod === m.id} />
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* ── METHOD CONTENT ── */}
                  <AnimatePresence mode="wait">
                    {payMethod === 'card' && (
                      <motion.div
                        key="card"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="space-y-2.5"
                      >
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(fmtCard(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            className="buy-input pr-10 number-display"
                          />
                          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8FA899' }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <input
                            type="text" inputMode="numeric"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(fmtExpiry(e.target.value))}
                            placeholder="MM/YY"
                            className="buy-input number-display"
                          />
                          <input
                            type="text" inputMode="numeric"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="CVV"
                            className="buy-input number-display"
                          />
                        </div>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on card"
                          className="buy-input"
                        />
                      </motion.div>
                    )}

                    {payMethod === 'apple' && (
                      <motion.div key="apple" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                        <ApplePayBlock onPay={handlePurchase} price={pkg.price} loading={loading} />
                      </motion.div>
                    )}

                    {payMethod === 'google' && (
                      <motion.div key="google" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                        <GooglePayBlock onPay={handlePurchase} price={pkg.price} loading={loading} />
                      </motion.div>
                    )}

                    {payMethod === 'crypto' && (
                      <motion.div
                        key="crypto"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-4 gap-1.5">
                          {CRYPTO_COINS.map((c) => (
                            <button
                              key={c.symbol}
                              onClick={() => setCryptoCoin(c.symbol as CryptoSym)}
                              className="py-2 rounded-lg text-xs font-black transition-all"
                              style={cryptoCoin === c.symbol
                                ? { background: 'rgba(96,165,250,0.15)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.4)' }
                                : { background: 'rgba(255,255,255,0.04)', color: '#8FA899', border: '1px solid #1A2E22' }
                              }
                            >
                              {c.symbol}
                            </button>
                          ))}
                        </div>
                        <div
                          className="rounded-xl p-3.5 space-y-2"
                          style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.22)' }}
                        >
                          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#60A5FA' }}>
                            Send {cryptoAddr.label} · {cryptoAddr.network}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-mono flex-1 break-all" style={{ color: '#F5E8C8' }}>{cryptoAddr.address}</p>
                            <button
                              onClick={handleCopy}
                              aria-label="Copy address"
                              className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/10"
                            >
                              {copied
                                ? <Check className="w-3.5 h-3.5" style={{ color: '#2DC97A' }} />
                                : <Copy className="w-3.5 h-3.5" style={{ color: '#8FA899' }} />
                              }
                            </button>
                          </div>
                          <p className="text-[10px]" style={{ color: '#8FA899' }}>
                            Demo only — address is a placeholder.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── ORDER SUMMARY ── */}
                  <div
                    className="rounded-xl p-3.5"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2E22' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA899' }}>Order summary</span>
                      <span className="font-display text-lg font-black number-display" style={{ color: '#F0B232' }}>${pkg.price.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                      <span className="flex items-center gap-1.5" style={{ color: '#F5E8C8' }}>
                        <GoldCoinIcon size={12} /> <span className="number-display">{formatGC(pkg.gc)}</span> GC
                      </span>
                      <span className="flex items-center gap-1.5" style={{ color: '#2DC97A' }}>
                        <SweepCoinIcon size={14} /> <span className="number-display">{pkg.sc}</span> SC
                      </span>
                      {pkg.bonus > 0 && (
                        <span className="flex items-center gap-1.5" style={{ color: '#F0B232' }}>
                          + <span className="number-display">{formatGC(pkg.bonus)}</span> bonus GC
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── PRIMARY CTA (card + crypto only — apple/google have their own buttons) ── */}
                  {(payMethod === 'card' || payMethod === 'crypto') && (
                    <button
                      onClick={handlePurchase}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #2DC97A)',
                        color: '#060E0A',
                        boxShadow: '0 4px 18px rgba(45,201,122,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                      }}
                    >
                      {loading
                        ? 'Processing…'
                        : payMethod === 'crypto'
                          ? <>I&apos;ve sent payment · ${pkg.price.toFixed(2)}</>
                          : <><Lock className="w-4 h-4" strokeWidth={3} /> Pay ${pkg.price.toFixed(2)}</>
                      }
                    </button>
                  )}

                  {/* Compliance footer */}
                  <p className="text-[10px] text-center leading-relaxed" style={{ color: '#4A6A55' }}>
                    No Purchase Necessary · Gold Coins have no cash value · 18+ · Void where prohibited
                  </p>
                </div>
              </div>
            )
          }

          <style>{`
            .buy-input {
              width: 100%;
              padding: 11px 14px;
              border-radius: 12px;
              font-size: 14px;
              color: #F5E8C8;
              background: rgba(255,255,255,0.04);
              border: 1px solid #1A2E22;
              outline: none;
              transition: border-color .15s ease, background .15s ease, box-shadow .15s ease;
            }
            .buy-input::placeholder { color: #4A6A55; }
            .buy-input:focus {
              border-color: rgba(240,178,50,0.45);
              background: rgba(240,178,50,0.04);
              box-shadow: 0 0 0 3px rgba(240,178,50,0.1);
            }
          `}</style>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────────────────
function PackageCard({ pkg, selected, onSelect }: { pkg: Package; selected: boolean; onSelect: () => void }) {
  const isPopular = pkg.badge === 'POPULAR';
  const isBest    = pkg.badge === 'BEST VALUE';
  const accent = selected
    ? (isPopular ? '#F0B232' : isBest ? '#2DC97A' : '#F0B232')
    : '#1A2E22';

  return (
    <button
      onClick={onSelect}
      className="relative text-left rounded-xl p-3.5 transition-all"
      style={{
        background: selected
          ? `linear-gradient(135deg, ${accent}10, transparent)`
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${selected ? `${accent}aa` : '#1A2E22'}`,
        boxShadow: selected ? `0 0 0 1px ${accent}33` : 'none',
      }}
    >
      {pkg.badge && (
        <span
          className="absolute -top-1.5 right-3 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{
            background: isPopular ? '#F0B232' : isBest ? '#2DC97A' : '#60A5FA',
            color: '#060E0A',
          }}
        >
          {pkg.badge}
        </span>
      )}
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-semibold text-sm" style={{ color: '#F5E8C8' }}>{pkg.name}</p>
        <p className="font-display text-xl font-black number-display" style={{ color: '#F0B232' }}>${pkg.price}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#F5E8C8' }}>
          <GoldCoinIcon size={12} />
          <span className="number-display font-semibold">{formatGC(pkg.gc)}</span>
          <span style={{ color: '#8FA899' }}>GC</span>
        </p>
        <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#2DC97A' }}>
          <SweepCoinIcon size={14} />
          <span className="number-display font-semibold">{pkg.sc}</span>
          <span style={{ color: '#8FA899' }}>SC</span>
        </p>
        {pkg.bonus > 0 && (
          <p className="text-[11px] flex items-center gap-1" style={{ color: '#F0B232' }}>
            <span className="font-bold">+</span>
            <span className="number-display font-semibold">{formatGC(pkg.bonus)}</span>
            <span style={{ color: '#8FA899' }}>bonus GC</span>
          </p>
        )}
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
function PayMethodIcon({ method, active }: { method: PayMethod; active: boolean }) {
  const color = active ? '#F0B232' : '#8FA899';
  if (method === 'card')   return <CreditCard className="w-4 h-4" style={{ color }} />;
  if (method === 'crypto') return <YalaIcon name="diamond" size={14} />;
  if (method === 'apple')  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
  // google — multi-color G mark
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function ApplePayBlock({ onPay, price, loading }: { onPay: () => void; price: number; loading: boolean }) {
  return (
    <div className="space-y-2">
      <button
        onClick={onPay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
      >
        {loading ? 'Processing…' : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Pay ${price.toFixed(2)}
          </>
        )}
      </button>
      <p className="text-[10px] text-center" style={{ color: '#8FA899' }}>Authenticate with Face ID or Touch ID</p>
    </div>
  );
}

function GooglePayBlock({ onPay, price, loading }: { onPay: () => void; price: number; loading: boolean }) {
  return (
    <div className="space-y-2">
      <button
        onClick={onPay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        style={{ background: '#fff', color: '#3c4043', border: '1px solid #dadce0' }}
      >
        {loading ? 'Processing…' : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-medium">Pay ${price.toFixed(2)}</span>
          </>
        )}
      </button>
      <p className="text-[10px] text-center" style={{ color: '#8FA899' }}>Complete with your Google account</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
function SuccessView({ pkg, onClose }: { pkg: Package; onClose: () => void }) {
  return (
    <div className="px-8 py-10 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
        style={{ background: 'rgba(45,201,122,0.15)', border: '1px solid rgba(45,201,122,0.35)' }}
      >
        <CheckCircle2 className="w-8 h-8" style={{ color: '#2DC97A' }} />
      </motion.div>
      <h3 className="font-display text-xl font-bold mb-2" style={{ color: '#F5E8C8' }}>
        Coins on the way
      </h3>
      <p className="text-sm mb-5" style={{ color: '#8FA899' }}>
        {pkg.name} Pack credited to your wallet.
      </p>

      {/* Breakdown card */}
      <div
        className="rounded-xl p-4 space-y-2 max-w-xs mx-auto mb-6 text-left"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-2" style={{ color: '#F5E8C8' }}>
            <GoldCoinIcon size={16} /> Gold Coins
          </span>
          <span className="text-sm font-bold number-display" style={{ color: '#F0B232' }}>+{formatGC(pkg.gc)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-2" style={{ color: '#F5E8C8' }}>
            <SweepCoinIcon size={18} /> Sweep Coins
          </span>
          <span className="text-sm font-bold number-display" style={{ color: '#2DC97A' }}>+{pkg.sc}</span>
        </div>
        {pkg.bonus > 0 && (
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#1A2E22' }}>
            <span className="text-xs flex items-center gap-2" style={{ color: '#F0B232' }}>
              <span className="font-black">+</span> Bonus GC
            </span>
            <span className="text-sm font-bold number-display" style={{ color: '#F0B232' }}>+{formatGC(pkg.bonus)}</span>
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full max-w-xs mx-auto py-3 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #10B981, #2DC97A)',
          color: '#060E0A',
          boxShadow: '0 4px 18px rgba(45,201,122,0.35)',
        }}
      >
        Start playing →
      </button>
    </div>
  );
}
