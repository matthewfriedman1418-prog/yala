'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatSC } from '@/lib/utils';
import { ArrowUpRight, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

const REDEMPTION_METHODS = [
  { id: 'bank', label: 'Bank Transfer (ACH)', min: 50, fee: 0, time: '3-5 business days' },
  { id: 'check', label: 'Check by Mail', min: 100, fee: 0, time: '7-10 business days' },
  { id: 'paypal', label: 'PayPal', min: 25, fee: 0, time: '1-2 business days' },
];

export default function RedeemPage() {
  const { sweepCoins } = useWalletStore();
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [step, setStep] = useState<'select' | 'kyc' | 'confirm' | 'success'>('select');
  const [method, setMethod] = useState('paypal');
  const [amount, setAmount] = useState('');

  const selectedMethod = REDEMPTION_METHODS.find((m) => m.id === method)!;
  const amountNum = Number(amount) || 0;
  const canRedeem = amountNum >= selectedMethod.min && amountNum <= sweepCoins;

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Redeem</span>
        </div>
        <h1 className="font-display text-3xl font-bold" style={{ color: '#F5E8C8' }}>Redeem Sweep Coins</h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Sweep Coins can be redeemed for cash prizes where permitted by applicable law.</p>
      </div>

      {/* Balance */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9CA3AF' }}>Available SC Balance</p>
          <p className="font-display text-3xl font-bold number-display text-emerald-400">{formatSC(sweepCoins)} SC</p>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>◇</div>
      </div>

      {/* No purchase necessary */}
      <div className="px-4 py-3 rounded-xl flex items-start gap-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-400">No Purchase Necessary</p>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>You can earn free Sweep Coins daily without making any purchase. See <a href="/sweepstakes-rules" className="underline">Sweepstakes Rules</a> for details.</p>
        </div>
      </div>

      {step === 'select' && (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Redemption Details</h3>

          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: '#9CA3AF' }}>SC Amount to Redeem</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={selectedMethod.min}
              max={sweepCoins}
              step="0.01"
              placeholder={`Min ${selectedMethod.min} SC`}
              className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-emerald-400/50 transition-colors number-display"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
            />
            {amountNum > 0 && (
              <p className="text-xs mt-1 text-emerald-400">≈ ${(amountNum * 1.00).toFixed(2)} USD (1 SC = $1.00)</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: '#9CA3AF' }}>Redemption Method</label>
            <div className="space-y-2">
              {REDEMPTION_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: method === m.id ? 'rgba(16,185,129,0.5)' : '#2a2a2a',
                    background: method === m.id ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#F5E8C8' }}>{m.label}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Min {m.min} SC · {m.time}</p>
                  </div>
                  {method === m.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {isLoggedIn ? (
            <>
              {!user?.isVerified && (
                <div className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-400">KYC Required</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>You must complete identity verification before redeeming. <a href="/kyc" className="underline text-amber-400">Verify now</a></p>
                  </div>
                </div>
              )}
              <button
                onClick={() => user?.isVerified ? setStep('confirm') : window.location.href = '/kyc'}
                disabled={!canRedeem}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-black disabled:opacity-40 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
              >
                {!canRedeem && amountNum > 0 && amountNum < selectedMethod.min
                  ? `Minimum ${selectedMethod.min} SC`
                  : 'Continue to Redeem'}
              </button>
            </>
          ) : (
            <button onClick={() => openAuthModal()} className="w-full py-3.5 rounded-xl font-semibold text-sm text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>
              Login to Redeem
            </button>
          )}
        </div>
      )}

      {step === 'confirm' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
          <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Confirm Redemption</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Amount</span><span className="font-bold text-emerald-400 number-display">{amountNum} SC</span></div>
            <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>USD Value</span><span className="font-bold" style={{ color: '#F5E8C8' }}>${(amountNum * 1.00).toFixed(2)}</span></div>
            <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Method</span><span style={{ color: '#F5E8C8' }}>{selectedMethod.label}</span></div>
            <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Processing Time</span><span style={{ color: '#F5E8C8' }}>{selectedMethod.time}</span></div>
            <div className="flex justify-between"><span style={{ color: '#9CA3AF' }}>Fee</span><span style={{ color: '#F5E8C8' }}>None</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('select')} className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: '#2a2a2a', color: '#9CA3AF' }}>Back</button>
            <button onClick={() => setStep('success')} className="flex-1 py-3 rounded-xl text-sm font-semibold text-black" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>Confirm Redemption</button>
          </div>
          <p className="text-[10px] text-center" style={{ color: '#9CA3AF' }}>By proceeding, you confirm you are eligible to redeem under the Sweepstakes Rules and applicable state law.</p>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Redemption Submitted</h3>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Your redemption of {amountNum} SC (${(amountNum * 1.00).toFixed(2)} USD) has been submitted and is pending review. Processing time: {selectedMethod.time}.</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>You will receive a confirmation email at your registered address.</p>
          <button onClick={() => { setStep('select'); setAmount(''); }} className="w-full py-3 rounded-xl text-sm font-semibold text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>Done</button>
        </motion.div>
      )}

      <div className="text-center">
        <p className="text-xs text-[#9CA3AF]/60">Sweep Coins redeemable where permitted by law. See <a href="/sweepstakes-rules" className="underline">Sweepstakes Rules</a>. 18+ only. Void where prohibited.</p>
      </div>
    </div>
  );
}
