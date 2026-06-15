'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  aspectClass?: string;
  autoPlay?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  showCounter?: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80';

export default function ImageCarousel({
  images,
  alt,
  className = '',
  aspectClass = 'aspect-[16/10]',
  autoPlay = false,
  showDots = true,
  showArrows = true,
  showCounter = true,
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const slides = images.length > 0 ? images : [FALLBACK_IMAGE];

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!autoPlay) {
      setCurrent(0);
      return;
    }
    if (slides.length <= 1) return;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [autoPlay, slides.length, next]);

  return (
    <div
      className={`group relative w-full overflow-hidden bg-slate-200 ${aspectClass} min-h-[180px] ${className}`}
    >
      {slides.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'z-[1] opacity-100' : 'z-0 opacity-0'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${alt} - image ${i + 1}`}
            className="h-full w-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {showArrows && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 z-[3] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow transition hover:bg-white sm:left-3 sm:h-9 sm:w-9"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 z-[3] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow transition hover:bg-white sm:right-3 sm:h-9 sm:w-9"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-[3] flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {showCounter && slides.length > 1 && (
        <span className="absolute right-3 top-3 z-[3] rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {current + 1}/{slides.length}
        </span>
      )}
    </div>
  );
}
