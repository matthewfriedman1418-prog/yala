'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { Shield, CheckCircle2, Upload, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Personal Information', desc: 'Name, date of birth, address' },
  { id: 2, title: 'Identity Document', desc: 'Government-issued ID or passport' },
  { id: 3, title: 'Proof of Address', desc: 'Utility bill or bank statement' },
  { id: 4, title: 'Review', desc: 'Final verification check' },
];

export default function KYCPage() {
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', dob: '', address: '', city: '', state: '', zip: '' });

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <Shield className="w-10 h-10 opacity-30" style={{ color: '#9CA3AF' }} />
        <p style={{ color: '#9CA3AF' }}>Login to complete KYC verification</p>
        <button onClick={() => openAuthModal()} className="px-6 py-3 rounded-xl font-semibold text-sm text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>Login</button>
      </div>
    );
  }

  if (user?.isVerified) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold" style={{ color: '#F5E8C8' }}>Identity Verified</h1>
        <p style={{ color: '#9CA3AF' }}>Your account is fully verified. You are eligible to redeem Sweep Coins where permitted by law.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4" style={{ color: '#D6A84F' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>KYC Verification</span>
        </div>
        <h1 className="font-display text-3xl font-bold" style={{ color: '#F5E8C8' }}>Identity Verification</h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Required to redeem Sweep Coins. Your information is encrypted and secure.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all', currentStep > step.id ? 'text-black' : currentStep === step.id ? 'text-black' : 'text-[#9CA3AF]')}
                style={{ background: currentStep > step.id ? '#10B981' : currentStep === step.id ? 'linear-gradient(135deg, #D6A84F, #F0C97A)' : '#1E1E1E' }}
              >
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <p className="text-[9px] mt-1 text-center hidden sm:block" style={{ color: currentStep === step.id ? '#D6A84F' : '#9CA3AF' }}>{step.title}</p>
            </div>
            {i < STEPS.length - 1 && <div className="h-px flex-1 mx-1" style={{ background: currentStep > step.id + 1 ? '#10B981' : '#1E1E1E' }} />}
          </div>
        ))}
      </div>

      {!submitted ? (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>
            Step {currentStep}: {STEPS[currentStep - 1].title}
          </h3>

          {currentStep === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'First Name', key: 'firstName', type: 'text', placeholder: 'John' },
                { label: 'Last Name', key: 'lastName', type: 'text', placeholder: 'Doe' },
                { label: 'Date of Birth', key: 'dob', type: 'date', placeholder: '', full: true },
                { label: 'Street Address', key: 'address', type: 'text', placeholder: '123 Main St', full: true },
                { label: 'City', key: 'city', type: 'text', placeholder: 'New York' },
                { label: 'State', key: 'state', type: 'text', placeholder: 'NY' },
                { label: 'ZIP Code', key: 'zip', type: 'text', placeholder: '10001' },
              ].map((field) => (
                <div key={field.key} className={field.full ? 'col-span-2' : ''}>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#9CA3AF' }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                  />
                </div>
              ))}
            </div>
          )}

          {(currentStep === 2 || currentStep === 3) && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                {currentStep === 2
                  ? 'Upload a clear photo of your government-issued ID (passport, driver\'s license, or national ID).'
                  : 'Upload a recent utility bill, bank statement, or government letter showing your name and address (dated within 3 months).'}
              </p>
              <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[#D6A84F]/50 transition-colors" style={{ borderColor: '#2a2a2a' }}>
                <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: '#9CA3AF', opacity: 0.5 }} />
                <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Click to upload or drag & drop</p>
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>PNG, JPG, PDF up to 10MB</p>
                <div className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-black inline-block" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>
                  Choose File (Demo)
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3">
              <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(214,168,79,0.08)', border: '1px solid rgba(214,168,79,0.2)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#D6A84F' }}>Review Your Submission</p>
                <div className="space-y-1 text-xs" style={{ color: '#9CA3AF' }}>
                  <p>Name: {form.firstName} {form.lastName}</p>
                  <p>DOB: {form.dob}</p>
                  <p>Address: {form.address}, {form.city}, {form.state} {form.zip}</p>
                  <p>Identity Document: ✓ Uploaded (Demo)</p>
                  <p>Proof of Address: ✓ Uploaded (Demo)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  Your information will be reviewed within 1-3 business days. You will receive an email confirmation once verified.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button onClick={() => setCurrentStep((s) => s - 1)} className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all" style={{ borderColor: '#2a2a2a', color: '#9CA3AF' }}>Back</button>
            )}
            {currentStep < 4 ? (
              <button onClick={() => setCurrentStep((s) => s + 1)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>
                Continue <ChevronRight className="w-4 h-4 inline" />
              </button>
            ) : (
              <button onClick={() => setSubmitted(true)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-black" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
                Submit Verification
              </button>
            )}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>
            <Shield className="w-7 h-7 text-black" />
          </div>
          <h3 className="font-display text-xl font-bold" style={{ color: '#F5E8C8' }}>Verification Submitted</h3>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Your documents are under review. You will receive a confirmation email within 1-3 business days.</p>
        </motion.div>
      )}

      <p className="text-xs text-center" style={{ color: 'rgba(156,163,175,0.6)' }}>
        KYC is required to redeem Sweep Coins. Your data is encrypted and processed in accordance with our Privacy Policy.
      </p>
    </div>
  );
}
