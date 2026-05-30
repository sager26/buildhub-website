"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function Preloader() {
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("bh_loaded")) {
      setShow(false);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      // ease toward 100 over ~1.9s
      const p = Math.min(100, Math.round((1 - Math.exp(-elapsed / 650)) * 100));
      setPct(p);
      if (elapsed < 1900 || document.readyState !== "complete") {
        raf = requestAnimationFrame(tick);
      } else {
        setPct(100);
        sessionStorage.setItem("bh_loaded", "1");
        setTimeout(() => setDone(true), 350);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setShow(false), 1100);
      return () => clearTimeout(t);
    }
  }, [done]);

  if (!show) return null;

  const blocks = Array.from({ length: 5 });

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-end gap-1.5">
            {blocks.map((_, i) => (
              <motion.span
                key={i}
                className="block w-3 rounded-sm bg-brand-green md:w-4"
                initial={{ height: 8, opacity: 0.3 }}
                animate={{
                  height: pct > i * 20 ? 40 : 8,
                  opacity: pct > i * 20 ? 1 : 0.3,
                }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            ))}
          </div>
          <div className="mt-6 font-display text-sm font-semibold uppercase tracking-[0.4em] text-white/80">
            Build<span className="text-brand-green">Hub</span>
          </div>
          <div className="mt-2 font-display text-4xl font-bold tabular-nums text-white md:text-6xl">
            {pct}
            <span className="text-brand-green">%</span>
          </div>
        </motion.div>
      )}
      {done && (
        <>
          <motion.div
            className="fixed inset-x-0 top-0 z-[121] h-1/2 bg-brand-dark"
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[121] h-1/2 bg-brand-dark"
            initial={{ y: 0 }}
            animate={{ y: "100%" }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
