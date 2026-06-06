"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WHATSAPP_QUOTE } from "@/lib/constants";

export default function WhatsAppFab() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={WHATSAPP_QUOTE}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          data-cursor="Chat"
          className="fixed bottom-5 right-5 z-[300] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_30px_rgba(37,211,102,0.45)] transition-transform hover:scale-110"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
          <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
            <path d="M16 .4C7.4.4.5 7.3.5 15.9c0 2.8.7 5.4 2 7.8L.4 31.6l8.2-2.1c2.3 1.2 4.8 1.9 7.4 1.9 8.6 0 15.5-6.9 15.5-15.5S24.6.4 16 .4zm0 28.3c-2.4 0-4.6-.6-6.5-1.8l-.5-.3-4.8 1.3 1.3-4.7-.3-.5c-1.3-2-1.9-4.3-1.9-6.6C2.6 8.5 8.6 2.5 16 2.5S29.4 8.5 29.4 15.9 23.4 28.7 16 28.7zm8.2-9.6c-.4-.2-2.6-1.3-3-1.5-.4-.1-.7-.2-1 .2-.3.4-1.1 1.5-1.4 1.7-.3.2-.5.3-.9.1-.4-.2-1.9-.7-3.6-2.2-1.3-1.2-2.2-2.6-2.5-3-.3-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3 0-.5 0-.7-.1-.2-1-2.4-1.4-3.3-.4-.9-.7-.7-1-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.5 1.4-1.5 3.5s1.5 4.1 1.7 4.4c.2.3 3 4.6 7.3 6.4 1 .4 1.8.7 2.4.9 1 .3 1.9.3 2.6.2.8-.1 2.6-1.1 3-2.1.4-1 .4-1.9.3-2.1-.1-.2-.4-.3-.8-.5z"/>
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
