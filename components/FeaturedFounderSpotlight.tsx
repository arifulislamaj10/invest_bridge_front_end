'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck, ShieldCheck, MapPin, Users, CalendarDays,
  Play, ArrowRight, Building2, TrendingUp,
} from 'lucide-react';
import { api, FeaturedFounder } from '@/lib/api';
import { formatCurrency, proofLabel } from '@/lib/utils';

/* Demo founders shown when the API has no verified founders yet (or is unreachable).
   The first is the big spotlight; the rest fill the "other verified founders" grid. */
const DEMO_FOUNDERS: FeaturedFounder[] = [
  {
    founder: {
      _id: 'demo-1',
      businessName: 'Nafisa Textiles Ltd.',
      businessType: 'Garments Manufacturing',
      description:
        'A family-run garments factory in Gazipur supplying knitwear to European brands for 11 years. We employ 240 workers and are raising growth capital to add an automated dyeing line and double export capacity.',
      foundedYear: 2014,
      teamSize: 240,
      valuation: 4200000,
      annualRevenue: 3100000,
      fundingRaised: 850000,
      location: 'Gazipur, Bangladesh',
      videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      proofBadges: ['business_registration', 'factory_verified', 'kyc', 'proof_of_funds'],
      gallery: [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80',
        'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
      ],
      fullName: 'Nafisa Rahman',
      isVerified: true,
    },
    projects: [{ _id: 'demo-p1', title: 'Automated Dyeing Line Expansion', industry: 'manufacturing', fundingGoal: 1200000, totalRaised: 850000, stage: 'growth' }],
    totalRaised: 850000,
    featuredProjectId: null,
  },
  {
    founder: {
      _id: 'demo-2',
      businessName: 'GreenHarvest Agro',
      businessType: 'Agro Processing',
      description: 'Cold-storage and processing hub linking 1,200 farmers directly to urban markets across northern Bangladesh.',
      foundedYear: 2017,
      teamSize: 85,
      annualRevenue: 1400000,
      fundingRaised: 320000,
      location: 'Rajshahi, Bangladesh',
      proofBadges: ['business_registration', 'factory_verified', 'kyc'],
      gallery: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80'],
      fullName: 'Tanvir Hasan',
      isVerified: true,
    },
    projects: [],
    totalRaised: 320000,
    featuredProjectId: null,
  },
  {
    founder: {
      _id: 'demo-3',
      businessName: 'MediCare Diagnostics',
      businessType: 'Healthcare Clinics',
      description: 'A chain of 6 diagnostic clinics bringing affordable lab testing and telemedicine to tier-2 cities.',
      foundedYear: 2016,
      teamSize: 130,
      annualRevenue: 2200000,
      fundingRaised: 540000,
      location: 'Dhaka, Bangladesh',
      proofBadges: ['business_registration', 'identity', 'factory_verified'],
      gallery: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80'],
      fullName: 'Dr. Ayesha Karim',
      isVerified: true,
    },
    projects: [],
    totalRaised: 540000,
    featuredProjectId: null,
  },
  {
    founder: {
      _id: 'demo-4',
      businessName: 'CraftLeather BD',
      businessType: 'Leather Goods Factory',
      description: 'An export-grade leather workshop producing bags and footwear for regional retail brands.',
      foundedYear: 2015,
      teamSize: 60,
      annualRevenue: 980000,
      fundingRaised: 210000,
      location: 'Sylhet, Bangladesh',
      proofBadges: ['business_registration', 'kyc'],
      gallery: ['https://images.unsplash.com/photo-1531932180566-d7c2eebf4d2e?w=1200&q=80'],
      fullName: 'Sajid Chowdhury',
      isVerified: true,
    },
    projects: [],
    totalRaised: 210000,
    featuredProjectId: null,
  },
];

/* Turn a YouTube/Vimeo/direct URL into something embeddable. */
function toEmbed(url: string): { type: 'iframe' | 'video'; src: string } {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: 'video', src: url };
}

