export default function PrivacyPage() {
  return (
    <div className="max-w-3xl space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Privacy Policy</h1>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Last updated: May 21, 2026</p>
      </div>
      <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>
        {[
          { title: '1. Information We Collect', body: 'We collect information you provide when creating an account (name, email, date of birth), payment information for coin purchases (processed by third-party processors), identity verification documents (for KYC/redemptions), and usage data including IP address, device information, and gameplay activity.' },
          { title: '2. How We Use Your Information', body: 'We use your information to operate the Platform, process transactions, verify identity for sweepstakes eligibility, provide customer support, send promotional communications (with consent), comply with legal obligations, and detect and prevent fraud.' },
          { title: '3. Information Sharing', body: 'We do not sell your personal information. We may share data with: payment processors for coin purchases; identity verification providers for KYC; analytics providers; law enforcement when required by law; and in connection with a merger or acquisition.' },
          { title: '4. Data Security', body: 'We use industry-standard encryption and security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.' },
          { title: '5. Your Rights', body: 'Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal data. To exercise these rights, contact privacy@yala.com.' },
          { title: '6. Cookies', body: 'We use cookies and similar technologies for authentication, analytics, and personalization. You can control cookie settings through your browser.' },
          { title: '7. Data Retention', body: 'We retain your data for as long as your account is active and as required by applicable law. KYC documents are retained per regulatory requirements.' },
          { title: '8. Children', body: 'Yala is not intended for users under 18. We do not knowingly collect information from minors.' },
          { title: '9. Contact', body: 'For privacy inquiries, contact privacy@yala.com or write to Yala Gaming LLC, Privacy Team, 1234 Desert Blvd, Suite 100, Wilmington, DE 19801.' },
        ].map((s) => (
          <div key={s.title}>
            <h2 className="font-semibold text-base mb-2" style={{ color: '#F5E8C8' }}>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
