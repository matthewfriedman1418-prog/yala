'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useModalA11y } from '@/lib/hooks/useModalA11y';
import { X, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { GoldCoinIcon, SweepCoinIcon, YalaIcon } from '@/components/ui/YalaIcon';

const STARTING_GC = 250_000;
const STARTING_SC = 5;

export function AuthModal() {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal, openOnboarding, resetOnboardingSeen } = useUIStore();
  const { login, register } = useAuthStore();
  useModalA11y(authModalOpen, closeAuthModal);
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm] = useState({
    username: '', email: '', password: '', referral: '', agreed: false, remember: true,
  });

  if (!authModalOpen) return null;
  const isLogin = authModalTab === 'login';

  // Password strength: 0–4 (none → weak → fair → strong → great)
  const strength = useMemo(() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  }, [form.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.agreed && !isLogin) {
      setError('You must agree to the Terms of Service and Sweepstakes Rules.');
      return;
    }
    if (!isLogin && strength < 2) {
      setError('Pick a stronger password — at least 8 chars with mixed case.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.username || form.email, form.password);
        closeAuthModal();
      } else {
        await register({ username: form.username, email: form.email, password: form.password });
        closeAuthModal();
        resetOnboardingSeen();
        openOnboarding();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={closeAuthModal}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-md rounded-2xl overflow-hidden z-10"
          style={{
            backgroundColor: '#0F1A14',
            border: '1px solid #1A2E22',
            boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(240,178,50,0.04)',
          }}
        >
          {/* Animated gradient rule */}
          <div className="h-[2px] w-full" style={{
            background: 'linear-gradient(90deg, #2DC97A, #F0B232, #2DC97A)',
            backgroundSize: '200% auto',
            animation: 'shimmer 4s linear infinite',
          }} />

          {/* Close */}
          <button
            onClick={closeAuthModal}
            aria-label="Close"
            className="absolute right-3 top-4 z-20 p-1.5 rounded-lg transition-colors hover:bg-white/10"
          >
            <X className="w-4 h-4" style={{ color: '#8FA899' }} />
          </button>

          {/* Header */}
          <div className="px-6 pt-5 pb-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg width="24" height="20" viewBox="0 0 40 34" fill="none" aria-hidden="true">
                <defs><clipPath id="pyr-am"><polygon points="20,0 40,34 0,34" /></clipPath></defs>
                <rect x="0" y="0"    width="40" height="8.5"  fill="#F0B232" clipPath="url(#pyr-am)" />
                <rect x="0" y="8.5"  width="40" height="8.5"  fill="#84CC16" clipPath="url(#pyr-am)" />
                <rect x="0" y="17"   width="40" height="8.5"  fill="#2DC97A" clipPath="url(#pyr-am)" />
                <rect x="0" y="25.5" width="40" height="8.5"  fill="#1A5C8A" clipPath="url(#pyr-am)" />
              </svg>
              <span
                className="font-display text-base font-black tracking-widest"
                style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                YALA
              </span>
            </div>
            <h2 className="font-display text-xl font-bold mb-1" style={{ color: '#F5E8C8' }}>
              {isLogin ? 'Welcome back' : "Let's play"}
            </h2>
            <p className="text-xs" style={{ color: '#8FA899' }}>
              {isLogin ? 'Sign in to keep your streak going' : 'Free to play, redeem real prizes'}
            </p>
          </div>

          {/* Tab switcher — sliding gold underline */}
          <div className="relative mx-6 mt-3 flex" style={{ borderBottom: '1px solid #1A2E22' }}>
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => openAuthModal(t)}
                className="relative flex-1 py-2.5 text-sm font-bold transition-colors"
                style={{ color: (t === 'login') === isLogin ? '#F0B232' : '#8FA899' }}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute bottom-[-1px] h-[2px] rounded-full"
              style={{
                left: isLogin ? '0%' : '50%',
                width: '50%',
                background: 'linear-gradient(90deg, #F0B232, #FFD166)',
                boxShadow: '0 0 8px rgba(240,178,50,0.5)',
              }}
            />
          </div>

          {/* Starting bonus preview — register only */}
          {!isLogin && (
            <div className="mx-6 mt-4 p-3 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(45,201,122,0.08), rgba(240,178,50,0.08))',
                border: '1px solid rgba(45,201,122,0.22)',
              }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-center" style={{ color: '#2DC97A' }}>
                ✦ Your starter pack lands instantly
              </p>
              <div className="flex items-center justify-center gap-5">
                <div className="flex items-center gap-2">
                  <GoldCoinIcon size={24} />
                  <span className="font-bold number-display text-sm" style={{ color: '#F0B232' }}>
                    {STARTING_GC.toLocaleString()} GC
                  </span>
                </div>
                <span style={{ color: '#4A6A55' }}>+</span>
                <div className="flex items-center gap-2">
                  <SweepCoinIcon size={28} />
                  <span className="font-bold number-display text-sm" style={{ color: '#2DC97A' }}>
                    {STARTING_SC.toFixed(2)} SC
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Social auth row */}
          <div className="px-6 pt-4 grid grid-cols-2 gap-2">
            <SocialButton provider="google" onClick={() => { /* OAuth wired backend-side */ }} />
            <SocialButton provider="apple"  onClick={() => { }} />
          </div>

          <div className="flex items-center gap-3 px-6 my-4">
            <div className="flex-1 h-px" style={{ background: '#1A2E22' }} />
            <span className="text-[10px] font-bold tracking-wider" style={{ color: '#4A6A55' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: '#1A2E22' }} />
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3.5">
            {!isLogin && (
              <Field label="Username">
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="DesertFox88"
                  required
                  minLength={3}
                  maxLength={24}
                  className="auth-input"
                />
              </Field>
            )}

            <Field label={isLogin ? 'Username or Email' : 'Email Address'}>
              <input
                type={isLogin ? 'text' : 'email'}
                value={isLogin ? form.username : form.email}
                onChange={(e) => isLogin ? setForm({ ...form, username: e.target.value }) : setForm({ ...form, email: e.target.value })}
                placeholder={isLogin ? 'username or you@example.com' : 'you@example.com'}
                required
                className="auth-input"
              />
            </Field>

            <Field
              label="Password"
              right={isLogin && (
                <button type="button" className="text-[10px] font-semibold transition-colors hover:text-[#F0B232]" style={{ color: '#8FA899' }}>
                  Forgot?
                </button>
              )}
            >
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={isLogin ? 1 : 8}
                  className="auth-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#8FA899] hover:text-[#F5E8C8] transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && form.password && <StrengthMeter level={strength} />}
            </Field>

            {!isLogin && (
              <Field label="Referral Code" optional>
                <input
                  type="text"
                  value={form.referral}
                  onChange={(e) => setForm({ ...form, referral: e.target.value.toUpperCase() })}
                  placeholder="DESERT88"
                  className="auth-input uppercase"
                />
              </Field>
            )}

            {isLogin && (
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none" style={{ color: '#8FA899' }}>
                <CheckboxControl checked={form.remember} onChange={() => setForm({ ...form, remember: !form.remember })} />
                Remember me on this device
              </label>
            )}

            {!isLogin && (
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <div className="mt-0.5">
                  <CheckboxControl checked={form.agreed} onChange={() => setForm({ ...form, agreed: !form.agreed })} />
                </div>
                <span className="text-[11px] leading-relaxed" style={{ color: '#8FA899' }}>
                  I&apos;m 18+ and agree to the{' '}
                  <a href="/terms" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#F0B232' }} target="_blank" rel="noreferrer">Terms</a>,{' '}
                  <a href="/privacy" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#F0B232' }} target="_blank" rel="noreferrer">Privacy</a>, and{' '}
                  <a href="/sweepstakes-rules" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#F0B232' }} target="_blank" rel="noreferrer">Sweepstakes Rules</a>.
                </span>
              </label>
            )}

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
              style={{
                background: 'linear-gradient(135deg, #10B981, #2DC97A)',
                color: '#060E0A',
                boxShadow: '0 4px 20px rgba(45,201,122,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {loading
                ? (isLogin ? 'Signing in…' : 'Creating account…')
                : (isLogin ? 'Sign In' : 'Create Account & Claim')}
            </button>

            {/* Switch link */}
            <p className="text-center text-xs pt-1" style={{ color: '#8FA899' }}>
              {isLogin
                ? <>New to Yala? <button type="button" onClick={() => openAuthModal('register')} className="font-bold transition-colors hover:opacity-80" style={{ color: '#F0B232' }}>Create an account</button></>
                : <>Already have one? <button type="button" onClick={() => openAuthModal('login')} className="font-bold transition-colors hover:opacity-80" style={{ color: '#F0B232' }}>Sign in</button></>
              }
            </p>

            {!isLogin && (
              <p className="text-[10px] text-center leading-relaxed pt-1" style={{ color: '#4A6A55' }}>
                No Purchase Necessary · Gold Coins have no cash value · 18+ · Void where prohibited
              </p>
            )}
          </form>

          {/* Scoped input styles */}
          <style>{`
            .auth-input {
              width: 100%;
              padding: 11px 14px;
              border-radius: 12px;
              font-size: 14px;
              color: #F5E8C8;
              background: rgba(255,255,255,0.04);
              border: 1px solid #1A2E22;
              outline: none;
              transition: border-color .15s ease, background .15s ease, box-shadow .15s ease;
            }
            .auth-input::placeholder { color: #4A6A55; }
            .auth-input:focus {
              border-color: rgba(240,178,50,0.45);
              background: rgba(240,178,50,0.04);
              box-shadow: 0 0 0 3px rgba(240,178,50,0.1);
            }
          `}</style>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, right, optional, children }: {
  label: string;
  right?: React.ReactNode;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA899' }}>
          {label}
          {optional && <span className="ml-1.5 font-normal normal-case tracking-normal" style={{ color: '#4A6A55' }}>optional</span>}
        </label>
        {right}
      </div>
      {children}
    </div>
  );
}