export default function FeaturedFounderSpotlight() {
  const [list, setList] = useState<FeaturedFounder[] | null>(null);
  const [active, setActive] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    api.get<FeaturedFounder[]>('/profiles/verified-founders?limit=4')
      .then((d) => setList(Array.isArray(d) && d.length ? d : DEMO_FOUNDERS))
      .catch(() => setList(DEMO_FOUNDERS));
  }, []);

  if (!list) return null;

  const data = list[0];
  const others = list.slice(1, 4);

  const f = data.founder;
  const gallery = f.gallery?.length ? f.gallery : DEMO_FOUNDERS[0].founder.gallery!;
  const embed = f.videoUrl ? toEmbed(f.videoUrl) : null;

  const facts = [
    f.foundedYear && { icon: CalendarDays, label: 'Operating Since', value: String(f.foundedYear) },
    f.teamSize && { icon: Users, label: 'Team Size', value: `${f.teamSize} people` },
    f.annualRevenue ? { icon: TrendingUp, label: 'Annual Revenue', value: formatCurrency(f.annualRevenue) } : null,
    (data.totalRaised || f.fundingRaised) ? { icon: Building2, label: 'Capital Raised', value: formatCurrency(data.totalRaised || f.fundingRaised || 0) } : null,
  ].filter(Boolean) as { icon: typeof Users; label: string; value: string }[];

  const investHref = data.featuredProjectId ? `/projects/${data.featuredProjectId}` : '/projects';

  return (
    <section className="bg-white py-16 sm:py-24" id="featured-founder">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="section-label">Real Business, Real Proof</span>
          <h2 className="section-title mt-4">Meet a Verified Founder</h2>
          <p className="section-subtitle mx-auto">
            Behind every listing is a real person with a real business. See the proof for yourself.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-8 sm:mt-12 lg:grid-cols-2 lg:gap-12">
          {/* ─── MEDIA: gallery + video ─── */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-lg shadow-slate-200/60 sm:rounded-3xl">
              {showVideo && embed ? (
                embed.type === 'iframe' ? (
                  <iframe
                    src={embed.src}
                    title="Business walkthrough"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={embed.src} controls autoPlay className="h-full w-full object-cover" />
                )
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gallery[active]} alt={f.businessName} className="h-full w-full object-cover" />
                  {embed && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/30 transition hover:bg-slate-950/40"
                      aria-label="Play business walkthrough"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-110">
                        <Play className="ml-1 h-7 w-7 fill-indigo-600 text-indigo-600" />
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Thumbnails (and a way back from the video) */}
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {embed && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-slate-900 ${
                    showVideo ? 'border-indigo-600' : 'border-transparent'
                  }`}
                  aria-label="Watch video"
                >
                  <Play className="h-5 w-5 fill-white text-white" />
                </button>
              )}
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => { setActive(i); setShowVideo(false); }}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    !showVideo && active === i ? 'border-indigo-600' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ─── DETAILS ─── */}
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 sm:text-2xl lg:text-3xl">{f.businessName}</h3>
              {f.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <BadgeCheck className="h-4 w-4" /> Verified
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {f.businessType && <span className="font-medium text-slate-600">{f.businessType}</span>}
              {f.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {f.location}
                </span>
              )}
              {f.fullName && <span>Led by <span className="font-medium text-slate-700">{f.fullName}</span></span>}
            </div>

            {f.description && (
              <p className="mt-5 leading-relaxed text-slate-600">{f.description}</p>
            )}

            {/* Proof badges */}
            {f.proofBadges && f.proofBadges.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verified Proof</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {f.proofBadges.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
                      <ShieldCheck className="h-4 w-4" /> {proofLabel(b)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key facts */}
            {facts.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                      <fact.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{fact.value}</p>
                      <p className="text-xs text-slate-500">{fact.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={investHref} className="btn-primary w-full sm:w-auto">
                Invest in this Business <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register?role=investor" className="btn-secondary w-full sm:w-auto">
                Become a Verified Investor
              </Link>
            </div>
          </div>
        </div>

        {/* ─── OTHER VERIFIED FOUNDERS ─── */}
        {others.length > 0 && (
          <div className="mt-16">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">More Verified Founders</h3>
              <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Browse all businesses <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => {
                const g = o.founder;
                const cover = g.gallery?.length ? g.gallery[0] : DEMO_FOUNDERS[0].founder.gallery![0];
                const href = o.featuredProjectId ? `/projects/${o.featuredProjectId}` : '/projects';
                return (
                  <Link key={g._id} href={href} className="card-hover group overflow-hidden !p-0">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt={g.businessName} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      {g.isVerified && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700 backdrop-blur">
                          <BadgeCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-slate-900">{g.businessName}</h4>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                        {g.businessType && <span>{g.businessType}</span>}
                        {g.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {g.location}
                          </span>
                        )}
                      </p>

                      {g.proofBadges && g.proofBadges.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {g.proofBadges.slice(0, 3).map((b) => (
                            <span key={b} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                              <ShieldCheck className="h-3 w-3" /> {proofLabel(b)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          {g.foundedYear && <><CalendarDays className="h-3.5 w-3.5" /> Since {g.foundedYear}</>}
                        </span>
                        {(o.totalRaised || g.fundingRaised) ? (
                          <span className="font-semibold text-slate-700">{formatCurrency(o.totalRaised || g.fundingRaised || 0)} raised</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
