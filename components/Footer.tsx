import Link from 'next/link';
import { Shield, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-bold">
                IB
              </div>
              <span className="text-lg font-bold">InvestBridge</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              The trusted global marketplace where verified founders meet credible investors.
              Verified. Secure. Confidential. Global.
            </p>
          </div>

          <div>
            <p className="font-semibold text-white">Platform</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li><Link href="/projects" className="hover:text-indigo-400">Browse Projects</Link></li>
              <li><Link href="/register?role=investor" className="hover:text-indigo-400">Join as Investor</Link></li>
              <li><Link href="/register?role=founder" className="hover:text-indigo-400">List Your Business</Link></li>
              <li><Link href="/verification" className="hover:text-indigo-400">Get Verified</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white">Company</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li><Link href="/#how-it-works" className="hover:text-indigo-400">How It Works</Link></li>
              <li><Link href="/#trust" className="hover:text-indigo-400">Trust & Security</Link></li>
              <li><Link href="/support" className="hover:text-indigo-400">Support Center</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-400">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-400">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white">Newsletter</p>
            <p className="mt-3 text-sm text-slate-400">
              Get new projects and investment tips in your inbox.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
                <Mail className="h-4 w-4" /> Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} InvestBridge Global. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="h-4 w-4 text-emerald-400" />
            Bank-grade security & KYC verified
          </div>
        </div>
      </div>
    </footer>
  );
}
