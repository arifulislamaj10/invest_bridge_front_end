'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, statusColor } from '@/lib/utils';
import { UserCircle, ShieldCheck, CheckCircle2, XCircle, Star, Briefcase } from 'lucide-react';

interface Credibility {
  profile: {
    _id: string;
    investorType?: string;
    companyName?: string;
    investmentRangeMin?: number;
    investmentRangeMax?: number;
    riskAppetite?: string;
    userId?: { fullName: string; email: string };
  };
  badges: { identity: boolean; proofOfFunds: boolean; address: boolean; bank: boolean };
  credibilityScore: number;
  accountStatus: string;
  isVerified: boolean;
  memberSince?: string;
  dealStats: { total: number; completed: number; active: number; totalCommitted: number };
  deals: { _id: string; project: string; provider: string; amount: number; status: string; createdAt: string }[];
  ratings: { average: number; count: number; items: { rating: number; review?: string; from?: string }[] };
}

function scoreColor(s: number) {
  if (s >= 70) return 'text-emerald-600';
  if (s >= 45) return 'text-amber-600';
  return 'text-orange-600';
}

const BADGE_LABELS: Record<string, string> = {
  identity: 'Identity Verified',
  proofOfFunds: 'Proof of Funds',
  address: 'Address Verified',
  bank: 'Bank Verified',
};

export default function InvestorCredibilityPage() {
  const { id } = useParams();
  const [data, setData] = useState<Credibility | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Credibility>(`/profiles/investor/${id}/credibility`).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <p className="py-20 text-center text-slate-400">{error}</p>
        <Footer />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <p className="py-20 text-center text-slate-400">Loading investor profile…</p>
        <Footer />
      </div>
    );
  }

  const p = data.profile;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <UserCircle className="h-9 w-9" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold sm:text-3xl">{p.userId?.fullName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-indigo-100">
                <span className="capitalize">{p.investorType} investor</span>
                {p.companyName && <span>· {p.companyName}</span>}
                <span className={`badge ${statusColor(data.accountStatus)}`}>{data.accountStatus}</span>
                {data.isVerified && <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Verified</span>}
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-3 text-center">
              <p className={`text-3xl font-extrabold ${scoreColor(data.credibilityScore)}`}>{data.credibilityScore}</p>
              <p className="text-xs text-indigo-100">Credibility</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm text-slate-600">
          You are reviewing this investor&apos;s credibility before engaging. Verified funds and a strong deal track record indicate a trustworthy investor.
        </div>

        {/* Verification badges */}
        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><ShieldCheck className="h-5 w-5 text-indigo-600" /> Verification</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Object.entries(data.badges).map(([k, ok]) => (
              <div key={k} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${ok ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {BADGE_LABELS[k]}
              </div>
            ))}
          </div>
        </div>

        {/* Deal track record */}
        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Briefcase className="h-5 w-5 text-indigo-600" /> Investment Track Record</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Deals', value: data.dealStats.total },
              { label: 'Completed', value: data.dealStats.completed },
              { label: 'Active', value: data.dealStats.active },
              { label: 'Total Committed', value: formatCurrency(data.dealStats.totalCommitted) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          {p.investmentRangeMax ? (
            <p className="mt-4 text-sm text-slate-500">
              Stated investment range: <span className="font-medium text-slate-700">{formatCurrency(p.investmentRangeMin || 0)} – {formatCurrency(p.investmentRangeMax)}</span>
              {p.riskAppetite && <> · Risk appetite: <span className="capitalize">{p.riskAppetite}</span></>}
            </p>
          ) : null}
          {data.deals.length > 0 && (
            <div className="mt-4 space-y-2">
              {data.deals.map((d) => (
                <div key={d._id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{d.project}</p>
                    <p className="text-xs text-slate-400">with {d.provider} · {formatDate(d.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700">{formatCurrency(d.amount)}</span>
                    <span className={`badge ${statusColor(d.status)}`}>{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ratings */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Star className="h-5 w-5 text-indigo-600" /> Reputation</h2>
            <span className="text-sm font-medium text-slate-700">{data.ratings.average} ({data.ratings.count})</span>
          </div>
          {data.ratings.items.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No ratings from founders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.ratings.items.map((r, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-4 w-4 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  {r.review && <p className="mt-2 text-sm text-slate-600">{r.review}</p>}
                  <p className="mt-1 text-xs text-slate-400">{r.from || 'Founder'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400">Member since {data.memberSince ? formatDate(data.memberSince) : 'N/A'}</p>
      </div>
      <Footer />
    </div>
  );
}
