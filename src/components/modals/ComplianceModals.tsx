'use client';

/**
 * Compliance flow modals:
 *
 *   SelfExclusionModal — multi-step self-exclusion picker with explicit
 *     "type EXCLUDE to confirm" pattern for the permanent option. Once a
 *     permanent self-exclusion is set the user can't un-set it without
 *     contacting support — server-enforced in production.
 *
 *   TaxFormW9Modal — mock W-9 collection. Required before SC redemption
 *     once cumulative SC winnings exceed $600/year. Real form goes to a
 *     vendor like Avalara / TaxBandits in production.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ban, AlertTriangle, Clock, FileText, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useModalA11y } from '@/lib/hooks/useModalA11y';

// ─── Shell ───────────────────────────────────────────────────────────────

function ModalShell({
  open, onClose, accent = '#EF4444', children,
}: {
  open: boolean;
  onClose: () => void;
  accent?: string;
  children: React.ReactNode;
}) {
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] w-[460px] max-w-[calc(100vw-1.5rem)] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: '#0F1A14',
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

function ShellHeader({ icon, title, accent, onClose }: { icon: React.ReactNode; title: string; accent: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #1A2E22' }}>
      <div className="flex items-center gap-2">
        <span style={{ color: accent }}>{icon}</span>
        <h3 className="text-sm font-bold" style={{ color: '#F5E8C8' }}>{title}</h3>
      </div>
      <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
        <X className="w-4 h-4" style={{ color: '#8FA899' }} />
      </button>
    </div>
  );
}

// ─── SELF-EXCLUSION ──────────────────────────────────────────────────────

type ExclusionLength = '24h' | '7d' | '30d' | '6m' | '1y' | '5y';
// 5 years is the regulated-gaming long-term self-exclusion standard (NJ / NV).
// We follow the same ladder. Truly permanent closure is handled via support
// rather than as an option in the picker — it requires identity confirmation.
const EXCLUSION_OPTIONS: { id: ExclusionLength; label: string; sub: string; longTerm?: boolean }[] = [
  { id: '24h', label: '24 hours', sub: 'Quick break · ends automatically' },
  { id: '7d',  label: '7 days',   sub: 'Recommended if you need space' },
  { id: '30d', label: '30 days',  sub: 'Longer cool-off · ends automatically' },
  { id: '6m',  label: '6 months', sub: 'Extended exclusion · requires support to reverse' },
  { id: '1y',  label: '1 year',   sub: 'Long-term · cannot be reversed early', longTerm: true },
  { id: '5y',  label: '5 years',  sub: 'Industry-standard long-term exclusion · cannot be reversed early', longTerm: true },
];

export function SelfExclusionModal({
  open, onClose, onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen length once the user has confirmed. */
  onConfirm: (length: ExclusionLength) => void;
}) {
  const [selected, setSelected] = useState<ExclusionLength | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'choose' | 'confirm'>('choose');

  useEffect(() => {
    if (open) { setSelected(null); setConfirmText(''); setStep('choose'); }
  }, [open]);

  const isLongTerm = selected === '1y' || selected === '5y';
  const canConfirm = step === 'confirm' && selected && (!isLongTerm || confirmText.trim().toUpperCase() === 'EXCLUDE');

  const handleNext = () => {
    if (!selected) return;
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!canConfirm || !selected) return;
    onConfirm(selected);
    onClose();
  };

  return (
    <ModalShell open={open} onClose={onClose} accent="#EF4444">
      <ShellHeader icon={<Ban className="w-4 h-4" />} title="Self-Exclusion" accent="#EF4444" onClose={onClose} />

      {step === 'choose' && (
        <div className="p-5 space-y-3">
          <p className="text-[12px] leading-relaxed" style={{ color: '#8FA899' }}>
            Choose a period to pause your account. During exclusion you can&apos;t play, deposit, or withdraw. Long-term exclusions (1 year and 5 years) can&apos;t be reversed early. Full account closure is available by contacting support.
          </p>
          <div className="space-y-1.5">
            {EXCLUSION_OPTIONS.map((o) => {
              const isSel = selected === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelected(o.id)}
                  className="w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors hover:bg-white/[0.025]"
                  style={{
                    background: isSel ? (o.longTerm ? 'rgba(239,68,68,0.10)' : 'rgba(240,178,50,0.10)') : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSel ? (o.longTerm ? 'rgba(239,68,68,0.45)' : 'rgba(240,178,50,0.45)') : '#1A2E22'}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: o.longTerm ? 'rgba(239,68,68,0.14)' : 'rgba(240,178,50,0.10)',
                      border:     `1px solid ${o.longTerm ? 'rgba(239,68,68,0.30)' : 'rgba(240,178,50,0.30)'}`,
                      color:      o.longTerm ? '#EF4444' : '#F0B232',
                    }}
                  >
                    {o.longTerm ? <Ban className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: o.longTerm ? '#EF4444' : '#F5E8C8' }}>{o.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#8FA899' }}>{o.sub}</p>
                  </div>
                  {isSel && (
                    <Check className="w-4 h-4 flex-shrink-0 mt-1.5" style={{ color: o.longTerm ? '#EF4444' : '#F0B232' }} />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="flex items-start gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(45,201,122,0.06)', border: '1px solid rgba(45,201,122,0.25)' }}
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#2DC97A' }} />
            <p className="text-[11px] leading-relaxed" style={{ color: '#8FA899' }}>
              Need help? Call the National Council on Problem Gambling at{' '}
              <a href="tel:1-800-522-4700" className="font-bold" style={{ color: '#2DC97A' }}>1-800-522-4700</a> (24/7 · free · confidential).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#8FA899' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!selected}
              className="py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isLongTerm
                  ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                  : 'linear-gradient(135deg, #F0B232, #FFD166)',
                color: '#060E0A',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && selected && (
        <div className="p-5 space-y-3">
          <div
            className="flex items-start gap-2 px-3 py-3 rounded-xl"
            style={{
              background: isLongTerm ? 'rgba(239,68,68,0.10)' : 'rgba(240,178,50,0.10)',
              border: `1px solid ${isLongTerm ? 'rgba(239,68,68,0.40)' : 'rgba(240,178,50,0.40)'}`,
            }}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: isLongTerm ? '#EF4444' : '#F0B232' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: isLongTerm ? '#EF4444' : '#F0B232' }}>
                {isLongTerm
                  ? `Long-term exclusion · ${EXCLUSION_OPTIONS.find((o) => o.id === selected)?.label}`
                  : `You're excluding yourself for ${EXCLUSION_OPTIONS.find((o) => o.id === selected)?.label}`}
              </p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#F5E8C8' }}>
                {isLongTerm
                  ? `Your account will be paused for ${selected === '5y' ? '5 years' : '1 year'}. You cannot end this exclusion early under any circumstance — including by contacting support — until the period ends.`
                  : `During this period you can't play, deposit, or withdraw. The exclusion ends automatically and can't be ended early without contacting support.`}
              </p>
            </div>
          </div>

          {isLongTerm && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#EF4444' }}>
                Type <span className="font-mono">EXCLUDE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="EXCLUDE"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-mono font-bold tracking-widest uppercase focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${confirmText.trim().toUpperCase() === 'EXCLUDE' ? 'rgba(45,201,122,0.45)' : '#1A2E22'}`,
                  color: '#F5E8C8',
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#8FA899' }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isLongTerm
                  ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                  : 'linear-gradient(135deg, #F0B232, #FFD166)',
                color: isLongTerm ? '#fff' : '#060E0A',
                boxShadow: isLongTerm ? '0 4px 16px rgba(239,68,68,0.30)' : '0 4px 16px rgba(240,178,50,0.30)',
              }}
            >
              {isLongTerm ? `Exclude me for ${selected === '5y' ? '5 years' : '1 year'}` : 'Confirm exclusion'}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ─── W-9 TAX FORM ─────────────────────────────────────────────────────

interface W9Form {
  legalName: string;
  businessName: string;
  taxClass: 'individual' | 'sole-prop' | 'llc' | 'corp' | 'partnership' | 'other';
  tin: string;
  tinType: 'ssn' | 'ein';
  address1: string;
  city: string;
  state: string;
  zip: string;
  signature: string;
  certified: boolean;
}

const EMPTY_W9: W9Form = {
  legalName: '', businessName: '', taxClass: 'individual', tin: '', tinType: 'ssn',
  address1: '', city: '', state: '', zip: '', signature: '', certified: false,
};

export function TaxFormW9Modal({
  open, onClose, onSubmit, prefillName,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  prefillName?: string;
}) {
  const [form, setForm] = useState<W9Form>(EMPTY_W9);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_W9, legalName: prefillName ?? '' });
      setError('');
      setSubmitting(false);
    }
  }, [open, prefillName]);

  const update = <K extends keyof W9Form>(key: K, value: W9Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.legalName.trim())                  { setError('Enter your legal name'); return; }
    if (!/^\d{9}$/.test(form.tin.replace(/\D/g, ''))) { setError('Enter a valid 9-digit TIN (SSN or EIN)'); return; }
    if (!form.address1.trim() || !form.city.trim() || !form.state.trim() || !form.zip.trim()) {
      setError('Complete your mailing address'); return;
    }
    if (form.signature.trim().toLowerCase() !== form.legalName.trim().toLowerCase()) {
      setError('Signature must exactly match your legal name'); return;
    }
    if (!form.certified) { setError('You must certify the W-9'); return; }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('W-9 submitted', { description: 'Tax form on file. Your redemption will be processed.' });
      onSubmit();
      onClose();
    }, 600);
  };

  // Mask the TIN: show last 4 only
  const maskedTin = form.tin.replace(/\D/g, '').slice(0, 9);
  const tinDisplay = maskedTin.length <= 4
    ? maskedTin
    : `${'•'.repeat(maskedTin.length - 4)}${maskedTin.slice(-4)}`;

  return (
    <ModalShell open={open} onClose={onClose} accent="#F0B232">
      <ShellHeader icon={<FileText className="w-4 h-4" />} title="Tax form (W-9)" accent="#F0B232" onClose={onClose} />
      <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[78vh] overflow-y-auto no-scrollbar">
        <div
          className="flex items-start gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(240,178,50,0.06)', border: '1px solid rgba(240,178,50,0.25)' }}
        >
          <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#F0B232' }} />
          <p className="text-[11px] leading-relaxed" style={{ color: '#8FA899' }}>
            US tax law requires us to collect a W-9 before paying you cash prizes that may total <span className="font-bold" style={{ color: '#F0B232' }}>$600+ per year</span>. You&apos;ll receive a 1099-MISC at year end if you cross that threshold.
          </p>
        </div>

        <Field label="Legal name (as on tax return)">
          <input
            type="text"
            value={form.legalName}
            onChange={(e) => update('legalName', e.target.value)}
            autoComplete="name"
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
          />
        </Field>

        <Field label="Business name (if different)">
          <input
            type="text"
            value={form.businessName}
            onChange={(e) => update('businessName', e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
          />
        </Field>

        <Field label="Federal tax classification">
          <select
            value={form.taxClass}
            onChange={(e) => update('taxClass', e.target.value as W9Form['taxClass'])}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
          >
            <option value="individual"  style={{ background: '#0F1A14' }}>Individual / sole proprietor</option>
            <option value="sole-prop"   style={{ background: '#0F1A14' }}>Single-member LLC</option>
            <option value="llc"         style={{ background: '#0F1A14' }}>LLC (taxed as partnership / corporation)</option>
            <option value="corp"        style={{ background: '#0F1A14' }}>C / S corporation</option>
            <option value="partnership" style={{ background: '#0F1A14' }}>Partnership</option>
            <option value="other"       style={{ background: '#0F1A14' }}>Other</option>
          </select>
        </Field>

        <div className="grid grid-cols-[110px_1fr] gap-2">
          <Field label="TIN type">
            <select
              value={form.tinType}
              onChange={(e) => update('tinType', e.target.value as W9Form['tinType'])}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
            >
              <option value="ssn" style={{ background: '#0F1A14' }}>SSN</option>
              <option value="ein" style={{ background: '#0F1A14' }}>EIN</option>
            </select>
          </Field>
          <Field label={`${form.tinType === 'ssn' ? 'SSN' : 'EIN'} (9 digits)`}>
            <input
              type="text"
              inputMode="numeric"
              value={tinDisplay}
              onChange={(e) => update('tin', e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder={form.tinType === 'ssn' ? '•••-••-1234' : '••-•••1234'}
              autoComplete="off"
              className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
            />
          </Field>
        </div>

        <Field label="Street address">
          <input
            type="text"
            value={form.address1}
            onChange={(e) => update('address1', e.target.value)}
            autoComplete="street-address"
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
          />
        </Field>

        <div className="grid grid-cols-[1fr_90px_110px] gap-2">
          <Field label="City">
            <input
              type="text"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              autoComplete="address-level2"
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
            />
          </Field>
          <Field label="State">
            <input
              type="text"
              value={form.state}
              onChange={(e) => update('state', e.target.value.toUpperCase().slice(0, 2))}
              maxLength={2}
              autoComplete="address-level1"
              className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
            />
          </Field>
          <Field label="ZIP">
            <input
              type="text"
              inputMode="numeric"
              value={form.zip}
              onChange={(e) => update('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
              autoComplete="postal-code"
              className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
            />
          </Field>
        </div>

        <label className="flex items-start gap-2 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={form.certified}
            onChange={(e) => update('certified', e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-[11px] leading-relaxed" style={{ color: '#8FA899' }}>
            I certify under penalty of perjury that the TIN I&apos;ve provided is correct, I am not subject to backup withholding, and I am a US person.
          </span>
        </label>

        <Field label="Electronic signature (type your full legal name)">
          <input
            type="text"
            value={form.signature}
            onChange={(e) => update('signature', e.target.value)}
            placeholder={form.legalName || 'Your legal name'}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1A2E22',
              color: '#F5E8C8',
              fontFamily: 'cursive',
              fontStyle: 'italic',
              fontSize: '16px',
            }}
          />
        </Field>

        {error && (
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#EF4444' }}>
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #F0B232, #FFD166)',
            color: '#060E0A',
            boxShadow: '0 4px 16px rgba(240,178,50,0.30)',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit W-9'}
        </button>
      </form>
    </ModalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8FA899' }}>{label}</label>
      {children}
    </div>
  );
}
