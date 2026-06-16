'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusColor } from '@/lib/utils';

interface Sub {
  _id: string;
  planName: string;
  status: string;
  expiresAt?: string;
  createdAt: string;
  userId?: { fullName: string; email: string; role: string; accountStatus: string };
}

const PLAN_STYLE: Record<string, string> = {
  basic: 'bg-slate-100 text-slate-600',
  premium: 'bg-indigo-50 text-indigo-700',
  enterprise: 'bg-amber-50 text-amber-700',
};

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const qs = new URLSearchParams();
    if (plan) qs.set('plan', plan);
    if (status) qs.set('status', status);
    api.get<Sub[]>(`/admin/subscriptions${qs.toString() ? `?${qs}` : ''}`).then(setSubs).catch(() => {});
  }, [plan, status]);

  const counts = subs.reduce((a: Record<string, number>, s) => { a[s.planName] = (a[s.planName] || 0) + 1; return a; }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-sm text-slate-500">Who is subscribed, on which plan, and their status.</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-auto !py-2" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="">All plans</option>
            {['basic', 'premium', 'enterprise'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input w-auto !py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {['active', 'cancelled', 'expired'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {['basic', 'premium', 'enterprise'].map((p) => (
          <div key={p} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xl font-bold text-slate-900">{counts[p] || 0}</p>
            <p className="text-xs capitalize text-slate-500">{p} (filtered)</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Subscriber</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Since</th>
              <th className="px-4 py-3">Renews / Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {subs.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{s.userId?.fullName || '—'}</p>
                  <p className="text-xs text-slate-400">{s.userId?.email}</p>
                </td>
                <td className="px-4 py-3 capitalize text-slate-600">{s.userId?.role}</td>
                <td className="px-4 py-3"><span className={`badge capitalize ${PLAN_STYLE[s.planName]}`}>{s.planName}</span></td>
                <td className="px-4 py-3"><span className={`badge ${statusColor(s.status)}`}>{s.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3 text-slate-500">{s.expiresAt ? formatDate(s.expiresAt) : '—'}</td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No subscriptions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
