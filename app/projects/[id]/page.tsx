'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageCarousel from '@/components/ImageCarousel';
import { api, Project } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useConfirm } from '@/components/ConfirmDialog';
import { getProjectImages } from '@/lib/images';
import { formatCurrency, formatDate, statusColor } from '@/lib/utils';
import { Shield, MapPin, TrendingUp, Bookmark, Handshake, Building2, ChevronRight } from 'lucide-react';

interface ProjectDetail {
  project: Project;
  documents: { _id: string; type: string; fileName: string; accessLevel: string }[];
  milestones: { _id: string; title: string; status: string; targetDate: string }[];
}

interface TrustSummary {
  trustScore: number;
  trustLabel: string;
  risk: { level: string };
  badges: Record<string, boolean>;
}

function trustColor(score: number) {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-orange-600';
}

function riskBadge(level: string) {
  if (level === 'Low Risk') return 'bg-emerald-50 text-emerald-700';
  if (level === 'Medium Risk') return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-600';
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const confirm = useConfirm();
  const router = useRouter();
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [trust, setTrust] = useState<TrustSummary | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [showOffer, setShowOffer] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get<ProjectDetail>(`/projects/${id}`).then((d) => {
      setData(d);
      const founderId = d.project.founderId?._id;
      if (founderId) {
        api.get<TrustSummary>(`/trust/score/${founderId}`).then(setTrust).catch(() => {});
      }
    }).catch(() => {});
  }, [id]);

  const handleExpressInterest = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const r = await confirm({
      title: 'Express investment interest?',
      message: `This notifies the founder and opens a private deal room${offerAmount ? ` with your offer of $${Number(offerAmount).toLocaleString()}` : ''}.`,
      confirmLabel: 'Send interest',
    });
    if (!r.confirmed) return;
    try {
      const deal = await api.post<{ _id: string }>('/deals', {
        projectId: id,
        offeredAmount: Number(offerAmount),
      });
      setMessage('Interest expressed! Redirecting to deal room...');
      setTimeout(() => router.push(`/deals/${deal._id}`), 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create deal');
    }
  };

  const handleSave = async () => {
    if (!user) return router.push('/login');
    try {
      await api.post(`/saved-projects/${id}`);
      setMessage('Project saved!');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <p className="py-20 text-center text-slate-400">Loading...</p>
      </div>
    );
  }

  const { project, documents, milestones } = data;
  const progress = (project.totalRaised / project.fundingGoal) * 100;
  const images = getProjectImages(project);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Full-width image carousel */}
      <div className="relative">
        <ImageCarousel
          images={images}
          alt={project.title}
          aspectClass="aspect-[21/9] sm:aspect-[21/8]"
          autoPlay
          className="!min-h-[220px] sm:!min-h-[320px]"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent pb-8 pt-24">
          <div className="page-container !py-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${statusColor(project.status)}`}>{project.status}</span>
              {project.isFeatured && <span className="badge bg-amber-100 text-amber-800">★ Featured</span>}
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-4xl">{project.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1 capitalize"><TrendingUp className="h-4 w-4" />{project.stage}</span>
              <span className="capitalize">{project.industry}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{project.country}</span>
              {project.founderId?.userId?.isVerified && (
                <span className="flex items-center gap-1 text-emerald-600"><Shield className="h-4 w-4" />Verified Founder</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Founder / Business trust card */}
            {project.founderId && (
              <Link
                href={`/business/${project.founderId._id}`}
                className="card group flex items-center justify-between transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{project.founderId.businessName}</p>
                    <p className="text-sm text-slate-500">{project.founderId.userId?.fullName}</p>
                    {trust && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`text-sm font-bold ${trustColor(trust.trustScore)}`}>
                          Trust {trust.trustScore}/100
                        </span>
                        <span className={`badge ${riskBadge(trust.risk.level)}`}>{trust.risk.level}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-indigo-600">
                  View Trust Profile <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            )}

            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900">About This Project</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{project.description}</p>
            </div>

            {milestones.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-slate-900">Milestones</h2>
                <div className="mt-4 space-y-2">
                  {milestones.map((m) => (
                    <div key={m._id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                      <span className="text-sm text-slate-800">{m.title}</span>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${statusColor(m.status)}`}>{m.status}</span>
                        {m.targetDate && <span className="text-xs text-slate-400">{formatDate(m.targetDate)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-slate-900">Public Documents</h2>
                <div className="mt-4 space-y-2">
                  {documents.map((d) => (
                    <div key={d._id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
                      <span className="text-slate-700">{d.fileName}</span>
                      <span className="badge bg-slate-100 text-slate-600">{d.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card sticky top-28">
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-slate-500">Funding Goal</p>
                  <p className="text-2xl font-bold text-indigo-600">{formatCurrency(project.fundingGoal)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Equity Offered</p>
                  <p className="text-2xl font-bold text-slate-900">{project.equityOffered}%</p>
                </div>
                {project.valuation && (
                  <div>
                    <p className="text-sm text-slate-500">Valuation</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(project.valuation)}</p>
                  </div>
                )}
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Raised: {formatCurrency(project.totalRaised)}</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
              </div>

              {message && (
                <div className="mt-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{message}</div>
              )}

              {user?.role === 'investor' && (
                <div className="mt-6 space-y-3">
                  {!showOffer ? (
                    <button onClick={() => setShowOffer(true)} className="btn-primary w-full">
                      <Handshake className="h-4 w-4" /> Express Interest
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <input
                        className="input"
                        type="number"
                        placeholder="Offer amount ($)"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                      />
                      <button onClick={handleExpressInterest} className="btn-primary w-full">Submit Offer</button>
                    </div>
                  )}
                  <button onClick={handleSave} className="btn-secondary w-full">
                    <Bookmark className="h-4 w-4" /> Save Project
                  </button>
                </div>
              )}

              {!user && (
                <Link href="/login" className="btn-primary mt-6 block w-full text-center">
                  Sign in to Invest
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
