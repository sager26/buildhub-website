"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import MagneticButton from "./ui/MagneticButton";
import { HERO, WHATSAPP_QUOTE } from "@/lib/constants";
import { EASE } from "@/lib/motion";

const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => null,
});

const words = HERO.title.split(" ");

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#0f0e0c]"
    >
      {/* ── 3D canvas layer ── */}
      <div className="absolute inset-0 z-0">
        <Hero3D />
      </div>

      {/* ── Depth gradients ── */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_85%_75%_at_50%_52%,transparent_30%,rgba(0,0,0,0.55)_75%,rgba(15,14,12,0.92)_100%)]" />
      {/* bottom fade into white page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-[#fafaf9] to-transparent" />
      {/* top fade behind navbar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/60 to-transparent" />

      {/* ── Text — lower portion on mobile (model visible above), centred on desktop ── */}
      <div className="relative z-20 mt-auto px-6 pb-28 md:mt-0 md:flex md:flex-1 md:items-center md:px-10">
        <div className="mx-auto w-full max-w-7xl">
          {/* Eyebrow */}
          <motion.div
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3.5 py-1.5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/65 sm:text-[11px]">
              {HERO.eyebrow}
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="max-w-3xl font-display text-[2.6rem] font-extrabold leading-[0.93] tracking-tight text-white sm:text-6xl lg:text-8xl">
            {words.map((w, i) => (
              <span key={i} className="mr-[0.18em] inline-block overflow-hidden pb-1">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.38 + i * 0.13, duration: 0.95, ease: EASE }}
                >
                  {i === words.length - 1 ? (
                    <span className="text-brand-green">{w}</span>
                  ) : w}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Body — hidden on very small screens to keep hero clean */}
          <motion.p
            className="mt-5 hidden max-w-md text-base leading-relaxed text-white/60 sm:block md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7 }}
          >
            {HERO.body}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-7 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.7 }}
          >
            <MagneticButton href={WHATSAPP_QUOTE} external cursorLabel="Chat">
              Get a Quote
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MagneticButton>
            <MagneticButton href="#products" variant="ghost" cursorLabel="View">
              Explore Products
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll cue ── */}
      <motion.div
        className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 hidden flex-col items-center gap-2 text-white/35 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="flex h-9 w-5 justify-center rounded-full border border-white/20 pt-1.5">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-brand-green"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
