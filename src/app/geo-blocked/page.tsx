'use client';

/**
 * /geo-blocked — landing shown when GeoComply (server-side) determines the
 * user is in a state where we can't operate. Outside the (app) group so it
 * renders without the casino chrome.
 *
 * In production this is hit via a 302 redirect from middleware that has the
 * user's resolved state. Here it's static + a mock email-capture for "let me
 * know when you launch in [state]".
 */

import { useState } from 'react';
import Link from 'next/link';
import { Shield, MapPin, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

const SERVED_STATES = [
  'CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'NJ', 'VA', 'AZ', 'MA',
  'TN', 'IN', 'WI', 'MO', 'CO', 'MD', 'OR',
];
const RESTRICTED_STATES = [
  { code: 'WA', name: 'Washington' },
  { code: 'ID', name: 'Idaho' },
  { code: 'MI', name: 'Michigan' },
  { code: 'NV', name: 'Nevada' },
  { code: 'MT', name: 'Montana' },
  { code: 'KY', name: 'Kentucky' },
];

function YalaPyramidLarge() {
  return (
    <svg width="72" height="62" viewBox="0 0 40 34" fill="none" aria-hidden="true">
      <defs><clipPath id="pyr-geo"><polygon points="20,0 40,34 0,34" /></clipPath></defs>
      <rect x="0" y="0"    width="40" height="8.5"  fill="#F0B232" clipPath="url(#pyr-geo)" />
      <rect x="0" y="8.5"  width="40" height="8.5"  fill="#84CC16" clipPath="url(#pyr-geo)" />
      <rect x="0" y="17"   width="40" height="8.5"  fill="#2DC97A" clipPath="url(#pyr-geo)" />
      <rect x="0" y="25.5" width="40" height="8.5"  fill="#1A5C8A" clipPath="url(#pyr-geo)" />
    </svg>
  );
}

export default function GeoBlockedPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('Enter a valid email');
      return;
    }
    setSent(true);
    toast.success('Got it', { description: "We'll email you when Yala launches in your state." });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#040814', color: '#F5E8C8' }}
    >
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: { background: '#0F1828', border: '1px solid #1A2238', color: '#F5E8C8' },
        }}
      />
      <div
        className="w-full max-w-xl rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0F1828 0%, #08121C 100%)',
          border: '1px solid rgba(240,178,50,0.20)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
        }}
      >
        <div className="px-6 sm:px-10 pt-10 pb-6 text-center">
          <div className="mx-auto mb-5 flex items-center justify-center">
            <YalaPyramidLarge />
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)' }}
          >
            <MapPin className="w-3 h-3" style={{ color: '#EF4444' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#EF4444' }}>Not available in your state</span>
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight mb-2">
            We can&apos;t serve you here — yet
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#8FA3B8' }}>
            Yala is a US sweepstakes social casino. State laws on sweepstakes vary, and we currently don&apos;t operate in your state. The moment that changes, we&apos;ll let you know.
          </p>
        </div>

        {/* Email capture */}
        <div className="px-6 sm:px-10 pb-6">
          {sent ? (
            <div
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(45,201,122,0.10)', border: '1px solid rgba(45,201,122,0.30)' }}
            >
              <Check className="w-4 h-4" style={{ color: '#2DC97A' }} />
              <p className="text-sm font-bold" style={{ color: '#2DC97A' }}>You&apos;re on the list</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#4A5878' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Get notified when Yala launches in your state"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#F5E8C8' }}
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
                  color: '#040814',
                  boxShadow: '0 3px 12px rgba(45,201,122,0.30)',
                }}
              >
                Notify me
              </button>
            </form>
          )}
        </div>

        {/* Served + restricted */}
        <div className="px-6 sm:px-10 py-5 space-y-4" style={{ background: '#08121C', borderTop: '1px solid #1A2238' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2DC97A' }}>Currently served</p>
            <div className="flex flex-wrap gap-1">
              {SERVED_STATES.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(45,201,122,0.08)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.20)' }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#8FA3B8' }}>Not served</p>
            <div className="flex flex-wrap gap-1">
              {RESTRICTED_STATES.map((s) => (
                <span
                  key={s.code}
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(143,163,184,0.06)', color: '#8FA3B8', border: '1px solid #1A2238' }}
                  title={s.name}
                >
                  {s.code}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid #1A2238' }}>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" style={{ color: '#2DC97A' }} />
            <p className="text-[10px]" style={{ color: '#8FA3B8' }}>18+ · No Purchase Necessary · Void Where Prohibited</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: '#8FA3B8' }}>
            <Link href="/sweepstakes-rules" className="hover:text-[#F0B232] transition-colors">Sweepstakes rules</Link>
            <Link href="/terms" className="hover:text-[#F0B232] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#F0B232] transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
