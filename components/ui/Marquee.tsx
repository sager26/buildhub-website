"use client";

export default function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden border-y border-white/10 py-6 select-none">
      <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-2xl font-semibold uppercase tracking-tight text-white/70 md:text-4xl">
              {t}
            </span>
            <span className="text-brand-green text-2xl md:text-4xl">✦</span>
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 animate-marquee items-center gap-10 pr-10"
      >
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-2xl font-semibold uppercase tracking-tight text-white/70 md:text-4xl">
              {t}
            </span>
            <span className="text-brand-green text-2xl md:text-4xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
