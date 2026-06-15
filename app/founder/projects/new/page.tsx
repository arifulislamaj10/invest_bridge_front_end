'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { INDUSTRIES, STAGES } from '@/lib/utils';

export default function NewProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    industry: 'fintech',
    fundingGoal: '',
    equityOffered: '',
    valuation: '',
    stage: 'seed',
    country: 'Bangladesh',
    coverImage: '',
    imageUrls: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && user.role !== 'founder') {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const images = form.imageUrls
        ? form.imageUrls.split(',').map((u) => u.trim()).filter(Boolean)
        : [];
      const project = await api.post<{ _id: string }>('/projects', {
        title: form.title,
        description: form.description,
        industry: form.industry,
        fundingGoal: Number(form.fundingGoal),
        equityOffered: Number(form.equityOffered),
        valuation: form.valuation ? Number(form.valuation) : undefined,
        stage: form.stage,
        country: form.country,
        coverImage: form.coverImage || images[0] || undefined,
        images: images.length ? images : undefined,
        status: 'pending_review',
      });
      router.push(`/projects/${project._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container max-w-2xl">
        <h1 className="section-title">Create New Project</h1>
        <p className="section-subtitle">List your business for investment</p>

        {error && <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
          <div>
            <label className="label">Project Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[120px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Industry</label>
              <select className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Stage</label>
              <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Funding Goal ($)</label>
              <input type="number" className="input" value={form.fundingGoal} onChange={(e) => setForm({ ...form, fundingGoal: e.target.value })} required />
            </div>
            <div>
              <label className="label">Equity Offered (%)</label>
              <input type="number" className="input" value={form.equityOffered} onChange={(e) => setForm({ ...form, equityOffered: e.target.value })} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Valuation ($)</label>
              <input type="number" className="input" value={form.valuation} onChange={(e) => setForm({ ...form, valuation: e.target.value })} />
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Cover Image URL</label>
            <input
              className="input"
              placeholder="https://your-bucket.s3.amazonaws.com/cover.jpg"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            />
            <p className="mt-1 text-xs text-slate-500">Paste your AWS S3 or image link for the main project photo</p>
          </div>
          <div>
            <label className="label">Gallery Image URLs</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="https://bucket.s3.amazonaws.com/img1.jpg, https://bucket.s3.amazonaws.com/img2.jpg"
              value={form.imageUrls}
              onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
            />
            <p className="mt-1 text-xs text-slate-500">Comma-separated URLs for image carousel (2-5 images recommended)</p>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
