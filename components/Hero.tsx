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
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      {/* 3D layer */}
      <div className="absolute inset-0 z-0">
        <Hero3D />
      </div>

      {/* vignette + gradients for legibility */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_80%,#000_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black to-transparent" />

      <div className="container-x relative z-20 pt-24">
        <motion.span
          className="eyebrow glass mb-6 rounded-full px-4 py-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          {HERO.eyebrow}
        </motion.span>

        <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
          {words.map((w, i) => (
            <span key={i} className="mr-4 inline-block overflow-hidden pb-2">
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.35 + i * 0.12, duration: 0.9, ease: EASE }}
              >
                {i === words.length - 1 ? (
                  <span className="text-brand-green">{w}</span>
                ) : (
                  w
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="mt-7 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          {HERO.body}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          <MagneticButton href={WHATSAPP_QUOTE} external cursorLabel="Chat">
            Get a Quote
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
          <MagneticButton href="#products" variant="ghost" cursorLabel="View">
            Explore Products
          </MagneticButton>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex-col items-center gap-2 text-white/50 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="flex h-9 w-5 justify-center rounded-full border border-white/30 pt-1.5">
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
