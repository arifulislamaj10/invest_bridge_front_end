import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = { title: 'Privacy Policy · InvestBridge' };

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly — name, email, phone, business details, financial documents, identity and KYC verification documents — as well as data generated through your use of the platform such as deals, messages, reviews and payment records.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to operate the marketplace, verify identities and businesses, compute Trust Scores and risk ratings, facilitate deals between investors and founders, process payments, prevent fraud, and comply with legal obligations.',
  },
  {
    title: '3. The Trust Engine & Public Profiles',
    body: 'Certain information is shown publicly on business profiles to help investors make informed decisions: business name, verification badges, funding history, financial snapshots you choose to disclose, team members, milestones, investor reviews and your computed Trust Score. You control what financial details you publish.',
  },
  {
    title: '4. Document Verification',
    body: 'Documents you upload for verification (business license, tax file, bank statements, proof of funds, identity) are reviewed by our compliance team. We never display raw documents publicly — only the resulting verification badge.',
  },
  {
    title: '5. Sharing of Information',
    body: 'We do not sell your personal data. Information is shared only with deal counterparties (under NDA where applicable), payment processors, identity-verification providers, and authorities when legally required.',
  },
  {
    title: '6. Data Security',
    body: 'We apply bank-grade encryption in transit and at rest, role-based access controls, and audit logging of administrative actions. No system is perfectly secure, so we encourage strong passwords and account vigilance.',
  },
  {
    title: '7. Your Rights',
    body: 'You may access, correct, export or request deletion of your personal data, subject to legal and regulatory retention requirements (for example, transaction records). Contact us through the Support Center to exercise these rights.',
  },
  {
    title: '8. Cookies',
    body: 'We use essential cookies for authentication and session management, and analytics cookies to improve the product. You can control non-essential cookies through your browser settings.',
  },
  {
    title: '9. Changes to This Policy',
    body: 'We may update this policy from time to time. Material changes will be communicated via the platform or email. Continued use after changes constitutes acceptance.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container max-w-3xl">
        <h1 className="section-title">Privacy Policy</h1>
        <p className="section-subtitle">How InvestBridge collects, uses and protects your information.</p>
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
            Questions about your privacy? Reach our team through the{' '}
            <a href="/support" className="font-medium text-indigo-600 underline">Support Center</a>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
