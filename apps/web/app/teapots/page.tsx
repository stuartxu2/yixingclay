import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { Cta } from "@/components/cta";
import { breadcrumbSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { TEAPOTS } from "@/lib/teapots";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Yixing Teapots",
  description:
    "The PO/ET teapots — handmade Yixing zisha teapots thrown from purple sand clay. Classic Xishi, Shi Piao, and Ju Lun Zhu forms, unglazed and made to order.",
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
  { name: "Teapots", path: "/teapots" },
];

export default function TeapotsPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "PO/ET Yixing Teapots",
    description:
      "Handmade Yixing zisha teapots thrown from purple sand clay — classic Chinese teapot forms, unglazed and made to order.",
    numberOfItems: TEAPOTS.length,
    itemListElement: TEAPOTS.map((pot, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `${pot.name} (${pot.zh})`,
        description: pot.blurb,
        material: pot.clay,
        category: "Yixing teapot",
        brand: { "@type": "Brand", name: SITE.name },
        image: `${SITE.url}${pot.image}`,
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
          <p className="mt-6 max-w-[46ch] text-[17px] font-light text-ink-soft">
            PO is the pot; ET is the pet. The same Yixing purple sand clay that
            becomes our tea pets is thrown, paddled, and fired into teapots —
            unglazed, single-walled, and made to brew.
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

        {/* The teapots — alternating rows */}
        <section className="mt-20" aria-labelledby="the-teapots">
          <SectionHead
            id="the-teapots"
            kicker="Three Forms"
            title={
              <>
                Each one a{" "}
                <em className="font-normal not-italic text-clay">classic</em>.
              </>
            }
            note="Time-honoured Yixing shapes, each thrown by hand and fired once. Made to order in the studio."
          />

          <div className="mt-14 flex flex-col gap-16">
            {TEAPOTS.map((pot, i) => (
              <article
                key={pot.slug}
                className="reveal grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
              >
                <div
                  className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream ${
                    i % 2 === 1 ? "lg:order-2" : ""
                  }`}
                >
                  <Image
                    src={pot.image}
                    alt={`${pot.name} — a ${pot.clay} Yixing teapot by PO/ET`}
                    fill
                    sizes="(max-width: 1024px) 90vw, 620px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="eyebrow">{pot.shape}</p>
                  <h3 className="mt-4 text-[clamp(26px,3vw,38px)] font-extralight tracking-[-0.02em]">
                    {pot.name}{" "}
                    <span className="text-ink-faint">{pot.zh}</span>
                  </h3>
                  <p className="mt-3 max-w-[34ch] text-[15px] font-light italic text-ink-soft">
                    {pot.poem}
                  </p>
                  <p className="mt-5 max-w-[42ch] text-[15px] font-light text-ink-soft">
                    {pot.blurb}
                  </p>

                  <dl className="mt-7 max-w-[24rem] border-t border-ink-faint/25">
                    {[
                      ["Clay body", pot.clay],
                      ["Capacity", pot.capacity],
                      ["Form", "Hand-thrown, unglazed"],
                      ["Availability", "Made to order"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-6 border-b border-ink-faint/15 py-3 text-[13.5px]"
                      >
                        <dt className="text-ink-faint">{label}</dt>
                        <dd className="font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Made-to-order enquiry */}
        <section className="mt-24 rounded-2xl bg-ink px-8 py-16 text-center sm:px-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/55">
            Made to order
          </p>
          <h2 className="mx-auto mt-5 max-w-[18ch] text-[clamp(26px,3.4vw,42px)] font-extralight leading-[1.1] tracking-[-0.02em] text-paper">
            Commission a pot from the studio.
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[15px] font-light text-paper/65">
            Each teapot is thrown to order — choose a form and clay, and we will
            shape, fire, and ship it to you. Retail and wholesale enquiries
            welcome.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Cta href={`mailto:${SITE.email}`} variant="light">
              Enquire about a teapot
            </Cta>
            <Cta href="/#wholesale" variant="light" arrow={false}>
              Wholesale
            </Cta>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
