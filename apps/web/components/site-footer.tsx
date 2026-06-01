import Image from "next/image";
import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/lib/site";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-faint/25 bg-surface">
      <div className="mx-auto max-w-[1320px] px-6 py-16 sm:px-10">
        <div className="grid gap-x-8 gap-y-12 border-b border-ink-faint/20 pb-12 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/brand/logo.avif"
                alt=""
                width={38}
                height={38}
                className="rounded-full"
              />
              <Wordmark className="text-[20px] font-medium tracking-[0.16em]" />
            </div>
            <p className="mt-4 max-w-[18rem] text-[14px] font-light text-ink-soft">
              {SITE.tagline}, hand-sculpted from Yixing purple sand clay and
              finished by years of tea.
            </p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {col.heading}
              </h3>
              <ul className="mt-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="block py-1.5 text-[14px] font-light text-ink-soft transition-colors hover:text-clay"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-7">
          <p className="text-[12.5px] font-light text-ink-faint">
            © {new Date().getFullYear()} {SITE.legalName}. {SITE.domain} — all
            pieces handmade, all one of a kind.
          </p>
          <div className="flex gap-2">
            {["IG", "小红书", "WX"].map((s) => (
              <a
                key={s}
                href="#"
                aria-label={`PO/ET on ${s}`}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink-faint/35 text-[11px] font-medium text-ink-soft transition-colors hover:border-clay hover:bg-clay hover:text-paper"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
