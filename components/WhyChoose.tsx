"use client";

import { motion } from "framer-motion";
import Reveal from "./ui/Reveal";
import TiltCard from "./ui/TiltCard";
import { ICONS } from "./Icons";
import { WHY } from "@/lib/constants";
import { stagger, fadeUp } from "@/lib/motion";

export default function WhyChoose() {
  return (
    <section id="why" className="relative py-28 md:py-40">
      <div className="container-x">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <span className="eyebrow">{WHY.eyebrow}</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
                {WHY.title}
              </h2>
            </Reveal>
          </div>
        </div>

        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {WHY.items.map((item, i) => (
            <motion.div key={item.title} variants={fadeUp}>
              <TiltCard
                className={`h-full rounded-2xl ${
                  i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="glass flex h-full flex-col rounded-2xl p-7 transition-colors duration-300 hover:border-brand-green/40">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/15 text-brand-green">
                    {ICONS[item.icon]}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {item.body}
                  </p>
                  <span className="mt-6 text-xs font-medium tabular-nums text-white/25">
                    0{i + 1}
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
