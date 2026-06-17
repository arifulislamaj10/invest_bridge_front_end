'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api, FounderProfileFull, Verification } from '@/lib/api';
import { PROOF_BADGES, BADGE_REQUIREMENT, VERIFICATION_TYPE_LABEL } from '@/lib/utils';
import { ArrowLeft, Upload, X, Star, ShieldCheck, Loader2, Check, BadgeCheck, Clock } from 'lucide-react';

export default function FounderSpotlightEditor() {
  const { user, profile, loading, refreshUser } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    businessType: '', location: '', foundedYear: '', teamSize: '',
    annualRevenue: '', valuation: '', description: '', videoUrl: '',
  });
  const [gallery, setGallery] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [verifiedTypes, setVerifiedTypes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'founder')) router.push('/login');
  }, [user, loading, router]);

  // Which verification types this founder has actually had approved — drives the
  // verified/pending state on each proof badge.
  useEffect(() => {
    if (user?.role !== 'founder') return;
    api.get<Verification[]>('/verifications/my')
      .then((vs) => setVerifiedTypes(new Set(vs.filter((v) => v.status === 'approved').map((v) => v.verificationType))))
      .catch(() => {});
  }, [user]);

  // Seed the form from the founder's current profile.
  useEffect(() => {
    if (!profile) return;
    const p = profile as unknown as FounderProfileFull;
    setForm({
      businessType: p.businessType || '',
      location: p.location || '',
      foundedYear: p.foundedYear ? String(p.foundedYear) : '',
      teamSize: p.teamSize ? String(p.teamSize) : '',
      annualRevenue: p.annualRevenue ? String(p.annualRevenue) : '',
      valuation: p.valuation ? String(p.valuation) : '',
      description: p.description || '',
      videoUrl: p.videoUrl || '',
    });
    setGallery(p.gallery || []);
    setBadges(p.proofBadges || []);
    setIsFeatured(!!p.isFeatured);
  }, [profile]);

  if (loading || !user) return null;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleBadge = (key: string) =>
    setBadges((b) => (b.includes(key) ? b.filter((x) => x !== key) : [...b, key]));

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const updated = await api.post<FounderProfileFull>('/profiles/founder/gallery', fd);
      setGallery(updated.gallery || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = (url: string) => setGallery((g) => g.filter((x) => x !== url));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await api.put('/profiles/founder', {
        businessType: form.businessType.trim(),
        location: form.location.trim(),
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        teamSize: form.teamSize ? Number(form.teamSize) : undefined,
        annualRevenue: form.annualRevenue ? Number(form.annualRevenue) : undefined,
        valuation: form.valuation ? Number(form.valuation) : undefined,
        description: form.description.trim(),
        videoUrl: form.videoUrl.trim(),
        gallery,
        proofBadges: badges,
      });
      await refreshUser();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container max-w-3xl">
        <Link href="/founder" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mt-4">
          <h1 className="section-title">Featured Spotlight</h1>
          <p className="section-subtitle">
            Show investors the real business behind your listing — photos, a video walkthrough, and proof.
            A complete, verified profile is what gets you picked for the homepage.
          </p>
        </div>

        {isFeatured && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> You are currently featured on the homepage.
          </div>
        )}

        {error && <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        {/* ─── GALLERY ─── */}
        <div className="card mt-6">
          <h2 className="font-semibold text-slate-900">Business Photos</h2>
          <p className="mt-1 text-sm text-slate-500">Factory, shop, products, team — proof of a real, physical business.</p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((url) => (
              <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-indigo-400 hover:text-indigo-500"
            >
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
              <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Add photos'}</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files?.length && uploadImages(e.target.files)}
          />
          <p className="mt-2 text-xs text-slate-400">Removing a photo here takes effect when you save.</p>
        </div>

        {/* ─── VIDEO + DETAILS ─── */}
        <div className="card mt-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Video & Business Details</h2>

          <div>
            <label className="label">Video walkthrough URL</label>
            <input className="input" placeholder="YouTube, Vimeo, or a direct video link"
              value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
          </div>

          <div>
            <label className="label">Short description</label>
            <textarea className="input min-h-[100px]" placeholder="What does your business do, and why is it a strong investment?"
              value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Business type</label>
              <input className="input" placeholder="e.g. Garments Manufacturing"
                value={form.businessType} onChange={(e) => set('businessType', e.target.value)} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="e.g. Gazipur, Bangladesh"
                value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Operating since (year)</label>
              <input type="number" className="input" placeholder="2014"
                value={form.foundedYear} onChange={(e) => set('foundedYear', e.target.value)} />
            </div>
            <div>
              <label className="label">Team size</label>
              <input type="number" className="input" placeholder="240"
                value={form.teamSize} onChange={(e) => set('teamSize', e.target.value)} />
            </div>
            <div>
              <label className="label">Annual revenue ($)</label>
              <input type="number" className="input" placeholder="3100000"
                value={form.annualRevenue} onChange={(e) => set('annualRevenue', e.target.value)} />
            </div>
            <div>
              <label className="label">Valuation ($)</label>
              <input type="number" className="input" placeholder="4200000"
                value={form.valuation} onChange={(e) => set('valuation', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ─── PROOF BADGES ─── */}
        <div className="card mt-6">
          <h2 className="font-semibold text-slate-900">Proof You Can Show</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select the proofs to highlight. A badge only appears publicly once the matching document is
            <span className="font-medium text-slate-700"> approved in verification</span> — selecting it here without that won&apos;t show it on the homepage.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PROOF_BADGES.map((b) => {
              const on = badges.includes(b.key);
              const isVerified = verifiedTypes.has(BADGE_REQUIREMENT[b.key]);
              return (
                <button
                  key={b.key}
                  onClick={() => toggleBadge(b.key)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    on ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${on ? 'bg-indigo-600 text-white' : 'border border-slate-300'}`}>
                    {on && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{b.label}</span>
                  {isVerified ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                      <Clock className="h-3.5 w-3.5" /> Needs {VERIFICATION_TYPE_LABEL[BADGE_REQUIREMENT[b.key]]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <Link href="/verification" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Upload verification documents <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>

        <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 border-t border-slate-100 bg-white/90 py-4 backdrop-blur">
          {saved && <span className="text-sm font-medium text-emerald-600">Saved ✓</span>}
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Saving…' : 'Save Spotlight'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
