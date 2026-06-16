import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = { title: 'Terms & Conditions · InvestBridge' };

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using InvestBridge, you agree to these Terms & Conditions and our Privacy Policy. If you do not agree, do not use the platform.',
  },
  {
    title: '2. Eligibility & Accounts',
    body: 'You must be of legal age and capacity to enter into binding agreements. You are responsible for the accuracy of the information you provide and for keeping your credentials secure. Accounts may be suspended for fraud, misrepresentation or policy violations.',
  },
  {
    title: '3. Role of the Platform',
    body: 'InvestBridge is a marketplace that connects investors with founders seeking funding. We are not a broker-dealer, investment adviser, or party to any investment agreement. Trust Scores, risk ratings and verification badges are informational tools, not investment advice or guarantees.',
  },
  {
    title: '4. Investor Responsibilities',
    body: 'Investing carries risk, including total loss of capital. Investors must perform their own due diligence. Reviewing a Trust Score, financials, milestones and reviews does not replace independent professional advice. Past performance and projected ROI are not guarantees of future results.',
  },
  {
    title: '5. Founder / Business Responsibilities',
    body: 'Founders must provide truthful business, financial and team information and may not misrepresent revenue, traction or legal standing. Submitting fraudulent verification documents results in immediate removal and may be reported to authorities.',
  },
  {
    title: '6. Reviews & Trust Layer',
    body: 'Reviews must reflect genuine experiences. Only investors who have transacted with a business may post a verified review. Manipulating Trust Scores, posting fake reviews, or attempting to game the verification system is strictly prohibited.',
  },
  {
    title: '7. Deals, Payments & Escrow',
    body: 'Deals initiated on the platform may involve escrow and a service fee on released funds. All payment terms are disclosed before completion. You agree to transact in good faith and to use the in-platform deal room and dispute process.',
  },
  {
    title: '8. Disputes',
    body: 'Disputes between parties should first be raised through the platform’s dispute resolution process. We may mediate but are not obligated to resolve commercial disputes between users.',
  },
  {
    title: '9. Prohibited Conduct',
    body: 'No fraud, money laundering, harassment, scraping, reverse engineering, or circumventing the platform to avoid fees. Violations may result in suspension, forfeiture and legal action.',
  },
  {
    title: '10. Limitation of Liability',
    body: 'To the maximum extent permitted by law, InvestBridge is not liable for investment losses, indirect or consequential damages, or the conduct of other users. The platform is provided "as is".',
  },
  {
    title: '11. Changes & Termination',
    body: 'We may modify these terms or suspend the service at any time. We may terminate accounts that violate these terms. Material changes will be communicated through the platform.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container max-w-3xl">
        <h1 className="section-title">Terms &amp; Conditions</h1>
        <p className="section-subtitle">The rules for using the InvestBridge marketplace.</p>
        <p className="mt-2 text-sm text-slate-400">Last updated: June 2026</p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="card mt-12 bg-indigo-50/50">
          <p className="text-sm text-slate-600">
            By using InvestBridge you acknowledge that investing involves risk and that the platform’s trust signals are
            informational only. Need help? Visit the{' '}
            <a href="/support" className="font-medium text-indigo-600 underline">Support Center</a>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
