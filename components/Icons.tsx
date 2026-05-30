import type { ReactElement } from "react";

const common = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ICONS: Record<string, ReactElement> = {
  factory: (
    <svg {...common}>
      <path d="M3 21h18M4 21V10l5 3V10l5 3V6l6 4v11" />
      <path d="M7 21v-4M12 21v-4M17 21v-4" />
    </svg>
  ),
  bolt: (
    <svg {...common}>
      <path d="M13 2 4.5 13.5H11l-1 8.5 9-12H12l1-8z" />
    </svg>
  ),
  ruler: (
    <svg {...common}>
      <path d="M3 17 17 3l4 4L7 21z" />
      <path d="M7 7l2 2M11 5l1.5 1.5M9 13l2 2M13 11l1.5 1.5" />
    </svg>
  ),
  feather: (
    <svg {...common}>
      <path d="M20 4c-6 0-11 5-11 11v4l-3 1M20 4c0 6-5 11-11 11" />
      <path d="M9 12h7M5 19l9-9" />
    </svg>
  ),
  shield: (
    <svg {...common}>
      <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  leaf: (
    <svg {...common}>
      <path d="M11 20A7 7 0 0 1 9 6c4-2 8-2 11-2 0 3 0 7-2 11a7 7 0 0 1-7 5z" />
      <path d="M9 15c3-3 6-4 9-4" />
    </svg>
  ),
};
