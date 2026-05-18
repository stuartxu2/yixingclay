import Medusa from "@medusajs/js-sdk";
import type { ProductCategory } from "@yixingclay/ts-types";
import type { Product } from "./products";

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
});

/* ── Type mapping ────────────────────────────────────────────────────────── */

// All tokens are `*`-prefixed: a bare field token would switch Medusa into
// explicit-selection mode and drop the product's default scalars (handle,
// title, description). Prefixed tokens add to the defaults instead.
const PRODUCT_FIELDS =
  "*metadata,*categories,*variants.prices,*variants.inventory_quantity,*variants.manage_inventory";

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
  metadata: Record<string, unknown> | null;
  categories?: { handle: string }[];
  variants: MedusaVariant[];
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
  };
}

/* ── Fetchers ────────────────────────────────────────────────────────────── */

/** Fetch all published tea pets from Medusa store API. */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const { products } = await medusa.store.product.list({
      limit: 100,
      fields: PRODUCT_FIELDS,
    } as Parameters<typeof medusa.store.product.list>[0]);
    return (products as MedusaProduct[]).map(medusaToProduct);
  } catch {
    return [];
  }
}

/** Fetch a single product by slug (handle). */
export async function fetchProduct(slug: string): Promise<Product | undefined> {
  try {
    const { products } = await medusa.store.product.list({
      handle: slug,
      fields: PRODUCT_FIELDS,
    } as Parameters<typeof medusa.store.product.list>[0]);
    const p = (products as MedusaProduct[])[0];
    return p ? medusaToProduct(p) : undefined;
  } catch {
    return undefined;
  }
}
