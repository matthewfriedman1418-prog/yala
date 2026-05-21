'use client';
import { useState } from 'react';
import { HelpCircle, MessageCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react';

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
    <div className="max-w-3xl space-y-8 animate-[fade-in_0.3s_ease-out]">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4" style={{ color: '#D6A84F' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>Support</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Help Center</h1>
        <p style={{ color: '#9CA3AF' }}>Find answers or get in touch with our support team.</p>
      </div>

      {/* Contact options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="glass-card p-5 text-left hover:border-[#D6A84F]/30 transition-all">
          <MessageCircle className="w-6 h-6 mb-3" style={{ color: '#D6A84F' }} />
          <p className="font-semibold mb-1" style={{ color: '#F5E8C8' }}>Live Chat</p>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Chat with a support agent in real time.</p>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400">Available 24/7</span>
          </div>
        </button>
        <button className="glass-card p-5 text-left hover:border-[#D6A84F]/30 transition-all">
          <Mail className="w-6 h-6 mb-3" style={{ color: '#D6A84F' }} />
          <p className="font-semibold mb-1" style={{ color: '#F5E8C8' }}>Email Support</p>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>support@yala.com — typically reply within 24h.</p>
          <span className="text-xs mt-2 block" style={{ color: '#9CA3AF' }}>Response time: &lt; 24 hours</span>
        </button>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: '#F5E8C8' }}>Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <p className="font-medium pr-4" style={{ color: '#F5E8C8' }}>{faq.q}</p>
                {openFaq === i ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#D6A84F' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-[#9CA3AF]" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 border-t border-[#1E1E1E] pt-3">
                  <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit ticket */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: '#F5E8C8' }}>Submit a Support Ticket</h3>
        {!submitted ? (
          <div className="space-y-3">
            <input type="email" value={ticketForm.email} onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })} placeholder="Your email" className="w-full px-4 py-2.5 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50" style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }} />
            <input type="text" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} placeholder="Subject" className="w-full px-4 py-2.5 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50" style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }} />
            <textarea value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} placeholder="Describe your issue..." rows={4} className="w-full px-4 py-2.5 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 resize-none" style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }} />
            <button onClick={() => { if (ticketForm.email && ticketForm.message) setSubmitted(true); }} className="w-full py-3 rounded-xl font-semibold text-sm text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>
              Submit Ticket
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-emerald-400 font-semibold">✓ Ticket Submitted</p>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>We will respond to {ticketForm.email} within 24 hours.</p>
          </div>
        )}
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs" style={{ color: '#9CA3AF' }}>Problem Gambling Helpline: <strong>1-800-522-4700</strong> (24/7, free)</p>
      </div>
    </div>
  );
}
