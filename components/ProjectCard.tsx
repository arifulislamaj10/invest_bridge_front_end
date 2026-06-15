'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/api';
import { formatCurrency, industryLabel } from '@/lib/utils';
import { getProjectImages } from '@/lib/images';
import { Shield, Star } from 'lucide-react';
import ImageCarousel from './ImageCarousel';

export default function ProjectCard({ project }: { project: Project }) {
  const [active, setActive] = useState(false);

  const progress = project.fundingGoal
    ? Math.min((project.totalRaised / project.fundingGoal) * 100, 100)
    : 0;

  const images = getProjectImages(project);
  const hasMultiple = images.length > 1;

  return (
    <Link
      href={`/projects/${project._id}`}
      className="group block h-full outline-none"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <div className="card-hover flex h-full flex-col overflow-hidden !p-0 ring-indigo-500 transition-shadow focus-within:ring-2">
        <div className="relative">
          <ImageCarousel
            images={images}
            alt={project.title}
            aspectClass="aspect-[4/3]"
            autoPlay={active && hasMultiple}
            showArrows={active && hasMultiple}
            showDots={active && hasMultiple}
            showCounter={active && hasMultiple}
          />
          {project.isFeatured && (
            <span className="absolute left-3 top-3 z-20 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900 shadow">
              ★ Featured
            </span>
          )}
          <span className="absolute bottom-3 left-3 z-20 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            {industryLabel(project.industry)}
          </span>
          {hasMultiple && !active && (
            <span className="absolute bottom-3 right-3 z-20 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
              +{images.length - 1} photos
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-medium text-slate-500">4.9</span>
            <span className="ml-auto text-xs capitalize text-slate-400">{project.stage}</span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-indigo-600">
            {project.title}
          </h3>

          <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">{project.description}</p>

          <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="text-xl font-bold text-indigo-600">{formatCurrency(project.fundingGoal)}</p>
              <p className="text-xs text-slate-500">{project.equityOffered}% equity · {project.country}</p>
            </div>
            {project.founderId?.userId?.isVerified && (
              <span className="badge bg-emerald-50 text-emerald-700">
                <Shield className="mr-1 h-3 w-3" /> Verified
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
              <span>{progress.toFixed(0)}% funded</span>
              <span>{formatCurrency(project.totalRaised)} raised</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
