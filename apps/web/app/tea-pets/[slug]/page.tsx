import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PRODUCTS,
  galleryImages,
  getProduct,
  heroImage,
  relatedProducts,
} from "@/lib/products";
import { fetchProduct } from "@/lib/medusa";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, productDetailSchema } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGallery } from "@/components/product-gallery";
import { AddToTray } from "@/components/add-to-tray";
import { ProductPrice } from "@/components/product-price";
import { ProductCard } from "@/components/product-card";
import { TrackOnMount } from "@/components/analytics/track-on-mount";

/** Pre-render every tea pet at build time; refresh on a one-hour ISR window. */
export const revalidate = 3600;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = (await fetchProduct(slug)) ?? getProduct(slug);
  if (!product) return { title: "Tea pet not found" };

  const title = product.seoTitle ?? `${product.name} (${product.zh})`;
  const description = product.seoDescription ?? product.blurb;
  const path = `/tea-pets/${product.slug}`;
  return {
    title,
    description,
    keywords: product.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${title} · ${SITE.name}`,
      description,
      url: `${SITE.url}${path}`,
      images: [{ url: heroImage(product), width: 1200, height: 1200, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE.name}`,
      description,
      images: [heroImage(product)],
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = (await fetchProduct(slug)) ?? getProduct(slug);
  if (!product) notFound();

  const shots = galleryImages(product);
  const related = relatedProducts(product.slug, 3);
  const trail = [
    { name: "Home", path: "/" },
    { name: "Tea Pets", path: "/tea-pets" },
    { name: product.name, path: `/tea-pets/${product.slug}` },
  ];

  const specs: [string, string][] = [
    ["Clay body", product.clay],
    ["Height", `${product.height} cm`],
    ["Form", "Hand-sculpted, unglazed"],
    ["Firing", "Single firing, 1,200°C"],
    ["SKU", product.slug.toUpperCase()],
  ];

  return (
    <>
      <TrackOnMount
        event="product_viewed"
        properties={{
          slug: product.slug,
          title: product.name,
          price: product.price,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productDetailSchema(product)),
        }}
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

        <article className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <ProductGallery shots={shots} productName={product.name} />

          <div className="lg:py-2">
            <p className="eyebrow">{product.clay}</p>
            <h1 className="mt-5 text-[clamp(32px,4vw,52px)] font-extralight leading-[1.05] tracking-[-0.02em]">
              {product.name}
            </h1>
            <p className="mt-2 text-[15px] text-ink-faint">
              {product.zh} · one of a kind
            </p>
            <p className="mt-5 max-w-[34ch] text-[16px] font-light italic text-ink-soft">
              {product.poem}
            </p>

            <ProductPrice slug={product.slug} price={product.price} />

            <div className="mt-7">
              <AddToTray
                slug={product.slug}
                name={product.name}
                price={product.price}
                soldOut={product.soldOut}
              />
            </div>

            {/* Trust signals */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
              {[
                {
                  label: "Free shipping",
                  note: "orders over $150",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <circle cx="5.5" cy="18.5" r="1.5" fill="currentColor"/>
                      <circle cx="18.5" cy="18.5" r="1.5" fill="currentColor"/>
                    </svg>
                  ),
                },
                {
                  label: "Easy returns",
                  note: "within 30 days",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.364 2.636L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  label: "Secure checkout",
                  note: "SSL encrypted",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
              ].map(({ label, note, icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-xl bg-cream px-2 py-4 text-ink-soft"
                >
                  {icon}
                  <p className="text-[12px] font-medium text-ink">{label}</p>
                  <p className="text-[11px] leading-tight text-ink-faint">{note}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 max-w-[44ch] text-[15px] font-light text-ink-soft">
              {product.blurb}
            </p>

            {/* Specs — structured for AEO extraction */}
            <dl className="mt-8 border-t border-ink-faint/25">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-6 border-b border-ink-faint/15 py-3 text-[13.5px]"
                >
                  <dt className="text-ink-faint">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 rounded-xl bg-cream px-5 py-4 text-[13.5px] font-light text-ink-soft">
              <span className="font-medium text-ink">Seasoning —</span> bathe
              the pet in warm leftover tea after each session and brush gently.
              The unglazed clay will slowly darken into a patina that is yours
              alone.
            </p>
          </div>
        </article>

        {/* Related */}
        <section className="mt-24" aria-labelledby="related-title">
          <h2
            id="related-title"
            className="text-[clamp(24px,3vw,36px)] font-extralight tracking-[-0.02em]"
          >
            More from the <em className="font-normal not-italic text-clay">studio</em>
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
