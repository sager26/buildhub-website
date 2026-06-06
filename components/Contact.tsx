"use client";

import { motion } from "framer-motion";
import Reveal from "./ui/Reveal";
import MagneticButton from "./ui/MagneticButton";
import { BRAND, WHATSAPP_QUOTE } from "@/lib/constants";
import { useLang } from "@/lib/i18n";
import { EASE } from "@/lib/motion";

export default function Contact() {
  const { t } = useLang();
  return (
    <section id="contact" className="bg-[#f4f3ef] py-24 md:py-36">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:p-16">
          {/* Subtle green bloom */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-green/10 blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-2">
            <div>
              <Reveal><span className="eyebrow">{t.contact.eyebrow}</span></Reveal>
              <motion.h2
                className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-tight text-gray-900 md:text-6xl"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: EASE }}
              >
                {t.contact.title1}<br /><span className="text-brand-green">{t.contact.title2}</span>
              </motion.h2>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-500">{t.contact.body}</p>
              </Reveal>

              <div className="mt-8 flex flex-wrap gap-4">
                <MagneticButton href={WHATSAPP_QUOTE} external cursorLabel="Chat">
                  {t.ui.chat}
                </MagneticButton>
                <MagneticButton href={BRAND.phoneHref} variant="ghost-light" cursorLabel="Call">
                  {BRAND.phoneDisplay}
                </MagneticButton>
              </div>

              <div className="mt-10 grid gap-4 border-t border-gray-200 pt-8 sm:grid-cols-2">
                <a href={BRAND.emailHref} className="group flex flex-col gap-1" data-cursor="Email">
                  <span className="text-xs uppercase tracking-widest text-gray-400">{t.contact.email}</span>
                  <span className="text-gray-700 transition-colors group-hover:text-brand-green">
                    {BRAND.email}
                  </span>
                </a>
                <a
                  href={BRAND.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1"
                  data-cursor="Map"
                >
                  <span className="text-xs uppercase tracking-widest text-gray-400">{t.contact.location}</span>
                  <span className="text-gray-700 transition-colors group-hover:text-brand-green">
                    {BRAND.location}
                  </span>
                </a>
              </div>
            </div>

            <motion.div
              className="relative min-h-[300px] overflow-hidden rounded-2xl border border-gray-200 lg:min-h-full"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <iframe
                title="BuildHub location"
                src="https://www.google.com/maps?q=Amman,+Jordan&output=embed"
                className="h-full w-full"
                style={{ border: 0, minHeight: 300 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={BRAND.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-gray-700 shadow backdrop-blur hover:text-brand-green"
              >
                {t.contact.openMaps}
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
