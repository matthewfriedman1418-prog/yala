'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { MOCK_TRANSACTIONS, type Transaction } from '@/lib/mock-data/transactions';
import { formatGC, formatSC, formatTime } from '@/lib/utils';
import { GoldCoinIcon, SweepCoinIcon, YalaIcon } from '@/components/ui/YalaIcon';
import {
  ArrowUpRight, ArrowDownLeft, Shield, Plus, ChevronRight,
  CheckCircle2, AlertCircle,
} from 'lucide-react';

export default function WalletPage() {
  const { goldCoins, sweepCoins, vaultBalance, activeCurrency, toggleCurrency } = useWalletStore();
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal, openBuyCoins, openRedeemModal } = useUIStore();
  const isGC = activeCurrency === 'GC';

  const [txFilter, setTxFilter] = useState<'all' | 'in' | 'out' | 'bonus'>('all');

  // Logged-out shell
  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}
          >
            <YalaIcon name="wallet-icon" size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Your wallet</h1>
          <p className="text-sm mb-6" style={{ color: '#8FA899' }}>
            Sign in to see your balances, deposit coins, and redeem Sweep Coins for cash prizes.
          </p>
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => openAuthModal('register')}
              className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
            >
              Create account
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-white/5"
              style={{ borderColor: '#1A2E22', color: '#8FA899' }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Recent activity, filtered
  const recentTxns = MOCK_TRANSACTIONS
    .filter((t) => {
      if (txFilter === 'all') return true;
      if (txFilter === 'in')   return ['buy', 'daily_bonus', 'bonus', 'rakeback', 'rain', 'tip', 'vault_withdraw'].includes(t.type);
      if (txFilter === 'out')  return ['redeem', 'vault_deposit'].includes(t.type);
      if (txFilter === 'bonus')return ['bonus', 'rakeback', 'daily_bonus', 'rain'].includes(t.type);
      return true;
    })
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}
            >
              <YalaIcon name="wallet-icon" size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0B232]">Wallet</span>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: '#F5E8C8' }}>Your Balances</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8FA899' }}>Deposit, redeem, and manage your coins.</p>
        </div>

        {/* KYC chip */}
        <Link
          href="/kyc"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
          style={{
            background: user?.isVerified ? 'rgba(45,201,122,0.08)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${user?.isVerified ? 'rgba(45,201,122,0.25)' : 'rgba(245,158,11,0.3)'}`,
            color: user?.isVerified ? '#2DC97A' : '#F59E0B',
          }}
        >
          {user?.isVerified
            ? <><CheckCircle2 className="w-3.5 h-3.5" /> KYC Verified</>
            : <><Shield className="w-3.5 h-3.5" /> Verify Identity</>
          }
        </Link>
      </div>

      {/* ── BALANCE HERO — big active-currency display ──────── */}
      <div
        className="relative rounded-2xl overflow-hidden p-6"
        style={{
          background: isGC
            ? 'radial-gradient(ellipse at 15% 80%, rgba(240,178,50,0.14) 0%, transparent 55%), linear-gradient(180deg, #0F1A14 0%, #0A1410 100%)'
            : 'radial-gradient(ellipse at 15% 80%, rgba(45,201,122,0.16) 0%, transparent 55%), linear-gradient(180deg, #0F1A14 0%, #0A1410 100%)',
          border: `1px solid ${isGC ? 'rgba(240,178,50,0.22)' : 'rgba(45,201,122,0.22)'}`,
        }}
      >
        {/* Currency toggle (top right) */}
        <button
          onClick={toggleCurrency}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all hover:bg-white/5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid #1A2E22',
            color: '#8FA899',
          }}
        >
          View {isGC ? 'SC' : 'GC'}
          <ChevronRight className="w-3 h-3" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {isGC ? <GoldCoinIcon size={56} /> : <SweepCoinIcon size={60} />}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA899' }}>
                {isGC ? 'Gold Coins balance' : 'Sweep Coins balance'}
              </p>
              <p
                className="font-display font-black number-display leading-none mt-1"
                style={{ color: '#F5E8C8', fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)' }}
              >
                {isGC ? formatGC(goldCoins) : formatSC(sweepCoins)}
                <span className="ml-2" style={{ fontSize: '0.45em', color: isGC ? '#F0B232' : '#2DC97A' }}>
                  {activeCurrency}
                </span>
              </p>
              {!isGC && (
                <p className="text-xs mt-1.5 number-display" style={{ color: '#8FA899' }}>
                  ≈ <span style={{ color: '#F5E8C8' }}>${sweepCoins.toFixed(2)}</span> USD at redemption
                </p>
              )}
            </div>
          </div>

          {/* Primary actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={openBuyCoins}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #F0B232, #FFD166)',
                color: '#060E0A',
                boxShadow: '0 4px 18px rgba(240,178,50,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={3} /> Buy Coins
            </button>
            {!isGC && (
              <button
                onClick={openRedeemModal}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #2DC97A, #10B981)',
                  color: '#060E0A',
                  boxShadow: '0 4px 18px rgba(45,201,122,0.35)',
                }}
              >
                <ArrowUpRight className="w-4 h-4" strokeWidth={3} /> Redeem
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BALANCE BREAKDOWN — 3 cards (the other currency + vault + lifetime) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <BalanceCard
          label={isGC ? 'Sweep Coins' : 'Gold Coins'}
          value={isGC ? `${sweepCoins.toFixed(2)} SC` : formatGC(goldCoins)}
          accent={isGC ? '#2DC97A' : '#F0B232'}
          icon={isGC ? <SweepCoinIcon size={26} /> : <GoldCoinIcon size={24} />}
          action={{ label: isGC ? 'Switch to SC' : 'Switch to GC', onClick: toggleCurrency }}
        />
        <BalanceCard
          label="Vault (locked)"
          value={`${vaultBalance.toFixed(2)} SC`}
          accent="#2DC97A"
          icon={<YalaIcon name="lock" size={22} />}
          action={{ label: 'Manage', href: '/vault' }}
          note="Protected from play"
        />
        <BalanceCard
          label="Total wagered"
          value={formatGC(user?.totalWagered || 0)}
          accent="#A78BFA"
          icon={<YalaIcon name="activity" size={22} />}
          action={{ label: 'See stats', href: '/profile' }}
          note="All-time across all coins"
        />
      </div>

      {/* ── QUICK ACTIONS ───────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8FA899' }}>
          Move money
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ActionTile
            title="Buy Coins"
            blurb="Card · Apple/Google Pay · Crypto"
            icon={<YalaIcon name="coin-stack" size={28} />}
            accent="#F0B232"
            onClick={openBuyCoins}
          />
          <ActionTile
            title="Redeem SC"
            blurb="Cash out 25+ SC for prizes"
            icon={<YalaIcon name="cash-bill" size={28} />}
            accent="#2DC97A"
            onClick={openRedeemModal}
            disabled={sweepCoins < 25}
            disabledHint="Min 25 SC"
          />
          <ActionTile
            title="Crypto"
            blurb="BTC · ETH · SOL · USDT"
            icon={<YalaIcon name="diamond" size={26} />}
            accent="#60A5FA"
            href="/wallet/crypto"
          />
          <ActionTile
            title="Vault"
            blurb="Lock SC away from play"
            icon={<YalaIcon name="lock" size={24} />}
            accent="#2DC97A"
            href="/vault"
          />
        </div>
      </div>

      {/* ── RECENT ACTIVITY ─────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1A2E22' }}>
          <div className="flex items-center gap-2">
            <YalaIcon name="activity" size={16} />
            <h3 className="font-semibold text-sm" style={{ color: '#F5E8C8' }}>Recent activity</h3>
          </div>
          <Link
            href="/profile/transactions"
            className="text-[11px] font-semibold flex items-center gap-1 transition-colors hover:text-[#F0B232]"
            style={{ color: '#8FA899' }}
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 px-5 py-3" style={{ borderBottom: '1px solid #1A2E22' }}>
          {([
            { id: 'all',   label: 'All' },
            { id: 'in',    label: 'In' },
            { id: 'out',   label: 'Out' },
            { id: 'bonus', label: 'Bonuses' },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => setTxFilter(f.id)}
              className="px-3 py-1 rounded-full text-[11px] font-bold transition-all"
              style={txFilter === f.id
                ? { background: 'rgba(240,178,50,0.15)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.3)' }
                : { background: 'rgba(255,255,255,0.03)', color: '#8FA899', border: '1px solid #1A2E22' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="divide-y" style={{ borderColor: '#1A2E22' }}>
          {recentTxns.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: '#8FA899' }}>No activity matches this filter.</p>
            </div>
          ) : (
            recentTxns.map((txn, i) => <TxnRow key={txn.id} txn={txn} delay={i * 0.04} />)
          )}
        </div>
      </div>

      {/* ── Compliance footer ── */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2E22' }}>
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#4A6A55' }} />
        <p className="text-[11px] leading-relaxed" style={{ color: '#8FA899' }}>
          Gold Coins are virtual play coins and have no cash value. Sweep Coins are redeemable for prizes
          under our <Link href="/sweepstakes-rules" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#F0B232' }}>Sweepstakes Rules</Link>.
          18+ only · Void where prohibited.
        </p>
      </div>
    </div>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────────────
function BalanceCard({
  label, value, accent, icon, action, note,
}: {
  label: string;
  value: string;
  accent: string;
  icon: React.ReactNode;
  action?: { label: string; onClick?: () => void; href?: string };
  note?: string;
}) {
  const actionEl = action && (
    action.href ? (
      <Link href={action.href} className="text-[10px] font-bold transition-colors hover:opacity-80" style={{ color: accent }}>
        {action.label} →
      </Link>
    ) : (
      <button onClick={action.onClick} className="text-[10px] font-bold transition-colors hover:opacity-80" style={{ color: accent }}>
        {action.label} →
      </button>
    )
  );
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        {actionEl}
      </div>
      <p className="font-bold text-lg number-display leading-none" style={{ color: accent }}>{value}</p>
      <p className="text-[10px] mt-1.5 uppercase tracking-widest font-semibold" style={{ color: '#8FA899' }}>{label}</p>
      {note && <p className="text-[10px] mt-0.5" style={{ color: '#4A6A55' }}>{note}</p>}
    </div>
  );
}

function ActionTile({
  title, blurb, icon, accent, onClick, href, disabled, disabledHint,
}: {
  title: string;
  blurb: string;
  icon: React.ReactNode;
  accent: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const inner = (
    <div
      className="rounded-2xl p-4 transition-all group h-full flex flex-col gap-2.5"
      style={{
        background: '#0F1A14',
        border: '1px solid #1A2E22',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}12`, border: `1px solid ${accent}28` }}
        >
          {icon}
        </div>
        {!disabled && (
          <ChevronRight
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5 mt-1.5"
            style={{ color: accent }}
          />
        )}
      </div>
      <div>
        <p className="font-bold text-sm transition-colors group-hover:text-[#F5E8C8]" style={{ color: '#F5E8C8' }}>{title}</p>
        <p className="text-[11px] mt-0.5" style={{ color: '#8FA899' }}>
          {disabled ? (disabledHint ?? blurb) : blurb}
        </p>
      </div>
    </div>
  );

  if (disabled) return <div>{inner}</div>;
  return href
    ? <Link href={href}>{inner}</Link>
    : <button onClick={onClick} className="text-left">{inner}</button>;
}

const TXN_ICON: Partial<Record<Transaction['type'], string>> = {
  buy: 'coin-stack', redeem: 'cash-bill', bonus: 'gift', rakeback: 'activity',
  vault_deposit: 'lock', vault_withdraw: 'lock', rain: 'sparkle', tip: 'star',
  daily_bonus: 'daily-star',
};
const TXN_LABEL: Record<Transaction['type'], string> = {
  buy: 'Deposit', redeem: 'Redemption', bonus: 'Bonus', rakeback: 'Rakeback',
  vault_deposit: 'Vault Deposit', vault_withdraw: 'Vault Withdraw',
  rain: 'Rain', tip: 'Tip', daily_bonus: 'Daily Bonus',
};
const TXN_CREDIT: Transaction['type'][] = [
  'buy', 'daily_bonus', 'bonus', 'rakeback', 'rain', 'tip', 'vault_withdraw',
];

function TxnRow({ txn, delay }: { txn: Transaction; delay: number }) {
  const isCredit = TXN_CREDIT.includes(txn.type);
  const iconName = (TXN_ICON[txn.type] ?? 'activity') as Parameters<typeof YalaIcon>[0]['name'];
  const amountColor =
    isCredit ? '#2DC97A' : '#EF4444';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="flex items-center gap-4 px-5 py-3.5"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: isCredit ? 'rgba(45,201,122,0.08)' : 'rgba(239,68,68,0.06)',
          border: `1px solid ${isCredit ? 'rgba(45,201,122,0.18)' : 'rgba(239,68,68,0.18)'}`,
        }}
      >
        <YalaIcon name={iconName} size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: '#F5E8C8' }}>{txn.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8FA899' }}>{TXN_LABEL[txn.type]}</span>
          <span className="text-[10px]" style={{ color: '#4A6A55' }}>·</span>
          <span className="text-[10px]" style={{ color: '#8FA899' }}>{formatTime(txn.timestamp)}</span>
          {txn.status !== 'completed' && (
            <>
              <span className="text-[10px]" style={{ color: '#4A6A55' }}>·</span>
              <span className="text-[10px] font-bold uppercase" style={{ color: txn.status === 'pending' ? '#F59E0B' : '#EF4444' }}>{txn.status}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {txn.currency === 'GC'
          ? <GoldCoinIcon size={14} />
          : txn.currency === 'SC'
            ? <SweepCoinIcon size={16} />
            : <YalaIcon name="gift" size={14} />
        }
        <p className="text-sm font-bold number-display" style={{ color: amountColor }}>
          {isCredit ? '+' : '−'}{txn.currency === 'SC' ? formatSC(txn.amount) : formatGC(txn.amount)} {txn.currency}
        </p>
      </div>
    </motion.div>
  );
}
