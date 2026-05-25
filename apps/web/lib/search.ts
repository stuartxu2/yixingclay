import { medusa, isTeapotKind } from "./medusa";

/** A single storefront search hit. `price` is in cents, USD. */
export interface SearchResult {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
  /** Resolved storefront route for this hit. */
  href: string;
}

const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;

interface StoreSearchVariant {
  prices?: { amount: number; currency_code: string }[];
}
interface StoreSearchProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  metadata?: Record<string, unknown> | null;
  variants?: StoreSearchVariant[];
}
interface StoreSearchResponse {
  products: StoreSearchProduct[];
}

/** Teapots carry `metadata.kind === "teapot"`; everything else is a tea-pet. */
function hrefFor(p: StoreSearchProduct): string {
  return isTeapotKind(p.metadata)
    ? `/teapots/${p.handle}`
    : `/tea-pets/${p.handle}`;
}

/**
 * Search the product catalogue via the Medusa Meilisearch endpoint
 * (`@rokmohar/medusa-plugin-meilisearch`). Returns up to 8 hits, ordered by
 * relevance. Returns `[]` for an empty query or on any error — callers never
 * need to guard.
 */
export async function searchProducts(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const res = await medusa.client.fetch<StoreSearchResponse>(
      "/store/meilisearch/products",
      {
        query: {
          query: q,
          limit: 8,
          region_id: REGION_ID,
          currency_code: "usd",
          // `*`-prefixed so default product scalars are kept, not replaced.
          fields: "*thumbnail,*variants.prices,*metadata",
        },
      },
    );

    return res.products.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      thumbnail: p.thumbnail ?? null,
      price:
        p.variants?.[0]?.prices?.find((pr) => pr.currency_code === "usd")
          ?.amount ?? 0,
      href: hrefFor(p),
    }));
  } catch {
    return [];
  }
}
