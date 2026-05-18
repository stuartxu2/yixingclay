import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";

/**
 * Sitemap for the storefront: the homepage, the collection route, and every
 * tea-pet detail page. Stays the canonical source for crawlers as the
 * catalogue grows.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/teapots`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/tea-pets`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...PRODUCTS.map((p) => ({
      url: `${SITE.url}/tea-pets/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
