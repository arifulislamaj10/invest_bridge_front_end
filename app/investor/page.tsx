'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { useAuth } from '@/lib/auth';
import { api, Project, Deal } from '@/lib/api';
import { formatCurrency, statusColor } from '@/lib/utils';

export default function InvestorDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [saved, setSaved] = useState<{ projectId: Project }[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'investor')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'investor') {
      api.get<Project[]>('/projects?status=active').then(setProjects).catch(() => {});
      api.get<Deal[]>('/deals').then(setDeals).catch(() => {});
      api.get<{ projectId: Project }[]>('/saved-projects').then(setSaved).catch(() => {});
    }
  }, [user]);

  if (loading || !user) return null;

  const investorProfile = profile as { investmentRangeMin?: number; investmentRangeMax?: number };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Dashboard</h1>
            <p className="section-subtitle">Welcome back, {user.fullName}</p>
          </div>
          {!user.isVerified && (
            <Link href="/verification" className="btn-primary text-sm">Complete Verification</Link>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active Projects', value: projects.length },
            { label: 'My Deals', value: deals.length },
            { label: 'Saved', value: saved.length },
            {
              label: 'Investment Range',
              value: `${formatCurrency(investorProfile?.investmentRangeMin || 0)} – ${formatCurrency(investorProfile?.investmentRangeMax || 0)}`,
            },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
              <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-neutral-900">Recommended Projects</h2>
            <Link href="/projects" className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline">View all</Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((p) => <ProjectCard key={p._id} project={p} />)}
          </div>
        </div>

        {deals.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-medium text-neutral-900">Recent Deals</h2>
            <div className="mt-4 space-y-2">
              {deals.slice(0, 5).map((deal) => (
                <Link key={deal._id} href={`/deals/${deal._id}`} className="card-hover flex items-center justify-between !py-4">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {typeof deal.projectId === 'object' ? deal.projectId.title : 'Project'}
                    </p>
                    <p className="text-sm text-neutral-500">{formatCurrency(deal.offeredAmount)}</p>
                  </div>
                  <span className={`badge ${statusColor(deal.dealStatus)}`}>{deal.dealStatus}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
