'use client';

import { useEffect, useState } from 'react';
import { api, PlatformReview } from '@/lib/api';
import { useConfirm } from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const confirm = useConfirm();
  const [reviews, setReviews] = useState<PlatformReview[]>([]);

  const load = () => api.get<PlatformReview[]>('/admin/platform-reviews').then(setReviews).catch(() => {});
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await api.patch(`/admin/platform-reviews/${id}`, { status });
    setReviews((p) => p.map((r) => (r._id === id ? { ...r, status } : r)));
  };
  const remove = async (id: string) => {
    const r = await confirm({ title: 'Delete this testimonial?', message: 'It will be permanently removed.', confirmLabel: 'Delete', danger: true });
    if (!r.confirmed) return;
    await api.delete(`/admin/platform-reviews/${id}`);
    setReviews((p) => p.filter((x) => x._id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Testimonials</h1>
        <p className="text-sm text-slate-500">Approved testimonials appear on the public homepage. Hide or delete inappropriate ones.</p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No testimonials submitted yet.</p>
      ) : reviews.map((r) => (
        <div key={r._id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}</div>
                <span className={`badge ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{r.status}</span>
              </div>
              {r.headline && <p className="mt-2 font-medium text-slate-900">{r.headline}</p>}
              <p className="mt-1 text-sm text-slate-600">{r.message}</p>
              <p className="mt-2 text-xs text-slate-400">
                {typeof r.userId === 'object' && r.userId ? `${r.userId.fullName} · ${r.userId.role}` : 'User'} · {formatDate(r.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              {r.status === 'approved' ? (
                <button onClick={() => setStatus(r._id, 'hidden')} title="Hide" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><EyeOff className="h-4 w-4" /></button>
              ) : (
                <button onClick={() => setStatus(r._id, 'approved')} title="Approve / Show" className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"><Eye className="h-4 w-4" /></button>
              )}
              <button onClick={() => remove(r._id)} title="Delete" className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
