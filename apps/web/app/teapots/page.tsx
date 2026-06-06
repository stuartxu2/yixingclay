import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { TeapotCollection } from "@/components/teapot-collection";
import { breadcrumbSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { TEAPOTS, priceRange } from "@/lib/teapots";
import { fetchTeapots } from "@/lib/medusa";
import { formatPrice } from "@/lib/price";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Yixing Teapots",
  description:
    "The PO/ET teapots — handmade Yixing zisha teapots thrown from purple sand clay. Classic Xishi, Shi Piao, gourd and bamboo forms, unglazed and ready to brew.",
  alternates: { canonical: "/teapots" },
  openGraph: {
    type: "website",
    title: `Yixing Teapots · ${SITE.name}`,
    description:
      "Handmade Yixing zisha teapots — classic forms thrown from purple sand clay, unglazed and made to season with your tea.",
    url: `${SITE.url}/teapots`,
    images: [{ url: "/images/teapot1.avif", width: 1200, height: 545 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Yixing Teapots · ${SITE.name}`,
    description:
      "Handmade Yixing zisha teapots — classic forms thrown from purple sand clay, unglazed and made to season with your tea.",
    images: ["/images/teapot1.avif"],
  },
};

const trail = [
  { name: "Home", path: "/" },
  { name: "The Pots", path: "/teapots" },
];

export default async function TeapotsPage() {
  const live = await fetchTeapots();
  const teapots = live.length > 0 ? live : TEAPOTS;
  const [floor, ceiling] = priceRange(teapots);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "PO/ET Yixing Teapots",
    description:
      "Handmade Yixing zisha teapots thrown from purple sand clay — classic Chinese teapot forms, unglazed and ready to brew.",
    numberOfItems: teapots.length,
    itemListElement: teapots.map((pot, i) => ({
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


      <main
        id="main-content"
        className="mx-auto max-w-[1320px] px-6 py-10 sm:px-10 sm:py-14"
      >
        <Breadcrumbs trail={trail} />

        {/* Cultural intro */}
        <section className="mt-6" aria-labelledby="teapots-hero">
          <p className="eyebrow">The Pots of PO/ET</p>
          <h1
            id="teapots-hero"
            className="mt-5 max-w-[18ch] text-[clamp(36px,5vw,68px)] font-extralight leading-[1.04] tracking-[-0.022em]"
          >
            Teapots, thrown to{" "}
            <em className="font-normal not-italic text-clay">pour</em>.
          </h1>

          <div className="mt-9 grid items-center gap-10 lg:grid-cols-[1fr_0.82fr] lg:gap-14">
            <div>
              <p className="max-w-[48ch] text-[17px] font-light text-ink-soft">
                PO is the pot; ET is the pet. The same Yixing purple sand clay
                that becomes our tea pets is thrown, paddled, and fired into
                teapots — unglazed, single-walled, and made to brew.{" "}
                {teapots.length} pots in stock, from {formatPrice(floor)} to{" "}
                {formatPrice(ceiling)}.
              </p>

              <h2
                id="why-yixing"
                className="mt-8 text-[clamp(22px,2.6vw,32px)] font-extralight tracking-[-0.02em]"
              >
                Why a clay pot{" "}
                <em className="font-normal not-italic text-clay">remembers</em>.
              </h2>
              <div className="mt-4 space-y-3 text-[14.5px] font-light text-ink-soft">
                <p>
                  Yixing teapots are thrown from zisha — &ldquo;purple
                  sand&rdquo; clay quarried near Yixing in Jiangsu, China. The
                  clay is left unglazed, so its open pore structure can breathe.
                </p>
                <p>
                  With each brewing the walls absorb a trace of the tea&apos;s
                  oil and aroma. Over years a seasoned pot is so saturated that,
                  as the old saying goes, it can draw tea from nothing but hot
                  water.
                </p>
                <p>
                  For that reason a Yixing pot is kept to a single kind of tea —
                  one pot, one tea. It is not washed with soap, only rinsed and
                  wiped, and like the tea pets it slowly deepens into a patina
                  that is yours alone.
                </p>
                <p className="pt-1 text-[13.5px]">
                  New to this clay?{" "}
                  <Link
                    href="/guides/what-is-yixing-clay"
                    className="font-medium text-clay underline decoration-clay/40 underline-offset-2 hover:decoration-clay"
                  >
                    What is Yixing clay?
                  </Link>{" "}
                  ·{" "}
                  <Link
                    href="/guides/how-to-season-a-yixing-teapot"
                    className="font-medium text-clay underline decoration-clay/40 underline-offset-2 hover:decoration-clay"
                  >
                    How to season a teapot
                  </Link>
                </p>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream">
              <Image
                src="/images/teapot1.avif"
                alt="A Yixing zisha teapot pouring tea on a wooden tea table"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* The teapots — filterable collection */}
        <section className="mt-16" aria-labelledby="the-teapots">
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

          <TeapotCollection teapots={teapots} />
        </section>
      </main>

    </>
  );
}
