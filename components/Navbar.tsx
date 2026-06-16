'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { LogOut, Menu, X, Bell, User, Shield } from 'lucide-react';
import { useState } from 'react';

const publicLinks = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#trust', label: 'Trust & Verify' },
  { href: '/#reviews', label: 'Reviews' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'founder'
      ? '/founder'
      : '/investor';

  const authLinks = user
    ? [
        { href: dashboardPath, label: 'Dashboard' },
        { href: '/projects', label: 'Projects' },
        { href: '/deals', label: 'Deals' },
        { href: '/verification', label: 'Verification' },
        { href: '/support', label: 'Support' },
      ]
    : publicLinks;

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-2.5 text-center text-xs font-medium text-white sm:text-sm">
        ✦ Verified Investors Only · Secure Deal Rooms · Start Free Today
      </div>

      <nav className="border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-sm font-bold text-white shadow-md">
              IB
            </div>
            <span className="text-lg font-bold text-slate-900">
              Invest<span className="text-indigo-600">Bridge</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                {user.isVerified && (
                  <span className="badge bg-emerald-50 text-emerald-700">
                    <Shield className="mr-1 h-3 w-3" /> Verified
                  </span>
                )}
                <Link href="/notifications" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600">
                  <Bell className="h-5 w-5" />
                </Link>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.fullName}</span>
                </span>
                <button onClick={logout} className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-500" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary !px-5 !py-2.5 text-sm">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
              {user ? (
                <button onClick={logout} className="text-left text-sm text-red-500">Logout</button>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary w-full text-center text-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link href="/register" className="btn-primary w-full text-center text-sm" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
