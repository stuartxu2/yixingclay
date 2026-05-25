import Medusa from "@medusajs/js-sdk";
import type { ProductCategory } from "@yixingclay/ts-types";
import type { Product } from "./products";
import type { ArtistKey, Teapot } from "./teapots";

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
});

/* ── Type mapping ────────────────────────────────────────────────────────── */

// All tokens are `*`-prefixed: a bare field token would switch Medusa into
// explicit-selection mode and drop the product's default scalars (handle,
// title, description). Prefixed tokens add to the defaults instead.
const PRODUCT_FIELDS =
  "*metadata,*categories,*images,*variants.prices,*variants.inventory_quantity,*variants.manage_inventory";

// Medusa v2 store product shape (subset we use)
interface MedusaVariant {
  prices?: { amount: number; currency_code: string }[];
  inventory_quantity?: number | null;
  manage_inventory?: boolean;
}
interface MedusaProduct {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  weight: number | null;
  metadata: Record<string, unknown> | null;
  categories?: { handle: string }[];
  images?: { url: string }[];
  variants: MedusaVariant[];
}

/** A teapot is a Medusa product carrying `metadata.kind === "teapot"`. */
function isTeapot(p: MedusaProduct): boolean {
  return (p.metadata?.kind as string) === "teapot";
}

export function medusaToProduct(p: MedusaProduct): Product {
  const meta = p.metadata ?? {};
  const variant = p.variants?.[0];
  const usdPrice =
    variant?.prices?.find((pr) => pr.currency_code === "usd")?.amount ?? 0;

  // A one-of-a-kind piece is sold out when its tracked stock has run out.
  const soldOut =
    variant?.manage_inventory === true &&
    (variant?.inventory_quantity ?? 0) <= 0;

  const images = (p.images ?? []).map((i) => i.url).filter(Boolean);

  return {
    slug: p.handle,
    name: p.title,
    zh: (meta.zh as string) ?? "",
    category: (p.categories?.[0]?.handle ?? "creatures") as ProductCategory,
    clay: (meta.clay as string) ?? "",
    price: usdPrice,
    poem: (meta.poem as string) ?? "",
    blurb: p.description ?? "",
    height: (meta.height as number) ?? 0,
    featured: (meta.featured as boolean) ?? false,
    soldOut,
    images: images.length > 0 ? images : undefined,
  };
}

/**
 * Map a Medusa product onto the storefront `Teapot` shape. Editorial copy and
 * specs travel in `metadata` (seeded by `apps/backend/src/scripts/
 * seed-teapots.mjs`); price and stock come live off the first variant; the
 * gallery is the product's blob-hosted image list.
 */
export function medusaToTeapot(p: MedusaProduct): Teapot {
  const meta = p.metadata ?? {};
  const variant = p.variants?.[0];
  const usdPrice =
    variant?.prices?.find((pr) => pr.currency_code === "usd")?.amount ?? 0;
  const stock =
    variant?.manage_inventory === true
      ? Math.max(0, variant?.inventory_quantity ?? 0)
      : 99;

  const artistName = String(meta.artist ?? "");
  const artist: ArtistKey = /fou/i.test(artistName) ? "yi-fou" : "yao-yun";
  const clay = String(meta.clay ?? "");
  const images = (p.images ?? []).map((i) => i.url).filter(Boolean);

  return {
    slug: p.handle,
    sku: `PO/ET · ${p.handle.toUpperCase()}`,
    name: p.title,
    zh: String(meta.zh ?? ""),
    artist,
    clay,
    clayKey: clay.split(" · ")[0] || clay || "Yixing clay",
    shape: String(meta.shape ?? ""),
    capacity: Number(meta.capacity_ml) || 0,
    dimensions: String(meta.dimensions ?? ""),
    weight: Number(meta.weight_g ?? p.weight ?? 0) || 0,
    price: usdPrice,
    stock,
    poem: String(meta.poem ?? ""),
    blurb: p.description ?? "",
    featured: Boolean(meta.featured),
    images:
      images.length > 0
        ? images
        : [p.thumbnail ?? `/teapots/${p.handle}/1.avif`],
  };
}

/* ── Fetchers ────────────────────────────────────────────────────────────── */

/** Fetch all published tea pets from Medusa (teapots excluded). */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const { products } = await medusa.store.product.list({
      limit: 100,
      fields: PRODUCT_FIELDS,
    } as Parameters<typeof medusa.store.product.list>[0]);
    return (products as MedusaProduct[])
      .filter((p) => !isTeapot(p))
      .map(medusaToProduct);
  } catch {
    return [];
  }
}

/** Fetch a single tea pet by slug (handle). */
export async function fetchProduct(slug: string): Promise<Product | undefined> {
  try {
    const { products } = await medusa.store.product.list({
      handle: slug,
      fields: PRODUCT_FIELDS,
    } as Parameters<typeof medusa.store.product.list>[0]);
    const p = (products as MedusaProduct[])[0];
    return p && !isTeapot(p) ? medusaToProduct(p) : undefined;
  } catch {
    return undefined;
  }
}

/** Fetch all published teapots from Medusa. */
export async function fetchTeapots(): Promise<Teapot[]> {
  try {
    const { products } = await medusa.store.product.list({
      limit: 100,
      fields: PRODUCT_FIELDS,
    } as Parameters<typeof medusa.store.product.list>[0]);
    return (products as MedusaProduct[]).filter(isTeapot).map(medusaToTeapot);
  } catch {
    return [];
  }
}

/** Fetch a single teapot by slug (handle). */
export async function fetchTeapot(slug: string): Promise<Teapot | undefined> {
  try {
    const { products } = await medusa.store.product.list({
      handle: slug,
      fields: PRODUCT_FIELDS,
    } as Parameters<typeof medusa.store.product.list>[0]);
    const p = (products as MedusaProduct[])[0];
    return p && isTeapot(p) ? medusaToTeapot(p) : undefined;
  } catch {
    return undefined;
  }
}
