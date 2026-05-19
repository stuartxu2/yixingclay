import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { ShopGrid } from "@/components/shop-grid";
import { breadcrumbSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { PRODUCTS, formatPrice } from "@/lib/products";
import { fetchAllProducts, fetchTeapots } from "@/lib/medusa";
import { TEAPOTS } from "@/lib/teapots";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Shop — Teapots & Tea Pets",
  description:
    "The full PO/ET catalogue in one place — handmade Yixing zisha teapots and tea pets, every piece shaped from purple sand clay and unglazed. Retail and wholesale.",
  alternates: { canonical: "/shop" },
  openGraph: {
    type: "website",
    title: `Shop · ${SITE.name}`,
    description:
      "Handmade Yixing teapots and tea pets — the complete PO/ET catalogue, shaped from purple sand clay.",
    url: `${SITE.url}/shop`,
    images: [{ url: "/images/getty_pots.jpg", width: 1200, height: 630 }],
  },
};

const trail = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
];

export default async function ShopPage() {
  const [liveProducts, liveTeapots] = await Promise.all([
    fetchAllProducts(),
    fetchTeapots(),
  ]);
  const products = liveProducts.length > 0 ? liveProducts : PRODUCTS;
  const teapots = liveTeapots.length > 0 ? liveTeapots : TEAPOTS;

  const prices = [
    ...products.map((p) => p.price),
    ...teapots.map((t) => t.price),
  ];
  const floor = Math.min(...prices);
  const ceiling = Math.max(...prices);
  const total = products.length + teapots.length;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "PO/ET — Teapots & Tea Pets",
    description:
      "The complete PO/ET catalogue of handmade Yixing clay teapots and tea pets.",
    numberOfItems: total,
    itemListElement: [
      ...teapots.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE.url}/teapots/${t.slug}`,
        name: `${t.name} (${t.zh})`,
      })),
      ...products.map((p, i) => ({
        "@type": "ListItem",
        position: teapots.length + i + 1,
        url: `${SITE.url}/tea-pets/${p.slug}`,
        name: `${p.name} (${p.zh})`,
      })),
    ],
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

        <div className="mt-9">
          <SectionHead
            id="shop-title"
            kicker="The Whole Studio"
            title={
              <>
                Pots and pets,{" "}
                <em className="font-normal not-italic text-clay">
                  one catalogue
                </em>
                .
              </>
            }
            note={`${total} pieces in clay — ${teapots.length} teapots and ${products.length} tea pets, from ${formatPrice(
              floor,
            )} to ${formatPrice(
              ceiling,
            )}. Filter by what you came for, then bathe your choice in years of tea.`}
          />
        </div>

        <ShopGrid products={products} teapots={teapots} />
      </main>

      <SiteFooter />
    </>
  );
}
