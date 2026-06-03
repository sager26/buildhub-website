"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "./ui/MagneticButton";
import { HERO, WHATSAPP_QUOTE } from "@/lib/constants";
import { EASE } from "@/lib/motion";

const words = HERO.title.split(" ");

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: photo drifts up as page scrolls
  const imgY      = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  // Content fades + rises on scroll
  const contentY  = useTransform(scrollYProgress, [0, 0.55], ["0%", "-12%"]);
  const contentOp = useTransform(scrollYProgress, [0, 0.5],  [1, 0]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
    >
      {/* ── Real catalog photo ── */}
      <motion.div
        className="absolute inset-0 z-0 scale-110"
        style={{ y: imgY }}
      >
        <Image
          src="/catalog-pages/page-46.png"
          alt="Grand facade with Corinthian columns — BuildHub project"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "center 30%" }}
        />
      </motion.div>

      {/* ── Overlays for depth & legibility ── */}
      {/* Base dark wash */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-black/52" />
      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
      {/* Top fade (for navbar) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-48 bg-gradient-to-b from-black/70 to-transparent" />
      {/* Bottom fade (into next section) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-52 bg-gradient-to-t from-black to-transparent" />

      {/* ── Eyebrow pill — top center ── */}
      <motion.div
        className="absolute top-28 inset-x-0 z-20 flex justify-center"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
      >
        <span className="glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          {HERO.eyebrow}
        </span>
      </motion.div>

      {/* ── Centre content: Logo → rule → headline → body → CTAs ── */}
      <motion.div
        className="relative z-20 flex flex-col items-center px-6 text-center"
        style={{ y: contentY, opacity: contentOp }}
      >
        {/* LOGO — the centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.0, ease: EASE }}
        >
          <Image
            src="/logo-transparent.png"
            alt="BuildHub — For Green Solutions"
            width={420}
            height={116}
            priority
            style={{
              filter: "brightness(0) invert(1)",   // pure white — crisp on photo bg
              width: "clamp(200px, 26vw, 380px)",
              height: "auto",
            }}
          />
        </motion.div>

        {/* Green decorative rule */}
        <motion.div
          className="my-8 flex items-center gap-3"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.75, duration: 0.85, ease: EASE }}
          style={{ transformOrigin: "center" }}
        >
          <span className="h-px w-12 bg-white/30" />
          <span className="h-2 w-2 rotate-45 border border-brand-green bg-transparent" />
          <span className="h-px w-24 bg-brand-green" />
          <span className="h-2 w-2 rotate-45 border border-brand-green bg-transparent" />
          <span className="h-px w-12 bg-white/30" />
        </motion.div>

        {/* Headline */}
        <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-[5.5rem]">
          {words.map((w, i) => (
            <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-1">
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.85 + i * 0.13, duration: 0.95, ease: EASE }}
              >
                {i === words.length - 1 ? (
                  <span className="text-brand-green">{w}</span>
                ) : w}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Body */}
        <motion.p
          className="mt-7 max-w-lg text-base leading-relaxed text-white/60 md:text-lg"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          {HERO.body}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
        >
          <MagneticButton href={WHATSAPP_QUOTE} external cursorLabel="Chat">
            Get a Quote
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
          <MagneticButton href="#products" variant="ghost" cursorLabel="View">
            Explore Products
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Scroll cue ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="flex h-9 w-5 justify-center rounded-full border border-white/25 pt-1.5">
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
