import Logo from "./Logo";
import { BRAND, NAV_LINKS, WHATSAPP_QUOTE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-14">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Logo variant="dark" />
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Foam Stone & architectural facade solutions, proudly manufactured
              in Jordan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400">
                Explore
              </h4>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-gray-600 transition-colors hover:text-brand-green"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400">
                Contact
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href={BRAND.phoneHref} className="text-gray-600 transition-colors hover:text-brand-green">
                    {BRAND.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={BRAND.emailHref} className="text-gray-600 transition-colors hover:text-brand-green">
                    {BRAND.email}
                  </a>
                </li>
                <li>
                  <a
                    href={BRAND.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors hover:text-brand-green"
                  >
                    {BRAND.location}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400">
                Start
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a
                    href={WHATSAPP_QUOTE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 transition-colors hover:text-brand-green"
                  >
                    Get a Quote
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-xs text-gray-400 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p>Made in Jordan · Elevate Your Facade</p>
        </div>
      </div>
    </footer>
  );
}
