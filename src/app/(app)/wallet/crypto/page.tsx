'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { AlertCircle, Copy, CheckCircle2, ChevronLeft, ExternalLink } from 'lucide-react';
import { YalaIcon } from '@/components/ui/YalaIcon';
import { toast } from 'sonner';

// Stable mock QR — generated once at module load so render is pure
const QR_PATTERN = Array.from({ length: 64 }, () => Math.random() > 0.4);

const COINS = [
  { symbol: 'BTC',  name: 'Bitcoin',       address: 'bc1qmockaddressyala1234567890abcdef',   network: 'Bitcoin',  confirmations: 3,  min: '0.0001' },
  { symbol: 'ETH',  name: 'Ethereum',      address: '0xMockYalaAddress1234567890AbCdEf0123', network: 'ERC-20',   confirmations: 12, min: '0.005' },
  { symbol: 'SOL',  name: 'Solana',        address: 'MockYalaSolAddressABCDEF1234567890xyz', network: 'Solana',   confirmations: 32, min: '0.05' },
  { symbol: 'USDT', name: 'Tether',        address: '0xMockYalaUSDTAddress9876543210FEDCBA', network: 'ERC-20',   confirmations: 12, min: '5' },
  { symbol: 'LTC',  name: 'Litecoin',      address: 'LMockYalaAddress1234567890ltcxyz',      network: 'Litecoin', confirmations: 6,  min: '0.01' },
] as const;

type CoinSym = typeof COINS[number]['symbol'];

export default function CryptoPage() {
  useWalletStore(); // hydrate
  const [selectedCoin, setSelectedCoin] = useState<CoinSym>('ETH');
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [copied, setCopied] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const coin = COINS.find((c) => c.symbol === selectedCoin)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(coin.address).catch(() => {});
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-[fade-in_0.3s_ease-out]">

      <Link
        href="/wallet"
        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-[#F0B232]"
        style={{ color: '#8FA899' }}
      >
        <ChevronLeft className="w-3 h-3" /> Back to wallet
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.28)' }}
          >
            <YalaIcon name="diamond" size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#60A5FA' }}>Crypto</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold" style={{ color: '#F5E8C8' }}>Crypto deposits & withdrawals</h1>
        <p className="text-sm mt-1" style={{ color: '#8FA899' }}>
          Send BTC, ETH, SOL, USDT, or LTC. Funds credit your wallet after network confirmations.
        </p>
      </div>

      {/* Demo notice */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.22)' }}>
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#8FA899' }}>
          <span className="font-bold" style={{ color: '#F59E0B' }}>Demo mode.</span>{' '}
          Addresses below are not real and no funds will be processed. Live crypto wires up with the real payment integration.
        </p>
      </div>

      {/* Coin selector */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#8FA899' }}>
          Asset
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {COINS.map((c) => (
            <button
              key={c.symbol}
              onClick={() => setSelectedCoin(c.symbol)}
              className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all"
              style={selectedCoin === c.symbol
                ? { background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.4)', color: '#60A5FA' }
                : { background: '#0F1A14', border: '1px solid #1A2E22', color: '#8FA899' }
              }
            >
              <span className="font-display">{c.symbol}</span>
              <span className="text-[10px] font-normal" style={{ color: '#4A6A55' }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}
      >
        {(['deposit', 'withdraw'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all"
            style={tab === t
              ? { background: 'linear-gradient(135deg, #60A5FA, #3B82F6)', color: '#060E0A' }
              : { color: '#8FA899' }
            }
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'deposit' ? (
          <motion.div
            key="deposit"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl p-5 space-y-4"
            style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
          >
            <p className="text-sm" style={{ color: '#F5E8C8' }}>
              Deposit <span className="font-bold" style={{ color: '#60A5FA' }}>{coin.name}</span> on the{' '}
              <span className="font-bold">{coin.network}</span> network
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              {/* QR */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div
                  className="w-40 h-40 rounded-xl p-2 flex items-center justify-center"
                  style={{ background: '#F5F7F2', border: '2px solid rgba(96,165,250,0.25)' }}
                >
                  <div className="grid grid-cols-8 gap-px w-full h-full">
                    {QR_PATTERN.map((filled, i) => (
                      <div
                        key={i}
                        style={{ background: filled ? '#1c1a14' : 'transparent', borderRadius: '1px' }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] font-mono" style={{ color: '#4A6A55' }}>scan with wallet app</p>
              </div>

              {/* Address + meta */}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: '#8FA899' }}>
                    Deposit address
                  </p>
                  <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
                    style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.22)' }}>
                    <p className="text-xs font-mono flex-1 break-all" style={{ color: '#60A5FA' }}>{coin.address}</p>
                    <button
                      onClick={handleCopy}
                      aria-label="Copy address"
                      className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/10"
                    >
                      {copied
                        ? <CheckCircle2 className="w-4 h-4" style={{ color: '#2DC97A' }} />
                        : <Copy className="w-4 h-4" style={{ color: '#8FA899' }} />
                      }
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <MetaCell label="Network" value={coin.network} />
                  <MetaCell label="Min deposit" value={`${coin.min} ${coin.symbol}`} />
                  <MetaCell label="Confirmations" value={`${coin.confirmations}`} />
                  <MetaCell label="Fee" value="None" accent="#2DC97A" />
                </div>
              </div>
            </div>

            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
              <p className="text-[11px]" style={{ color: '#8FA899' }}>
                Send <span style={{ color: '#F5E8C8' }}>only</span> {coin.symbol} on the {coin.network} network.
                Wrong-network or wrong-asset transfers may be lost.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="withdraw"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl p-5 space-y-4"
            style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
          >
            <p className="text-sm" style={{ color: '#F5E8C8' }}>
              Withdraw <span className="font-bold" style={{ color: '#60A5FA' }}>{coin.symbol}</span> to an external wallet
            </p>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1.5" style={{ color: '#8FA899' }}>
                Destination address
              </label>
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={`Your ${coin.symbol} address`}
                className="w-full px-4 py-3 rounded-xl text-sm font-mono focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #1A2E22',
                  color: '#F5E8C8',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(96,165,250,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#1A2E22')}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold block mb-1.5" style={{ color: '#8FA899' }}>
                Amount ({coin.symbol})
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl text-sm number-display focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #1A2E22',
                  color: '#F5E8C8',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(96,165,250,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#1A2E22')}
              />
            </div>

            <button
              disabled
              className="w-full py-3 rounded-xl font-bold text-sm cursor-not-allowed"
              style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.25)' }}
            >
              Withdraw (demo disabled)
            </button>
            <p className="text-[10px] text-center" style={{ color: '#4A6A55' }}>
              Live withdrawals enabled once the production payment integration ships.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        href="/sweepstakes-rules"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold pt-1 transition-colors hover:opacity-80"
        style={{ color: '#8FA899' }}
      >
        Sweepstakes rules + redemption policy <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
}

function MetaCell({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2E22' }}>
      <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#8FA899' }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: accent || '#F5E8C8' }}>{value}</p>
    </div>
  );
}
