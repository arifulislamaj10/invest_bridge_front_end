'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { statusColor } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface Verification {
  _id: string;
  verificationType: string;
  status: string;
  createdAt: string;
}

const TYPES = [
  { value: 'identity', label: 'Identity (ID/Passport)', roles: ['investor', 'founder'] },
  { value: 'business', label: 'Business Registration / Tax File', roles: ['founder'] },
  { value: 'proof_of_funds', label: 'Proof of Funds', roles: ['investor'] },
  { value: 'address', label: 'Address Verification', roles: ['investor', 'founder'] },
  { value: 'bank', label: 'Bank Statement', roles: ['investor', 'founder'] },
  { value: 'revenue', label: 'Revenue / Financial Proof', roles: ['founder'] },
];

export default function VerificationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [type, setType] = useState('identity');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) api.get<Verification[]>('/verifications/my').then(setVerifications).catch(() => {});
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('verificationType', type);

    try {
      await api.post('/verifications', formData);
      setMessage('Verification submitted for review');
      setFile(null);
      api.get<Verification[]>('/verifications/my').then(setVerifications);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  if (loading || !user) return null;

  const availableTypes = TYPES.filter(
    (t) =>
      t.roles.includes(user.role) &&
      !verifications.some((v) => v.verificationType === t.value && v.status !== 'rejected')
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container max-w-3xl">
        <h1 className="section-title">Verification</h1>
        <p className="section-subtitle">Complete verification to unlock full platform features</p>

        {user.isVerified && (
          <div className="mt-6 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            Your account is fully verified.
          </div>
        )}

        <div className="card mt-8">
          <h2 className="font-medium text-neutral-900">Your Verifications</h2>
          {verifications.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No verifications submitted yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {verifications.map((v) => (
                <div key={v._id} className="flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3">
                  <span className="text-sm capitalize text-neutral-800">{v.verificationType.replace(/_/g, ' ')}</span>
                  <span className={`badge ${statusColor(v.status)}`}>{v.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {availableTypes.length > 0 && (
          <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
            <h2 className="font-medium text-neutral-900">Submit New Verification</h2>
            {message && <div className="rounded-md bg-neutral-100 px-3 py-2 text-sm text-neutral-700">{message}</div>}
            <div>
              <label className="label">Verification Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {availableTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Upload Document</label>
              <input
                type="file"
                className="input"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              <Upload className="h-4 w-4" /> Submit for Review
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
