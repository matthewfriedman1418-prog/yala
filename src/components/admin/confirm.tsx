'use client';
// Promise-based confirm dialog. Call `confirm({...})` from anywhere; a single
// <ConfirmHost/> (mounted in AdminShell) renders it. Enforces a typed reason on
// destructive/financial actions, and supports a dual-control "second approver"
// note for money actions above threshold.
import { create } from 'zustand';
import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** Require the operator to type/select a reason before confirming. */
  requireReason?: boolean;
  reasonOptions?: string[];
  /** Show a "second approver required" notice (dual control). */
  dualControl?: boolean;
}
export interface ConfirmResult { confirmed: boolean; reason?: string; }

interface ConfirmState {
  open: boolean;
  opts: ConfirmOptions | null;
  resolve: ((r: ConfirmResult) => void) | null;
  request: (opts: ConfirmOptions) => Promise<ConfirmResult>;
  close: (r: ConfirmResult) => void;
}

const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  opts: null,
  resolve: null,
  request: (opts) =>
    new Promise<ConfirmResult>((resolve) => set({ open: true, opts, resolve })),
  close: (r) => {
    get().resolve?.(r);
    set({ open: false, opts: null, resolve: null });
  },
}));

/** Imperative API — `const r = await confirm({...}); if (!r.confirmed) return;` */
export function confirm(opts: ConfirmOptions): Promise<ConfirmResult> {
  return useConfirmStore.getState().request(opts);
}

export function ConfirmHost() {
  const { open, opts, close } = useConfirmStore();
  const [reason, setReason] = useState('');

  // Reset reason on each close path (avoids set-state-in-effect).
  const dismiss = (r: ConfirmResult) => { setReason(''); close(r); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) dismiss({ confirmed: false }); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !opts) return null;
  const reasons = opts.reasonOptions ?? ['Goodwill', 'Correction', 'Policy / compliance', 'Fraud / risk', 'Other'];
  const needReason = opts.requireReason && !reason;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => dismiss({ confirmed: false })} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#1A2E22] bg-[#0A140F] animate-bounce-in p-5">
        <div className="flex items-start gap-3">
          <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', opts.danger ? 'bg-red-500/12 text-red-400' : 'bg-[var(--accent)]/15 text-[var(--accent)]')}>
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-[#F5E8C8]">{opts.title}</h3>
            {opts.message && <p className="text-sm text-[#8FA899] mt-1">{opts.message}</p>}
          </div>
        </div>

        {opts.dualControl && (
          <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Dual control: this will be queued for a second approver before it executes.
          </div>
        )}

        {opts.requireReason && (
          <div className="mt-4">
            <label className="text-xs font-semibold text-[#8FA899] uppercase tracking-wide">Reason (required)</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5 w-full px-3 py-2 rounded-lg bg-[#0C1812] border border-[#1A2E22] text-sm text-[#F5E8C8] focus:outline-none focus:border-[var(--accent)]">
              <option value="">Select a reason…</option>
              {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={() => dismiss({ confirmed: false })} className="flex-1 py-2 rounded-lg text-sm font-semibold border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5">
            {opts.cancelLabel ?? 'Cancel'}
          </button>
          <button
            autoFocus
            onClick={() => dismiss({ confirmed: true, reason: reason || undefined })}
            disabled={needReason}
            className={cn('flex-1 py-2 rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed',
              opts.danger ? 'bg-red-500/90 text-white hover:bg-red-500' : 'bg-[var(--accent)] text-[#060E0A] hover:brightness-110')}
          >
            {opts.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
