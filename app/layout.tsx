import type { Metadata, Viewport } from "next";
import { Inter, Sora, Cairo } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import GrainOverlay from "@/components/ui/GrainOverlay";
import WhatsAppFab from "@/components/ui/WhatsAppFab";
import { LangProvider } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-display", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["400", "600", "700", "800"], variable: "--font-cairo", display: "swap" });

const SITE_URL = "https://buildhub-jo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BuildHub — Foam Stone & Architectural Facades in Jordan | حجر الفوم والواجهات",
    template: "%s | BuildHub",
  },
  description:
    "BuildHub manufactures Foam Stone (EPS) cladding, decorative moldings, columns, arches and custom facade elements in Amman, Jordan. Lightweight, durable, fast to install. حجر الفوم والواجهات المعمارية في الأردن.",
  keywords: [
    "Foam Stone Jordan", "حجر الفوم", "واجهات الأردن", "facade Jordan", "decorative moldings Amman",
    "EPS facade", "architectural columns", "كرانيش", "أعمدة ديكور", "واجهات فلل", "BuildHub",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "BuildHub — Elevate Your Facade",
    description: "Foam Stone & architectural facade solutions, manufactured in Jordan. حجر الفوم والواجهات المعمارية.",
    url: SITE_URL, siteName: "BuildHub", type: "website", locale: "en_US", alternateLocale: "ar_JO",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0c0b09",
  width: "device-width",
  initialScale: 1,
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: "BuildHub",
  description: "Foam Stone (EPS) cladding, decorative moldings, columns, arches and custom architectural facade elements, manufactured in Jordan.",
  image: `${SITE_URL}/logo-transparent.png`,
  url: SITE_URL,
  telephone: "+962797435635",
  email: "Buildhub.jo@gmail.com",
  areaServed: "Jordan",
  address: { "@type": "PostalAddress", addressLocality: "Amman", addressCountry: "JO" },
  sameAs: ["https://wa.me/962797435635"],
  makesOffer: ["Foam Stone Cladding", "Decorative Moldings", "Columns & Capitals", "Architectural Arches", "Balustrades", "Window Surrounds"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${cairo.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
        <LangProvider>
          <CustomCursor />
          <GrainOverlay />
          <WhatsAppFab />
          <SmoothScroll>{children}</SmoothScroll>
        </LangProvider>
      </body>
    </html>
  );
}