function CheckboxControl({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
      style={{
        background: checked ? '#F0B232' : 'transparent',
        border: `1px solid ${checked ? '#F0B232' : '#2A3A30'}`,
      }}
    >
      {checked && <Check className="w-3 h-3" style={{ color: '#060E0A' }} strokeWidth={3} />}
    </button>
  );
}

function StrengthMeter({ level }: { level: number }) {
  const labels = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const colors = ['#EF4444', '#F59E0B', '#F0B232', '#10B981', '#2DC97A'];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-colors"
            style={{ background: i <= level ? colors[level] : '#1A2E22' }}
          />
        ))}
      </div>
      <p className="text-[10px] mt-1 font-semibold" style={{ color: colors[level] || '#8FA899' }}>
        {labels[level]}
      </p>
    </div>
  );
}

function SocialButton({ provider, onClick }: { provider: 'google' | 'apple'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
    >
      {provider === 'google' ? (
        <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#EA4335" d="M9 3.5c1.7 0 3.1.6 4.2 1.7l3.1-3.1C14.4.8 11.9 0 9 0 5.5 0 2.5 2 1 5l3.6 2.8C5.4 5.4 7 3.5 9 3.5z"/>
          <path fill="#4285F4" d="M17.6 9.2c0-.7-.1-1.3-.2-1.9H9v3.6h4.8c-.2 1.2-.9 2.2-1.9 2.9l3 2.3c1.7-1.6 2.7-4 2.7-6.9z"/>
          <path fill="#FBBC05" d="M4.6 10.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L1 4.5C.4 5.9 0 7.4 0 9s.4 3.1 1 4.5l3.6-2.7z"/>
          <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.3c-.8.5-1.9.9-3 .9-2 0-3.6-1.4-4.4-3.2L1 13.9C2.5 17 5.5 18 9 18z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#F5E8C8" aria-hidden="true">
          <path d="M13.4 12.4c-.3.6-.6 1.2-1 1.7-.5.7-1 1.2-1.4 1.4-.7.3-1.4.3-2.1 0-.5-.3-1.1-.3-1.8 0-.7.3-1.3.3-1.9.1-.4-.2-.9-.6-1.4-1.4C2.6 12.5 2.1 10.2 3 8.1c.5-1 1.2-1.7 2.2-2.1.6-.2 1.3-.3 1.9 0 .3.1.6.3.9.4.3.1.6 0 1-.1.5-.2 1-.3 1.6-.3 1 .1 1.8.5 2.4 1.2-1.6 1-1.4 2.9-1.5 3 .2 1 .8 1.7 1.7 2.2-.2.6-.4 1.2-.8 1.8zM10.4 1.3c0 .8-.3 1.4-.9 2-.6.6-1.4 1-2.1.9-.1-.8.3-1.5.9-2.1.3-.3.7-.5 1.1-.7.5-.1.9-.2 1-.1z"/>
        </svg>
      )}
      Continue with {provider === 'google' ? 'Google' : 'Apple'}
    </button>
  );
}
