'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface Payment {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  transactionId?: string;
  createdAt: string;
  project: string;
  from: string; fromEmail: string;
  to: string; toEmail: string;
}

const STATUS_STYLE: Record<string, string> = {
  released: 'bg-emerald-50 text-emerald-700',
  in_escrow: 'bg-amber-50 text-amber-700',
  pending: 'bg-slate-100 text-slate-600',
  refunded: 'bg-blue-50 text-blue-700',
  failed: 'bg-red-50 text-red-600',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.get<Payment[]>(`/admin/payments${status ? `?status=${status}` : ''}`).then(setPayments).catch(() => {});
  }, [status]);

  const totals = payments.reduce(
    (acc, p) => { acc.all += p.amount; if (p.status === 'released') acc.released += p.amount; if (p.status === 'in_escrow') acc.escrow += p.amount; return acc; },
    { all: 0, released: 0, escrow: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Money Flow</h1>
          <p className="text-sm text-slate-500">Every transaction — who paid whom, how much, and its status.</p>
        </div>
        <select className="input w-auto !py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['pending', 'in_escrow', 'released', 'refunded', 'failed'].map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total (filtered)', value: totals.all },
          { label: 'Released', value: totals.released },
          { label: 'In Escrow', value: totals.escrow },
        ].map((t) => (
          <div key={t.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xl font-bold text-slate-900">{formatCurrency(t.value)}</p>
            <p className="text-xs text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Flow (Investor → Founder)</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Txn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{p.from}</p>
                      <p className="text-xs text-slate-400">{p.fromEmail}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-indigo-400" />
                    <div>
                      <p className="font-medium text-slate-900">{p.to}</p>
                      <p className="text-xs text-slate-400">{p.toEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.project}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3"><span className={`badge ${STATUS_STYLE[p.status] || 'bg-slate-100 text-slate-600'}`}>{p.status.replace(/_/g, ' ')}</span></td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.transactionId || '—'}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No payments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
