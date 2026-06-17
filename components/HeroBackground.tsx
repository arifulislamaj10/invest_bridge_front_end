'use client';

import { useEffect, useState } from 'react';
import { heroImages } from '@/lib/images';

const INTERVAL = 5500; // ms each image is shown

export default function HeroBackground() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    // Respect users who prefer reduced motion — show a single static image.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimate(false);
      return;
    }
    const id = setInterval(() => setIndex((i) => (i + 1) % heroImages.length), INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {heroImages.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1500ms] ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          } ${animate && i === index ? 'hero-zoom' : ''}`}
        />
      ))}

      {/* Mobile: darker uniform overlay so text is readable full-width.
          Desktop: left-to-right so the image stays visible on the right. */}
      <div className="absolute inset-0 bg-slate-950/55 sm:bg-gradient-to-r sm:from-slate-950/85 sm:via-slate-900/55 sm:to-slate-900/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
    </div>
  );
}
