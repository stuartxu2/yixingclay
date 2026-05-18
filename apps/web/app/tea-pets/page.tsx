import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { CollectionGrid } from "@/components/collection";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo";
import { PRODUCTS, PRICE_FLOOR, PRICE_CEILING, formatPrice } from "@/lib/products";
import { fetchAllProducts } from "@/lib/medusa";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Tea Pets",
  description:
    "The full PO/ET collection — 18 handmade Yixing clay tea pets, from cats and creatures to the pilgrims of Journey to the West. Each fired from purple sand clay.",
  alternates: { canonical: "/tea-pets" },
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

        <div className="mt-9">
          <SectionHead
            id="tea-pets-title"
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
        </div>

        <CollectionGrid products={products} />
      </main>

      <SiteFooter />
    </>
  );
}
