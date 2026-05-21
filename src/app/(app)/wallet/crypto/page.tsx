'use client';
import { useState } from 'react';
import { useWalletStore } from '@/lib/store/wallet';
import { AlertCircle, Copy, CheckCircle2 } from 'lucide-react';

// Stable mock QR pattern — generated once at module level so render stays pure
const QR_PATTERN = Array.from({ length: 64 }, () => Math.random() > 0.4);

const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', address: 'bc1qmockaddressyala1234567890abcdef', network: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', address: '0xMockYalaAddress1234567890AbCdEf0123', network: 'ERC-20' },
  { symbol: 'SOL', name: 'Solana', address: 'MockYalaSolAddressABCDEF1234567890xyz', network: 'Solana' },
  { symbol: 'USDT', name: 'Tether (USDT)', address: '0xMockYalaUSDTAddress9876543210FEDCBA', network: 'ERC-20' },
  { symbol: 'LTC', name: 'Litecoin', address: 'LMockYalaAddress1234567890ltcxyz', network: 'Litecoin' },
];

export default function CryptoPage() {
  useWalletStore();
  const [selectedCoin, setSelectedCoin] = useState('ETH');
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [copied, setCopied] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const coin = COINS.find((c) => c.symbol === selectedCoin)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(coin.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>₿ Crypto</span>
        </div>
        <h1 className="font-display text-3xl font-bold" style={{ color: '#F5E8C8' }}>Crypto Payments</h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Demo flow only. No real transactions. Mock addresses shown.</p>
      </div>

      <div className="px-4 py-3 rounded-xl flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs" style={{ color: '#9CA3AF' }}>
          <span className="text-amber-400 font-semibold">Demo Mode: </span>
          This is a placeholder crypto payment interface. Wallet addresses are not real. No funds will be processed.
        </p>
      </div>

      {/* Coin selector */}
      <div className="flex gap-2 flex-wrap">
        {COINS.map((c) => (
          <button
            key={c.symbol}
            onClick={() => setSelectedCoin(c.symbol)}
            className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style={selectedCoin === c.symbol
              ? { background: 'linear-gradient(135deg, #D6A84F, #F0C97A)', color: '#000' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid #1E1E1E', color: '#9CA3AF' }
            }
          >
            {c.symbol}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E1E1E' }}>
        <button onClick={() => setTab('deposit')} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all" style={tab === 'deposit' ? { background: 'linear-gradient(135deg, #D6A84F, #F0C97A)', color: '#000' } : { color: '#9CA3AF' }}>Deposit</button>
        <button onClick={() => setTab('withdraw')} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all" style={tab === 'withdraw' ? { background: 'linear-gradient(135deg, #D6A84F, #F0C97A)', color: '#000' } : { color: '#9CA3AF' }}>Withdraw</button>
      </div>

      {tab === 'deposit' ? (
        <div className="glass-card p-5 space-y-4">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Deposit {coin.name} ({coin.network})</p>
            <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Send {coin.symbol} to the address below. Purchases will credit your Gold Coins and Sweep Coins wallet.</p>
          </div>

          {/* Mock QR code */}
          <div className="flex justify-center">
            <div className="w-36 h-36 rounded-xl border-2 flex items-center justify-center" style={{ borderColor: 'rgba(214,168,79,0.3)', background: 'rgba(214,168,79,0.05)' }}>
              <div className="grid grid-cols-8 gap-0.5 opacity-40">
                {QR_PATTERN.map((filled, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded-[1px]" style={{ background: filled ? '#D6A84F' : 'transparent' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>Wallet Address</p>
            <div className="flex items-center gap-2 px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a2a' }}>
              <p className="text-xs font-mono flex-1 truncate" style={{ color: '#F5E8C8' }}>{coin.address}</p>
              <button onClick={handleCopy} className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/10">
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#9CA3AF]" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1E1E1E' }}>
              <p style={{ color: '#9CA3AF' }}>Network</p>
              <p className="font-semibold" style={{ color: '#F5E8C8' }}>{coin.network}</p>
            </div>
            <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1E1E1E' }}>
              <p style={{ color: '#9CA3AF' }}>Min Deposit</p>
              <p className="font-semibold" style={{ color: '#F5E8C8' }}>0.001 {coin.symbol}</p>
            </div>
          </div>

          <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
            Demo only. Do not send real {coin.symbol} to this address. Confirmations required: {coin.symbol === 'BTC' ? 3 : 12}.
          </p>
        </div>
      ) : (
        <div className="glass-card p-5 space-y-4">
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Withdraw {coin.symbol} from your wallet to an external address.</p>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#9CA3AF' }}>Destination Address</label>
            <input
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              placeholder={`Your ${coin.symbol} address`}
              className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 transition-colors font-mono"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#9CA3AF' }}>Amount ({coin.symbol})</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 transition-colors number-display"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
            />
          </div>
          <button className="w-full py-3 rounded-xl font-semibold text-sm text-black opacity-50 cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>
            Withdraw (Demo Disabled)
          </button>
          <p className="text-[10px]" style={{ color: '#9CA3AF' }}>This is a placeholder. No real withdrawals are processed.</p>
        </div>
      )}
    </div>
  );
}
