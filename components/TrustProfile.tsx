'use client';

import { TrustProfileData } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Linkedin,
  Activity,
  Wallet,
  Target,
} from 'lucide-react';

function scoreColor(score: number) {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  if (score >= 30) return 'text-orange-600';
  return 'text-red-600';
}

function scoreStroke(score: number) {
  if (score >= 70) return '#059669';
  if (score >= 50) return '#d97706';
  if (score >= 30) return '#ea580c';
  return '#dc2626';
}

function riskStyle(level: string) {
  if (level === 'Low Risk') return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', pct: 25 };
  if (level === 'Medium Risk') return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', pct: 60 };
  return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', pct: 90 };
}

const BADGE_LABELS: Record<string, string> = {
  businessLicense: 'Business License',
  taxFile: 'Tax File',
  bankStatement: 'Bank Statement',
  revenue: 'Revenue Verified',
  founderIdentity: 'Founder Identity',
  proofOfFunds: 'Proof of Funds',
  address: 'Address',
};

const BREAKDOWN_LABELS: Record<string, string> = {
  verification: 'Verification',
  revenueProof: 'Revenue Proof',
  teamCredibility: 'Team Credibility',
  milestoneCompletion: 'Milestone Completion',
  investorReviews: 'Investor Reviews',
  legalCompliance: 'Legal Compliance',
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </span>
  );
}

function TrustGauge({ score, label }: { score: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={scoreStroke(score)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-extrabold ${scoreColor(score)}`}>{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
        <span className={`mt-0.5 text-xs font-semibold ${scoreColor(score)}`}>{label}</span>
      </div>
    </div>
  );
}

export default function TrustProfile({ data }: { data: TrustProfileData }) {
  const risk = riskStyle(data.risk.level);
  const fh = data.fundingHistory;
  const fin = data.financials;

  return (
    <div className="space-y-6">
      {/* Trust score + risk header */}
      <div className="card">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <TrustGauge score={data.trustScore} label={data.trustLabel} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900">Business Trust Score</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Auto-computed from verifications, financials, team, milestones, reviews and legal standing.
            </p>
            <div className="mt-4 space-y-2">
              {Object.entries(data.breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-0.5 flex justify-between text-xs text-slate-500">
                    <span>{BREAKDOWN_LABELS[key] || key} <span className="text-slate-400">({data.weights[key]}%)</span></span>
                    <span className="font-medium text-slate-700">{value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk meter */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Activity className="h-5 w-5 text-indigo-600" /> Risk Meter
          </h3>
          <span className={`badge ${risk.bg} ${risk.text}`}>{data.risk.level}</span>
        </div>
        <div className="relative mt-4 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500">
          <div
            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-slate-800 shadow"
            style={{ left: `${Math.min(Math.max(data.risk.score, 3), 97)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>Low</span><span>Medium</span><span>High</span>
        </div>
        <ul className="mt-4 space-y-1.5">
          {data.risk.factors.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Verification badges */}
      <div className="card">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ShieldCheck className="h-5 w-5 text-indigo-600" /> Document Verification
        </h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.entries(data.badges).map(([key, ok]) => (
            <div
              key={key}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                ok ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-slate-50 text-slate-400'
              }`}
            >
              {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {BADGE_LABELS[key] || key}
            </div>
          ))}
        </div>
      </div>

      {/* Funding history */}
      <div className="card">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Wallet className="h-5 w-5 text-indigo-600" /> Funding History
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Raised', value: formatCurrency(fh.totalRaised) },
            { label: 'Total Investors', value: fh.totalInvestors },
            { label: 'Successful Closures', value: fh.successfulClosures },
            { label: 'Active Deals', value: fh.activeDeals },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Financial health snapshot */}
      {fin && (fin.yearlyRevenue || fin.monthlyRevenue || fin.profitMargin) ? (
        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 text-indigo-600" /> Financial Health
            {fin.revenueVerified && (
              <span className="badge bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</span>
            )}
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'Monthly Revenue', value: formatCurrency(fin.monthlyRevenue || 0) },
              { label: 'Yearly Revenue', value: formatCurrency(fin.yearlyRevenue || 0) },
              { label: 'Profit Margin', value: `${fin.profitMargin || 0}%` },
              { label: 'Cash Flow', value: formatCurrency(fin.cashFlow || 0) },
              { label: 'Burn Rate', value: formatCurrency(fin.burnRate || 0) },
              { label: 'Debt Ratio', value: `${fin.debtRatio || 0}%` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-base font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Team transparency */}
      {data.team.length > 0 && (
        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Users className="h-5 w-5 text-indigo-600" /> Team
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.team.map((m) => (
              <div key={m._id} className="flex items-start justify-between rounded-xl border border-slate-100 p-3">
                <div>
                  <p className="flex items-center gap-1.5 font-medium text-slate-900">
                    {m.name}
                    {m.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  </p>
                  <p className="text-sm text-slate-500">{m.role}</p>
                  {m.experienceYears ? <p className="text-xs text-slate-400">{m.experienceYears} yrs experience</p> : null}
                  {m.bio && <p className="mt-1 text-xs text-slate-500">{m.bio}</p>}
                </div>
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI history */}
      {data.roi.length > 0 && (
        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Target className="h-5 w-5 text-indigo-600" /> ROI History
          </h3>
          <div className="mt-4 space-y-2">
            {data.roi.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.periodLabel || 'Investment period'}</p>
                  {r.notes && <p className="text-xs text-slate-400">{r.notes}</p>}
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-xs text-slate-400">Expected</p>
                    <p className="text-sm font-semibold text-slate-700">{r.expectedROI || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Achieved</p>
                    <p className={`text-sm font-semibold ${(r.achievedROI || 0) >= (r.expectedROI || 0) ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {r.achievedROI || 0}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fraud / dispute transparency */}
      <div className="card">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ShieldCheck className="h-5 w-5 text-indigo-600" /> Trust & Safety Record
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: 'Disputes Resolved', value: data.fraudHistory.disputesResolved },
            { label: 'Open Disputes', value: data.fraudHistory.disputesOpen },
            { label: 'Fraud Reports', value: data.fraudHistory.fraudReports },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Star className="h-5 w-5 text-indigo-600" /> Investor Reviews
          </h3>
          <div className="flex items-center gap-2">
            <Stars value={data.reviewStats.average} />
            <span className="text-sm font-medium text-slate-700">
              {data.reviewStats.average} ({data.reviewStats.count})
            </span>
          </div>
        </div>
        {data.reviews.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.reviews.map((r) => (
              <div key={r._id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} />
                  {r.isVerifiedInvestor && (
                    <span className="badge bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified Investor</span>
                  )}
                </div>
                {r.reviewTitle && <p className="mt-2 font-medium text-slate-900">{r.reviewTitle}</p>}
                {r.reviewMessage && <p className="mt-1 text-sm text-slate-600">{r.reviewMessage}</p>}
                <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-slate-400">
                  <span>{r.authorId?.fullName || 'Investor'}</span>
                  {r.investmentAmount ? <span>· Invested {formatCurrency(r.investmentAmount)}</span> : null}
                  <span>· {formatDate(r.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
