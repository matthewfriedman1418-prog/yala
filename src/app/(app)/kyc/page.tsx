'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import {
  CheckCircle2, Upload, AlertCircle, ChevronRight, ChevronLeft, Lock,
} from 'lucide-react';
import { YalaIcon } from '@/components/ui/YalaIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Personal Info',  desc: 'Name, DOB, address' },
  { id: 2, title: 'ID Document',    desc: 'Government-issued ID' },
  { id: 3, title: 'Proof of Address', desc: 'Recent utility bill' },
  { id: 4, title: 'Review',         desc: 'Final check + submit' },
];

type DocType = 'passport' | 'license' | 'national_id';
const DOC_OPTIONS: { id: DocType; label: string; sub: string }[] = [
  { id: 'passport',    label: 'Passport',          sub: 'Best for international users' },
  { id: 'license',     label: "Driver's License",  sub: 'Front + back required' },
  { id: 'national_id', label: 'National ID Card',  sub: 'Front + back required' },
];

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'New Zealand', 'Germany', 'Other'];

// Demo-only: lets you preview the three KYC states without setting up
// real flow data. Remove this block once the real KYC integration ships.
type DemoState = 'wizard' | 'submitted' | 'verified';

export default function KYCPage() {
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const [demoState, setDemoState] = useState<DemoState>('wizard');
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted]     = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', country: 'United States',
    address: '', city: '', state: '', zip: '',
  });
  const [docType, setDocType] = useState<DocType>('license');
  const [docFile, setDocFile] = useState<string | null>(null);
  const [poaFile, setPoaFile] = useState<string | null>(null);

  // ── Signed-OUT ─────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <EmptyState
          icon="shield"
          title="Sign in to verify your identity"
          body="KYC verification unlocks Sweep Coin redemption + higher daily limits."
          ctaLabel="Sign in"
          ctaOnClick={() => openAuthModal()}
          size="lg"
        />
      </div>
    );
  }

  // Demo override: if user explicitly picks a demo state, honor it
  const showVerified  = demoState === 'verified'  || (demoState === 'wizard' && user?.isVerified && false);
  const showSubmitted = demoState === 'submitted' || submitted;

  // ── Already verified ──────────────────────────────────────────────────
  if (showVerified) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-[fade-in_0.3s_ease-out]">
        <DemoSwitcher state={demoState} onChange={setDemoState} />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.25)' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#2DC97A' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2DC97A' }}>Verified</span>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Identity verified</h1>
          <p style={{ color: '#8FA3B8' }}>You&apos;re eligible to redeem Sweep Coins where permitted by law.</p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-7 flex items-center gap-5"
          style={{
            background: 'radial-gradient(ellipse at 15% 80%, rgba(45,201,122,0.14) 0%, transparent 55%), #0F1828',
            border: '1px solid rgba(45,201,122,0.28)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(45,201,122,0.14)', border: '1px solid rgba(45,201,122,0.35)' }}
          >
            <YalaIcon name="shield" size={32} />
          </div>
          <div className="flex-1">
            <p className="font-display text-xl font-bold mb-1" style={{ color: '#F5E8C8' }}>
              KYC complete · No action needed
            </p>
            <p className="text-sm" style={{ color: '#8FA3B8' }}>
              Your account is fully verified. Redeem Sweep Coins anytime from{' '}
              <Link href="/wallet/redeem" className="font-semibold underline transition-colors hover:opacity-80" style={{ color: '#2DC97A' }}>Wallet → Redeem</Link>.
            </p>
          </div>
        </div>

        <TrustSignals />
      </div>
    );
  }

  const step = STEPS[currentStep - 1];
  const canContinue =
    currentStep === 1 ? form.firstName && form.lastName && form.dob && form.address && form.city && form.zip :
    currentStep === 2 ? Boolean(docFile) :
    currentStep === 3 ? Boolean(poaFile) :
    true;

  const handleSubmit = () => {
    setSubmitted(true);
    toast.success('Verification submitted', {
      description: 'Most reviews complete within 1–3 business days.',
    });
  };

  // ── Submitted (under review) ──────────────────────────────────────────
  if (showSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-[fade-in_0.3s_ease-out]">
        <DemoSwitcher state={demoState} onChange={setDemoState} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.10) 0%, transparent 55%), #0F1828',
            border: '1px solid rgba(245,158,11,0.28)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.35)' }}
          >
            <YalaIcon name="shield" size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#F5E8C8' }}>
            Verification submitted
          </h1>
          <p className="text-sm" style={{ color: '#8FA3B8' }}>
            Most reviews complete within <span className="font-bold" style={{ color: '#F5E8C8' }}>1–3 business days</span>.
            We&apos;ll email you the moment your status changes.
          </p>
        </motion.div>

        {/* What's next */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0F1828', border: '1px solid #1A2238' }}
        >
          <div className="px-5 py-3" style={{ borderBottom: '1px solid #1A2238' }}>
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA3B8' }}>What happens next</p>
          </div>
          <div className="divide-y" style={{ borderColor: '#1A2238' }}>
            {[
              { step: '1', label: 'Submitted', sub: 'Your documents are in our review queue', state: 'done' as const },
              { step: '2', label: 'Reviewing', sub: 'Our compliance team checks your ID + address', state: 'active' as const },
              { step: '3', label: 'Approved', sub: 'You&apos;ll receive an email and can redeem SC', state: 'pending' as const },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: s.state === 'done'
                      ? 'rgba(45,201,122,0.14)'
                      : s.state === 'active'
                        ? 'rgba(245,158,11,0.14)'
                        : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      s.state === 'done'   ? 'rgba(45,201,122,0.35)' :
                      s.state === 'active' ? 'rgba(245,158,11,0.35)' :
                      '#1A2238'
                    }`,
                  }}
                >
                  {s.state === 'done'
                    ? <CheckCircle2 className="w-4 h-4" style={{ color: '#2DC97A' }} />
                    : s.state === 'active'
                      ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#F59E0B' }} />
                      : <span className="text-[10px] font-bold" style={{ color: '#4A5878' }}>{s.step}</span>
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: s.state === 'pending' ? '#8FA3B8' : '#F5E8C8' }}>{s.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#8FA3B8' }} dangerouslySetInnerHTML={{ __html: s.sub }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(45,201,122,0.06)', border: '1px solid rgba(45,201,122,0.22)' }}
        >
          <YalaIcon name="check" size={18} />
          <div>
            <p className="font-bold text-sm" style={{ color: '#F5E8C8' }}>Keep playing while we review</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#8FA3B8' }}>
              Your GC balance and SC balance are unaffected. The only thing locked is SC redemption.
            </p>
          </div>
        </div>

        <TrustSignals />
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-[fade-in_0.3s_ease-out]">
      <DemoSwitcher state={demoState} onChange={setDemoState} />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.22)' }}
          >
            <YalaIcon name="shield" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0B232]">KYC</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Verify your identity</h1>
        <p style={{ color: '#8FA3B8' }}>
          Required to redeem Sweep Coins. Takes about <span className="font-bold" style={{ color: '#F5E8C8' }}>2 minutes</span>.
        </p>
      </div>

      {/* Why verify — 3 benefit cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Benefit icon="cash-bill" color="#2DC97A" title="Redeem SC for cash" body="Cash out Sweep Coins where permitted by law." />
        <Benefit icon="trophy"    color="#F0B232" title="Higher daily limits" body="Verified accounts unlock larger redemptions." />
        <Benefit icon="activity"  color="#60A5FA" title="Faster cashouts"     body="Verified players get priority processing." />
      </div>

      {/* Step indicator */}
      <div className="flex items-start gap-1.5 px-1 pt-3">
        {STEPS.map((s, i) => {
          const isDone   = currentStep > s.id;
          const isActive = currentStep === s.id;
          return (
            <div key={s.id} className="flex items-start flex-1">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: isDone
                      ? 'linear-gradient(135deg, #2DC97A, #10B981)'
                      : isActive
                        ? 'linear-gradient(135deg, #F0B232, #FFD166)'
                        : '#1A2238',
                    color: isDone || isActive ? '#040814' : '#8FA3B8',
                    boxShadow: isActive ? '0 0 14px rgba(240,178,50,0.4)' : 'none',
                  }}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <p
                  className="text-[10px] mt-1.5 text-center font-bold hidden sm:block"
                  style={{ color: isActive ? '#F0B232' : isDone ? '#2DC97A' : '#8FA3B8' }}
                >
                  {s.title}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="h-px flex-1 mt-4 mx-0.5"
                  style={{ background: currentStep > s.id + 1 ? '#2DC97A' : '#1A2238' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form card */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: '#0F1828', border: '1px solid #1A2238' }}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-display text-lg font-bold" style={{ color: '#F5E8C8' }}>
            {step.title}
          </h3>
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA3B8' }}>
            Step {currentStep} of {STEPS.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-2 gap-3"
            >
              <Field label="First name" full={false}>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="John"
                  className="kyc-input"
                />
              </Field>
              <Field label="Last name" full={false}>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Doe"
                  className="kyc-input"
                />
              </Field>
              <Field label="Date of birth" full>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="kyc-input"
                />
              </Field>
              <Field label="Country" full>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="kyc-input"
                >
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Street address" full>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main St, Apt 4"
                  className="kyc-input"
                />
              </Field>
              <Field label="City">
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="New York"
                  className="kyc-input"
                />
              </Field>
              <Field label="State / Region">
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="NY"
                  className="kyc-input"
                />
              </Field>
              <Field label="ZIP / Postal code" full>
                <input
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  placeholder="10001"
                  className="kyc-input"
                />
              </Field>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <p className="text-sm" style={{ color: '#8FA3B8' }}>
                Pick the document type you&apos;ll upload. Make sure all four corners are visible and text is readable.
              </p>

              {/* Document type chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DOC_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDocType(d.id)}
                    className="text-left p-3 rounded-xl transition-all"
                    style={{
                      background: docType === d.id ? 'rgba(240,178,50,0.10)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${docType === d.id ? 'rgba(240,178,50,0.45)' : '#1A2238'}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold" style={{ color: docType === d.id ? '#F0B232' : '#F5E8C8' }}>{d.label}</span>
                      {docType === d.id && <CheckCircle2 className="w-4 h-4" style={{ color: '#F0B232' }} />}
                    </div>
                    <p className="text-[10px]" style={{ color: '#8FA3B8' }}>{d.sub}</p>
                  </button>
                ))}
              </div>

              <UploadBox
                value={docFile}
                onPick={() => setDocFile('document.jpg')}
                onClear={() => setDocFile(null)}
                label={docType === 'passport' ? 'Upload photo page' : 'Upload front + back'}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <p className="text-sm" style={{ color: '#8FA3B8' }}>
                Upload a recent utility bill, bank statement, or government letter showing your name and address.
                Must be dated within the <span className="font-bold" style={{ color: '#F5E8C8' }}>last 90 days</span>.
              </p>
              <UploadBox
                value={poaFile}
                onPick={() => setPoaFile('utility-bill.pdf')}
                onClear={() => setPoaFile(null)}
                label="Upload proof of address"
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <div
                className="rounded-xl p-4 divide-y"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: '#1A2238', border: '1px solid #1A2238' }}
              >
                <ReviewRow label="Name"     value={`${form.firstName} ${form.lastName}`} />
                <ReviewRow label="Date of birth" value={form.dob || '—'} />
                <ReviewRow label="Address"  value={`${form.address}, ${form.city}, ${form.state} ${form.zip}`} />
                <ReviewRow label="Country"  value={form.country} />
                <ReviewRow label="ID type"  value={DOC_OPTIONS.find((o) => o.id === docType)?.label || '—'} hasFile={!!docFile} />
                <ReviewRow label="Proof of address" value="Uploaded" hasFile={!!poaFile} />
              </div>

              <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.22)' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#60A5FA' }} />
                <p className="text-xs" style={{ color: '#8FA3B8' }}>
                  Reviews complete within <span className="font-bold" style={{ color: '#F5E8C8' }}>1–3 business days</span>.
                  You&apos;ll get an email the moment we&apos;re done.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="flex gap-2 mt-5">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#8FA3B8' }}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canContinue}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #F0B232, #FFD166)',
                color: '#040814',
                boxShadow: canContinue ? '0 4px 16px rgba(240,178,50,0.3)' : 'none',
              }}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #2DC97A, #10B981)',
                color: '#040814',
                boxShadow: '0 4px 16px rgba(45,201,122,0.35)',
              }}
            >
              <Lock className="w-4 h-4" strokeWidth={3} /> Submit verification
            </button>
          )}
        </div>
      </div>

      <TrustSignals />
    </div>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────────
function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="text-[10px] uppercase tracking-widest font-bold block mb-1.5" style={{ color: '#8FA3B8' }}>{label}</label>
      {children}
      <style>{`
        .kyc-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          color: #F5E8C8;
          background: rgba(255,255,255,0.04);
          border: 1px solid #1A2238;
          outline: none;
          transition: border-color .15s ease, background .15s ease, box-shadow .15s ease;
        }
        .kyc-input::placeholder { color: #4A5878; }
        .kyc-input:focus {
          border-color: rgba(240,178,50,0.45);
          background: rgba(240,178,50,0.04);
          box-shadow: 0 0 0 3px rgba(240,178,50,0.1);
        }
        select.kyc-input { appearance: none; background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238FA899' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-position: right 14px center; background-repeat: no-repeat; padding-right: 36px; }
      `}</style>
    </div>
  );
}

function Benefit({ icon, color, title, body }: {
  icon: Parameters<typeof YalaIcon>[0]['name']; color: string; title: string; body: string;
}) {
  return (
    <div
      className="rounded-xl p-3.5"
      style={{ background: '#0F1828', border: `1px solid ${color}22` }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
        style={{ background: `${color}14`, border: `1px solid ${color}30` }}
      >
        <YalaIcon name={icon} size={18} />
      </div>
      <p className="font-bold text-sm" style={{ color: '#F5E8C8' }}>{title}</p>
      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#8FA3B8' }}>{body}</p>
    </div>
  );
}

function UploadBox({ value, onPick, onClear, label }: {
  value: string | null; onPick: () => void; onClear: () => void; label: string;
}) {
  if (value) {
    return (
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{ background: 'rgba(45,201,122,0.06)', border: '1px solid rgba(45,201,122,0.28)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(45,201,122,0.14)', border: '1px solid rgba(45,201,122,0.35)' }}
        >
          <CheckCircle2 className="w-5 h-5" style={{ color: '#2DC97A' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: '#F5E8C8' }}>{value}</p>
          <p className="text-[11px]" style={{ color: '#8FA3B8' }}>Uploaded · ready to submit</p>
        </div>
        <button
          onClick={onClear}
          className="text-[11px] font-bold transition-colors hover:opacity-80"
          style={{ color: '#8FA3B8' }}
        >
          Replace
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={onPick}
      className="w-full rounded-xl p-7 flex flex-col items-center text-center transition-all hover:bg-white/[0.03]"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '2px dashed #1A2238',
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.22)' }}
      >
        <Upload className="w-5 h-5" style={{ color: '#F0B232' }} />
      </div>
      <p className="text-sm font-bold mb-1" style={{ color: '#F5E8C8' }}>{label}</p>
      <p className="text-[11px]" style={{ color: '#8FA3B8' }}>PNG, JPG, or PDF up to 10MB · Demo will fake upload</p>
    </button>
  );
}

function ReviewRow({ label, value, hasFile }: { label: string; value: string; hasFile?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
      <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color: '#8FA3B8' }}>{label}</span>
      <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#F5E8C8' }}>
        {hasFile && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#2DC97A' }} />}
        {value}
      </span>
    </div>
  );
}

// Demo-only state switcher. Not for production — gates the 3 KYC screens
// for design review. Hide with a feature flag once real KYC integration
// ships.
function DemoSwitcher({ state, onChange }: { state: DemoState; onChange: (s: DemoState) => void }) {
  const STATES: { id: DemoState; label: string }[] = [
    { id: 'wizard',    label: 'Wizard' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'verified',  label: 'Verified' },
  ];
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl"
      style={{
        background: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.25)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-widest flex-shrink-0" style={{ background: '#F59E0B', color: '#040814' }}>
          Demo
        </span>
        <span className="text-[11px] truncate" style={{ color: '#8FA3B8' }}>Preview KYC states — not visible in production</span>
      </div>
      <div className="flex gap-1 p-0.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid #1A2238' }}>
        {STATES.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all"
            style={state === s.id
              ? { background: 'rgba(240,178,50,0.18)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.35)' }
              : { color: '#8FA3B8', border: '1px solid transparent' }
            }
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TrustSignals() {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4"
      style={{ background: '#0F1828', border: '1px solid #1A2238' }}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.28)' }}
        >
          <Lock className="w-5 h-5" style={{ color: '#60A5FA' }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>End-to-end encrypted</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#8FA3B8' }}>
            Your documents are encrypted in transit and at rest. Verified by our regulated KYC partner.
          </p>
        </div>
      </div>
      <div className="hidden sm:block w-px h-12" style={{ background: '#1A2238' }} />
      <div className="flex items-center gap-3 sm:flex-1">
        <div className="hidden sm:block w-px h-8" />
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA3B8' }}>Required for</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: '#F5E8C8' }}>
            Sweep Coin redemption + higher limits
          </p>
        </div>
      </div>
    </div>
  );
}
