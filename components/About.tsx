"use client";

import { motion } from "framer-motion";
import Reveal from "./ui/Reveal";
import Counter from "./ui/Counter";
import { STATS } from "@/lib/constants";
import { useLang } from "@/lib/i18n";
import { clipReveal, stagger, fadeUp } from "@/lib/motion";

export default function About() {
  const { t } = useLang();
  const A = t.about;
  return (
    <>
      <section id="about" className="container-x relative py-24 md:py-36">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal><span className="eyebrow">{A.eyebrow}</span></Reveal>
            <motion.h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 md:text-5xl"
              variants={clipReveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
              {A.title}
            </motion.h2>
            <Reveal delay={0.14}>
              <div className="mt-8 space-y-3 border-l-2 border-brand-green pl-5 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-5">
                {A.diffs.map((d, i) => <p key={i} className="text-sm text-gray-500">{d}</p>)}
              </div>
            </Reveal>
          </div>
          <div className="md:col-span-7">
            <Reveal delay={0.08}><p className="text-lg leading-relaxed text-gray-600">{A.body}</p></Reveal>
            <Reveal delay={0.14}><p className="mt-5 text-base leading-relaxed text-gray-500">{A.body2}</p></Reveal>
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-gray-200 pt-10">
              {STATS.map((s, i) => (
                <Reveal key={i} delay={0.1 + i * 0.1}>
                  <div>
                    <div className="font-display text-3xl font-extrabold text-brand-green md:text-4xl"><Counter value={s.value} suffix={s.suffix} /></div>
                    <p className="mt-2 text-xs leading-snug text-gray-400 md:text-sm">{t.stats[i]}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f3ef] py-24 md:py-36">
        <div className="container-x">
          <div className="mb-12">
            <Reveal><span className="eyebrow">{A.makeEyebrow}</span></Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                {A.makeTitle1}<br /><span className="text-brand-green">{A.makeTitle2}</span>
              </h2>
            </Reveal>
          </div>
          <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {A.services.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-brand-green/50 hover:shadow-md">
                <span className="font-display text-5xl font-extrabold text-gray-100 transition-colors group-hover:text-brand-green/20">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
