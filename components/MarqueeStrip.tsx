"use client";

import Marquee from "./ui/Marquee";
import { useLang } from "@/lib/i18n";

export default function MarqueeStrip() {
  const { t } = useLang();
  return <Marquee items={t.products.items.map((p) => p.name)} />;
}
