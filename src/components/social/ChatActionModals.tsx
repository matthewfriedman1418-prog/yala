'use client';

/**
 * TipModal + RainModal — chat actions launched from the profile popover (Tip)
 * and the chat input row (Rain).
 *
 * These DO deduct from the wallet store so the user feels real consequences,
 * but they DO NOT have any cross-user effect (no one else sees the tip; the
 * "received tip" toast on the recipient side won't happen until real chat
 * backend lands). For the demo this is plenty — the action feels real because
 * your balance drops and a tip/rain row appears in chat.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, CloudRain, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { GoldCoinIcon, SweepCoinIcon } from '@/components/ui/YalaIcon';
import { YalaAvatar } from '@/components/ui/YalaAvatar';
import { formatGC, getVIPColor } from '@/lib/utils';
import { useModalA11y } from '@/lib/hooks/useModalA11y';

// ─── TipModal ─────────────────────────────────────────────────────────────
interface TipTarget {
  userId: string;
  username: string;
  avatar: string;
  vipTier: number;
}

interface TipModalProps {
  open: boolean;
  target: TipTarget | null;
  onClose: () => void;
  onSend: (amount: number, currency: 'GC' | 'SC') => void;
}

const TIP_QUICK = [50, 100, 250, 500, 1000, 5000];
const MIN_TIP   = 10;

export function TipModal({ open, target, onClose, onSend }: TipModalProps) {
  const { goldCoins, sweepCoins, addGC, addSC, activeCurrency } = useWalletStore();
  const [currency, setCurrency] = useState<'GC' | 'SC'>(activeCurrency);
  const [amount, setAmount] = useState<string>('100');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useModalA11y(open, onClose);

  useEffect(() => {
    if (open) {
      setCurrency(activeCurrency);
      setAmount('100');
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, activeCurrency]);

  if (!target) return null;
  const isGC      = currency === 'GC';
  const accent    = isGC ? '#F0B232' : '#2DC97A';
  const balance   = isGC ? goldCoins : sweepCoins;
  const value     = parseFloat(amount) || 0;
  const tooLow    = value > 0 && value < (isGC ? MIN_TIP : 0.1);
  const tooHigh   = value > balance;
  const canSend   = value > 0 && !tooLow && !tooHigh && !sending;
  const tierColor = getVIPColor(target.vipTier);

  const send = () => {
    if (!canSend) return;
    setSending(true);
    if (isGC) addGC(-value); else addSC(-value);
    // micro-delay so the spinner shows for a beat
    setTimeout(() => {
      onSend(value, currency);
      toast.success(`Tipped ${target.username}`, {
        description: `${value.toFixed(2)} ${currency} sent. They'll see your tip in chat.`,
      });
      onClose();
    }, 350);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/55"
            style={{ backdropFilter: 'blur(2px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tip-modal-title"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: '#0F1828',
              border: `1px solid ${accent}40`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.65), 0 0 32px ${accent}1F`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1A2238' }}>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" style={{ color: accent }} />
                <h3 id="tip-modal-title" className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Send a tip</h3>
              </div>
              <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: '#8FA3B8' }} />
              </button>
            </div>

            {/* Recipient */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: `${tierColor}08`, borderBottom: '1px solid #1A2238' }}>
              <YalaAvatar initials={target.avatar} tier={target.vipTier} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate" style={{ color: tierColor }}>{target.username}</p>
                <p className="text-[10px]" style={{ color: '#8FA3B8' }}>Tier {target.vipTier}</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 py-4 space-y-3">
              {/* Currency segmented */}
              <div className="flex rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2238' }}>
                {(['GC', 'SC'] as const).map((c) => {
                  const active = currency === c;
                  const cAccent = c === 'GC' ? '#F0B232' : '#2DC97A';
                  return (
                    <button
                      key={c} type="button" onClick={() => setCurrency(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-colors"
                      style={{
                        background: active ? `${cAccent}14` : 'transparent',
                        color:      active ? cAccent : '#8FA3B8',
                      }}
                    >
                      {c === 'GC' ? <GoldCoinIcon size={12} /> : <SweepCoinIcon size={12} />}
                      {c}
                    </button>
                  );
                })}
              </div>

              {/* Amount input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA3B8' }}>Amount</label>
                  <span className="text-[10px] font-mono" style={{ color: '#4A5878' }}>
                    Balance: {isGC ? formatGC(balance) : balance.toFixed(2)} {currency}
                  </span>
                </div>
                <input
                  ref={inputRef}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={isGC ? MIN_TIP : 0.1}
                  step={isGC ? 1 : 0.1}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tooLow || tooHigh ? '#EF4444' : '#1A2238'}`,
                    color: '#F5E8C8',
                  }}
                  onFocus={(e) => { if (!tooLow && !tooHigh) e.currentTarget.style.borderColor = `${accent}66`; }}
                  onBlur={(e) => { if (!tooLow && !tooHigh) e.currentTarget.style.borderColor = '#1A2238'; }}
                />
                {tooLow && (
                  <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>
                    Minimum tip is {isGC ? MIN_TIP : 0.1} {currency}
                  </p>
                )}
                {tooHigh && (
                  <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>
                    Insufficient {currency} balance
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div className="flex flex-wrap gap-1.5">
                {TIP_QUICK.map((v) => {
                  const adj = isGC ? v : +(v / 100).toFixed(2);
                  return (
                    <button
                      key={v} type="button" onClick={() => setAmount(String(adj))}
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors"
                      style={{
                        background: parseFloat(amount) === adj ? `${accent}1A` : 'rgba(255,255,255,0.03)',
                        color:      parseFloat(amount) === adj ? accent : '#8FA3B8',
                        border:     `1px solid ${parseFloat(amount) === adj ? `${accent}44` : '#1A2238'}`,
                      }}
                    >
                      {isGC ? v : adj}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${isGC ? '#FFD166' : '#34D399'})`,
                  color: '#040814',
                  boxShadow: `0 4px 16px ${accent}40`,
                }}
              >
                {sending ? 'Sending…' : value > 0 ? `Tip ${value.toFixed(2)} ${currency}` : 'Enter an amount'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── RainModal ────────────────────────────────────────────────────────────
interface RainModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with (amount, currency, recipientCount) when rain is sent. */
  onSend: (amount: number, currency: 'GC' | 'SC', count: number) => void;
}

const RAIN_QUICK    = [500, 1_000, 5_000, 10_000, 25_000];
const MIN_RAIN_GC   = 100;
const MIN_RAIN_SC   = 1;
const COUNT_OPTIONS = [5, 10, 25, 50];

const VIP_RAIN_GATE = 4;

export function RainModal({ open, onClose, onSend }: RainModalProps) {
  const { goldCoins, sweepCoins, addGC, addSC, activeCurrency } = useWalletStore();
  const { user } = useAuthStore();
  const [currency, setCurrency] = useState<'GC' | 'SC'>(activeCurrency);
  const [amount, setAmount] = useState<string>('1000');
  const [count, setCount] = useState<number>(10);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useModalA11y(open, onClose);

  useEffect(() => {
    if (open) {
      setCurrency(activeCurrency);
      setAmount('1000');
      setCount(10);
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, activeCurrency]);

  const userTier = user?.vipTier ?? 0;
  const gated    = userTier < VIP_RAIN_GATE;
  const isGC     = currency === 'GC';
  const accent   = '#60A5FA';   // rain blue — distinct from tip GC gold
  const balance  = isGC ? goldCoins : sweepCoins;
  const value    = parseFloat(amount) || 0;
  const minRain  = isGC ? MIN_RAIN_GC : MIN_RAIN_SC;
  const tooLow   = value > 0 && value < minRain;
  const tooHigh  = value > balance;
  const perPerson = count > 0 ? value / count : 0;
  const canSend  = !gated && value > 0 && !tooLow && !tooHigh && !sending;

  const send = () => {
    if (!canSend) return;
    setSending(true);
    if (isGC) addGC(-value); else addSC(-value);
    setTimeout(() => {
      onSend(value, currency, count);
      toast.success('Rain! 🌧️', {
        description: `${value.toFixed(2)} ${currency} split across ${count} active chatters.`,
      });
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/55"
            style={{ backdropFilter: 'blur(2px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rain-modal-title"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: '#0F1828',
              border: `1px solid ${accent}44`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.65), 0 0 32px ${accent}1F`,
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1A2238' }}>
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4" style={{ color: accent }} />
                <h3 id="rain-modal-title" className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Make it rain</h3>
              </div>
              <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: '#8FA3B8' }} />
              </button>
            </div>

            {/* Gating notice */}
            {gated && (
              <div
                className="flex items-start gap-2 mx-4 mt-3 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(240,178,50,0.10)', border: '1px solid rgba(240,178,50,0.30)' }}
              >
                <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#F0B232' }} />
                <p className="text-[11px]" style={{ color: '#F5E8C8' }}>
                  Rain is unlocked at <span className="font-bold">VIP Tier {VIP_RAIN_GATE}</span>. You&apos;re currently Tier {userTier}.
                </p>
              </div>
            )}

            <div className="px-4 py-4 space-y-3">
              <div className="flex rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2238' }}>
                {(['GC', 'SC'] as const).map((c) => {
                  const active = currency === c;
                  const cAccent = c === 'GC' ? '#F0B232' : '#2DC97A';
                  return (
                    <button
                      key={c} type="button" disabled={gated} onClick={() => setCurrency(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-40"
                      style={{
                        background: active ? `${cAccent}14` : 'transparent',
                        color:      active ? cAccent : '#8FA3B8',
                      }}
                    >
                      {c === 'GC' ? <GoldCoinIcon size={12} /> : <SweepCoinIcon size={12} />}
                      {c}
                    </button>
                  );
                })}
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA3B8' }}>Total amount</label>
                  <span className="text-[10px] font-mono" style={{ color: '#4A5878' }}>
                    Balance: {isGC ? formatGC(balance) : balance.toFixed(2)} {currency}
                  </span>
                </div>
                <input
                  ref={inputRef}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={gated}
                  min={minRain}
                  step={isGC ? 100 : 1}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none transition-colors disabled:opacity-40"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tooLow || tooHigh ? '#EF4444' : '#1A2238'}`,
                    color: '#F5E8C8',
                  }}
                  onFocus={(e) => { if (!tooLow && !tooHigh) e.currentTarget.style.borderColor = `${accent}66`; }}
                  onBlur={(e) => { if (!tooLow && !tooHigh) e.currentTarget.style.borderColor = '#1A2238'; }}
                />
                {tooLow  && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>Minimum rain is {minRain} {currency}</p>}
                {tooHigh && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>Insufficient {currency} balance</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {RAIN_QUICK.map((v) => {
                    const adj = isGC ? v : +(v / 100).toFixed(2);
                    return (
                      <button
                        key={v} type="button" disabled={gated} onClick={() => setAmount(String(adj))}
                        className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors disabled:opacity-40"
                        style={{
                          background: parseFloat(amount) === adj ? `${accent}1A` : 'rgba(255,255,255,0.03)',
                          color:      parseFloat(amount) === adj ? accent : '#8FA3B8',
                          border:     `1px solid ${parseFloat(amount) === adj ? `${accent}44` : '#1A2238'}`,
                        }}
                      >
                        {isGC ? v.toLocaleString() : adj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#8FA3B8' }}>
                  Split across
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {COUNT_OPTIONS.map((c) => {
                    const active = count === c;
                    return (
                      <button
                        key={c} type="button" disabled={gated} onClick={() => setCount(c)}
                        className="py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-40"
                        style={{
                          background: active ? `${accent}1A` : 'rgba(255,255,255,0.03)',
                          color:      active ? accent : '#8FA3B8',
                          border:     `1px solid ${active ? `${accent}44` : '#1A2238'}`,
                        }}
                      >
                        {c} <span className="text-[9px] font-normal">users</span>
                      </button>
                    );
                  })}
                </div>
                {!gated && perPerson > 0 && (
                  <p className="text-[10px] mt-2 text-center" style={{ color: '#8FA3B8' }}>
                    ≈ <span className="font-mono font-bold" style={{ color: accent }}>{perPerson.toFixed(2)} {currency}</span> per recipient
                  </p>
                )}
              </div>
            </div>

            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${accent}, #818CF8)`,
                  color: '#040814',
                  boxShadow: `0 4px 16px ${accent}40`,
                }}
              >
                <CloudRain className="w-4 h-4" />
                {gated ? 'VIP only' : sending ? 'Raining…' : value > 0 ? `Rain ${value.toFixed(2)} ${currency}` : 'Enter an amount'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
