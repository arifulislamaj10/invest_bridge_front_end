'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api, Deal } from '@/lib/api';
import { formatCurrency, statusColor } from '@/lib/utils';

export default function DealsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) api.get<Deal[]>('/deals').then(setDeals).catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container">
        <h1 className="section-title">My Deals</h1>
        <p className="section-subtitle">Manage your investment negotiations</p>

        {deals.length === 0 ? (
          <div className="card mt-10 text-center">
            <p className="text-neutral-500">No deals yet.</p>
            {user.role === 'investor' && (
              <Link href="/projects" className="btn-primary mt-4 inline-flex text-sm">Browse Projects</Link>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-2">
            {deals.map((deal) => (
              <Link key={deal._id} href={`/deals/${deal._id}`} className="card-hover flex items-center justify-between !py-4">
                <div>
                  <p className="font-medium text-neutral-900">
                    {typeof deal.projectId === 'object' ? deal.projectId.title : 'Project'}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {formatCurrency(deal.offeredAmount)}
                    {deal.equityRequested ? ` · ${deal.equityRequested}% equity` : ''}
                  </p>
                </div>
                <span className={`badge ${statusColor(deal.dealStatus)}`}>{deal.dealStatus}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
