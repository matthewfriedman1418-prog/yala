'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatSC } from '@/lib/utils';
import { ArrowUpRight, Shield, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { SweepCoinIcon, YalaIcon } from '@/components/ui/YalaIcon';
import { toast } from 'sonner';

const REDEMPTION_METHODS = [
  { id: 'paypal', label: 'PayPal',         min: 25,  fee: 0, time: '1–2 business days',  hint: 'Fastest', accent: '#60A5FA' },
  { id: 'bank',   label: 'Bank (ACH)',     min: 50,  fee: 0, time: '3–5 business days',  hint: 'Most popular', accent: '#2DC97A' },
  { id: 'check',  label: 'Check by Mail',  min: 100, fee: 0, time: '7–10 business days', hint: 'For large prizes', accent: '#F0B232' },
] as const;

type StepKey = 'select' | 'confirm' | 'success';

export default function RedeemPage() {
  const { sweepCoins } = useWalletStore();
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [step, setStep]     = useState<StepKey>('select');
  const [methodId, setMethodId] = useState<typeof REDEMPTION_METHODS[number]['id']>('paypal');
  const [amount, setAmount] = useState('');

  const method = REDEMPTION_METHODS.find((m) => m.id === methodId)!;
  const amountNum = Number(amount) || 0;
  const canRedeem = amountNum >= method.min && amountNum <= sweepCoins;
  const usdValue  = amountNum * 1.0;

  const presetChips = [25, 50, 100, 250].filter((v) => v <= sweepCoins);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-[fade-in_0.3s_ease-out]">

      {/* Back link */}
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
            style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.25)' }}
          >
            <ArrowUpRight className="w-3 h-3" style={{ color: '#2DC97A' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2DC97A' }}>Redeem</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold" style={{ color: '#F5E8C8' }}>Redeem Sweep Coins</h1>
        <p className="text-sm mt-1" style={{ color: '#8FA899' }}>
          1 SC = $1.00 USD. Cashouts go through identity verification before payout.
        </p>
      </div>

      {/* SC Balance */}
      <div
        className="rounded-2xl p-5 flex items-center justify-between"
        style={{
          background: 'radial-gradient(ellipse at 10% 80%, rgba(45,201,122,0.14) 0%, transparent 55%), #0F1A14',
          border: '1px solid rgba(45,201,122,0.22)',
        }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA899' }}>Available SC Balance</p>
          <p className="font-display text-3xl font-black number-display mt-1" style={{ color: '#2DC97A' }}>
            {formatSC(sweepCoins)} <span className="text-base" style={{ color: '#8FA899' }}>SC</span>
          </p>
          <p className="text-xs mt-1 number-display" style={{ color: '#8FA899' }}>
            ≈ <span style={{ color: '#F5E8C8' }}>${sweepCoins.toFixed(2)}</span> USD if redeemed today
          </p>
        </div>
        <SweepCoinIcon size={56} />
      </div>

      {/* AMOE notice */}
      <div
        className="px-4 py-3 rounded-xl flex items-start gap-3"
        style={{ background: 'rgba(45,201,122,0.05)', border: '1px solid rgba(45,201,122,0.18)' }}
      >
        <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed" style={{ color: '#8FA899' }}>
          <span className="font-bold" style={{ color: '#2DC97A' }}>No purchase necessary.</span>{' '}
          Sweep Coins can be earned for free through daily bonuses, missions, login streaks, and our AMOE.{' '}
          <Link href="/sweepstakes-rules" className="font-semibold underline transition-colors hover:opacity-80" style={{ color: '#2DC97A' }}>See Sweepstakes Rules</Link>.
        </p>
      </div>

      {/* STEP: select */}
      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            {/* Methods */}
            <div
              className="rounded-2xl p-5"
              style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
            >
              <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: '#8FA899' }}>
                Payout method
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {REDEMPTION_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethodId(m.id)}
                    className="text-left p-4 rounded-xl transition-all relative"
                    style={{
                      background: methodId === m.id ? `${m.accent}10` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${methodId === m.id ? `${m.accent}55` : '#1A2E22'}`,
                    }}
                  >
                    {methodId === m.id && (
                      <CheckCircle2
                        className="w-4 h-4 absolute top-3 right-3"
                        style={{ color: m.accent }}
                      />
                    )}
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: m.accent }}>
                      {m.hint}
                    </p>
                    <p className="font-bold text-sm mb-1" style={{ color: '#F5E8C8' }}>{m.label}</p>
                    <p className="text-[11px]" style={{ color: '#8FA899' }}>
                      Min {m.min} SC · {m.time}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount + presets */}
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA899' }}>
                  Amount
                </p>
                <button
                  onClick={() => setAmount(String(sweepCoins))}
                  className="text-[10px] font-bold transition-colors hover:opacity-80"
                  style={{ color: '#2DC97A' }}
                >
                  Max
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={method.min}
                  max={sweepCoins}
                  step="0.01"
                  placeholder={`Min ${method.min} SC`}
                  className="w-full pl-12 pr-20 py-4 rounded-xl font-display text-2xl font-bold number-display transition-colors focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid #1A2E22',
                    color: '#F5E8C8',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(45,201,122,0.5)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#1A2E22')}
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <SweepCoinIcon size={28} />
                </div>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#8FA899' }}>
                  SC
                </span>
              </div>
              {presetChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {presetChips.map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:bg-white/5"
                      style={{
                        background: amountNum === v ? 'rgba(45,201,122,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${amountNum === v ? 'rgba(45,201,122,0.4)' : '#1A2E22'}`,
                        color: amountNum === v ? '#2DC97A' : '#8FA899',
                      }}
                    >
                      {v} SC
                    </button>
                  ))}
                </div>
              )}
              {amountNum > 0 && (
                <div
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                  style={{ background: 'rgba(45,201,122,0.06)', border: '1px solid rgba(45,201,122,0.18)' }}
                >
                  <span className="text-xs" style={{ color: '#8FA899' }}>You receive</span>
                  <span className="font-display text-base font-bold number-display" style={{ color: '#2DC97A' }}>
                    ${usdValue.toFixed(2)} USD
                  </span>
                </div>
              )}
            </div>

            {/* CTAs */}
            {isLoggedIn ? (
              <>
                {!user?.isVerified && (
                  <div className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-400">KYC verification required</p>
                      <p className="text-xs mt-0.5" style={{ color: '#8FA899' }}>You must verify your identity before redeeming.</p>
                    </div>
                    <Link
                      href="/kyc"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 whitespace-nowrap"
                      style={{ background: '#F59E0B', color: '#060E0A' }}
                    >
                      Verify
                    </Link>
                  </div>
                )}
                <button
                  onClick={() => user?.isVerified ? setStep('confirm') : (window.location.href = '/kyc')}
                  disabled={!canRedeem}
                  className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #2DC97A, #10B981)',
                    color: '#060E0A',
                    boxShadow: canRedeem ? '0 4px 18px rgba(45,201,122,0.35)' : 'none',
                  }}
                >
                  {amountNum > 0 && amountNum < method.min
                    ? `Minimum ${method.min} SC for ${method.label}`
                    : amountNum > sweepCoins
                      ? 'Not enough SC'
                      : 'Continue to review'}
                </button>
              </>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #F0B232, #FFD166)', color: '#060E0A' }}
              >
                Sign in to redeem
              </button>
            )}
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl p-5 space-y-4"
            style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
          >
            <h3 className="font-display text-lg font-bold" style={{ color: '#F5E8C8' }}>Review redemption</h3>
            <div className="rounded-xl divide-y" style={{ background: 'rgba(255,255,255,0.02)', borderColor: '#1A2E22' }}>
              {[
                { label: 'Amount',          value: `${amountNum} SC`, accent: '#2DC97A' },
                { label: 'USD value',       value: `$${usdValue.toFixed(2)}`, accent: '#F5E8C8' },
                { label: 'Payout method',   value: method.label,       accent: '#F5E8C8' },
                { label: 'Processing time', value: method.time,        accent: '#F5E8C8' },
                { label: 'Fee',             value: 'Free',             accent: '#2DC97A' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-4 py-3" style={{ borderColor: '#1A2E22', borderTopWidth: 0 }}>
                  <span className="text-xs" style={{ color: '#8FA899' }}>{row.label}</span>
                  <span className="text-sm font-bold number-display" style={{ color: row.accent }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-white/5"
                style={{ borderColor: '#1A2E22', color: '#8FA899' }}
              >
                Back
              </button>
              <button
                onClick={() => { setStep('success'); toast.success('Redemption submitted', { description: `${amountNum} SC → $${usdValue.toFixed(2)} pending review.` }); }}
                className="flex-1 py-3 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #2DC97A, #10B981)', color: '#060E0A' }}
              >
                Confirm redemption
              </button>
            </div>
            <p className="text-[10px] text-center leading-relaxed" style={{ color: '#4A6A55' }}>
              By proceeding, you confirm you&apos;re eligible to redeem under the Sweepstakes Rules and applicable state law.
            </p>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="rounded-2xl p-8 text-center space-y-4"
            style={{ background: '#0F1A14', border: '1px solid rgba(45,201,122,0.3)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'rgba(45,201,122,0.15)', border: '1px solid rgba(45,201,122,0.35)' }}
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Redemption submitted</h3>
              <p className="text-sm" style={{ color: '#8FA899' }}>
                <span className="font-bold" style={{ color: '#2DC97A' }}>{amountNum} SC</span> (${usdValue.toFixed(2)} USD) is pending review.
              </p>
              <p className="text-xs mt-1" style={{ color: '#8FA899' }}>
                Estimated arrival: <span className="font-semibold" style={{ color: '#F5E8C8' }}>{method.time}</span>
              </p>
            </div>
            <div className="flex gap-2 max-w-sm mx-auto">
              <button
                onClick={() => { setStep('select'); setAmount(''); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
              >
                New redemption
              </button>
              <Link
                href="/wallet"
                className="flex-1 py-3 rounded-xl text-sm font-bold text-center transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #F0B232, #FFD166)', color: '#060E0A' }}
              >
                Back to wallet
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[11px] text-center pt-2" style={{ color: '#4A6A55' }}>
        <YalaIcon name="shield" size={10} className="inline mr-1" />
        Sweep Coins redeemable where permitted by law. See{' '}
        <Link href="/sweepstakes-rules" className="underline transition-colors hover:opacity-80" style={{ color: '#8FA899' }}>Sweepstakes Rules</Link>. 18+ only.
      </p>
    </div>
  );
}
