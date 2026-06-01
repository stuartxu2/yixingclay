import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Cta } from "@/components/cta";
import { breadcrumbSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { GUIDES } from "@/lib/guides";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Yixing Clay Guides — Teapots & Tea Pets Explained",
  description:
    "Plain-English guides to Yixing clay, zisha teapots, and tea pets: what the clay is, how to season a teapot, what a tea pet means, care steps, and a tea glossary.",
  alternates: { canonical: "/guides" },
  openGraph: {
    type: "website",
    title: `Guides · ${SITE.name}`,
    description:
      "Learn Yixing clay teaware — what zisha is, how to season a teapot, tea pet culture, care, and a full glossary.",
    url: `${SITE.url}/guides`,
    images: [{ url: "/images/teapot1.avif", width: 1200, height: 545 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Guides · ${SITE.name}`,
    description:
      "Learn Yixing clay teaware — what zisha is, how to season a teapot, tea pet culture, care, and a full glossary.",
    images: ["/images/teapot1.avif"],
  },
};

const trail = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guides" },
];

export default function GuidesPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "PO/ET Yixing Clay Guides",
    description:
      "Educational guides on Yixing zisha clay, teapots, and tea pets for tea drinkers and collectors.",
    numberOfItems: GUIDES.length,
    itemListElement: GUIDES.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/guides/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />

      <SiteHeader />

      <main
        id="main-content"
        className="mx-auto max-w-[1320px] px-6 py-10 sm:px-10 sm:py-14"
      >
        <Breadcrumbs trail={trail} />

        {/* Intro */}
        <section className="mt-9" aria-labelledby="guides-hero">
          <p className="eyebrow">Learn</p>
          <h1
            id="guides-hero"
            className="mt-5 max-w-[20ch] text-[clamp(36px,5vw,68px)] font-extralight leading-[1.04] tracking-[-0.022em]"
          >
            Yixing clay,{" "}
            <em className="font-normal not-italic text-clay">explained</em>.
          </h1>
          <p className="mt-6 max-w-[54ch] text-[17px] font-light text-ink-soft">
            Everything a non-collector wants to know before buying — what zisha
            purple sand clay actually is, how to season a teapot, what a tea pet
            means, and the Chinese tea words that show up on every product page.
          </p>
        </section>

        {/* Guide cards */}
        <section className="mt-12" aria-labelledby="all-guides">
          <h2 id="all-guides" className="sr-only">
            All guides
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-faint/25 bg-surface transition-colors hover:border-ink-faint/50"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-cream">
                    <Image
                      src={g.ogImage}
                      alt={g.ogImageAlt}
                      fill
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 400px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="eyebrow">{g.kicker}</p>
                    <h3 className="mt-3 text-[20px] font-light leading-snug tracking-[-0.01em]">
                      {g.h1}
                    </h3>
                    <p className="mt-3 text-[14px] font-light text-ink-soft">
                      {g.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.1em] text-clay">
                      Read the guide
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA strip */}
        <section className="mt-20 rounded-2xl bg-ink px-8 py-16 text-center sm:px-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/55">
            Ready to brew
          </p>
          <h2 className="mx-auto mt-5 max-w-[22ch] text-[clamp(26px,3.4vw,42px)] font-extralight leading-[1.1] tracking-[-0.02em] text-paper">
            Put the reading into a pot.
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-[15px] font-light text-paper/65">
            Browse handmade Yixing teapots and tea pets — every piece named for
            the clay it is shaped from.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Cta href="/teapots" variant="light">
              Shop teapots
            </Cta>
            <Cta href="/tea-pets" variant="light" arrow={false}>
              Shop tea pets
            </Cta>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
