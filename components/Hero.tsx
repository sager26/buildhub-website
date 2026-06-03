"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import MagneticButton from "./ui/MagneticButton";
import { HERO, WHATSAPP_QUOTE } from "@/lib/constants";
import { EASE } from "@/lib/motion";

const SPRING = { stiffness: 55, damping: 18, mass: 0.9 };

const words = HERO.title.split(" ");

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  /* ── Scroll-linked fade ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentOp = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentUp = useTransform(scrollYProgress, [0, 0.55], [0, -60]);
  const imgScale  = useTransform(scrollYProgress, [0, 1], [1.08, 1.22]);

  /* ── Mouse tracking (normalised -0.5 → +0.5) ── */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const { left, top, width, height } =
        sectionRef.current!.getBoundingClientRect();
      rawX.set((e.clientX - left) / width - 0.5);
      rawY.set((e.clientY - top) / height - 0.5);
    },
    [rawX, rawY]
  );
  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  /* ── Per-layer spring transforms ── */
  // Background photo: slow drift (farthest)
  const bgX = useSpring(useTransform(rawX, [-0.5, 0.5], ["-4%", "4%"]), SPRING);
  const bgY = useSpring(useTransform(rawY, [-0.5, 0.5], ["-4%", "4%"]), SPRING);

  // Mid: decorative vertical lines (structural echo)
  const midX = useSpring(useTransform(rawX, [-0.5, 0.5], [-20, 20]), SPRING);
  const midY = useSpring(useTransform(rawY, [-0.5, 0.5], [-10, 10]), SPRING);

  // Logo card: closest — most movement (appears to float forward)
  const logoX = useSpring(useTransform(rawX, [-0.5, 0.5], [-38, 38]), SPRING);
  const logoY = useSpring(useTransform(rawY, [-0.5, 0.5], [-22, 22]), SPRING);
  const logoRX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]), SPRING);
  const logoRY = useSpring(useTransform(rawX, [-0.5, 0.5], [-8, 8]), SPRING);

  // Headline: mid depth
  const hdX = useSpring(useTransform(rawX, [-0.5, 0.5], [-18, 18]), SPRING);
  const hdY = useSpring(useTransform(rawY, [-0.5, 0.5], [-10, 10]), SPRING);

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
      style={{ perspective: "1100px" }}
    >
      {/* ── Background photo — deepest layer ── */}
      <motion.div
        className="absolute inset-[-6%] z-0"
        style={{ x: bgX, y: bgY, scale: imgScale }}
      >
        <Image
          src="/catalog-pages/page-46.png"
          alt="Grand Corinthian facade — BuildHub project"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "center 28%" }}
        />
      </motion.div>

      {/* ── Dark washes ── */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-black/54" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_75%_75%_at_50%_50%,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-44 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-black to-transparent" />

      {/* ── Mid-depth: column echo lines ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 flex items-stretch justify-around"
        style={{ x: midX, y: midY, opacity: 0.07 }}
      >
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-px bg-white/60" />
        ))}
      </motion.div>

      {/* ── Eyebrow ── */}
      <motion.div
        className="absolute top-28 inset-x-0 z-30 flex justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
      >
        <span className="glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          {HERO.eyebrow}
        </span>
      </motion.div>

      {/* ── Foreground content (scroll fade) ── */}
      <motion.div
        className="relative z-30 flex flex-col items-center px-6 text-center"
        style={{ opacity: contentOp, y: contentUp }}
      >
        {/* LOGO — floating closest, real brand colours on frosted card */}
        <motion.div
          style={{
            x: logoX,
            y: logoY,
            rotateX: logoRX,
            rotateY: logoRY,
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0, y: 40, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.1, ease: EASE }}
          className="mb-8"
        >
          {/* Frosted glass frame so logo shows in original colours */}
          <div
            className="rounded-2xl border border-white/18 px-8 py-5"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(14px) saturate(1.4)",
              WebkitBackdropFilter: "blur(14px) saturate(1.4)",
              boxShadow: "0 8px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset",
            }}
          >
            <Image
              src="/logo-transparent.png"
              alt="BuildHub — For Green Solutions"
              width={380}
              height={105}
              priority
              style={{
                filter: "invert(1) hue-rotate(180deg) brightness(1.05)",
                width: "clamp(190px, 22vw, 340px)",
                height: "auto",
              }}
            />
          </div>
        </motion.div>

        {/* Green decorative rule — mid depth */}
        <motion.div
          className="mb-9 flex items-center gap-3"
          style={{ x: midX, opacity: 0.9 }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.78, duration: 0.9, ease: EASE }}
        >
          <span className="h-px w-10 bg-white/25" />
          <span className="h-2 w-2 rotate-45 border border-brand-green" />
          <span className="h-px w-20 bg-brand-green/80" />
          <span className="h-2 w-2 rotate-45 border border-brand-green" />
          <span className="h-px w-10 bg-white/25" />
        </motion.div>

        {/* Headline — mid depth */}
        <motion.h1
          className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-[5.25rem]"
          style={{ x: hdX, y: hdY }}
        >
          {words.map((w, i) => (
            <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-1">
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.88 + i * 0.13, duration: 0.95, ease: EASE }}
              >
                {i === words.length - 1 ? (
                  <span className="text-brand-green">{w}</span>
                ) : w}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* Body */}
        <motion.p
          className="mt-7 max-w-lg text-base leading-relaxed text-white/60 md:text-lg"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.22, duration: 0.7 }}
        >
          {HERO.body}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.42, duration: 0.7 }}
        >
          <MagneticButton href={WHATSAPP_QUOTE} external cursorLabel="Chat">
            Get a Quote
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </MagneticButton>
          <MagneticButton href="#products" variant="ghost" cursorLabel="View">
            Explore Products
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Scroll cue ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-2 text-white/38"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="flex h-9 w-5 justify-center rounded-full border border-white/22 pt-1.5">
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
