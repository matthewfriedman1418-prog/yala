'use client';

/**
 * /free-entry — AMOE (Alternative Method of Entry) page.
 *
 * Legally required for US sweepstakes operations: there must be a no-purchase
 * way to enter the prize draw. This page is the user-friendly version of the
 * mail-in instructions buried in /sweepstakes-rules.
 *
 * Provides:
 *   1. The mailing address as a copy-able formatted block
 *   2. A downloadable / printable entry letter template
 *   3. Step-by-step instructions
 *   4. FAQ
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail, Copy, Check, Download, ChevronDown, ChevronUp, Shield, MapPin, FileText, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { SweepCoinIcon } from '@/components/ui/YalaIcon';

const MAILING_ADDRESS = {
  name:    'Yala Gaming LLC',
  attn:    'AMOE Department',
  line1:   '1234 Desert Blvd, Suite 100',
  line2:   'Wilmington, DE 19801',
};

const REQUIRED_FIELDS = [
  'Your full legal name',
  'Complete mailing address',
  'Date of birth (must be 18+)',
  'Valid email address tied to your Yala account',
  'The exact phrase "Yala Sweepstakes AMOE"',
];

const FAQS = [
  {
    q: 'How many free Sweep Coins do I get per envelope?',
    a: '1.00 SC per valid AMOE request. One request per envelope per day.',
  },
  {
    q: 'How long does it take?',
    a: 'Your SC is credited within 30 days of us receiving a valid request. Most are processed within 7–10 business days.',
  },
  {
    q: 'Do I need an account first?',
    a: 'Yes. The email you mail in must match an existing Yala account so we can credit you. Create a free account first, then mail in.',
  },
  {
    q: 'Can I send multiple requests in one envelope?',
    a: 'No. Each AMOE request must be in its own envelope, hand-addressed, and contain a separate handwritten letter.',
  },
  {
    q: 'Are typed letters okay?',
    a: 'Letters must be handwritten to qualify. Printed / typed letters will be rejected.',
  },
  {
    q: 'What about printed mailing labels?',
    a: 'The OUTGOING envelope can use any normal addressing (printed, sticker, handwritten). The handwritten requirement is for the LETTER inside.',
  },
];

const TEMPLATE_TEXT = `Yala Gaming LLC
Attn: AMOE Department
1234 Desert Blvd, Suite 100
Wilmington, DE 19801

[Today's Date]

Yala Sweepstakes AMOE

To Whom It May Concern,

Please credit my Yala account with one (1) Sweep Coin under the Yala
Sweepstakes Alternative Method of Entry program.

Full Name:        [Your full legal name]
Mailing Address:  [Your street address]
                  [City, State, ZIP]
Date of Birth:    [MM/DD/YYYY — must be 18 or older]
Email:            [The email you signed up with on Yala]

[Your handwritten signature]
`;

export default function FreeEntryPage() {
  const [copied, setCopied] = useState<'address' | 'template' | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const copy = (text: string, kind: 'address' | 'template') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      toast.success('Copied');
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => toast.error("Couldn't copy — select and copy manually"));
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_TEXT], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'yala-amoe-template.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded', { description: 'Fill in your details, then copy by hand onto a sheet of paper.' });
  };

  const addressBlock = `${MAILING_ADDRESS.name}\nAttn: ${MAILING_ADDRESS.attn}\n${MAILING_ADDRESS.line1}\n${MAILING_ADDRESS.line2}`;

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out] max-w-4xl">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        className="relative rounded-3xl overflow-hidden p-5 sm:p-8"
        style={{
          background: `
            radial-gradient(ellipse at 0% 0%, rgba(45,201,122,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 100% 100%, rgba(240,178,50,0.14) 0%, transparent 50%),
            linear-gradient(135deg, #0F1828 0%, #08121C 100%)
          `,
          border: '1px solid rgba(45,201,122,0.25)',
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4" style={{ color: '#2DC97A' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#2DC97A' }}>
              Alternative method of entry
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-2" style={{ color: '#F5E8C8' }}>
            Get Sweep Coins by mail — free
          </h1>
          <p className="text-sm sm:text-base max-w-lg mb-4" style={{ color: '#8FA3B8' }}>
            No purchase necessary. Mail us a hand-written request and we&apos;ll credit your Yala account with{' '}
            <span className="font-bold" style={{ color: '#2DC97A' }}>1 Sweep Coin</span> per valid entry. Required by US sweepstakes law — and yes, it really is free.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(45,201,122,0.08)', border: '1px solid rgba(45,201,122,0.25)' }}>
              <SweepCoinIcon size={14} />
              <span className="text-[10px] font-bold" style={{ color: '#2DC97A' }}>1.00 SC per envelope</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(240,178,50,0.10)', border: '1px solid rgba(240,178,50,0.28)' }}>
              <Clock className="w-3 h-3" style={{ color: '#F0B232' }} />
              <span className="text-[10px] font-bold" style={{ color: '#F0B232' }}>Credited in 7–30 days</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.28)' }}>
              <FileText className="w-3 h-3" style={{ color: '#A78BFA' }} />
              <span className="text-[10px] font-bold" style={{ color: '#A78BFA' }}>Must be handwritten</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1-2-3 STEPS ────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { n: 1, title: 'Hand-write the letter', body: 'Use the template below as a guide. The letter itself must be handwritten in ink on plain paper.' },
            { n: 2, title: 'Mail to the AMOE address', body: 'Address the envelope to our AMOE Department in Wilmington, DE. Standard postage.' },
            { n: 3, title: "We'll credit your account", body: '+1.00 SC will appear in your Yala wallet within 30 days. We email you when it lands.' },
          ].map((s) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: s.n * 0.05 }}
              className="rounded-2xl p-4"
              style={{ background: '#0F1828', border: '1px solid #1A2238' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-sm mb-3"
                style={{ background: 'rgba(45,201,122,0.14)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.30)' }}
              >
                {s.n}
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: '#F5E8C8' }}>{s.title}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#8FA3B8' }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MAILING ADDRESS ────────────────────────────────── */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0F1828', border: '1px solid #1A2238' }}
      >
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1A2238' }}>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: '#F0B232' }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F5E8C8' }}>Mailing address</p>
          </div>
          <button
            type="button"
            onClick={() => copy(addressBlock, 'address')}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-colors hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: copied === 'address' ? '#2DC97A' : '#8FA3B8' }}
          >
            {copied === 'address' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>
        <div className="p-5 sm:p-6">
          <pre
            className="font-mono text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: '#F5E8C8' }}
          >
{addressBlock}
          </pre>
        </div>
      </section>

      {/* ── LETTER TEMPLATE ───────────────────────────────── */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0F1828', border: '1px solid #1A2238' }}
      >
        <div className="px-5 py-3 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: '1px solid #1A2238' }}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: '#A78BFA' }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F5E8C8' }}>Letter template</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copy(TEMPLATE_TEXT, 'template')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: copied === 'template' ? '#2DC97A' : '#8FA3B8' }}
            >
              {copied === 'template' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
            <button
              type="button"
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-colors hover:brightness-110"
              style={{ background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.30)', color: '#A78BFA' }}
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <pre
            className="font-mono text-[12px] sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: '#F5E8C8' }}
          >
{TEMPLATE_TEXT}
          </pre>
        </div>
        <div className="px-5 py-3" style={{ background: 'rgba(167,139,250,0.04)', borderTop: '1px solid #1A2238' }}>
          <p className="text-[10px] leading-relaxed" style={{ color: '#8FA3B8' }}>
            Reminder: this template is for reference. The actual letter you mail{' '}
            <span className="font-bold" style={{ color: '#F5E8C8' }}>must be handwritten</span>{' '}
            on plain paper — typed / printed letters do not qualify.
          </p>
        </div>
      </section>

      {/* ── REQUIRED FIELDS ────────────────────────────────── */}
      <section
        className="rounded-2xl p-5"
        style={{ background: '#0F1828', border: '1px solid #1A2238' }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#F0B232' }}>
          Required in every letter
        </p>
        <ul className="space-y-1.5">
          {REQUIRED_FIELDS.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: '#F5E8C8' }}>
              <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#2DC97A' }} />
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-lg font-black mb-3 flex items-center gap-2.5" style={{ color: '#F5E8C8' }}>
          <div className="w-1 h-5 rounded-full" style={{ background: '#F0B232' }} />
          Frequently asked questions
        </h2>
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
          {FAQS.map((f, i) => (
            <div key={i} className={i > 0 ? 'border-t' : ''} style={{ borderColor: '#1A2238' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
              >
                <p className="font-medium text-sm pr-4" style={{ color: '#F5E8C8' }}>{f.q}</p>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#F0B232' }} />
                  : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA3B8' }} />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 -mt-1">
                  <p className="text-xs leading-relaxed" style={{ color: '#8FA3B8' }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── LINKS ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        style={{ background: '#08121C', border: '1px solid #1A2238' }}
      >
        <div className="flex items-center gap-2 flex-1">
          <Shield className="w-4 h-4 flex-shrink-0" style={{ color: '#2DC97A' }} />
          <p className="text-[12px]" style={{ color: '#8FA3B8' }}>
            See the full sweepstakes terms for prize tiers, restrictions, and dispute resolution.
          </p>
        </div>
        <Link
          href="/sweepstakes-rules"
          className="px-3 py-2 rounded-lg text-xs font-bold text-center transition-colors hover:brightness-110"
          style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.30)' }}
        >
          Read full sweepstakes rules →
        </Link>
      </div>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2238' }}>
        <p className="text-[11px]" style={{ color: 'rgba(143,163,184,0.5)' }}>
          NO PURCHASE NECESSARY · 18+ · VOID WHERE PROHIBITED
        </p>
      </div>

    </div>
  );
}
