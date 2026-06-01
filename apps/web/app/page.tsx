import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { ClaySection } from "@/components/clay-section";
import { Teapots } from "@/components/teapots";
import { SectionHead } from "@/components/section-head";
import { CollectionGrid } from "@/components/collection";
import { Craft } from "@/components/craft";
import { WordmarkBand } from "@/components/wordmark-band";
import { Story } from "@/components/story";
import { Faq } from "@/components/faq";
import { Newsletter } from "@/components/newsletter";
import { Wholesale } from "@/components/wholesale";
import { SiteFooter } from "@/components/site-footer";
import { collectionSchema, faqSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";
import { fetchAllProducts } from "@/lib/medusa";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Handmade Yixing Clay Teapots & Tea Pets — ${SITE.name}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const liveProducts = await fetchAllProducts();
  const products = liveProducts.length > 0 ? liveProducts : PRODUCTS;

  return (
    <>
      {/* AEO: collection + FAQ schema injected as raw JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }}
      />

      <SiteHeader />

      <main id="main-content">
        <Hero />
        <Marquee />
        <ClaySection />
        <Teapots />

        <section
          id="collection"
          className="scroll-mt-24 py-24 sm:py-28"
          aria-labelledby="collection-title"
        >
          <div className="mx-auto max-w-[1320px] px-6 sm:px-10">
            <SectionHead
              id="collection-title"
              kicker="The Tea Pets"
              title={
                <>
                  Eighteen small{" "}
                  <em className="font-normal not-italic text-clay">
                    characters
                  </em>
                  .
                </>
              }
              note="Cats, creatures, and the pilgrims of Journey to the West — each one cast from a different Yixing clay, each one waiting to be seasoned."
            />
            <CollectionGrid products={products} />
          </div>
        </section>

        <Craft />
        <WordmarkBand />
        <Story />
        <Faq />
        <Newsletter />
        <Wholesale />
      </main>

      <SiteFooter />
    </>
  );
}
