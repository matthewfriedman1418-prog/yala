export default function TermsPage() {
  return (
    <div className="max-w-3xl space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Terms of Service</h1>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Last updated: May 21, 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>
        {[
          { title: '1. Introduction', body: 'Welcome to Yala ("Platform", "we", "us", "our"). By creating an account or accessing any portion of the Platform, you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. Yala is a social sweepstakes entertainment platform. No real money gambling occurs on Yala. Gold Coins are virtual currency with no monetary value.' },
          { title: '2. Eligibility', body: 'You must be at least 18 years of age to register or use the Platform. By registering, you represent and warrant that you are at least 18 years old and that your use of the Platform is legal in your jurisdiction. The Platform is void where prohibited by law. Residents of certain states may be restricted from participating in sweepstakes.' },
          { title: '3. No Purchase Necessary', body: 'No purchase is necessary to enter or win Sweep Coins prizes on Yala. Free Gold Coins are available through daily login bonuses, free spins, and other promotional mechanics. Alternative methods of entry (AMOE) are available as described in the Official Sweepstakes Rules.' },
          { title: '4. Virtual Currency', body: 'Gold Coins (GC) are virtual currency provided solely for entertainment purposes. GC have no monetary value, cannot be exchanged for real money, and are non-transferable. Sweep Coins (SC) can be redeemed for prizes as described in the Official Sweepstakes Rules, subject to applicable law and eligibility requirements.' },
          { title: '5. Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials. You may only create one account per person. Duplicate accounts may be suspended. You agree to provide accurate, complete information during registration and keep it updated.' },
          { title: '6. Prohibited Conduct', body: 'You agree not to: use automated tools or bots; exploit bugs or vulnerabilities; harass other users; engage in fraud; circumvent geographic restrictions; create duplicate accounts; or violate any applicable law. Violations may result in permanent account suspension.' },
          { title: '7. Intellectual Property', body: 'All content on Yala — including the name, logo, game designs, text, graphics, and software — is owned by Yala Gaming LLC or its licensors. You may not reproduce, distribute, or create derivative works without written permission.' },
          { title: '8. Disclaimers', body: 'The Platform is provided "as is" without warranties of any kind. Yala does not guarantee uninterrupted service. Results from games are determined by certified random number generators for entertainment purposes only.' },
          { title: '9. Limitation of Liability', body: 'To the maximum extent permitted by law, Yala shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.' },
          { title: '10. Governing Law', body: 'These Terms are governed by the laws of the State of Delaware, without regard to conflict of law provisions.' },
          { title: '11. Changes', body: 'We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms.' },
          { title: '12. Contact', body: 'For questions regarding these Terms, contact us at legal@yala.com.' },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="font-semibold text-base mb-2" style={{ color: '#F5E8C8' }}>{section.title}</h2>
            <p>{section.body}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Gold Coins have no cash value · Void Where Prohibited</p>
      </div>
    </div>
  );
}
