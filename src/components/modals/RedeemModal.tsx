'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { formatSC } from '@/lib/utils';
import { X, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

const REDEMPTION_METHODS = [
  { id: 'paypal', label: 'PayPal', min: 25, time: '1–2 business days', icon: '🅿' },
  { id: 'bank', label: 'Bank Transfer (ACH)', min: 50, time: '3–5 business days', icon: '🏦' },
  { id: 'check', label: 'Check by Mail', min: 100, time: '7–10 business days', icon: '✉' },
];

export function RedeemModal() {
  const { redeemModalOpen, closeRedeemModal } = useUIStore();
  const { sweepCoins } = useWalletStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [method, setMethod] = useState('paypal');
  const [amount, setAmount] = useState('');

  const selectedMethod = REDEMPTION_METHODS.find((m) => m.id === method)!;
  const amountNum = Number(amount) || 0;
  const canRedeem = amountNum >= selectedMethod.min && amountNum <= sweepCoins;

  const handleClose = () => {
    closeRedeemModal();
    setStep('select');
    setAmount('');
    setMethod('paypal');
  };

  if (!redeemModalOpen) return null;

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
          className="relative w-full max-w-md rounded-2xl border border-[#1E1E1E] overflow-hidden z-10"
          style={{ backgroundColor: '#111', maxHeight: '92vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E1E1E]">
            <div>
              <h2 className="font-display text-xl font-bold text-emerald-400">Redeem SC</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">1 SC = $1.00 USD</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-[#9CA3AF]" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Balance */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-0.5">Available SC Balance</p>
                <p className="font-display text-2xl font-bold number-display text-emerald-400">{formatSC(sweepCoins)} SC</p>
              </div>
              <span className="text-3xl opacity-60">◇</span>
            </div>

            {/* AMOE notice */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <AlertCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px]" style={{ color: '#9CA3AF' }}>
                <span className="text-emerald-400 font-semibold">No Purchase Necessary</span>: earn free SC daily.{' '}
                <a href="/sweepstakes-rules" className="underline text-emerald-400/70">Rules</a>
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 'select' && (
                <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Amount */}
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: '#9CA3AF' }}>Amount to Redeem</label>
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
                      <p className="text-xs mt-1 text-emerald-400 number-display">≈ ${amountNum.toFixed(2)} USD</p>
                    )}
                  </div>

                  {/* Method */}
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: '#9CA3AF' }}>Payout Method</label>
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
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{m.icon}</span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#F5E8C8' }}>{m.label}</p>
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>Min {m.min} SC · {m.time}</p>
                            </div>
                          </div>
                          {method === m.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!user?.isVerified && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-400">Identity Verification Required</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>
                          <a href="/kyc" className="underline text-amber-400" onClick={handleClose}>Complete KYC</a> before redeeming
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => user?.isVerified ? setStep('confirm') : undefined}
                    disabled={!canRedeem || !user?.isVerified}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm text-black disabled:opacity-40 transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
                  >
                    {!canRedeem && amountNum > 0 && amountNum < selectedMethod.min
                      ? `Minimum ${selectedMethod.min} SC`
                      : 'Continue →'}
                  </button>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Confirm Redemption</h3>
                  <div className="rounded-xl border divide-y divide-[#1E1E1E] overflow-hidden" style={{ borderColor: '#1E1E1E' }}>
                    {[
                      { label: 'Amount', value: <span className="text-emerald-400 font-bold number-display">{amountNum} SC</span> },
                      { label: 'USD Value', value: <span className="font-bold" style={{ color: '#F5E8C8' }}>${amountNum.toFixed(2)}</span> },
                      { label: 'Method', value: selectedMethod.label },
                      { label: 'Processing', value: selectedMethod.time },
                      { label: 'Fee', value: 'None' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                        <span style={{ color: '#9CA3AF' }}>{label}</span>
                        <span style={{ color: '#F5E8C8' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('select')} className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: '#2a2a2a', color: '#9CA3AF' }}>
                      Back
                    </button>
                    <button
                      onClick={() => setStep('success')}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold text-black"
                      style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
                    >
                      Confirm
                    </button>
                  </div>
                  <p className="text-[10px] text-center" style={{ color: '#9CA3AF' }}>
                    By confirming you agree to the <a href="/sweepstakes-rules" className="underline">Sweepstakes Rules</a> and applicable law.
                  </p>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Redemption Submitted</h3>
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>
                      {amountNum} SC (${amountNum.toFixed(2)} USD) via {selectedMethod.label}.<br />
                      Expected: {selectedMethod.time}.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-black"
                    style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
