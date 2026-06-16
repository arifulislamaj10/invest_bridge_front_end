'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users, Briefcase, Handshake, Star, Wallet, CreditCard, TrendingUp,
  LifeBuoy, ShieldCheck, ArrowUpRight,
} from 'lucide-react';

interface Summary {
  users: { total: number; investors: number; founders: number; admins: number; active: number; suspended: number; pending: number };
  projects: { total: number; active: number; funded: number };
  deals: { total: number; completed: number };
  reviews: number;
  moneyFlow: { pending: number; in_escrow: number; released: number; refunded: number; failed: number; grossVolume: number; totalRaised: number; platformRevenue: number };
  subscriptions: { active: number; byPlan: { basic: number; premium: number; enterprise: number }; mrr: number };
  queues: { openTickets: number; pendingVerifications: number; openDisputes: number; pendingProjects?: number };
}
interface FeedItem { type: string; at: string; text: string }

export default function AdminOverview() {
  const [s, setS] = useState<Summary | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    api.get<Summary>('/admin/summary').then(setS).catch(() => {});
    api.get<FeedItem[]>('/admin/activity').then(setFeed).catch(() => {});
  }, []);

  if (!s) return <p className="text-sm text-slate-400">Loading dashboard…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500">Everything happening across the platform at a glance.</p>
      </div>

      {/* Money headline */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-5 text-white shadow-lg shadow-indigo-500/20">
          <Wallet className="h-6 w-6 opacity-80" />
          <p className="mt-3 text-2xl font-extrabold">{formatCurrency(s.moneyFlow.grossVolume)}</p>
          <p className="text-sm text-indigo-100">Gross Transaction Volume</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/20">
          <TrendingUp className="h-6 w-6 opacity-80" />
          <p className="mt-3 text-2xl font-extrabold">{formatCurrency(s.moneyFlow.platformRevenue)}</p>
          <p className="text-sm text-emerald-100">Platform Revenue (fees)</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 p-5 text-white shadow-lg shadow-sky-500/20">
          <CreditCard className="h-6 w-6 opacity-80" />
          <p className="mt-3 text-2xl font-extrabold">{formatCurrency(s.subscriptions.mrr)}</p>
          <p className="text-sm text-sky-100">Subscription MRR</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-amber-500/20">
          <Wallet className="h-6 w-6 opacity-80" />
          <p className="mt-3 text-2xl font-extrabold">{formatCurrency(s.moneyFlow.in_escrow)}</p>
          <p className="text-sm text-amber-100">Funds In Escrow</p>
        </div>
      </div>

      {/* Marketplace KPIs — clickable where a destination exists */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {([
          { label: 'Investors', value: s.users.investors, icon: Users, href: '/admin/users?role=investor' },
          { label: 'Founders', value: s.users.founders, icon: Briefcase, href: '/admin/users?role=founder' },
          { label: 'Projects', value: s.projects.total, icon: Briefcase, href: '/admin/projects?status=active' },
          { label: 'Pending Review', value: s.queues.pendingProjects ?? 0, icon: Briefcase, href: '/admin/projects' },
          { label: 'Deals', value: s.deals.total, icon: Handshake, href: undefined },
          { label: 'Reviews', value: s.reviews, icon: Star, href: undefined },
        ] as { label: string; value: number; icon: typeof Users; href?: string }[]).map((k) => {
          const inner = (
            <>
              <k.icon className="h-5 w-5 text-indigo-500" />
              <p className="mt-2 text-xl font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500">{k.label}</p>
            </>
          );
          return k.href ? (
            <Link key={k.label} href={k.href} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              {inner}
            </Link>
          ) : (
            <div key={k.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">{inner}</div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Money flow breakdown */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Money Flow Breakdown</h2>
            <Link href="/admin/payments" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
              Full ledger <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'Released', value: s.moneyFlow.released, c: 'text-emerald-600' },
              { label: 'In Escrow', value: s.moneyFlow.in_escrow, c: 'text-amber-600' },
              { label: 'Pending', value: s.moneyFlow.pending, c: 'text-slate-600' },
              { label: 'Refunded', value: s.moneyFlow.refunded, c: 'text-slate-600' },
              { label: 'Failed', value: s.moneyFlow.failed, c: 'text-red-600' },
              { label: 'Total Raised', value: s.moneyFlow.totalRaised, c: 'text-slate-900' },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-slate-50 p-3">
                <p className={`text-lg font-bold ${m.c}`}>{formatCurrency(m.value)}</p>
                <p className="text-xs text-slate-500">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions snapshot */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Subscriptions</h2>
            <Link href="/admin/subscriptions" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
              View <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{s.subscriptions.active}</p>
          <p className="text-xs text-slate-500">Active subscriptions</p>
          <div className="mt-4 space-y-2">
            {([['Basic', s.subscriptions.byPlan.basic], ['Premium', s.subscriptions.byPlan.premium], ['Enterprise', s.subscriptions.byPlan.enterprise]] as [string, number][]).map(([plan, n]) => (
              <div key={plan} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{plan}</span>
                <span className="font-semibold text-slate-900">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Queues */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Projects Awaiting Review', value: s.queues.pendingProjects ?? 0, href: '/admin/projects', icon: Briefcase },
          { label: 'Open Support Tickets', value: s.queues.openTickets, href: '/admin/support', icon: LifeBuoy },
          { label: 'Pending KYC', value: s.queues.pendingVerifications, href: '/admin/verifications', icon: ShieldCheck },
        ].map((q) => (
          <Link key={q.label} href={q.href} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-indigo-200">
            <div className="flex items-center gap-3">
              <q.icon className="h-5 w-5 text-indigo-500" />
              <span className="text-sm text-slate-600">{q.label}</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{q.value}</span>
          </Link>
        ))}
      </div>

      {/* Activity */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Recent Activity</h2>
        <div className="mt-3 space-y-1">
          {feed.slice(0, 15).map((f, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-slate-50 py-2.5 last:border-0">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${f.type === 'deal' ? 'bg-indigo-500' : f.type === 'review' ? 'bg-amber-500' : f.type === 'signup' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div className="flex-1">
                <p className="text-sm text-slate-700">{f.text}</p>
                <p className="text-xs text-slate-400">{formatDate(f.at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
