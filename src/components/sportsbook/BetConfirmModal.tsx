'use client';

/**
 * BetConfirmModal — explicit confirmation step before stakes leave the wallet.
 * Style is closer to DraftKings/FanDuel than to Stake: review screen with full
 * line summary, big primary CTA, easy cancel.
 *
 * The parent owns placement — this modal just renders the summary, gates the
 * confirm click on "no odds change since you opened" (we don't simulate live
 * odds movement yet, so this is always green; the visual reservation is here
 * for when we do).
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldCheck } from 'lucide-react';
import { useModalA11y } from '@/lib/hooks/useModalA11y';

export interface BetConfirmLeg {
  /** Plain-English label, e.g. "Chiefs ML" or "O 47.5" */
  label: string;
  /** Game context line, e.g. "KC vs PHI · Sun 8:20 PM" */
  gameLabel: string;
  /** American odds, e.g. -110 or +150 */
  odds: number;
}

export interface BetConfirmSummary {
  mode: 'single' | 'parlay';
  legs: BetConfirmLeg[];
  /** Total stake about to be deducted. */
  totalStake: number;
  /** Potential payout if everything hits (includes returned stake). */
  potentialPayout: number;
  /** For parlays — the combined decimal odds. */
  parlayDecimalOdds?: number;
  currency: 'GC' | 'SC';
  balance: number;
}

interface Props {
  open: boolean;
  summary: BetConfirmSummary | null;
  onClose: () => void;
  onConfirm: () => void;
  placing?: boolean;
}

function fmtOdds(odds: number) {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function BetConfirmModal({ open, summary, onClose, onConfirm, placing }: Props) {
  useModalA11y(open, onClose);

  // Auto-close on confirm completion is the parent's job
  useEffect(() => { /* nothing */ }, [open]);

  if (!summary) return null;
  const insufficient = summary.totalStake > summary.balance;
  const profit = summary.potentialPayout - summary.totalStake;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/65"
            style={{ backdropFilter: 'blur(3px)' }}
          />
          {/* Mobile: bottom sheet. Desktop: centered card. */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bet-confirm-title"
            className="fixed left-1/2 z-[80] -translate-x-1/2 w-[440px] max-w-[calc(100vw-1.5rem)] rounded-2xl overflow-hidden shadow-2xl
                       bottom-3 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
            style={{
              background: '#0F1A14',
              border: '1px solid rgba(45,201,122,0.30)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 32px rgba(45,201,122,0.18)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #1A2E22' }}>
              <div>
                <h3 id="bet-confirm-title" className="text-sm font-bold" style={{ color: '#F5E8C8' }}>
                  Confirm your {summary.mode === 'parlay' ? `${summary.legs.length}-leg parlay` : `${summary.legs.length} bet${summary.legs.length === 1 ? '' : 's'}`}
                </h3>
                <p className="text-[10px] mt-0.5" style={{ color: '#8FA899' }}>
                  Review the details. Stake leaves your wallet when you confirm.
                </p>
              </div>
              <button onClick={onClose} aria-label="Cancel" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: '#8FA899' }} />
              </button>
            </div>

            {/* Legs */}
            <div className="max-h-[40vh] overflow-y-auto px-5 py-3 space-y-2">
              {summary.legs.map((leg, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-snug truncate" style={{ color: '#F5E8C8' }}>{leg.label}</p>
                    <p className="text-[11px] truncate" style={{ color: '#8FA899' }}>{leg.gameLabel}</p>
                  </div>
                  <span
                    className="text-sm font-mono font-black flex-shrink-0"
                    style={{ color: leg.odds > 0 ? '#2DC97A' : '#F0B232' }}
                  >
                    {fmtOdds(leg.odds)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary numbers */}
            <div className="px-5 py-3 space-y-1.5" style={{ borderTop: '1px solid #1A2E22', background: '#0A1410' }}>
              {summary.mode === 'parlay' && summary.parlayDecimalOdds && (
                <Row label="Parlay odds" value={`${summary.parlayDecimalOdds.toFixed(2)}× (${fmtOdds(Math.round((summary.parlayDecimalOdds - 1) * 100))})`} />
              )}
              <Row label="Total stake"      value={`${summary.totalStake.toFixed(2)} ${summary.currency}`} />
              <Row label="To win"           value={`${profit.toFixed(2)} ${summary.currency}`} highlight />
              <Row label="Total payout"     value={`${summary.potentialPayout.toFixed(2)} ${summary.currency}`} />
              <Row label="Balance after"    value={`${(summary.balance - summary.totalStake).toFixed(2)} ${summary.currency}`} dim />
            </div>

            {/* Odds-lock indicator (placeholder for when we have live odds) */}
            <div className="px-5 py-2 flex items-center gap-2" style={{ borderTop: '1px solid #1A2E22' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#2DC97A' }} />
              <p className="text-[10px]" style={{ color: '#8FA899' }}>
                Odds locked at the values shown. No changes since you opened the slip.
              </p>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 pt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={placing}
                className="col-span-1 py-3 rounded-xl text-sm font-bold transition-colors hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={placing || insufficient}
                className="col-span-2 py-3 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
                  color: '#060E0A',
                  boxShadow: '0 6px 24px rgba(45,201,122,0.40)',
                }}
              >
                {placing
                  ? 'Placing…'
                  : insufficient
                    ? `Need ${(summary.totalStake - summary.balance).toFixed(2)} more ${summary.currency}`
                    : <><Check className="w-4 h-4" /> Confirm · {summary.totalStake.toFixed(2)} {summary.currency}</>
                }
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, highlight, dim }: { label: string; value: string; highlight?: boolean; dim?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span style={{ color: dim ? '#4A6A55' : '#8FA899' }}>{label}</span>
      <span
        className="font-mono font-black"
        style={{
          color: highlight ? '#2DC97A' : dim ? '#8FA899' : '#F5E8C8',
          fontSize: highlight ? '14px' : '12px',
        }}
      >
        {value}
      </span>
    </div>
  );
}
