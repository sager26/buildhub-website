"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import MagneticButton from "./ui/MagneticButton";
import { NAV_LINKS, WHATSAPP_QUOTE } from "@/lib/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-400 ${
          scrolled
            ? "border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="container-x flex h-16 items-center justify-between md:h-20">
          <a href="#top" aria-label="BuildHub home">
            {/* When transparent (over dark hero) → white logo; when scrolled (over white) → colour logo */}
            <Logo variant={scrolled ? "dark" : "light"} />
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`group relative text-sm font-medium transition-colors hover:text-brand-green ${
                  scrolled ? "text-gray-600" : "text-white/80"
                }`}
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-green transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <MagneticButton href={WHATSAPP_QUOTE} external cursorLabel="Quote">
              Get a Quote
            </MagneticButton>
          </div>

          {/* Hamburger — adapts colour */}
          <button
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-6 transition-all ${scrolled ? "bg-gray-800" : "bg-white"} ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 transition-all ${scrolled ? "bg-gray-800" : "bg-white"} ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 transition-all ${scrolled ? "bg-gray-800" : "bg-white"} ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Mobile drawer — light theme */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-white px-6 pt-24 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
          >
            {NAV_LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-gray-100 py-5 font-display text-3xl font-semibold text-gray-900"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                {l.label}
              </motion.a>
            ))}
            <a
              href={WHATSAPP_QUOTE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-green px-7 py-4 font-semibold text-white shadow-lg"
            >
              Get a Quote on WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
