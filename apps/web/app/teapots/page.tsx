import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { TeapotCollection } from "@/components/teapot-collection";
import { breadcrumbSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import {
  TEAPOTS,
  TEAPOT_PRICE_FLOOR,
  TEAPOT_PRICE_CEILING,
} from "@/lib/teapots";
import { formatPrice } from "@/lib/products";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Yixing Teapots",
  description:
    "The PO/ET teapots — 24 handmade Yixing zisha teapots thrown from purple sand clay. Classic Xishi, Shi Piao, gourd and bamboo forms, unglazed and ready to brew.",
  alternates: { canonical: "/teapots" },
  openGraph: {
    type: "website",
    title: `Yixing Teapots · ${SITE.name}`,
    description:
      "Handmade Yixing zisha teapots — classic forms thrown from purple sand clay, unglazed and made to season with your tea.",
    url: `${SITE.url}/teapots`,
    images: [{ url: "/images/teapot1.png", width: 1200, height: 545 }],
  },
};

const trail = [
  { name: "Home", path: "/" },
  { name: "The Pots", path: "/teapots" },
];

export default function TeapotsPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "PO/ET Yixing Teapots",
    description:
      "Handmade Yixing zisha teapots thrown from purple sand clay — classic Chinese teapot forms, unglazed and ready to brew.",
    numberOfItems: TEAPOTS.length,
    itemListElement: TEAPOTS.map((pot, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `${pot.name} (${pot.zh})`,
        description: pot.blurb,
        sku: pot.sku,
        material: pot.clay,
        category: "Yixing teapot",
        brand: { "@type": "Brand", name: SITE.name },
        image: `${SITE.url}${pot.images[0]}`,
        offers: {
          "@type": "Offer",
          price: (pot.price / 100).toFixed(2),
          priceCurrency: SITE.currency,
          availability:
            pot.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `${SITE.url}/teapots/${pot.slug}`,
        },
      },
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

        {/* Hero */}
        <section className="mt-9" aria-labelledby="teapots-hero">
          <p className="eyebrow">The Pots of PO/ET</p>
          <h1
            id="teapots-hero"
            className="mt-5 max-w-[16ch] text-[clamp(38px,5.4vw,72px)] font-extralight leading-[1.04] tracking-[-0.022em]"
          >
            Teapots, thrown to{" "}
            <em className="font-normal not-italic text-clay">pour</em>.
          </h1>
          <p className="mt-6 max-w-[48ch] text-[17px] font-light text-ink-soft">
            PO is the pot; ET is the pet. The same Yixing purple sand clay that
            becomes our tea pets is thrown, paddled, and fired into teapots —
            unglazed, single-walled, and made to brew. {TEAPOTS.length} pots in
            stock, from {formatPrice(TEAPOT_PRICE_FLOOR)} to{" "}
            {formatPrice(TEAPOT_PRICE_CEILING)}.
          </p>

          <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-2xl bg-cream">
            <Image
              src="/images/teapot1.png"
              alt="A Yixing zisha teapot pouring tea on a wooden tea table"
              fill
              priority
              sizes="(max-width: 1320px) 100vw, 1320px"
              className="object-cover"
            />
          </div>
        </section>

        {/* Why Yixing teapots — AEO-friendly informational block */}
        <section
          className="mt-20 grid gap-10 border-t border-ink-faint/20 pt-14 lg:grid-cols-[0.9fr_1.1fr]"
          aria-labelledby="why-yixing"
        >
          <h2
            id="why-yixing"
            className="text-[clamp(24px,3vw,36px)] font-extralight tracking-[-0.02em]"
          >
            Why a clay pot{" "}
            <em className="font-normal not-italic text-clay">remembers</em>.
          </h2>
          <div className="space-y-4 text-[15px] font-light text-ink-soft">
            <p>
              Yixing teapots are thrown from zisha — &ldquo;purple sand&rdquo;
              clay quarried near Yixing in Jiangsu, China. The clay is left
              unglazed, so its open pore structure can breathe.
            </p>
            <p>
              With each brewing the walls absorb a trace of the tea&apos;s oil
              and aroma. Over years a seasoned pot is so saturated that, as the
              old saying goes, it can draw tea from nothing but hot water.
            </p>
            <p>
              For that reason a Yixing pot is kept to a single kind of tea — one
              pot, one tea. It is not washed with soap, only rinsed and wiped,
              and like the tea pets it slowly deepens into a patina that is
              yours alone.
            </p>
          </div>
        </section>

        {/* The teapots — filterable collection */}
        <section className="mt-20" aria-labelledby="the-teapots">
          <SectionHead
            id="the-teapots"
            kicker="The Collection"
            title={
              <>
                Every teapot, sorted by{" "}
                <em className="font-normal not-italic text-clay">clay</em>.
              </>
            }
            note="Hand-thrown Yixing pots, each fired once and unglazed. Filter by clay body, then choose the pour that suits your tea."
          />

          <TeapotCollection teapots={TEAPOTS} />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
