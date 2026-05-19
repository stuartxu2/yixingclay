import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TEAPOTS,
  ARTISTS,
  getTeapot,
  relatedTeapots,
  teapotGallery,
  teapotHero,
} from "@/lib/teapots";
import { fetchTeapot, fetchTeapots } from "@/lib/medusa";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, teapotDetailSchema } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGallery } from "@/components/product-gallery";
import { AddToTray } from "@/components/add-to-tray";
import { ProductPrice } from "@/components/product-price";
import { TeapotCard } from "@/components/teapot-card";
import { TrackOnMount } from "@/components/analytics/track-on-mount";

/** Pre-render every teapot at build time; refresh on a one-hour ISR window. */
export const revalidate = 3600;

export async function generateStaticParams() {
  const live = await fetchTeapots();
  return (live.length > 0 ? live : TEAPOTS).map((t) => ({ slug: t.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const teapot = (await fetchTeapot(slug)) ?? getTeapot(TEAPOTS, slug);
  if (!teapot) return { title: "Teapot not found" };

  const title = `${teapot.name} (${teapot.zh})`;
  const path = `/teapots/${teapot.slug}`;
  return {
    title,
    description: teapot.blurb,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${title} · ${SITE.name}`,
      description: teapot.blurb,
      url: `${SITE.url}${path}`,
      images: [
        { url: teapotHero(teapot), width: 1200, height: 1200, alt: teapot.name },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE.name}`,
      description: teapot.blurb,
      images: [teapotHero(teapot)],
    },
  };
}

export default async function TeapotPage({ params }: Params) {
  const { slug } = await params;
  const live = await fetchTeapots();
  const list = live.length > 0 ? live : TEAPOTS;
  const teapot = getTeapot(list, slug);
  if (!teapot) notFound();

  const shots = teapotGallery(teapot);
  const related = relatedTeapots(list, teapot.slug, 3);
  const artist = ARTISTS[teapot.artist];
  const soldOut = teapot.stock <= 0;
  const trail = [
    { name: "Home", path: "/" },
    { name: "The Pots", path: "/teapots" },
    { name: teapot.name, path: `/teapots/${teapot.slug}` },
  ];

  const specs: [string, string][] = [
    ["Clay body", teapot.clay],
    ["Capacity", `${teapot.capacity} ml`],
    ["Dimensions", teapot.dimensions],
    ["Weight", `${teapot.weight} g`],
    ["Form", teapot.shape],
    ["Maker", `${artist.name} · ${artist.zh}`],
    ["SKU", teapot.sku],
  ];

  return (
    <>
      <TrackOnMount
        event="product_viewed"
        properties={{
          slug: teapot.slug,
          title: teapot.name,
          price: teapot.price,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(teapotDetailSchema(teapot)),
        }}
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

        <article className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <ProductGallery shots={shots} productName={teapot.name} />

          <div className="lg:py-2">
            <p className="eyebrow">{teapot.clay}</p>
            <h1 className="mt-5 text-[clamp(32px,4vw,52px)] font-extralight leading-[1.05] tracking-[-0.02em]">
              {teapot.name}
            </h1>
            <p className="mt-2 text-[15px] text-ink-faint">
              {teapot.zh} · {teapot.capacity} ml · thrown by{" "}
              <Link
                href="/artists"
                className="underline decoration-ink-faint/40 underline-offset-2 transition-colors hover:text-clay"
              >
                {artist.name}
              </Link>
            </p>
            <p className="mt-5 max-w-[34ch] text-[16px] font-light italic text-ink-soft">
              {teapot.poem}
            </p>

            <ProductPrice slug={teapot.slug} price={teapot.price} />

            {/* Stock signal */}
            <p className="mt-3 text-[13px] font-medium">
              {soldOut ? (
                <span className="text-ink-faint">Sold out</span>
              ) : teapot.stock <= 3 ? (
                <span className="text-clay">
                  Low stock — only {teapot.stock} left
                </span>
              ) : (
                <span className="text-ink-soft">
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-clay align-middle" />
                  In stock — {teapot.stock} available
                </span>
              )}
            </p>

            <div className="mt-7">
              <AddToTray
                slug={teapot.slug}
                name={teapot.name}
                price={teapot.price}
                soldOut={soldOut}
                image={teapotHero(teapot)}
                href={`/teapots/${teapot.slug}`}
              />
            </div>

            {/* Trust signals */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
              {[
                { label: "Free shipping", note: "orders over $150" },
                { label: "Easy returns", note: "within 30 days" },
                { label: "Secure checkout", note: "SSL encrypted" },
              ].map(({ label, note }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-xl bg-cream px-2 py-4 text-ink-soft"
                >
                  <p className="text-[12px] font-medium text-ink">{label}</p>
                  <p className="text-[11px] leading-tight text-ink-faint">
                    {note}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 max-w-[44ch] text-[15px] font-light text-ink-soft">
              {teapot.blurb}
            </p>

            {/* Specs — structured for AEO extraction */}
            <dl className="mt-8 border-t border-ink-faint/25">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-6 border-b border-ink-faint/15 py-3 text-[13.5px]"
                >
                  <dt className="text-ink-faint">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 rounded-xl bg-cream px-5 py-4 text-[13.5px] font-light text-ink-soft">
              <span className="font-medium text-ink">One pot, one tea —</span>{" "}
              keep this pot to a single kind of tea. Rinse with hot water only,
              never soap, and wipe dry. The unglazed clay will slowly take on a
              patina from the tea you brew.
            </p>
          </div>
        </article>

        {/* Related */}
        <section className="mt-24" aria-labelledby="related-title">
          <h2
            id="related-title"
            className="text-[clamp(24px,3vw,36px)] font-extralight tracking-[-0.02em]"
          >
            More from{" "}
            <em className="font-normal not-italic text-clay">{artist.name}</em>
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3">
            {related.map((t) => (
              <TeapotCard key={t.slug} teapot={t} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
