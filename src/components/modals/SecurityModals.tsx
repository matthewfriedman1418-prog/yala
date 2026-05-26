'use client';

/**
 * Security flow modals — three separate modals that live next to each other
 * in one file because they share styles and are small individually:
 *
 *   TwoFactorSetupModal  — show a QR + 6-digit verify, mock the enrollment
 *   PasswordChangeModal  — current + new + confirm, with strength meter
 *   EmailVerifyModal     — banner-style modal that "we sent a link" + resend
 *
 * All three are launched from /settings. They mock the real backend flow so
 * the UX is feel-real but no real secrets / tokens are involved.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Mail, KeyRound, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useModalA11y } from '@/lib/hooks/useModalA11y';

// ─── 2FA SETUP ───────────────────────────────────────────────────────────

const MOCK_TOTP_SECRET = 'JBSWY3DPEHPK3PXPYBQ7YA4FZ';
const MOCK_BACKUP_CODES = [
  'a7b4-92cd', 'e1f9-44a8', 'c5d2-7e3b', '8a16-bb09', 'f3c7-1d52',
  '4ed8-9a6c', '1b2f-cc7a', 'd9e4-5083', '7a3c-fe19', '6c8b-2af5',
];

function ShellHeader({ icon, title, onClose }: { icon: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #1A2238' }}>
      <div className="flex items-center gap-2">{icon}<h3 className="text-sm font-bold" style={{ color: '#F5E8C8' }}>{title}</h3></div>
      <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
        <X className="w-4 h-4" style={{ color: '#8FA3B8' }} />
      </button>
    </div>
  );
}

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
}

function ModalShell({ open, onClose, children, accent = '#F0B232' }: BaseModalProps & { children: React.ReactNode; accent?: string }) {
  useModalA11y(open, onClose);
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
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] w-[420px] max-w-[calc(100vw-1.5rem)] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: '#0F1828',
              border: `1px solid ${accent}40`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.65), 0 0 28px ${accent}1F`,
            }}
            role="dialog"
            aria-modal="true"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function TwoFactorSetupModal({
  open, onClose, onConfirm,
}: BaseModalProps & { onConfirm: () => void }) {
  const [step, setStep]   = useState<'scan' | 'verify' | 'codes'>('scan');
  const [digits, setDigits] = useState('');
  const [error, setError]   = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (open) { setStep('scan'); setDigits(''); setError(''); setCopiedSecret(false); }
  }, [open]);

  const handleVerify = () => {
    if (!/^\d{6}$/.test(digits)) {
      setError('Enter the 6-digit code from your authenticator');
      return;
    }
    setError('');
    setStep('codes');
  };

  return (
    <ModalShell open={open} onClose={onClose} accent="#F0B232">
      <ShellHeader icon={<ShieldCheck className="w-4 h-4" style={{ color: '#F0B232' }} />} title="Set up two-factor" onClose={onClose} />

      {step === 'scan' && (
        <div className="p-5 space-y-3">
          <p className="text-[12px] leading-relaxed" style={{ color: '#8FA3B8' }}>
            Scan this code with an authenticator app (Authy, 1Password, Google Authenticator). Then enter the 6-digit code below to confirm.
          </p>
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#08121C', border: '1px solid #1A2238' }}>
            {/* Mock QR placeholder — clean grid */}
            <div
              className="w-32 h-32 rounded-lg flex-shrink-0 grid grid-cols-8 grid-rows-8 gap-0"
              style={{ background: '#F5E8C8', border: '1px solid #1A2238' }}
              aria-label="Mock QR code"
            >
              {Array.from({ length: 64 }).map((_, i) => {
                // Deterministic pseudo-random pattern that looks QR-like
                const on = (i * 37 + 7) % 5 < 2 || i < 8 || i > 55 || i % 8 === 0 || i % 8 === 7;
                return <div key={i} style={{ background: on ? '#040814' : 'transparent' }} />;
              })}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: '#8FA3B8' }}>Can&apos;t scan?</p>
              <p className="text-[10px] mb-1.5" style={{ color: '#8FA3B8' }}>Enter this secret manually:</p>
              <div className="flex items-center gap-1.5">
                <code
                  className="font-mono text-[11px] font-bold px-2 py-1 rounded break-all"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#F0B232', border: '1px solid #1A2238' }}
                >
                  {MOCK_TOTP_SECRET}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(MOCK_TOTP_SECRET).then(() => {
                      setCopiedSecret(true);
                      setTimeout(() => setCopiedSecret(false), 1500);
                    });
                  }}
                  aria-label="Copy secret"
                  className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                >
                  {copiedSecret ? <Check className="w-3 h-3" style={{ color: '#2DC97A' }} /> : <Copy className="w-3 h-3" style={{ color: '#8FA3B8' }} />}
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep('verify')}
            className="w-full py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #F0B232, #FFD166)', color: '#040814' }}
          >
            Next — verify code
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="p-5 space-y-3">
          <p className="text-[12px] leading-relaxed" style={{ color: '#8FA3B8' }}>
            Enter the 6-digit code your authenticator app is showing right now.
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={6}
            value={digits}
            onChange={(e) => { setDigits(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
            placeholder="123456"
            autoFocus
            className="w-full px-4 py-4 rounded-xl text-2xl font-mono font-black text-center tracking-[0.6em] focus:outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${error ? '#EF4444' : '#1A2238'}`,
              color: '#F5E8C8',
            }}
          />
          {error && (
            <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#EF4444' }}>
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStep('scan')}
              className="py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#8FA3B8' }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #F0B232, #FFD166)', color: '#040814' }}
            >
              Verify &amp; enable
            </button>
          </div>
        </div>
      )}

      {step === 'codes' && (
        <div className="p-5 space-y-3">
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(45,201,122,0.10)', border: '1px solid rgba(45,201,122,0.30)' }}
          >
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2DC97A' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#2DC97A' }}>Two-factor is on</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#8FA3B8' }}>Save these backup codes somewhere safe. Each works once if you lose your phone.</p>
            </div>
          </div>
          <div className="rounded-xl p-3 grid grid-cols-2 gap-1.5" style={{ background: '#08121C', border: '1px solid #1A2238' }}>
            {MOCK_BACKUP_CODES.map((c, i) => (
              <code key={i} className="font-mono text-[12px] font-bold text-center py-1.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#F5E8C8' }}>
                {c}
              </code>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(MOCK_BACKUP_CODES.join('\n')).then(() => toast.success('Backup codes copied'));
            }}
            className="w-full py-2 rounded-lg text-xs font-bold transition-colors hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#F5E8C8' }}
          >
            <Copy className="w-3 h-3 inline mr-1.5" />
            Copy all to clipboard
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className="w-full py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814', boxShadow: '0 4px 16px rgba(45,201,122,0.30)' }}
          >
            Done
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ─── PASSWORD CHANGE ─────────────────────────────────────────────────────

export function PasswordChangeModal({ open, onClose }: BaseModalProps) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) { setForm({ current: '', next: '', confirm: '' }); setError(''); setSubmitting(false); }
  }, [open]);

  const strength = useMemo(() => {
    const p = form.next;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  }, [form.next]);
  const strengthLabel = ['none', 'weak', 'fair', 'strong', 'great'][strength];
  const strengthColor = ['#4A5878', '#EF4444', '#F59E0B', '#34D399', '#2DC97A'][strength];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current) { setError('Enter your current password'); return; }
    if (form.next.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (strength < 2)  { setError('Pick a stronger password (mix of cases + numbers)'); return; }
    if (form.next !== form.confirm) { setError('New password and confirmation don\'t match'); return; }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Password changed', { description: 'Your other sessions have been signed out for security.' });
      onClose();
    }, 700);
  };

  return (
    <ModalShell open={open} onClose={onClose} accent="#F0B232">
      <ShellHeader icon={<KeyRound className="w-4 h-4" style={{ color: '#F0B232' }} />} title="Change password" onClose={onClose} />
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <PassField
          label="Current password"
          value={form.current}
          show={show.current}
          onShow={() => setShow((s) => ({ ...s, current: !s.current }))}
          onChange={(v) => setForm((f) => ({ ...f, current: v }))}
          autoFocus
        />
        <PassField
          label="New password"
          value={form.next}
          show={show.next}
          onShow={() => setShow((s) => ({ ...s, next: !s.next }))}
          onChange={(v) => setForm((f) => ({ ...f, next: v }))}
        />
        {form.next && (
          <div>
            <div className="grid grid-cols-4 gap-0.5 mb-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1 rounded-full"
                  style={{ background: i <= strength ? strengthColor : '#1A2238' }}
                />
              ))}
            </div>
            <p className="text-[10px]" style={{ color: strengthColor }}>{strengthLabel}</p>
          </div>
        )}
        <PassField
          label="Confirm new password"
          value={form.confirm}
          show={show.next}
          onShow={() => setShow((s) => ({ ...s, next: !s.next }))}
          onChange={(v) => setForm((f) => ({ ...f, confirm: v }))}
        />
        {error && (
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#EF4444' }}>
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
        <p className="text-[10px]" style={{ color: '#4A5878' }}>
          Your other sessions will be signed out after a successful change.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #F0B232, #FFD166)', color: '#040814' }}
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </ModalShell>
  );
}

