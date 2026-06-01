import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { CollectionGrid } from "@/components/collection";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { PRODUCTS, PRICE_FLOOR, PRICE_CEILING, formatPrice } from "@/lib/products";
import { fetchAllProducts } from "@/lib/medusa";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tea Pets",
  description:
    "What is a tea pet? The PO/ET collection of handmade Yixing clay tea pets (茶宠) — small unglazed creatures kept on the tea tray and raised on years of tea, from cats and creatures to the pilgrims of Journey to the West.",
  alternates: { canonical: "/tea-pets" },
  openGraph: {
    type: "website",
    title: `Tea Pets · ${SITE.name}`,
    description:
      "Yixing clay tea pets (茶宠) — small unglazed creatures kept on the tea tray and raised on years of tea, sculpted from the same purple sand clay as our teapots.",
    url: `${SITE.url}/tea-pets`,
    images: [{ url: "/products/wukong/tray.avif", width: 1200, height: 1200 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Tea Pets · ${SITE.name}`,
    description:
      "Yixing clay tea pets (茶宠) — small unglazed creatures kept on the tea tray and raised on years of tea, sculpted from the same purple sand clay as our teapots.",
    images: ["/products/wukong/tray.avif"],
  },
};

const trail = [
  { name: "Home", path: "/" },
  { name: "Tea Pets", path: "/tea-pets" },
];

export default async function TeaPetsPage() {
  const liveProducts = await fetchAllProducts();
  const products = liveProducts.length > 0 ? liveProducts : PRODUCTS;
  const priceFloor = Math.min(...products.map((p) => p.price)) || PRICE_FLOOR;
  const priceCeiling = Math.max(...products.map((p) => p.price)) || PRICE_CEILING;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />

      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-[1320px] px-6 py-10 sm:px-10 sm:py-14">
        <Breadcrumbs trail={trail} />

        {/* Cultural intro */}
        <section className="mt-6" aria-labelledby="tea-pets-hero">
          <p className="eyebrow">The Pets of PO/ET</p>
          <h1
            id="tea-pets-hero"
            className="mt-5 max-w-[18ch] text-[clamp(36px,5vw,68px)] font-extralight leading-[1.04] tracking-[-0.022em]"
          >
            Creatures, raised on{" "}
            <em className="font-normal not-italic text-clay">tea</em>.
          </h1>

          <div className="mt-9 grid items-center gap-10 lg:grid-cols-[1fr_0.82fr] lg:gap-14">
            <div>
              <p className="max-w-[48ch] text-[17px] font-light text-ink-soft">
                ET is the pet; PO is the pot. The same Yixing purple sand clay
                that becomes our teapots is sculpted, fired, and set beside the
                brewing as a tea pet (茶宠) — a small clay creature you raise
                with the tea you pour. {products.length} forms in the
                collection, from {formatPrice(priceFloor)} to{" "}
                {formatPrice(priceCeiling)}.
              </p>

              <h2
                id="what-is-a-tea-pet"
                className="mt-8 text-[clamp(22px,2.6vw,32px)] font-extralight tracking-[-0.02em]"
              >
                Why a clay creature{" "}
                <em className="font-normal not-italic text-clay">drinks</em>.
              </h2>
              <div className="mt-4 space-y-3 text-[14.5px] font-light text-ink-soft">
                <p>
                  A tea pet — 茶宠, &ldquo;tea pet&rdquo; — is a small unglazed
                  figure kept on the tea tray beside the pot. Sculpted from the
                  same zisha purple sand clay as a Yixing teapot, it has shared
                  the gongfu tea table in China for centuries as a quiet
                  companion to the brewing.
                </p>
                <p>
                  You raise it the way you season a pot. With each session the
                  first rinse and the last drops are poured over the pet, and
                  its open clay drinks the tea in. Over months the surface
                  darkens and takes on a soft glow — a patina that records how
                  often you brew.
                </p>
                <p>
                  The old forms carry meaning: the three-legged money toad for
                  prosperity, zodiac creatures for the year you were born, the
                  pilgrims of Journey to the West for the road. One pet, many
                  years — it becomes a record of your tea, a colour that is
                  yours alone.
                </p>
                <p className="pt-1 text-[13.5px]">
                  New to tea pets?{" "}
                  <Link
                    href="/guides/tea-pets-explained"
                    className="font-medium text-clay underline decoration-clay/40 underline-offset-2 hover:decoration-clay"
                  >
                    What is a tea pet?
                  </Link>{" "}
                  ·{" "}
                  <Link
                    href="/guides/how-to-care-for-a-tea-pet"
                    className="font-medium text-clay underline decoration-clay/40 underline-offset-2 hover:decoration-clay"
                  >
                    How to care for one
                  </Link>
                </p>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream">
              <Image
                src="/products/wukong/tray.avif"
                alt="A Yixing zisha tea pet resting on a wooden gongfu tea tray"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover object-[center_40%]"
              />
            </div>
          </div>
        </section>

        {/* The tea pets — filterable collection */}
        <section className="mt-16" aria-labelledby="the-tea-pets">
          <SectionHead
            id="the-tea-pets"
            kicker="The Collection"
            title={
              <>
                Every tea pet,{" "}
                <em className="font-normal not-italic text-clay">
                  in one place
                </em>
                .
              </>
            }
            note={`${products.length} sculpted forms, from ${formatPrice(
              priceFloor,
            )} to ${formatPrice(
              priceCeiling,
            )}. Filter by character, then bathe your choice in years of tea.`}
          />

          <CollectionGrid products={products} />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
