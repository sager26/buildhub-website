"use client";

import { motion } from "framer-motion";
import Reveal from "./ui/Reveal";
import TiltCard from "./ui/TiltCard";
import { ICONS } from "./Icons";
import { useLang } from "@/lib/i18n";
import { stagger, fadeUp } from "@/lib/motion";

const ICON_ORDER = ["factory", "bolt", "ruler", "feather", "shield", "leaf"];

export default function WhyChoose() {
  const { t } = useLang();
  return (
    <section id="why" className="relative bg-white py-24 md:py-36">
      <div className="container-x">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal><span className="eyebrow">{t.why.eyebrow}</span></Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 md:text-5xl">{t.why.title}</h2>
            </Reveal>
          </div>
        </div>
        <motion.div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
          {t.why.items.map((item, i) => (
            <motion.div key={i} variants={fadeUp}>
              <TiltCard className={`h-full rounded-2xl ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
                <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand-green/40 hover:shadow-md">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">{ICONS[ICON_ORDER[i]]}</div>
                  <h3 className="font-display text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.body}</p>
                  <span className="mt-6 text-xs font-medium tabular-nums text-gray-200">0{i + 1}</span>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
