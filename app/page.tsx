'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import HeroBackground from '@/components/HeroBackground';
import { api, Project } from '@/lib/api';
import { testimonialAvatars } from '@/lib/images';
import {
  ArrowRight, Check, Shield, Lock, Users, TrendingUp,
  FileCheck, Handshake, Star, Globe, BadgeCheck, Zap,
  Building2, Award,
} from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    api.get<Project[]>('/projects?status=active').then(setProjects).catch(() => {});
  }, []);

  const stats = [
    { value: '27+', label: 'Active Projects' },
    { value: '$12M+', label: 'Total Funding Raised' },
    { value: '500+', label: 'Verified Investors' },
    { value: '4.9★', label: 'Platform Rating' },
  ];

  const partners = ['Dhaka Angels', 'Startup Bangladesh', 'BASIS', 'iDEA Project', 'BGMEA', 'FinTech Alliance'];

  const howItHelps = [
    {
      icon: Users,
      title: 'For Investors',
      color: 'from-indigo-500 to-blue-500',
      points: [
        'Browse 25+ verified startups & SMEs',
        'Filter by industry, stage & risk level',
        'Secure deal rooms with NDA signing',
        'Track portfolio & investment returns',
      ],
      cta: 'Start Investing',
      href: '/register?role=investor',
    },
    {
      icon: TrendingUp,
      title: 'For Founders',
      color: 'from-amber-500 to-orange-500',
      points: [
        'List your business in minutes',
        'Connect with 500+ verified investors',
        'Share pitch decks in encrypted vault',
        'Close deals in secure deal rooms',
      ],
      cta: 'List Your Business',
      href: '/register?role=founder',
    },
  ];

  const trustFeatures = [
    { icon: BadgeCheck, title: 'KYC Verified', desc: 'Every user passes government ID and business verification' },
    { icon: Lock, title: 'Encrypted Vault', desc: 'Bank-grade AES-256 encryption for all sensitive documents' },
    { icon: Shield, title: 'Admin Oversight', desc: 'Every project reviewed before going live on platform' },
    { icon: FileCheck, title: 'Proof of Funds', desc: 'Investors must prove investment capacity before deals' },
    { icon: Handshake, title: 'Deal Rooms', desc: 'Private encrypted spaces for negotiation & contracts' },
    { icon: Globe, title: 'Global Reach', desc: 'Bangladesh, India, Singapore & expanding worldwide' },
  ];

  const steps = [
    { num: '01', title: 'Register & Verify', desc: 'Create profile and complete KYC in under 24 hours.', icon: BadgeCheck },
    { num: '02', title: 'Discover', desc: 'Browse 25+ verified projects or get investor matches.', icon: Zap },
    { num: '03', title: 'Connect', desc: 'Enter deal rooms, sign NDAs, review documents.', icon: Lock },
    { num: '04', title: 'Close Deal', desc: 'Negotiate terms and complete investment securely.', icon: Handshake },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Angel Investor', location: 'Dhaka', rating: 5, text: 'InvestBridge changed how I find startups. Every project is verified, and the deal room makes negotiations feel safe and professional.' },
    { name: 'Rahim Ahmed', role: 'Founder, PayBridge BD', location: 'Chittagong', rating: 5, text: 'I listed my fintech startup and connected with 3 serious investors in the first month. Raised $325K through the platform.' },
    { name: 'James Wilson', role: 'VC Partner', location: 'Singapore', rating: 5, text: 'Finally a platform that takes verification seriously. Proof of funds checks and encrypted documents give me real confidence.' },
    { name: 'Fatima Rahman', role: 'Founder, AgriConnect', location: 'Rajshahi', rating: 5, text: 'As a female founder, trust was everything. InvestBridge verified my business and connected me with investors who believed in our mission.' },
    { name: 'Priya Sharma', role: 'Angel Investor', location: 'Mumbai', rating: 5, text: 'The project filtering is excellent. I found 4 agritech startups in Bangladesh that matched my investment thesis perfectly.' },
    { name: 'Michael Tan', role: 'Corporate Investor', location: 'Singapore', rating: 5, text: 'We closed a $200K deal through InvestBridge deal room. The NDA workflow and document vault saved us weeks of legal back-and-forth.' },
  ];


  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <HeroBackground />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
              Global Investment Marketplace
            </span>

            <h1 className="mt-8 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Invest in{' '}
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                Verified
              </span>
              {' '}Startups with Confidence
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl">
              Discover hand-picked opportunities, connect with serious investors, and close deals in a secure, verified environment.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/register?role=investor" className="btn-accent">
                Start Investing Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/15"
              >
                Browse {projects.length > 0 ? projects.length : 27}+ Projects
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-300 sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUSTED BY ─── */}
      <section className="border-b border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            Trusted by leading organizations
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {partners.map((p) => (
              <span key={p} className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                <Building2 className="h-4 w-4" />
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { value: '$300B+', label: 'Global Startup Market', icon: Globe },
            { value: '150+', label: 'Deals in Progress', icon: Handshake },
            { value: '100%', label: 'Verified Listings', icon: Award },
            { value: '24hr', label: 'KYC Turnaround', icon: BadgeCheck },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100">
                <s.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 sm:text-2xl">{s.value}</p>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW PLATFORM HELPS ─── */}
      <section className="py-16 sm:py-24" id="how-it-helps">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="section-label">Built For You</span>
            <h2 className="section-title mt-4">How InvestBridge Helps You</h2>
            <p className="section-subtitle mx-auto">
              Whether you&apos;re raising capital or looking to invest, we&apos;ve built tools that work for you.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {howItHelps.map((item) => (
              <div key={item.title} className="card-hover overflow-hidden !p-0">
                <div className={`bg-gradient-to-r ${item.color} px-6 py-5`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link href={item.href} className="btn-primary mt-6 inline-flex text-sm">
                    {item.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST & VERIFIED ─── */}
      <section className="bg-gradient-to-b from-indigo-50/50 to-white py-16 sm:py-24" id="trust">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="section-label">Trust & Security</span>
            <h2 className="section-title mt-4">Only Verified & Trusted People</h2>
            <p className="section-subtitle mx-auto">
              Every investor and founder goes through multi-layer verification. No fake profiles. No unverified deals.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trustFeatures.map((f) => (
              <div key={f.title} className="card-hover group text-center sm:text-left">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 transition group-hover:bg-indigo-600 sm:mx-0">
                  <f.icon className="h-6 w-6 text-indigo-600 transition group-hover:text-white" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-center text-white sm:p-12">
            <Shield className="mx-auto h-12 w-12 text-amber-300" />
            <h3 className="mt-4 text-2xl font-bold sm:text-3xl">Your Trust Is Our Foundation</h3>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100">
              We verify identity, business registration, and proof of funds before anyone can invest or raise capital.
            </p>
            <Link href="/verification" className="btn-accent mt-8 inline-flex">
              Get Verified Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROJECTS ─── */}
      <section className="py-16 sm:py-24" id="projects">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="section-label">Top Opportunities</span>
              <h2 className="section-title mt-4">
                {projects.length > 0 ? `${projects.length} Verified Projects` : 'Featured Investment Projects'}
              </h2>
              <p className="section-subtitle">Hand-picked verified startups seeking funding right now.</p>
            </div>
            <Link href="/projects" className="btn-secondary shrink-0 text-sm">
              View All Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 9).map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
          {projects.length > 9 && (
            <div className="mt-10 text-center">
              <Link href="/projects" className="btn-primary">
                See All {projects.length} Projects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="border-y border-slate-100 bg-slate-50 py-16 sm:py-24" id="how-it-works">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="section-label">Simple Process</span>
            <h2 className="section-title mt-4">How It Works</h2>
            <p className="section-subtitle mx-auto">Four simple steps from sign-up to closed deal.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="card-hover relative text-center">
                <span className="text-4xl font-black text-indigo-100">{step.num}</span>
                <div className="mx-auto -mt-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="py-16 sm:py-24" id="reviews">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="section-label">Client Satisfaction</span>
            <h2 className="section-title mt-4">Real People. Real Results.</h2>
            <p className="section-subtitle mx-auto">Hear from investors and founders who trust InvestBridge.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div key={t.name} className="card-hover">
                <div className="flex">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={testimonialAvatars[idx % testimonialAvatars.length]}
                      alt={t.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role} · {t.location}</p>
                  </div>
                  <span className="ml-auto badge bg-emerald-50 text-emerald-700">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 px-6 py-14 text-center shadow-2xl shadow-indigo-500/30 sm:px-12 sm:py-20">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-amber-400/20 blur-2xl" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                Ready to Bridge the Trust Gap?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-indigo-100 sm:text-lg">
                Join 500+ verified investors funding 27+ startups. Free to sign up. Start in under 2 minutes.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/register?role=investor" className="btn-accent">
                  Join as Investor <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/register?role=founder" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                  List Your Business
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
