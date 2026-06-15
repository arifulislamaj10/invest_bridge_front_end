'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Stats {
  users: number;
  projects: number;
  deals: number;
  pendingVerifications: number;
  openDisputes: number;
}

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  accountStatus: string;
  isVerified: boolean;
}

interface PendingVerification {
  _id: string;
  verificationType: string;
  userId: { fullName: string; email: string; role: string };
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get<Stats>('/admin/stats').then(setStats).catch(() => {});
      api.get<AdminUser[]>('/admin/users').then(setUsers).catch(() => {});
      api.get<PendingVerification[]>('/verifications/pending').then(setVerifications).catch(() => {});
    }
  }, [user]);

  const approveVerification = async (id: string) => {
    await api.patch(`/verifications/${id}/review`, { status: 'approved' });
    setVerifications((prev) => prev.filter((v) => v._id !== id));
    api.get<Stats>('/admin/stats').then(setStats);
  };

  const rejectVerification = async (id: string) => {
    await api.patch(`/verifications/${id}/review`, { status: 'rejected', notes: 'Rejected by admin' });
    setVerifications((prev) => prev.filter((v) => v._id !== id));
  };

  const updateUserStatus = async (id: string, accountStatus: string) => {
    await api.patch(`/admin/users/${id}/status`, { accountStatus });
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, accountStatus } : u)));
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container">
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Platform management and oversight</p>

        {stats && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Users', value: stats.users },
              { label: 'Projects', value: stats.projects },
              { label: 'Deals', value: stats.deals },
              { label: 'Pending KYC', value: stats.pendingVerifications },
              { label: 'Disputes', value: stats.openDisputes },
            ].map((s) => (
              <div key={s.label} className="card">
                <p className="text-2xl font-semibold text-neutral-900">{s.value}</p>
                <p className="mt-1 text-sm text-neutral-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-medium text-neutral-900">Pending Verifications</h2>
            {verifications.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">No pending verifications</p>
            ) : (
              <div className="mt-4 space-y-2">
                {verifications.map((v) => (
                  <div key={v._id} className="card flex items-center justify-between !py-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{v.userId.fullName}</p>
                      <p className="text-xs capitalize text-neutral-500">{v.verificationType.replace(/_/g, ' ')} · {v.userId.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveVerification(v._id)} className="btn-primary !px-3 !py-1.5 text-xs">Approve</button>
                      <button onClick={() => rejectVerification(v._id)} className="btn-secondary !px-3 !py-1.5 text-xs">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-medium text-neutral-900">User Management</h2>
            <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
              {users.map((u) => (
                <div key={u._id} className="card flex items-center justify-between !py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{u.fullName}</p>
                    <p className="text-xs text-neutral-500">{u.email} · {u.role}</p>
                  </div>
                  <select
                    className="input w-auto text-xs"
                    value={u.accountStatus}
                    onChange={(e) => updateUserStatus(u._id, e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                    <option value="rejected">rejected</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
