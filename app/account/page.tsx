'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { useConfirm } from '@/components/ConfirmDialog';
import { api, BusinessReview, PlatformReview } from '@/lib/api';
import { formatCurrency, formatDate, statusColor } from '@/lib/utils';
import {
  User as UserIcon, Activity, Star, MessageSquareQuote, Save, Trash2, Pencil, ShieldCheck, CreditCard, ExternalLink,
  Image as ImageIcon, Link as LinkIcon,
} from 'lucide-react';

type Tab = 'profile' | 'activity' | 'reviews' | 'testimonial';

export default function AccountPage() {
  const { user, profile, loading, refreshUser } = useAuth();
  const router = useRouter();
  const confirm = useConfirm();
  const [tab, setTab] = useState<Tab>('profile');
  const [msg, setMsg] = useState('');

  // profile form
  const [basics, setBasics] = useState({ fullName: '', phone: '' });
  const [inv, setInv] = useState<any>({});
  const [fnd, setFnd] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // avatar
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarLink, setAvatarLink] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // activity
  const [activity, setActivity] = useState<any>(null);

  // my business reviews
  const [myReviews, setMyReviews] = useState<BusinessReview[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, reviewTitle: '', reviewMessage: '' });

  // platform testimonial
  const [testimonial, setTestimonial] = useState<PlatformReview | null>(null);
  const [tForm, setTForm] = useState({ rating: 5, headline: '', message: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setBasics({ fullName: user.fullName, phone: (user as any).phone || '' });
    setAvatarUrl(user.avatarUrl || '');
    const p = (profile || {}) as any;
    if (user.role === 'investor') {
      setInv({
        companyName: p.companyName || '',
        investorType: p.investorType || 'individual',
        investmentRangeMin: p.investmentRangeMin || '',
        investmentRangeMax: p.investmentRangeMax || '',
        riskAppetite: p.riskAppetite || 'medium',
        preferredIndustries: (p.preferredIndustries || []).join(', '),
        preferredCountries: (p.preferredCountries || []).join(', '),
      });
    } else if (user.role === 'founder') {
      setFnd({
        businessName: p.businessName || '',
        businessType: p.businessType || '',
        description: p.description || '',
        valuation: p.valuation || '',
        annualRevenue: p.annualRevenue || '',
        teamSize: p.teamSize || '',
        foundedYear: p.foundedYear || '',
      });
    }
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;
    api.get('/profiles/me/activity').then(setActivity).catch(() => {});
    api.get<PlatformReview | null>('/platform-reviews/me').then((t) => {
      setTestimonial(t);
      if (t) setTForm({ rating: t.rating, headline: t.headline || '', message: t.message });
    }).catch(() => {});
    if (user.role === 'investor') {
      api.get<BusinessReview[]>('/trust/business-reviews/mine').then(setMyReviews).catch(() => {});
    }
  }, [user]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post<{ avatarUrl: string }>('/profiles/me/avatar', fd);
      setAvatarUrl(res.avatarUrl);
      await refreshUser();
      flash('Profile image updated.');
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveAvatarLink = async () => {
    if (!avatarLink.trim()) return;
    await api.put('/profiles/me', { avatarUrl: avatarLink.trim() });
    setAvatarUrl(avatarLink.trim());
    setAvatarLink('');
    await refreshUser();
    flash('Profile image updated from link.');
  };

  const removeAvatar = async () => {
    await api.put('/profiles/me', { avatarUrl: '' });
    setAvatarUrl('');
    await refreshUser();
    flash('Profile image removed.');
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/profiles/me', basics);
      if (user?.role === 'investor') {
        await api.put('/profiles/investor', {
          ...inv,
          investmentRangeMin: Number(inv.investmentRangeMin) || 0,
          investmentRangeMax: Number(inv.investmentRangeMax) || 0,
          preferredIndustries: inv.preferredIndustries.split(',').map((s: string) => s.trim()).filter(Boolean),
          preferredCountries: inv.preferredCountries.split(',').map((s: string) => s.trim()).filter(Boolean),
        });
      } else if (user?.role === 'founder') {
        await api.put('/profiles/founder', {
          ...fnd,
          valuation: Number(fnd.valuation) || 0,
          annualRevenue: Number(fnd.annualRevenue) || 0,
          teamSize: Number(fnd.teamSize) || 0,
          foundedYear: Number(fnd.foundedYear) || undefined,
        });
      }
      await refreshUser();
      flash('Profile saved.');
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveReviewEdit = async (id: string) => {
    await api.put(`/trust/business-reviews/${id}`, editForm);
    setMyReviews((p) => p.map((r) => (r._id === id ? { ...r, ...editForm } : r)));
    setEditing(null);
    flash('Review updated.');
  };
  const deleteReview = async (id: string) => {
    const r = await confirm({ title: 'Delete this review?', message: 'It will be removed from the business profile.', confirmLabel: 'Delete', danger: true });
    if (!r.confirmed) return;
    await api.delete(`/trust/business-reviews/${id}`);
    setMyReviews((p) => p.filter((x) => x._id !== id));
    flash('Review deleted.');
  };

  const saveTestimonial = async () => {
    if (!tForm.message.trim()) return flash('Please write your testimonial.');
    const saved = await api.post<PlatformReview>('/platform-reviews', tForm);
    setTestimonial(saved);
    flash('Thanks! Your testimonial is now live on the platform.');
  };
  const deleteTestimonial = async () => {
    const r = await confirm({ title: 'Remove your testimonial?', message: 'It will no longer appear on the platform.', confirmLabel: 'Remove', danger: true });
    if (!r.confirmed) return;
    await api.delete('/platform-reviews/me');
    setTestimonial(null);
    setTForm({ rating: 5, headline: '', message: '' });
    flash('Testimonial removed.');
  };

  if (loading || !user) return null;

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'profile', label: 'Profile', icon: UserIcon },
    { key: 'activity', label: 'My Activity', icon: Activity },
    ...(user.role === 'investor' ? [{ key: 'reviews' as Tab, label: 'My Reviews', icon: Star }] : []),
    { key: 'testimonial', label: 'Platform Testimonial', icon: MessageSquareQuote },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="page-container max-w-4xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : user.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.fullName}</h1>
            <p className="text-sm capitalize text-slate-500">{user.role} · {user.email} {user.isVerified && <span className="ml-1 text-emerald-600">· ✓ Verified</span>}</p>
          </div>
        </div>

        {msg && <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{msg}</div>}

        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${tab === t.key ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* PROFILE */}
        {tab === 'profile' && (
          <div className="mt-6 space-y-4">
            <div className="card">
              <h2 className="font-semibold text-slate-900">Profile Image</h2>
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">{user.fullName.charAt(0)}</div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className={`btn-secondary cursor-pointer text-sm ${uploadingAvatar ? 'opacity-50' : ''}`}>
                      <ImageIcon className="h-4 w-4" /> {uploadingAvatar ? 'Uploading…' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingAvatar}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
                    </label>
                    {avatarUrl && <button onClick={removeAvatar} className="btn-secondary text-sm"><Trash2 className="h-4 w-4" /> Remove</button>}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input className="input" placeholder="…or paste an image URL (e.g. S3 / CDN link)" value={avatarLink} onChange={(e) => setAvatarLink(e.target.value)} />
                    <button onClick={saveAvatarLink} className="btn-primary shrink-0 text-sm"><LinkIcon className="h-4 w-4" /> Use Link</button>
                  </div>
                  <p className="text-xs text-slate-400">Uploads go to AWS S3 when configured (otherwise stored locally). PNG/JPG/WEBP up to 5MB.</p>
                </div>
              </div>
            </div>

            <div className="card space-y-4">
              <h2 className="font-semibold text-slate-900">Account Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Full Name</label><input className="input" value={basics.fullName} onChange={(e) => setBasics({ ...basics, fullName: e.target.value })} /></div>
                <div><label className="label">Phone</label><input className="input" value={basics.phone} onChange={(e) => setBasics({ ...basics, phone: e.target.value })} /></div>
                <div><label className="label">Email</label><input className="input bg-slate-50" value={user.email} disabled /></div>
              </div>
            </div>

            {user.role === 'investor' && (
              <div className="card space-y-4">
                <h2 className="font-semibold text-slate-900">Investor Profile</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label">Company Name</label><input className="input" value={inv.companyName || ''} onChange={(e) => setInv({ ...inv, companyName: e.target.value })} /></div>
                  <div><label className="label">Investor Type</label>
                    <select className="input" value={inv.investorType} onChange={(e) => setInv({ ...inv, investorType: e.target.value })}>
                      {['individual', 'angel', 'vc', 'corporate'].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Min Investment ($)</label><input type="number" className="input" value={inv.investmentRangeMin} onChange={(e) => setInv({ ...inv, investmentRangeMin: e.target.value })} /></div>
                  <div><label className="label">Max Investment ($)</label><input type="number" className="input" value={inv.investmentRangeMax} onChange={(e) => setInv({ ...inv, investmentRangeMax: e.target.value })} /></div>
                  <div><label className="label">Risk Appetite</label>
                    <select className="input" value={inv.riskAppetite} onChange={(e) => setInv({ ...inv, riskAppetite: e.target.value })}>
                      {['low', 'medium', 'high'].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Preferred Industries</label><input className="input" placeholder="fintech, saas" value={inv.preferredIndustries} onChange={(e) => setInv({ ...inv, preferredIndustries: e.target.value })} /></div>
                  <div><label className="label">Preferred Countries</label><input className="input" placeholder="Bangladesh, India" value={inv.preferredCountries} onChange={(e) => setInv({ ...inv, preferredCountries: e.target.value })} /></div>
                </div>
              </div>
            )}

            {user.role === 'founder' && (
              <div className="card space-y-4">
                <h2 className="font-semibold text-slate-900">Business Profile</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label">Business Name</label><input className="input" value={fnd.businessName || ''} onChange={(e) => setFnd({ ...fnd, businessName: e.target.value })} /></div>
                  <div><label className="label">Business Type</label><input className="input" value={fnd.businessType || ''} onChange={(e) => setFnd({ ...fnd, businessType: e.target.value })} /></div>
                  <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input min-h-[90px]" value={fnd.description || ''} onChange={(e) => setFnd({ ...fnd, description: e.target.value })} /></div>
                  <div><label className="label">Valuation ($)</label><input type="number" className="input" value={fnd.valuation} onChange={(e) => setFnd({ ...fnd, valuation: e.target.value })} /></div>
                  <div><label className="label">Annual Revenue ($)</label><input type="number" className="input" value={fnd.annualRevenue} onChange={(e) => setFnd({ ...fnd, annualRevenue: e.target.value })} /></div>
                  <div><label className="label">Team Size</label><input type="number" className="input" value={fnd.teamSize} onChange={(e) => setFnd({ ...fnd, teamSize: e.target.value })} /></div>
                  <div><label className="label">Founded Year</label><input type="number" className="input" value={fnd.foundedYear} onChange={(e) => setFnd({ ...fnd, foundedYear: e.target.value })} /></div>
                </div>
                <p className="text-xs text-slate-500">Tip: complete your <Link href="/founder/trust" className="text-indigo-600 underline">Trust Profile</Link> (financials, team, milestones) to raise your Trust Score.</p>
              </div>
            )}

            <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm"><Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        )}

        {/* ACTIVITY */}
        {tab === 'activity' && (
          <div className="mt-6 space-y-4">
            {!activity ? <p className="text-sm text-slate-400">Loading…</p> : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Deals', value: activity.deals?.length || 0 },
                    ...(activity.profileType === 'founder' ? [{ label: 'Projects', value: activity.projects?.length || 0 }, { label: 'Reviews Received', value: activity.reviewsReceived?.length || 0 }] : []),
                    ...(activity.profileType === 'investor' ? [{ label: 'Saved', value: activity.saved?.length || 0 }, { label: 'Reviews Given', value: activity.reviewsGiven?.length || 0 }] : []),
                    { label: 'Verifications', value: activity.verifications?.length || 0 },
                    { label: 'Support Tickets', value: activity.tickets?.length || 0 },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                      <p className="text-xl font-bold text-slate-900">{s.value}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {activity.subscription && (
                  <div className="card flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600"><CreditCard className="h-4 w-4 text-indigo-500" /> Subscription</span>
                    <span className="flex items-center gap-2"><span className="badge bg-indigo-50 capitalize text-indigo-700">{activity.subscription.planName}</span><span className={`badge ${statusColor(activity.subscription.status)}`}>{activity.subscription.status}</span></span>
                  </div>
                )}

                {activity.deals?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-slate-900">Deals</h3>
                    <div className="mt-3 space-y-2">
                      {activity.deals.map((d: any) => (
                        <Link key={d._id} href={`/deals/${d._id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2.5 text-sm transition hover:border-indigo-200">
                          <span className="text-slate-700">{d.projectId?.title || 'Project'}</span>
                          <span className="flex items-center gap-2 text-slate-500">{formatCurrency(d.offeredAmount)} <span className={`badge ${statusColor(d.dealStatus)}`}>{d.dealStatus}</span></span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {activity.projects?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-slate-900">My Projects</h3>
                    <div className="mt-3 space-y-2">
                      {activity.projects.map((p: any) => (
                        <Link key={p._id} href={`/projects/${p._id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2.5 text-sm transition hover:border-indigo-200">
                          <span className="text-slate-700">{p.title}</span>
                          <span className={`badge ${statusColor(p.status)}`}>{p.status.replace(/_/g, ' ')}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {activity.saved?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-slate-900">Saved Projects</h3>
                    <div className="mt-3 space-y-2">
                      {activity.saved.map((s: any) => s.projectId && (
                        <Link key={s._id} href={`/projects/${s.projectId._id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2.5 text-sm transition hover:border-indigo-200">
                          <span className="text-slate-700">{s.projectId.title}</span>
                          <span className={`badge ${statusColor(s.projectId.status)}`}>{s.projectId.status}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900"><ShieldCheck className="h-4 w-4 text-indigo-500" /> Verifications</h3>
                  {activity.verifications?.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">No verifications yet. <Link href="/verification" className="text-indigo-600 underline">Get verified</Link>.</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activity.verifications.map((v: any) => (
                        <span key={v._id} className={`badge ${statusColor(v.status)} capitalize`}>{v.verificationType.replace(/_/g, ' ')}: {v.status}</span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* MY REVIEWS */}
        {tab === 'reviews' && (
          <div className="mt-6 space-y-3">
            {myReviews.length === 0 ? (
              <p className="text-sm text-slate-500">You haven&apos;t reviewed any businesses yet.</p>
            ) : myReviews.map((r) => (
              <div key={r._id} className="card">
                {editing === r._id ? (
                  <div className="space-y-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} onClick={() => setEditForm({ ...editForm, rating: i })} type="button">
                          <Star className={`h-6 w-6 ${i <= editForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <input className="input" value={editForm.reviewTitle} onChange={(e) => setEditForm({ ...editForm, reviewTitle: e.target.value })} placeholder="Title" />
                    <textarea className="input min-h-[80px]" value={editForm.reviewMessage} onChange={(e) => setEditForm({ ...editForm, reviewMessage: e.target.value })} />
                    <div className="flex gap-2">
                      <button onClick={() => saveReviewEdit(r._id)} className="btn-primary !py-2 text-sm">Save</button>
                      <button onClick={() => setEditing(null)} className="btn-secondary !py-2 text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />)}</div>
                        <span className="text-sm font-medium text-slate-700">{(r as any).founderId?.businessName || 'Business'}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(r._id); setEditForm({ rating: r.rating, reviewTitle: r.reviewTitle || '', reviewMessage: r.reviewMessage || '' }); }} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => deleteReview(r._id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    {r.reviewTitle && <p className="mt-2 font-medium text-slate-900">{r.reviewTitle}</p>}
                    {r.reviewMessage && <p className="mt-1 text-sm text-slate-600">{r.reviewMessage}</p>}
                    <p className="mt-2 text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PLATFORM TESTIMONIAL */}
        {tab === 'testimonial' && (
          <div className="mt-6">
            <div className="card space-y-4">
              <div>
                <h2 className="font-semibold text-slate-900">Your Platform Testimonial</h2>
                <p className="text-sm text-slate-500">Share your experience with InvestBridge. Approved testimonials appear on our homepage.</p>
              </div>
              {testimonial && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <MessageSquareQuote className="h-4 w-4" /> Your testimonial is {testimonial.status === 'approved' ? 'live on the platform' : 'awaiting review'}.
                </div>
              )}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setTForm({ ...tForm, rating: i })} type="button">
                    <Star className={`h-7 w-7 ${i <= tForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <input className="input" placeholder="Headline (e.g. Found my investor in 2 weeks)" value={tForm.headline} onChange={(e) => setTForm({ ...tForm, headline: e.target.value })} />
              <textarea className="input min-h-[120px]" placeholder="Tell others about your experience…" value={tForm.message} onChange={(e) => setTForm({ ...tForm, message: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={saveTestimonial} className="btn-primary text-sm"><Save className="h-4 w-4" /> {testimonial ? 'Update Testimonial' : 'Submit Testimonial'}</button>
                {testimonial && <button onClick={deleteTestimonial} className="btn-secondary text-sm"><Trash2 className="h-4 w-4" /> Remove</button>}
                <Link href="/#reviews" className="btn-secondary text-sm">View on homepage <ExternalLink className="h-3.5 w-3.5" /></Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
