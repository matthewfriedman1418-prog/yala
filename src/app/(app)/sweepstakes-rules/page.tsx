export default function SweepstakesRulesPage() {
  return (
    <div className="max-w-3xl space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <div className="inline-block px-3 py-1 rounded-full mb-3 text-xs font-bold uppercase tracking-wide" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
          No Purchase Necessary
        </div>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Official Sweepstakes Rules</h1>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Effective: May 21, 2026 — Yala Gaming LLC</p>
      </div>

      <div className="px-5 py-4 rounded-2xl border" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.25)' }}>
        <p className="text-base font-bold text-emerald-400 mb-2">NO PURCHASE NECESSARY</p>
        <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>
          No purchase or payment of any kind is necessary to enter or win Sweep Coins prizes on the Yala platform. A purchase does not improve your chances of winning. See Alternative Method of Entry below.
        </p>
      </div>

      <div className="space-y-5 text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>
        {[
          { title: 'Sponsor', body: 'Yala Gaming LLC ("Sponsor"), 1234 Desert Blvd, Suite 100, Wilmington, DE 19801.' },
          { title: 'Eligibility', body: 'Open to legal residents of the United States (excluding residents of Washington, Idaho, Michigan, Nevada, and any other state where sweepstakes are prohibited), who are 18 years of age or older at the time of entry. Void where prohibited. Employees of Sponsor and their immediate family members are not eligible.' },
          { title: 'Currencies', body: 'Gold Coins (GC): Virtual play currency with no monetary value. Cannot be redeemed for cash or prizes. Sweep Coins (SC): Sweepstakes currency that can be redeemed for prizes. Can be obtained through free daily bonuses, login rewards, free spins, promotions, and Alternative Method of Entry (AMOE), in addition to optional purchase.' },
          { title: 'How to Play', body: 'Players use GC or SC to participate in available social games on the Platform. GC gameplay is for entertainment only. SC gameplay enters players into sweepstakes-style prize draws. Winning depends on game outcomes determined by random number generators.' },
          { title: 'Alternative Method of Entry (AMOE)', body: 'To obtain free Sweep Coins without purchase: Send a handwritten letter including your full name, complete mailing address, date of birth, valid email address, and the words "Yala Sweepstakes AMOE" to: Yala Gaming LLC, AMOE Department, 1234 Desert Blvd, Suite 100, Wilmington, DE 19801. Each valid AMOE request will receive 1.0 Sweep Coin within 30 days of receipt. One AMOE per envelope per day.' },
          { title: 'Prizes & Redemption', body: 'Sweep Coins can be redeemed for cash prizes at a rate of 1 SC = $1.00 USD. Minimum redemption: 25 SC. Redemptions are subject to identity verification (KYC). Redemptions processed via PayPal, ACH bank transfer, or check. Processing time: 1-10 business days depending on method. Prize values may be subject to applicable tax reporting requirements.' },
          { title: 'Odds', body: 'Odds of winning depend on the number of SC wagered, game type, and random number generator outcomes. The house edge varies by game and is disclosed on each game page. No skill, purchase, or payment improves your odds.' },
          { title: 'Restrictions', body: 'Void where prohibited. Participants must be eligible under applicable state law. The Sponsor reserves the right to disqualify any participant for fraud, abuse, or violation of these Rules.' },
          { title: 'Dispute Resolution', body: 'Any dispute arising from participation shall be resolved by binding arbitration in Delaware in accordance with AAA rules. Class action waiver applies.' },
          { title: 'General Conditions', body: 'Sponsor reserves the right to cancel, suspend, or modify the promotion if fraud, technical failures, or any other factor impairs the integrity of the promotion. Sponsor is not responsible for technical failures, lost entries, or unauthorized access.' },
          { title: 'Winners List', body: 'For a list of prize winners, send a self-addressed, stamped envelope to Yala Gaming LLC, Winners List, 1234 Desert Blvd, Suite 100, Wilmington, DE 19801, within 90 days of the applicable promotion end date.' },
        ].map((s) => (
          <div key={s.title}>
            <h2 className="font-semibold text-base mb-1.5" style={{ color: '#F5E8C8' }}>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center space-y-1">
        <p className="text-xs font-bold" style={{ color: '#9CA3AF' }}>NO PURCHASE NECESSARY · 18+ · VOID WHERE PROHIBITED</p>
        <p className="text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>Gold Coins have no monetary value and cannot be redeemed. Sweep Coins redemption subject to applicable law.</p>
      </div>
    </div>
  );
}
