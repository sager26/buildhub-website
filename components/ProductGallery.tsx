"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "./ui/Reveal";
import { useLang } from "@/lib/i18n";

const GALLERY = [
  { src: "/catalog-pages/page-46.png", pos: "center 20%",  span: 2, label: "Columns & Capitals" },
  { src: "/catalog-pages/page-50.png", pos: "center top",   span: 1, label: "Foam Stone Facade" },
  { src: "/catalog-pages/page-30.png", pos: "center 30%",  span: 1, label: "Custom Projects" },
  { src: "/catalog-pages/page-53.png", pos: "center 65%",  span: 1, label: "Foam Stone Villa" },
  { src: "/catalog-pages/page-58.png", pos: "center 70%",  span: 1, label: "Decorative Details" },
  { src: "/catalog-pages/page-48.png", pos: "center 65%",  span: 2, label: "Colonnade Villa" },
  { src: "/catalog-pages/page-14.png", pos: "center 80%",  span: 1, label: "Arched Entry" },
  { src: "/catalog-pages/page-26.png", pos: "center 80%",  span: 1, label: "Night Facade" },
  { src: "/catalog-pages/page-22.png", pos: "center 72%",  span: 1, label: "Modern Villa" },
];

function GalleryItem({ src, pos, span, label, index }: {
  src: string; pos: string; span: number; label: string; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1],
    [index % 2 === 0 ? 40 : -40, index % 2 === 0 ? -40 : 40]);

  return (
    <motion.div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl bg-gray-200 ${
        span === 2 ? "col-span-2" : "col-span-1"
      }`}
      style={{ aspectRatio: span === 2 ? "16/9" : "3/4" }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.06 }}
      data-cursor="View"
    >
      <motion.div style={{ y }} className="absolute inset-[-8%]">
        <Image
          src={src}
          alt={label}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition: pos }}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute bottom-4 left-4 translate-y-3 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        {label}
      </span>
    </motion.div>
  );
}

export default function ProductGallery() {
  const { t } = useLang();
  return (
    <section className="bg-[#f4f3ef] py-20 md:py-28">
      <div className="container-x">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Reveal><span className="eyebrow">{t.gallery.eyebrow}</span></Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">{t.gallery.title}</h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <p className="max-w-sm text-sm leading-relaxed text-gray-500">{t.gallery.body}</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {GALLERY.map((item, i) => (
            <GalleryItem key={item.src} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
