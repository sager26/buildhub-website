"use client";

import { motion } from "framer-motion";
import Reveal from "./ui/Reveal";
import { useLang } from "@/lib/i18n";
import { stagger, fadeUp } from "@/lib/motion";

export default function Process() {
  const { t } = useLang();
  return (
    <section className="bg-[#f4f3ef] py-24 md:py-36">
      <div className="container-x">
        <div className="mb-14 max-w-xl">
          <Reveal><span className="eyebrow">{t.process.eyebrow}</span></Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 md:text-5xl">{t.process.title}</h2>
          </Reveal>
        </div>

        <motion.div
          className="grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 md:grid-cols-3"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
        >
          {t.process.steps.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="group relative bg-white p-8 transition-colors duration-300 hover:bg-[#f9f8f5] md:p-10">
              <span className="font-display text-6xl font-extrabold text-gray-100 transition-colors group-hover:text-brand-green/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold text-gray-900">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {s.body}
              </p>
              <span className="absolute right-8 top-10 h-2 w-2 rounded-full bg-brand-green opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
