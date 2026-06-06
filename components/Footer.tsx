"use client";

import Logo from "./Logo";
import { BRAND, WHATSAPP_QUOTE } from "@/lib/constants";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  const links = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.why, href: "#why" },
    { label: t.nav.products, href: "#products" },
    { label: t.nav.contact, href: "#contact" },
  ];
  return (
    <footer className="border-t border-gray-200 bg-white py-14">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Logo variant="dark" />
            <p className="mt-4 text-sm leading-relaxed text-gray-500">{t.footer.blurb}</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400">{t.footer.explore}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.href}><a href={l.href} className="text-sm text-gray-600 transition-colors hover:text-brand-green">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400">{t.footer.contact}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href={BRAND.phoneHref} className="text-gray-600 transition-colors hover:text-brand-green" dir="ltr">{BRAND.phoneDisplay}</a></li>
                <li><a href={BRAND.emailHref} className="text-gray-600 transition-colors hover:text-brand-green">{BRAND.email}</a></li>
                <li><a href={BRAND.maps} target="_blank" rel="noopener noreferrer" className="text-gray-600 transition-colors hover:text-brand-green">{BRAND.location}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400">{t.footer.start}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href={WHATSAPP_QUOTE} target="_blank" rel="noopener noreferrer" className="text-gray-600 transition-colors hover:text-brand-green">{t.ui.quote}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-xs text-gray-400 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. {t.footer.rights}</p>
          <p>{t.footer.made}</p>
        </div>
      </div>
    </footer>
  );
}