function PassField({
  label, value, show, onShow, onChange, autoFocus,
}: {
  label: string;
  value: string;
  show: boolean;
  onShow: () => void;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8FA3B8' }}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          autoComplete={label.toLowerCase().includes('current') ? 'current-password' : 'new-password'}
          className="w-full pl-3 pr-10 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#F5E8C8' }}
        />
        <button
          type="button"
          onClick={onShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/5"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" style={{ color: '#8FA3B8' }} /> : <Eye className="w-3.5 h-3.5" style={{ color: '#8FA3B8' }} />}
        </button>
      </div>
    </div>
  );
}

// ─── EMAIL VERIFY ─────────────────────────────────────────────────────

export function EmailVerifyModal({ open, onClose, email }: BaseModalProps & { email?: string }) {
  const [resentAt, setResentAt] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!resentAt) return;
    const tick = () => {
      const elapsed = Date.now() - resentAt;
      const remaining = Math.max(0, Math.ceil((60_000 - elapsed) / 1000));
      setCooldown(remaining);
      if (remaining === 0) setResentAt(null);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [resentAt]);

  const handleResend = () => {
    setResentAt(Date.now());
    toast.success('Verification email re-sent', { description: 'Check your inbox (and spam folder).' });
  };

  return (
    <ModalShell open={open} onClose={onClose} accent="#60A5FA">
      <ShellHeader icon={<Mail className="w-4 h-4" style={{ color: '#60A5FA' }} />} title="Verify your email" onClose={onClose} />
      <div className="p-5 text-center space-y-3">
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.30)' }}
        >
          <Mail className="w-7 h-7" style={{ color: '#60A5FA' }} />
        </div>
        <div>
          <p className="font-bold text-base" style={{ color: '#F5E8C8' }}>Check your inbox</p>
          <p className="text-[12px] mt-1" style={{ color: '#8FA3B8' }}>
            We sent a verification link to{' '}
            <span className="font-bold" style={{ color: '#F5E8C8' }}>{email || 'your email'}</span>.
            Click the link to confirm — it expires in 24 hours.
          </p>
        </div>
        <p className="text-[10px] leading-relaxed" style={{ color: '#4A5878' }}>
          Verifying lets us send withdrawal alerts and recover your account if you forget your password.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#8FA3B8' }}
          >
            Later
          </button>
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={handleResend}
            className="py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #60A5FA, #818CF8)', color: '#040814' }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
