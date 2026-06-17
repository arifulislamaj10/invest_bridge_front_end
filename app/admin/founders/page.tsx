'use client';

import { useEffect, useState } from 'react';
import { api, FounderProfileFull } from '@/lib/api';
import { proofLabel } from '@/lib/utils';
import { Star, BadgeCheck, Image as ImageIcon, Video, Clock } from 'lucide-react';

export default function AdminFoundersPage() {
  const [founders, setFounders] = useState<FounderProfileFull[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => api.get<FounderProfileFull[]>('/admin/founders').then(setFounders).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggleFeature = async (id: string, next: boolean) => {
    setBusy(id);
    try {
      await api.patch(`/admin/founders/${id}/feature`, { isFeatured: next });
      // Only one founder is featured at a time — reflect that locally.
      setFounders((list) => list.map((f) => ({ ...f, isFeatured: f._id === id ? next : false })));
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Featured Founders</h1>
        <p className="text-sm text-slate-500">
          Pick one founder to spotlight on the homepage. Choose a well-documented, verified business — photos, video, and proof badges make the strongest impression.
        </p>
      </div>

      {founders.length === 0 ? (
        <p className="text-sm text-slate-500">No founder profiles yet.</p>
      ) : founders.map((f) => (
        <div key={f._id} className={`rounded-2xl border bg-white p-4 shadow-sm ${f.isFeatured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-100'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{f.businessName}</p>
                {f.userId?.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
                {f.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Featured
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {f.userId?.fullName || '—'}
                {f.businessType ? ` · ${f.businessType}` : ''}
                {f.location ? ` · ${f.location}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> {f.gallery?.length || 0} photos</span>
                <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {f.videoUrl ? 'Video added' : 'No video'}</span>
              </div>
              {f.proofBadges && f.proofBadges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {f.proofBadges.map((b) => {
                    const verified = f.verifiedBadges?.includes(b);
                    return (
                      <span
                        key={b}
                        title={verified ? 'Backed by an approved verification' : 'Claimed but not yet verified — will not show publicly'}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {verified ? <BadgeCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {proofLabel(b)}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => toggleFeature(f._id, !f.isFeatured)}
              disabled={busy === f._id}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
                f.isFeatured
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-slate-900 text-white hover:bg-slate-700'
              }`}
            >
              <Star className={`h-4 w-4 ${f.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
              {f.isFeatured ? 'Featured' : 'Feature'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
