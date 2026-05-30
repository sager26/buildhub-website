"use client";

import { motion } from "framer-motion";
import Reveal from "./ui/Reveal";
import Counter from "./ui/Counter";
import { ABOUT, STATS } from "@/lib/constants";
import { clipReveal, stagger, fadeUp } from "@/lib/motion";

const SERVICES = [
  {
    title: "Foam Stone Cladding",
    body: "EPS-core panels with a stone-textured exterior coat — lightweight, insulating, and weatherproof. Replaces natural stone at a fraction of the weight and cost.",
  },
  {
    title: "Decorative Moldings",
    body: "Window surrounds, cornices, sills, and string courses made to your exact dimensions. Supplied pre-finished and ready to install.",
  },
  {
    title: "Columns & Capitals",
    body: "Classical and contemporary column systems — Doric, Ionic, Corinthian, and custom profiles. Full column kits including base, shaft, capital, and plinth.",
  },
  {
    title: "Architectural Arches",
    body: "Semicircular, segmental, and custom-profile arch systems for entrances, windows, and facades. Precision-cut for perfect fit on site.",
  },
  {
    title: "Custom Elements",
    body: "One-off decorative pieces designed from your drawings or reference images — medallions, pilasters, balustrades, pediments, and bespoke ornaments.",
  },
  {
    title: "Full Facade Systems",
    body: "Turn-key facade packages from design to delivery. We coordinate all elements — cladding, trim, columns, arches — as a single engineered system.",
  },
];

export default function About() {
  return (
    <>
      {/* ── About copy + stats ── */}
      <section id="about" className="container-x relative py-28 md:py-40">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal>
              <span className="eyebrow">{ABOUT.eyebrow}</span>
            </Reveal>
            <motion.h2
              className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl"
              variants={clipReveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
            >
              {ABOUT.title}
            </motion.h2>

            {/* What makes us different */}
            <Reveal delay={0.14}>
              <div className="mt-8 space-y-3 border-l-2 border-brand-green pl-5">
                <p className="text-sm text-white/60">Local manufacturer — not an importer. Every piece is produced in Jordan.</p>
                <p className="text-sm text-white/60">Works with architects, contractors, and villa owners directly.</p>
                <p className="text-sm text-white/60">Custom orders accepted from single pieces to full project supply.</p>
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-7">
            <Reveal delay={0.08}>
              <p className="text-lg leading-relaxed text-white/70">
                {ABOUT.body}
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-5 text-base leading-relaxed text-white/55">
                Unlike traditional stone, our Foam Stone system is manufactured
                using Expanded Polystyrene (EPS) technology bonded with a
                cement-polymer exterior coat. The result is an architectural
                finish that looks identical to natural stone — but installs
                in days, not weeks, and places no extra load on the structure.
              </p>
            </Reveal>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={0.1 + i * 0.1}>
                  <div>
                    <div className="font-display text-4xl font-extrabold text-brand-green md:text-5xl">
                      <Counter value={s.value} suffix={s.suffix} />
                    </div>
                    <p className="mt-2 text-xs leading-snug text-white/50 md:text-sm">
                      {s.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services grid ── */}
      <section className="container-x pb-28 md:pb-40">
        <div className="mb-12">
          <Reveal>
            <span className="eyebrow">What We Make</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
              Full facade capability,
              <br />
              <span className="text-brand-green">under one roof</span>
            </h2>
          </Reveal>
        </div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              className="group glass rounded-2xl p-7 transition-colors duration-300 hover:border-brand-green/40"
            >
              <span className="font-display text-5xl font-extrabold text-white/8 transition-colors group-hover:text-brand-green/20">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
