const HERO_IMAGE =
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1920&q=85';

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="h-full w-full object-cover object-center"
        aria-hidden
      />

      {/* Clean left-to-right overlay for readable text */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
    </div>
  );
}
