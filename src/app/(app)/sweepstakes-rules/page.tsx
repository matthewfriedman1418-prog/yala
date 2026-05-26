'use client';

/**
 * /sweepstakes-rules — official sweepstakes rules.
 *
 * Per industry pattern (Chumba / Pulsz / LuckyLand / Stake.us), AMOE
 * instructions live inside the rules doc rather than as a standalone page.
 * The AMOE section here has the mailing-address block + a copyable letter
 * template so a user can fulfill the legal requirement directly from here.
 */

import { useState } from 'react';
import { Copy, Check, Mail, FileText } from 'lucide-react';
import { toast } from 'sonner';

const MAILING_ADDRESS = `Yala Gaming LLC
Attn: AMOE Department
1234 Desert Blvd, Suite 100
Wilmington, DE 19801`;

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

const SECTIONS: { title: string; body: string }[] = [
  { title: 'Sponsor',         body: 'Yala Gaming LLC ("Sponsor"), 1234 Desert Blvd, Suite 100, Wilmington, DE 19801.' },
  { title: 'Eligibility',     body: 'Open to legal residents of the United States (excluding residents of Washington, Idaho, Michigan, Nevada, Montana, Kentucky, and any other state where sweepstakes are prohibited), who are 18 years of age or older at the time of entry. Void where prohibited. Employees of Sponsor and their immediate family members are not eligible.' },
  { title: 'Currencies',      body: 'Gold Coins (GC) are virtual play currency with no monetary value and cannot be redeemed. Sweep Coins (SC) are sweepstakes currency that can be redeemed for prizes. Both can be obtained free of charge through daily bonuses, login rewards, free spins, promotions, and the Alternative Method of Entry described below.' },
  { title: 'How to Play',     body: 'Players use GC or SC to participate in available social games on the Platform. GC gameplay is for entertainment only. SC gameplay enters players into sweepstakes-style prize draws. Outcomes are determined by random number generators with disclosed RTP per game.' },
  { title: 'Prizes & Redemption', body: 'Sweep Coins can be redeemed for cash prizes at a rate of 1 SC = $1.00 USD. Minimum redemption: 25 SC. Redemptions require completed identity verification (KYC). For cumulative annual winnings of $600 or more, a W-9 tax form is required and a 1099-MISC will be issued. Redemptions are processed via Pay-by-Bank (Trustly), ACH, or paper check within 1–10 business days depending on method.' },
  { title: 'Odds',            body: 'Odds of winning depend on the number of SC wagered, the game type, and outcomes of the cryptographically-secure random number generator. The house edge varies by game and is disclosed on each game page. No skill, purchase, or payment improves your odds.' },
  { title: 'Restrictions',    body: 'Void where prohibited. Participants must be eligible under applicable state law. The Sponsor reserves the right to disqualify any participant for fraud, abuse, multi-accounting, or violation of these Rules.' },
  { title: 'Dispute Resolution', body: 'Any dispute arising from participation shall be resolved by binding arbitration in Delaware in accordance with AAA Consumer Arbitration Rules. Class action waiver applies.' },
  { title: 'General Conditions', body: 'Sponsor reserves the right to cancel, suspend, or modify the promotion if fraud, technical failures, or any other factor impairs the integrity of the promotion. Sponsor is not responsible for technical failures, lost entries, or unauthorized access.' },
  { title: 'Winners List',    body: 'For a list of prize winners, send a self-addressed, stamped envelope to Yala Gaming LLC, Winners List, 1234 Desert Blvd, Suite 100, Wilmington, DE 19801, within 90 days of the applicable promotion end date.' },
];

