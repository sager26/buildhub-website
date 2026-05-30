import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import GrainOverlay from "@/components/ui/GrainOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const SITE_URL = "https://buildhub.jo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BuildHub — Elevate Your Facade | Foam Stone & Facades, Jordan",
    template: "%s | BuildHub",
  },
  description:
    "Jordan's leading provider of Foam Stone and architectural facade solutions. Custom decorative moldings, columns, arches and facade elements — lightweight, durable, fast to install.",
  keywords: [
    "Foam Stone",
    "facade Jordan",
    "decorative moldings",
    "EPS facade",
    "architectural columns",
    "BuildHub",
  ],
  openGraph: {
    title: "BuildHub — Elevate Your Facade",
    description:
      "Foam Stone and architectural facade solutions, manufactured in Jordan.",
    url: SITE_URL,
    siteName: "BuildHub",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <CustomCursor />
        <GrainOverlay />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
