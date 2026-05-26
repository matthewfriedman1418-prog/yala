'use client';
import { useState } from 'react';
import { HelpCircle, MessageCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { toast } from 'sonner';

const FAQS = [
  { q: 'What is Yala?', a: 'Yala is a social sweepstakes casino platform. We offer free-to-play games using virtual Gold Coins and Sweep Coins. No real money gambling occurs on Yala.' },
  { q: 'Do I need to purchase coins to play?', a: 'No! You can play for free using Gold Coins received through daily bonuses, login streaks, free spins, and other promotions. No purchase is ever necessary.' },
  { q: 'What are Gold Coins vs Sweep Coins?', a: 'Gold Coins (GC) are virtual play coins with no monetary value. Sweep Coins (SC) can be redeemed for cash prizes where permitted by applicable law. Both can be earned free of charge.' },
  { q: 'How do I redeem Sweep Coins?', a: 'To redeem SC, you must be KYC verified and meet the minimum redemption threshold. Go to Wallet → Redeem to start the process. Redemptions are reviewed within 1-3 business days.' },
  { q: 'What is the minimum SC balance to redeem?', a: 'The minimum redemption amount is 25 SC for PayPal, 50 SC for bank transfer (ACH), and 100 SC for check by mail.' },
  { q: 'What is Rakeback?', a: 'Rakeback is a percentage of your wagered Gold Coins returned to your Bonus Balance daily. The rate depends on your VIP tier (5% to 25%). Claim it daily from your Rakeback page.' },
  { q: 'How does the Vault work?', a: 'The Vault lets you lock Gold Coins to earn 5% daily interest. You can deposit or withdraw at any time. Interest is credited automatically each day.' },
  { q: 'Is Yala available in my state?', a: 'Yala is available in most US states. Some states with specific sweepstakes restrictions may be excluded. You will see a notice if your location is not eligible. Void where prohibited.' },
  { q: 'How do I verify my identity (KYC)?', a: 'Go to Profile → Verify Identity. You will need a government-issued ID and proof of address. Verification is required before redeeming Sweep Coins.' },
  { q: 'I think I have a gambling problem. What should I do?', a: 'Please contact the National Problem Gambling Helpline at 1-800-522-4700 (24/7, free, confidential). You can also use our Responsible Gaming tools to set limits or self-exclude.' },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-6xl space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Compact header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4" style={{ color: '#F0B232' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#F0B232' }}>Support</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Help Center</h1>
        <p style={{ color: '#8FA3B8' }}>Search the FAQ, hit live chat, or open a ticket.</p>
      </div>

      {/* Two-column layout: contact + FAQ on the left, ticket on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* LEFT column: contact + FAQ */}
        <div className="space-y-6">
          {/* Contact options — compact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => toast('Live chat opens here', { description: 'Real chat widget (Intercom/Zendesk) ships with the backend.' })}
              className="rounded-2xl p-4 text-left transition-all hover:border-[#F0B232]/30 flex items-start gap-3"
              style={{ background: '#0F1828', border: '1px solid #1A2238' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}>
                <MessageCircle className="w-5 h-5" style={{ color: '#F0B232' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm mb-0.5" style={{ color: '#F5E8C8' }}>Live Chat</p>
                <p className="text-xs leading-snug" style={{ color: '#8FA3B8' }}>Real-time agent</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-semibold">24/7</span>
                </div>
              </div>
            </button>
            <a
              href="mailto:support@yala.com?subject=Yala%20Support%20Request"
              className="rounded-2xl p-4 text-left transition-all hover:border-[#F0B232]/30 flex items-start gap-3"
              style={{ background: '#0F1828', border: '1px solid #1A2238' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}>
                <Mail className="w-5 h-5" style={{ color: '#F0B232' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm mb-0.5" style={{ color: '#F5E8C8' }}>Email</p>
                <p className="text-xs leading-snug truncate" style={{ color: '#8FA3B8' }}>support@yala.com</p>
                <p className="text-[10px] mt-1.5 font-semibold" style={{ color: '#8FA3B8' }}>&lt; 24h response</p>
              </div>
            </a>
          </div>

          {/* FAQ — tighter spacing */}
          <div>
            <h2 className="font-display text-lg font-bold mb-3" style={{ color: '#F5E8C8' }}>Frequently Asked Questions</h2>
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
              {FAQS.map((faq, i) => (
                <div key={i} className={i > 0 ? 'border-t' : ''} style={{ borderColor: '#1A2238' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <p className="font-medium text-sm pr-4" style={{ color: '#F5E8C8' }}>{faq.q}</p>
                    {openFaq === i
                      ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#F0B232' }} />
                      : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#8FA3B8' }} />}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 -mt-1">
                      <p className="text-xs leading-relaxed" style={{ color: '#8FA3B8' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT column: sticky ticket form */}
        <div className="rounded-2xl p-5 lg:sticky lg:top-4" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: '#F5E8C8' }}>Submit a Ticket</h3>
          {!submitted ? (
            <div className="space-y-2.5">
              <input type="email" value={ticketForm.email} onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })} placeholder="Your email" className="w-full px-3 py-2 rounded-lg text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#F0B232]/50" style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1A2238' }} />
              <input type="text" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} placeholder="Subject" className="w-full px-3 py-2 rounded-lg text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#F0B232]/50" style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1A2238' }} />
              <textarea value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} placeholder="Describe your issue…" rows={5} className="w-full px-3 py-2 rounded-lg text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#F0B232]/50 resize-none" style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1A2238' }} />
              <button
                onClick={() => {
                  if (!ticketForm.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ticketForm.email)) {
                    toast.error('Enter a valid email');
                    return;
                  }
                  if (!ticketForm.message.trim()) {
                    toast.error('Add a description of your issue');
                    return;
                  }
                  setSubmitted(true);
                  toast.success('Ticket submitted', { description: `We'll reply to ${ticketForm.email} within 24h.` });
                }}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
              >
                Submit Ticket
              </button>
              <p className="text-[10px] text-center pt-1" style={{ color: '#4A5878' }}>
                Average response time: under 24h
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2Icon />
              <p className="text-emerald-400 font-semibold text-sm mt-2">Ticket Submitted</p>
              <p className="text-xs mt-1" style={{ color: '#8FA3B8' }}>We will reply to {ticketForm.email} within 24h.</p>
            </div>
          )}

          {/* RG helpline tucked in the same column */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #1A2238' }}>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: '#8FA3B8' }}>Problem Gambling</p>
            <p className="text-xs" style={{ color: '#F5E8C8' }}>
              Helpline: <a href="tel:1-800-522-4700" className="font-bold" style={{ color: '#2DC97A' }}>1-800-522-4700</a>
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#4A5878' }}>24/7 · free · confidential</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2Icon() {
  return (
    <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(45,201,122,0.12)', border: '1px solid rgba(45,201,122,0.3)' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4 10-10" stroke="#2DC97A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}
