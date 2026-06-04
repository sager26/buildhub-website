"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  // Position: no spring — follows mouse at native speed (zero perceived lag)
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [label, setLabel] = useState<string>("");
  const enabled = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    enabled.current = true;
    document.body.classList.add("has-custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (hidden) setHidden(false);
      const interactive = (e.target as HTMLElement)?.closest(
        "a, button, [data-cursor]"
      ) as HTMLElement | null;
      setActive(!!interactive);
      setLabel(interactive?.getAttribute("data-cursor") || "");
    };
    const leave = () => setHidden(true);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [x, y, hidden]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
      style={{ x, y, opacity: hidden ? 0 : 1 }}
    >
      {/* Size springs separately — looks snappy, feels responsive */}
      <motion.div
        className="flex items-center justify-center rounded-full bg-white text-[10px] font-semibold uppercase tracking-wider text-black"
        animate={{
          width:  active ? (label ? 76 : 46) : 14,
          height: active ? (label ? 76 : 46) : 14,
          x:      active ? (label ? -38 : -23) : -7,
          y:      active ? (label ? -38 : -23) : -7,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 35, mass: 0.2 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}