export default function SweepstakesRulesPage() {
  const [copied, setCopied] = useState<'address' | 'template' | null>(null);

  const copy = (text: string, kind: 'address' | 'template') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      toast.success('Copied');
      setTimeout(() => setCopied(null), 1800);
    }).catch(() => toast.error("Couldn't copy — select manually"));
  };

  return (
    <div className="max-w-3xl space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <div className="inline-block px-3 py-1 rounded-full mb-3 text-xs font-bold uppercase tracking-wide" style={{ background: 'rgba(45,201,122,0.15)', color: '#2DC97A' }}>
          No Purchase Necessary
        </div>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Official Sweepstakes Rules</h1>
        <p className="text-sm" style={{ color: '#8FA899' }}>Effective: May 21, 2026 · Yala Gaming LLC</p>
      </div>

      <div className="px-5 py-4 rounded-2xl border" style={{ background: 'rgba(45,201,122,0.06)', borderColor: 'rgba(45,201,122,0.25)' }}>
        <p className="text-base font-bold mb-2" style={{ color: '#2DC97A' }}>NO PURCHASE NECESSARY</p>
        <p className="text-sm leading-relaxed" style={{ color: '#8FA899' }}>
          No purchase or payment of any kind is necessary to enter or win Sweep Coins prizes on the Yala platform. A purchase does not improve your chances of winning. See the Alternative Method of Entry section below for free entry instructions.
        </p>
      </div>

      {/* ── AMOE — beefed up so it's a real do-able flow ─────── */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1A2E22', background: 'rgba(45,201,122,0.04)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4" style={{ color: '#2DC97A' }} />
            <h2 className="font-semibold text-base" style={{ color: '#F5E8C8' }}>Alternative Method of Entry (AMOE)</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#8FA899' }}>
            To get Sweep Coins without any purchase, mail a hand-written letter to the address below. Each valid AMOE request earns <span className="font-bold" style={{ color: '#2DC97A' }}>1.00 SC</span> credited within 30 days. One request per envelope per day. Letters must be handwritten in ink on plain paper — typed letters do not qualify.
          </p>
        </div>

        {/* Address block */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1A2E22' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F0B232' }}>Mail to</p>
            <button
              type="button"
              onClick={() => copy(MAILING_ADDRESS, 'address')}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: copied === 'address' ? '#2DC97A' : '#8FA899' }}
            >
              {copied === 'address' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <pre
            className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: '#F5E8C8' }}
          >
{MAILING_ADDRESS}
          </pre>
        </div>

        {/* What to include */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1A2E22' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#F0B232' }}>Include in every letter</p>
          <ul className="space-y-1">
            {[
              'Your full legal name',
              'Complete mailing address',
              'Date of birth (must be 18+)',
              'The email tied to your Yala account',
              'The exact phrase "Yala Sweepstakes AMOE"',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: '#F5E8C8' }}>
                <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#2DC97A' }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Template */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" style={{ color: '#A78BFA' }} />
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F0B232' }}>Letter template (for reference)</p>
            </div>
            <button
              type="button"
              onClick={() => copy(TEMPLATE_TEXT, 'template')}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: copied === 'template' ? '#2DC97A' : '#8FA899' }}
            >
              {copied === 'template' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <pre
            className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words p-3 rounded-lg"
            style={{ color: '#8FA899', background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2E22' }}
          >
{TEMPLATE_TEXT}
          </pre>
          <p className="text-[10px] mt-2" style={{ color: '#4A6A55' }}>
            Reminder: the LETTER itself must be hand-written. You can use this as a guide, but copy it onto a sheet of paper in your own handwriting.
          </p>
        </div>
      </section>

      {/* Standard rules sections */}
      <div className="space-y-5 text-sm leading-relaxed" style={{ color: '#8FA899' }}>
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-semibold text-base mb-1.5" style={{ color: '#F5E8C8' }}>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 text-center space-y-1" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs font-bold" style={{ color: '#8FA899' }}>NO PURCHASE NECESSARY · 18+ · VOID WHERE PROHIBITED</p>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.6)' }}>Gold Coins have no monetary value and cannot be redeemed. Sweep Coins redemption subject to applicable law.</p>
      </div>
    </div>
  );
}
