"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Reveal from "./ui/Reveal";
import ProductCategory from "./ProductCategory";
import { PRODUCTS } from "@/lib/constants";
import { useLang } from "@/lib/i18n";

export default function Products() {
  const { t } = useLang();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const items = PRODUCTS.map((p, i) => ({ ...p, name: t.products.items[i].name, body: t.products.items[i].body }));
  const active = lightbox !== null ? items[lightbox] : null;

  return (
    <>
      <section id="products" className="bg-white py-24 md:py-36">
        <div className="container-x">
          <div className="mb-10 max-w-2xl">
            <Reveal><span className="eyebrow">{t.products.eyebrow}</span></Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 md:text-6xl">{t.products.title}</h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 text-lg leading-relaxed text-gray-500">{t.products.body}</p>
            </Reveal>
          </div>

          <div>
            {items.map((p, i) => (
              <ProductCategory key={p.id} product={p} label={t.products.label} index={i} onOpen={() => setLightbox(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(null)}
          >
            {/* Prev */}
            <button
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setLightbox(l => l !== null ? (l - 1 + PRODUCTS.length) % PRODUCTS.length : 0); }}
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* Next */}
            <button
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setLightbox(l => l !== null ? (l + 1) % PRODUCTS.length : 0); }}
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* Close */}
            <button
              className="absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>

            <motion.div
              key={lightbox}
              className="relative mx-auto flex max-h-[85vh] max-w-5xl flex-col items-center px-16"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '4/3' }}>
                {active.image && (
                  <Image
                    src={active.image}
                    alt={active.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: active.imagePosition ?? "center center" }}
                    priority
                  />
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="font-display text-xl font-semibold text-white">{active.name}</p>
                <p className="mt-1 text-sm text-white/50">
                  {(lightbox ?? 0) + 1} / {PRODUCTS.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
