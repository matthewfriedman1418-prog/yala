'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function AuthModal() {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal } = useUIStore();
  const { login, register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', referral: '', agreed: false });

  if (!authModalOpen) return null;

  const isLogin = authModalTab === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.agreed && !isLogin) {
      setError('You must agree to the Terms of Service and Sweepstakes Rules.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.username || form.email, form.password);
      } else {
        await register({ username: form.username, email: form.email, password: form.password });
      }
      closeAuthModal();
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
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={closeAuthModal}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-2xl overflow-hidden z-10"
          style={{ backgroundColor: '#101C16', border: '1px solid #1A2E22', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}
        >
          {/* Top gradient bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #2DC97A, #F0B232, #2DC97A)', backgroundSize: '200% auto', animation: 'shimmer 4s linear infinite' }} />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #1A2E22' }}>
            <div className="flex items-center gap-3">
              <svg width="28" height="23" viewBox="0 0 40 32" fill="none">
                <rect x="2" y="25" width="36" height="6" rx="2" fill="#1A5C8A"/>
                <rect x="7" y="17" width="26" height="6" rx="2" fill="#2DC97A"/>
                <rect x="13" y="9" width="14" height="6" rx="2" fill="#84CC16"/>
                <rect x="17" y="1" width="6" height="6" rx="2" fill="#F0B232"/>
              </svg>
              <div>
                <h2 className="font-display text-xl font-bold" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {isLogin ? 'Welcome Back' : 'Join Yala'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#8FA899' }}>
                  {isLogin ? 'Enter the oasis' : 'Your desert adventure begins here'}
                </p>
              </div>
            </div>
            <button onClick={closeAuthModal} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" style={{ color: '#8FA899' }} />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex" style={{ borderBottom: '1px solid #1A2E22' }}>
            <button
              onClick={() => openAuthModal('login')}
              className="flex-1 py-3 text-sm font-semibold transition-all"
              style={isLogin ? { color: '#F0B232', borderBottom: '2px solid #F0B232' } : { color: '#8FA899' }}
            >
              Login
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="flex-1 py-3 text-sm font-semibold transition-all"
              style={!isLogin ? { color: '#F0B232', borderBottom: '2px solid #F0B232' } : { color: '#8FA899' }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-[#8FA899] block mb-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E8C8] focus:outline-none transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}
                  placeholder="DesertFox88"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-[#8FA899] block mb-1">
                {isLogin ? 'Username or Email' : 'Email Address'}
              </label>
              <input
                type={isLogin ? 'text' : 'email'}
                value={isLogin ? form.username : form.email}
                onChange={(e) => isLogin ? setForm({ ...form, username: e.target.value }) : setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm text-[#F5E8C8] focus:outline-none transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}
                placeholder={isLogin ? 'Enter username or email' : 'you@example.com'}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#8FA899] block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-[#F5E8C8] focus:outline-none transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA899] hover:text-[#F5E8C8]">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-[#8FA899] block mb-1">Referral / Creator Code (optional)</label>
                <input
                  type="text"
                  value={form.referral}
                  onChange={(e) => setForm({ ...form, referral: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border text-[#F5E8C8] focus:outline-none focus:border-[#F0B232] transition-colors uppercase"
                  placeholder="YALA or creator code"
                />
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${form.agreed ? 'bg-[#F0B232] border-[#F0B232]' : 'border-[#2A3A30]'}`}
                    onClick={() => setForm({ ...form, agreed: !form.agreed })}
                  >
                    {form.agreed && <span className="text-black text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-xs text-[#8FA899] leading-relaxed">
                    I am 18+ years old and agree to the{' '}
                    <a href="/terms" className="text-[#F0B232] underline" target="_blank">Terms of Service</a>,{' '}
                    <a href="/privacy" className="text-[#F0B232] underline" target="_blank">Privacy Policy</a>, and{' '}
                    <a href="/sweepstakes-rules" className="text-[#F0B232] underline" target="_blank">Sweepstakes Rules</a>.
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
            >
              {loading ? 'Loading...' : isLogin ? 'Enter the Oasis' : 'Create Account'}
            </button>

            {!isLogin && (
              <div className="text-center">
                <p className="text-[11px] text-[#8FA899]/70 leading-relaxed">
                  No Purchase Necessary. Gold Coins have no cash value.<br />
                  18+ only. Void where prohibited.
                </p>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
