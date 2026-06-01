import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";
import { TEAPOTS } from "@/lib/teapots";
import { GUIDES } from "@/lib/guides";

/**
 * Sitemap for the storefront: the homepage, the top-level routes, and every
 * teapot and tea-pet detail page. Stays the canonical source for crawlers as
 * the catalogue grows.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/shop", priority: 0.95 },
    { path: "/teapots", priority: 0.9 },
    { path: "/tea-pets", priority: 0.9 },
    { path: "/artists", priority: 0.8 },
    { path: "/guides", priority: 0.75 },
    { path: "/about", priority: 0.7 },
  ].map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));

  return [
    ...staticRoutes,
    ...TEAPOTS.map((t) => ({
      url: `${SITE.url}/teapots/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...PRODUCTS.map((p) => ({
      url: `${SITE.url}/tea-pets/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...GUIDES.map((g) => ({
      url: `${SITE.url}/guides/${g.slug}`,
      lastModified: new Date(g.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
