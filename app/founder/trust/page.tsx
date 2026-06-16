'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api, FinancialSnapshot, TeamMember, RoiReport } from '@/lib/api';
import { Plus, Trash2, Save, TrendingUp, Users, Target, ShieldCheck } from 'lucide-react';

export default function FounderTrustPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [msg, setMsg] = useState('');

  const [fin, setFin] = useState<FinancialSnapshot>({});
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [roi, setRoi] = useState<RoiReport[]>([]);

  const [newMember, setNewMember] = useState({ name: '', role: '', experienceYears: '', linkedin: '', bio: '' });
  const [newRoi, setNewRoi] = useState({ periodLabel: '', expectedROI: '', achievedROI: '', notes: '' });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'founder')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'founder') {
      api.get<FinancialSnapshot>('/trust/financials/me').then(setFin).catch(() => {});
      api.get<TeamMember[]>('/trust/team/me').then(setTeam).catch(() => {});
      api.get<RoiReport[]>('/trust/roi/me').then(setRoi).catch(() => {});
    }
  }, [user]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const saveFinancials = async () => {
    await api.put('/trust/financials', {
      monthlyRevenue: Number(fin.monthlyRevenue) || 0,
      yearlyRevenue: Number(fin.yearlyRevenue) || 0,
      profitMargin: Number(fin.profitMargin) || 0,
      burnRate: Number(fin.burnRate) || 0,
      cashFlow: Number(fin.cashFlow) || 0,
      debtRatio: Number(fin.debtRatio) || 0,
    });
    flash('Financial snapshot saved. (Verification badge is granted by admin.)');
  };

  const addMember = async () => {
    if (!newMember.name || !newMember.role) return;
    const m = await api.post<TeamMember>('/trust/team', {
      ...newMember,
      experienceYears: Number(newMember.experienceYears) || 0,
    });
    setTeam((p) => [...p, m]);
    setNewMember({ name: '', role: '', experienceYears: '', linkedin: '', bio: '' });
    flash('Team member added.');
  };

  const removeMember = async (id: string) => {
    await api.delete(`/trust/team/${id}`);
    setTeam((p) => p.filter((m) => m._id !== id));
  };

  const addRoi = async () => {
    if (!newRoi.periodLabel) return;
    const r = await api.post<RoiReport>('/trust/roi', {
      ...newRoi,
      expectedROI: Number(newRoi.expectedROI) || 0,
      achievedROI: Number(newRoi.achievedROI) || 0,
    });
    setRoi((p) => [r, ...p]);
    setNewRoi({ periodLabel: '', expectedROI: '', achievedROI: '', notes: '' });
    flash('ROI record added.');
  };

  if (loading || !user) return null;

  const finFields: { key: keyof FinancialSnapshot; label: string }[] = [
    { key: 'monthlyRevenue', label: 'Monthly Revenue ($)' },
    { key: 'yearlyRevenue', label: 'Yearly Revenue ($)' },
    { key: 'profitMargin', label: 'Profit Margin (%)' },
    { key: 'burnRate', label: 'Burn Rate ($)' },
    { key: 'cashFlow', label: 'Cash Flow ($)' },
    { key: 'debtRatio', label: 'Debt Ratio (%)' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Trust Profile</h1>
            <p className="section-subtitle">Build investor confidence — the more you complete, the higher your Trust Score.</p>
          </div>
          <Link href="/founder" className="btn-secondary text-sm">Back to Dashboard</Link>
        </div>

        {msg && <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</div>}

        {/* Financials */}
        <div className="card mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 text-indigo-600" /> Financial Health
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {finFields.map((f) => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input
                  type="number"
                  className="input"
                  value={(fin[f.key] as number) ?? ''}
                  onChange={(e) => setFin((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <button onClick={saveFinancials} className="btn-primary mt-4 text-sm"><Save className="h-4 w-4" /> Save Financials</button>
        </div>

        {/* Team */}
        <div className="card mt-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Users className="h-5 w-5 text-indigo-600" /> Team Transparency
          </h2>
          <div className="mt-4 space-y-2">
            {team.map((m) => (
              <div key={m._id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{m.name} <span className="text-sm font-normal text-slate-500">· {m.role}</span></p>
                  {m.experienceYears ? <p className="text-xs text-slate-400">{m.experienceYears} yrs experience</p> : null}
                </div>
                <button onClick={() => removeMember(m._id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
            <input className="input" placeholder="Role (e.g. CTO)" value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} />
            <input className="input" type="number" placeholder="Years experience" value={newMember.experienceYears} onChange={(e) => setNewMember({ ...newMember, experienceYears: e.target.value })} />
            <input className="input" placeholder="LinkedIn URL" value={newMember.linkedin} onChange={(e) => setNewMember({ ...newMember, linkedin: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Short bio" value={newMember.bio} onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })} />
          </div>
          <button onClick={addMember} className="btn-secondary mt-3 text-sm"><Plus className="h-4 w-4" /> Add Team Member</button>
        </div>

        {/* ROI */}
        <div className="card mt-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Target className="h-5 w-5 text-indigo-600" /> ROI History
          </h2>
          <div className="mt-4 space-y-2">
            {roi.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm">
                <span className="font-medium text-slate-800">{r.periodLabel}</span>
                <span className="text-slate-500">Expected {r.expectedROI || 0}% · Achieved {r.achievedROI || 0}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Period (e.g. Year 1)" value={newRoi.periodLabel} onChange={(e) => setNewRoi({ ...newRoi, periodLabel: e.target.value })} />
            <input className="input" placeholder="Notes" value={newRoi.notes} onChange={(e) => setNewRoi({ ...newRoi, notes: e.target.value })} />
            <input className="input" type="number" placeholder="Expected ROI (%)" value={newRoi.expectedROI} onChange={(e) => setNewRoi({ ...newRoi, expectedROI: e.target.value })} />
            <input className="input" type="number" placeholder="Achieved ROI (%)" value={newRoi.achievedROI} onChange={(e) => setNewRoi({ ...newRoi, achievedROI: e.target.value })} />
          </div>
          <button onClick={addRoi} className="btn-secondary mt-3 text-sm"><Plus className="h-4 w-4" /> Add ROI Record</button>
        </div>

        <div className="card mt-6 flex items-start gap-3 bg-indigo-50/50">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
          <p className="text-sm text-slate-600">
            Verification badges (identity, business, bank, revenue) and your milestones drive the largest share of your
            Trust Score. Complete <Link href="/verification" className="font-medium text-indigo-600 underline">KYC verification</Link> and
            keep your project milestones up to date.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
