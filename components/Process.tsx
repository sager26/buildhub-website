"use client";

import { motion } from "framer-motion";
import Reveal from "./ui/Reveal";
import { PROCESS } from "@/lib/constants";
import { stagger, fadeUp } from "@/lib/motion";

export default function Process() {
  return (
    <section className="container-x py-28 md:py-40">
      <div className="mb-14 max-w-xl">
        <Reveal>
          <span className="eyebrow">{PROCESS.eyebrow}</span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
            {PROCESS.title}
          </h2>
        </Reveal>
      </div>

      <motion.div
        className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:grid-cols-3"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {PROCESS.steps.map((s) => (
          <motion.div
            key={s.n}
            variants={fadeUp}
            className="group relative bg-black p-8 transition-colors duration-300 hover:bg-brand-medium/40 md:p-10"
          >
            <span className="font-display text-6xl font-extrabold text-white/10 transition-colors group-hover:text-brand-green/30">
              {s.n}
            </span>
            <h3 className="mt-6 font-display text-2xl font-semibold text-white">
              {s.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              {s.body}
            </p>
            <span className="absolute right-8 top-10 h-2 w-2 rounded-full bg-brand-green opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
