'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrustProfile from '@/components/TrustProfile';
import { api, TrustProfileData } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Building2, ShieldCheck, Star, Send } from 'lucide-react';

export default function BusinessProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<TrustProfileData | null>(null);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get<TrustProfileData>(`/trust/business/${id}`).then(setData).catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  const submitReview = async () => {
    try {
      await api.post('/trust/business-reviews', {
        founderId: id,
        rating,
        reviewTitle,
        reviewMessage,
      });
      setMsg('Review submitted!');
      setShowForm(false);
      setReviewTitle('');
      setReviewMessage('');
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to submit review');
    }
  };

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
        <p className="py-20 text-center text-slate-400">Loading trust profile...</p>
        <Footer />
      </div>
    );
  }

  const f = data.founder;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold sm:text-3xl">{f.businessName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-indigo-100">
                {f.businessType && <span>{f.businessType}</span>}
                {f.foundedYear && <span>· Founded {f.foundedYear}</span>}
                {f.userId?.isVerified && (
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Verified Founder</span>
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 px-5 py-3 text-center">
              <p className="text-3xl font-extrabold">{data.trustScore}</p>
              <p className="text-xs text-indigo-100">Trust Score</p>
            </div>
          </div>
          {f.description && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-indigo-50">{f.description}</p>}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {msg && <div className="mb-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{msg}</div>}

        {/* Write a review (investors only) */}
        {user?.role === 'investor' && (
          <div className="card mb-6">
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="btn-secondary text-sm">
                <Star className="h-4 w-4" /> Write a Review
              </button>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Review this business</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setRating(i)} type="button">
                      <Star className={`h-7 w-7 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
                <input className="input" placeholder="Review title" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} />
                <textarea className="input min-h-[100px]" placeholder="Share your experience with this business..." value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={submitReview} className="btn-primary text-sm"><Send className="h-4 w-4" /> Submit</button>
                  <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Open projects */}
        {data.projects.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Projects by this Business</h3>
            <div className="mt-4 space-y-2">
              {data.projects.map((p) => (
                <Link key={p._id} href={`/projects/${p._id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/40">
                  <span className="text-sm font-medium text-slate-800">{p.title}</span>
                  <span className="badge bg-slate-100 text-slate-600">{p.status}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <TrustProfile data={data} />

        <p className="mt-6 text-center text-xs text-slate-400">
          Member since {f.userId?.createdAt ? formatDate(f.userId.createdAt) : 'N/A'}
        </p>
      </div>
      <Footer />
    </div>
  );
}
