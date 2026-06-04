"use client";

export default function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden border-y border-gray-200 bg-[#f4f3ef] py-5 select-none">
      <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-2xl font-semibold uppercase tracking-tight text-gray-700 md:text-3xl">
              {t}
            </span>
            <span className="text-brand-green text-xl md:text-2xl">✦</span>
          </span>
        ))}
      </div>
      <div aria-hidden className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-2xl font-semibold uppercase tracking-tight text-gray-700 md:text-3xl">
              {t}
            </span>
            <span className="text-brand-green text-xl md:text-2xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
