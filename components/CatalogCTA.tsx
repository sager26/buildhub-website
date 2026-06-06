"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Reveal from "./ui/Reveal";
import { BRAND } from "@/lib/constants";
import { useLang } from "@/lib/i18n";

export default function CatalogCTA() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // capture lead via WhatsApp + start the download
    const msg = encodeURIComponent(
      `Hi BuildHub, this is ${name || "(name)"} — please send me the product catalog. My WhatsApp: ${phone || "(number)"}`
    );
    window.open(`${BRAND.whatsapp}?text=${msg}`, "_blank", "noopener");
    const a = document.createElement("a");
    a.href = "/buildhub-catalog.pdf";
    a.download = "BuildHub-Catalog.pdf";
    document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-[#0c0b09] p-8 md:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-green/20 blur-3xl" />
          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <div>
              <Reveal><span className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-green">{t.products.label}</span></Reveal>
              <Reveal delay={0.06}>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white md:text-4xl">{t.ui.catalogTitle}</h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55 md:text-base">{t.ui.catalogBody}</p>
              </Reveal>
            </div>

            <motion.form
              onSubmit={submit}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <input
                value={name} onChange={(e) => setName(e.target.value)} required
                placeholder={t.ui.namePh}
                className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand-green"
              />
              <input
                value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel"
                placeholder={t.ui.phonePh}
                className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand-green"
              />
              <button type="submit" className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#00b400]">
                {t.ui.getCatalog}
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1v9m0 0l3.5-3.5M7.5 10L4 6.5M2 13h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <p className="text-center text-[11px] text-white/35">{t.ui.catalogNote}</p>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}
