import Logo from "./Logo";
import { BRAND, NAV_LINKS, WHATSAPP_QUOTE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-14">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Foam Stone & architectural facade solutions, proudly manufactured
              in Jordan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/40">
                Explore
              </h4>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-white/70 transition-colors hover:text-brand-green"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/40">
                Contact
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a
                    href={BRAND.phoneHref}
                    className="text-white/70 transition-colors hover:text-brand-green"
                  >
                    {BRAND.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={BRAND.emailHref}
                    className="text-white/70 transition-colors hover:text-brand-green"
                  >
                    {BRAND.email}
                  </a>
                </li>
                <li>
                  <a
                    href={BRAND.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 transition-colors hover:text-brand-green"
                  >
                    {BRAND.location}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/40">
                Start
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a
                    href={WHATSAPP_QUOTE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 transition-colors hover:text-brand-green"
                  >
                    Get a Quote
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p>Made in Jordan · Elevate Your Facade</p>
        </div>
      </div>
    </footer>
  );
}
