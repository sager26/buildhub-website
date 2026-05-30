"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Product } from "@/lib/constants";
import { EASE } from "@/lib/motion";

export default function ProductCategory({
  product,
  index,
  onOpen,
}: {
  product: Product;
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.1]);
  const reversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className="grid items-center gap-8 border-t border-white/10 py-14 md:grid-cols-2 md:gap-16 md:py-20"
    >
      {/* Visual */}
      <motion.div
        style={{ y }}
        className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl ${
          reversed ? "md:order-2" : ""
        }`}
        onClick={onOpen}
        data-cursor="View"
      >
        <motion.div style={{ scale: imgScale }} className="absolute inset-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              style={{ objectPosition: product.imagePosition ?? "center center" }}
            />
          ) : (
            <div className="absolute inset-0 bg-brand-medium">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,129,0,0.45),transparent_55%)]" />
              <span className="absolute bottom-5 left-6 font-display text-7xl font-extrabold text-white/10">
                0{index + 1}
              </span>
            </div>
          )}
        </motion.div>
        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 hover:bg-black/30 group-hover:bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100">
          <span className="rounded-full border border-white/60 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            View
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      </motion.div>

      {/* Copy */}
      <div className={reversed ? "md:order-1" : ""}>
        <motion.span
          className="font-display text-sm font-semibold text-brand-green"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          0{index + 1} — Products
        </motion.span>
        <motion.h3
          className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {product.name}
        </motion.h3>
        <motion.p
          className="mt-4 max-w-md text-base leading-relaxed text-white/60"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
        >
          {product.body}
        </motion.p>

        <motion.button
          onClick={onOpen}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:border-brand-green hover:text-brand-green"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          View Full Image
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 12L12 2M12 2H6M12 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
