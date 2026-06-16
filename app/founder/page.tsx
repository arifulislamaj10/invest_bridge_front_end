'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api, Project, Deal } from '@/lib/api';
import { formatCurrency, statusColor } from '@/lib/utils';
import { Plus, ShieldCheck } from 'lucide-react';

export default function FounderDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'founder')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'founder') {
      api.get<Project[]>('/projects/my/list').then(setProjects).catch(() => {});
      api.get<Deal[]>('/deals').then(setDeals).catch(() => {});
    }
  }, [user]);

  if (loading || !user) return null;

  const founderProfile = profile as { businessName?: string; valuation?: number; fundingRaised?: number };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Founder Dashboard</h1>
            <p className="section-subtitle">{founderProfile?.businessName || user.fullName}</p>
          </div>
          <div className="flex gap-3">
            {!user.isVerified && (
              <Link href="/verification" className="btn-secondary text-sm">Verify Account</Link>
            )}
            <Link href="/founder/trust" className="btn-secondary text-sm">
              <ShieldCheck className="h-4 w-4" /> Trust Profile
            </Link>
            <Link href="/founder/projects/new" className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> New Project
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'My Projects', value: projects.length },
            { label: 'Active Deals', value: deals.length },
            { label: 'Total Raised', value: formatCurrency(founderProfile?.fundingRaised || 0) },
            { label: 'Valuation', value: formatCurrency(founderProfile?.valuation || 0) },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
              <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-medium text-neutral-900">My Projects</h2>
          {projects.length === 0 ? (
            <div className="card mt-4 text-center">
              <p className="text-neutral-500">No projects yet.</p>
              <Link href="/founder/projects/new" className="btn-primary mt-4 inline-flex text-sm">Create Your First Project</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {projects.map((p) => (
                <Link key={p._id} href={`/projects/${p._id}`} className="card-hover flex items-center justify-between !py-4">
                  <div>
                    <p className="font-medium text-neutral-900">{p.title}</p>
                    <p className="text-sm text-neutral-500">{formatCurrency(p.fundingGoal)} goal · {p.equityOffered}% equity</p>
                  </div>
                  <span className={`badge ${statusColor(p.status)}`}>{p.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {deals.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-medium text-neutral-900">Investor Interest</h2>
            <p className="mt-1 text-sm text-neutral-500">Vet each investor&apos;s credibility before engaging.</p>
            <div className="mt-4 space-y-2">
              {deals.map((deal) => (
                <div key={deal._id} className="card flex flex-wrap items-center justify-between gap-3 !py-4">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {typeof deal.projectId === 'object' ? deal.projectId.title : 'Project'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {deal.investorId?.userId?.fullName || 'Investor'} · Offer: {formatCurrency(deal.offeredAmount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${statusColor(deal.dealStatus)}`}>{deal.dealStatus}</span>
                    {deal.investorId?._id && (
                      <Link href={`/investors/${deal.investorId._id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                        <ShieldCheck className="h-3.5 w-3.5" /> Vet Investor
                      </Link>
                    )}
                    <Link href={`/deals/${deal._id}`} className="btn-primary !px-3 !py-1.5 text-xs">Open Deal</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
