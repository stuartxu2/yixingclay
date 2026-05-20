/**
 * PO/ET tea-pet catalogue.
 *
 * This is hand-maintained seed data for the storefront. The shape is the
 * shared `CatalogProduct` contract from `@yixingclay/ts-types`; when the
 * MedusaJS backend (apps/backend) comes online, an adapter maps Medusa
 * products onto the same interface and this module is swapped out — no
 * consumer component changes.
 */

import type { CatalogProduct, ProductCategory } from "@yixingclay/ts-types";

/**
 * Local aliases keep existing imports (`Product`, `Category`) stable.
 * `soldOut` is derived from Medusa inventory at fetch time — one-of-a-kind
 * pieces sell out for good. Absent (static seed data) means available.
 * `images` are the Medusa-supplied blob URLs when the product comes from the
 * backend; for the seeded creatures it stays undefined and the helpers fall
 * back to the hardcoded /public/products/{slug}/{role}.jpg paths.
 */
export type Product = CatalogProduct & {
  soldOut?: boolean;
  images?: string[];
};
export type Category = ProductCategory;

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All Tea Pets" },
  { id: "cats", label: "Cats" },
  { id: "legends", label: "Journey West" },
  { id: "creatures", label: "Creatures" },
];

export const PRODUCTS: Product[] = [
  {
    slug: "wukong",
    name: "Wukong, the Stone Monkey",
    zh: "悟空",
    category: "legends",
    clay: "Lao Zi Ni · 老紫泥",
    price: 14500,
    poem: "Born of stone, steeped in mischief.",
    blurb:
      "The Monkey King mid-leap, hand shading his eyes. Sculpted from aged Zi Ni purple clay, his coat darkens with every pour of tea until the fur reads almost black.",
    height: 7.5,
    featured: true,
  },
  {
    slug: "bajie",
    name: "Bajie, the Glutton",
    zh: "八戒",
    category: "legends",
    clay: "Duan Ni · 段泥",
    price: 9800,
    poem: "An appetite the size of a pilgrimage.",
    blurb:
      "Zhu Bajie at rest, belly forward, entirely unbothered. Pale Duan Ni clay gives him a warm sandy tone that drinks tea slowly and evenly.",
    height: 6.0,
  },
  {
    slug: "tangseng",
    name: "Tangseng, the Monk",
    zh: "唐僧",
    category: "legends",
    clay: "Zhu Ni · 朱泥",
    price: 11200,
    poem: "Calm at the centre of every storm.",
    blurb:
      "The pilgrim monk seated in stillness. Fired from bright Zhu Ni cinnabar clay — a high-shrinkage body prized for its bell-clear ring and deepening red.",
    height: 6.8,
    featured: true,
  },
  {
    slug: "shaseng",
    name: "Sha Wujing",
    zh: "沙僧",
    category: "legends",
    clay: "Zi Ni · 紫泥",
    price: 9800,
    poem: "The quiet one who carries the load.",
    blurb:
      "Sandy Wujing, steady and broad-shouldered. Classic Zi Ni purple clay — the workhorse body of Yixing, dense and forgiving, a fine first pet to season.",
    height: 6.5,
  },
  {
    slug: "cat",
    name: "The White Cat",
    zh: "白猫",
    category: "cats",
    clay: "Duan Ni · 段泥",
    price: 6800,
    poem: "Sits where the sun lands.",
    blurb:
      "An upright cat with a watchful tilt. Pale Duan Ni starts the colour of raw biscuit and warms toward honey as the tea soaks in.",
    height: 5.2,
    featured: true,
  },
  {
    slug: "standing-cat",
    name: "The Standing Cat",
    zh: "站立猫咪",
    category: "cats",
    clay: "Zi Ni · 紫泥",
    price: 7200,
    poem: "Tall enough to see the kettle.",
    blurb:
      "Caught on its hind legs, paws drawn in. Zi Ni purple clay holds detail crisply — every whisker and toe survives the kiln.",
    height: 6.4,
  },
  {
    slug: "sleeping-cat",
    name: "The Sleeping Cat",
    zh: "睡觉猫咪",
    category: "cats",
    clay: "Zhu Ni · 朱泥",
    price: 6800,
    poem: "Curled into a comma.",
    blurb:
      "A cat folded into sleep, nose to tail. Zhu Ni clay turns a glowing oxblood red the longer it lives at the tea table.",
    height: 3.8,
    featured: true,
  },
  {
    slug: "lounging-cat",
    name: "The Lounging Cat",
    zh: "躺平猫",
    category: "cats",
    clay: "Duan Ni · 段泥",
    price: 7000,
    poem: "Flat out, and proud of it.",
    blurb:
      "The art of lying perfectly flat, in clay. Soft Duan Ni body with a matte, stone-like surface that loves to be rubbed with a tea brush.",
    height: 3.2,
  },
  {
    slug: "panda",
    name: "The Kung Fu Panda",
    zh: "功夫熊猫",
    category: "creatures",
    clay: "Zi Ni · 紫泥",
    price: 8800,
    poem: "Stillness, then a sudden stance.",
    blurb:
      "A panda mid-form, paws raised. Zi Ni purple clay — the two-tone sculpt keeps its contrast even as the whole piece deepens with tea.",
    height: 6.6,
    featured: true,
  },
  {
    slug: "bear",
    name: "The Bear",
    zh: "熊",
    category: "creatures",
    clay: "Lao Zi Ni · 老紫泥",
    price: 8200,
    poem: "Heavy-footed, soft-hearted.",
    blurb:
      "A rounded bear, sitting back on its haunches. Aged Zi Ni gives a deep cocoa tone that grows richer with each tea session.",
    height: 6.0,
  },
  {
    slug: "whale",
    name: "The Whale",
    zh: "鲸",
    category: "creatures",
    clay: "Ben Shan Lü Ni · 本山绿泥",
    price: 9400,
    poem: "Carries an ocean, asks for nothing.",
    blurb:
      "A breaching whale, tail curled. Rare Ben Shan green clay fires a soft greyed-green and slowly takes on a sea-glass depth.",
    height: 4.5,
    featured: true,
  },
  {
    slug: "horse",
    name: "The Foal",
    zh: "马驹",
    category: "creatures",
    clay: "Zhu Ni · 朱泥",
    price: 8600,
    poem: "New legs, old spirit.",
    blurb:
      "A young horse finding its footing. Bright Zhu Ni cinnabar clay — the high iron content fires a warm, living red.",
    height: 6.2,
  },
  {
    slug: "sheep",
    name: "The Ram",
    zh: "白羊",
    category: "creatures",
    clay: "Duan Ni · 段泥",
    price: 7600,
    poem: "Wool you can almost feel.",
    blurb:
      "A ram with a coiled fleece, head lowered. Pale Duan Ni clay carries the carved wool texture beautifully and warms to oat-gold.",
    height: 5.4,
  },
  {
    slug: "hedgehog",
    name: "Durian the Hedgehog",
    zh: "榴莲刺猬",
    category: "creatures",
    clay: "Zi Ni · 紫泥",
    price: 6400,
    poem: "Prickly outside, sweet within — a small joke in clay.",
    blurb:
      "Part hedgehog, part durian — a studio pun. Zi Ni purple clay holds each tiny spine sharp through the firing.",
    height: 3.6,
  },
  {
    slug: "hulk",
    name: "The Green Giant",
    zh: "绿巨人",
    category: "creatures",
    clay: "Ben Shan Lü Ni · 本山绿泥",
    price: 9200,
    poem: "Built like a boulder, calm as one.",
    blurb:
      "A heavy-set giant mid-stride. Fired from scarce Ben Shan green clay for a naturally muted, mineral green that no glaze could match.",
    height: 7.0,
  },
  {
    slug: "shin",
    name: "Little Shin",
    zh: "蜡笔小新",
    category: "creatures",
    clay: "Zhu Ni · 朱泥",
    price: 5800,
    poem: "Trouble, the cheerful kind.",
    blurb:
      "A small grinning troublemaker, hands on hips. Zhu Ni clay gives the smallest pieces a clean ring and a fast-developing shine.",
    height: 4.8,
  },
  {
    slug: "duck-pear",
    name: "The Pear",
    zh: "鸭梨山大",
    category: "creatures",
    clay: "Duan Ni · 段泥",
    price: 5400,
    poem: "All of the pressure, none of the worry.",
    blurb:
      "A pear with a face — another studio wordplay on bearing pressure lightly. Soft Duan Ni body, perfectly palm-sized.",
    height: 4.0,
  },
  {
    slug: "cicada",
    name: "The Golden Cicada",
    zh: "金蝉",
    category: "creatures",
    clay: "Zhu Ni · 朱泥",
    price: 6200,
    poem: "A long silence, then song.",
    blurb:
      "A cicada at rest, wings folded — an old Chinese emblem of rebirth. Zhu Ni clay fires a deep amber-red across the carved wings.",
    height: 3.0,
  },
];

/** Lowest price across the catalogue, in cents — used for Offer schema. */
export const PRICE_FLOOR = Math.min(...PRODUCTS.map((p) => p.price));
export const PRICE_CEILING = Math.max(...PRODUCTS.map((p) => p.price));

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

/** First gallery image for a product — used as the card's resting state. */
export function heroImage(product: Product | string): string {
  if (typeof product === "string") return `/products/${product}/front.jpg`;
  return product.images?.[0] ?? `/products/${product.slug}/front.jpg`;
}

/** Second gallery image, revealed on hover. `hulk` has no `hand` shot. */
export function altImage(product: Product | string): string {
  if (typeof product === "string") {
    return product === "hulk"
      ? `/products/${product}/left.jpg`
      : `/products/${product}/hand.jpg`;
  }
  if (product.images && product.images.length > 1) return product.images[1];
  return product.slug === "hulk"
    ? `/products/${product.slug}/left.jpg`
    : `/products/${product.slug}/hand.jpg`;
}

/** Human labels for each photographed angle. */
const ROLE_LABELS: Record<string, string> = {
  front: "Front",
  left: "Left profile",
  right: "Right profile",
  back: "Back",
  hand: "Held in hand",
  tray: "On the tea tray",
  pottery: "As fired greenware",
  size: "Shown to scale",
};

const STANDARD_ROLES = ["front", "left", "right", "back", "hand", "tray", "pottery"];
/** `hulk` was shot with a scale reference instead of the hand/tray pair. */
const HULK_ROLES = ["front", "left", "right", "back", "size", "pottery"];

export interface GalleryShot {
  src: string;
  label: string;
}

/** Ordered gallery for a product's detail page. */
export function galleryImages(product: Product | string): GalleryShot[] {
  const slug = typeof product === "string" ? product : product.slug;
  const medusaImages =
    typeof product === "string" ? undefined : product.images;

  if (medusaImages && medusaImages.length > 0) {
    // Honour Medusa's ordering; reuse the existing role labels for the first
    // few shots and fall back to a generic "View N" beyond that.
    const labels = STANDARD_ROLES.map((r) => ROLE_LABELS[r] ?? r);
    return medusaImages.map((src, i) => ({
      src,
      label: labels[i] ?? `View ${i + 1}`,
    }));
  }

  const roles = slug === "hulk" ? HULK_ROLES : STANDARD_ROLES;
  return roles.map((role) => ({
    src: `/products/${slug}/${role}.jpg`,
    label: ROLE_LABELS[role] ?? role,
  }));
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Up to `n` other pets, preferring the same category. */
export function relatedProducts(slug: string, n = 3): Product[] {
  const current = getProduct(slug);
  if (!current) return PRODUCTS.slice(0, n);
  const sameCategory = PRODUCTS.filter(
    (p) => p.slug !== slug && p.category === current.category,
  );
  const rest = PRODUCTS.filter(
    (p) => p.slug !== slug && p.category !== current.category,
  );
  return [...sameCategory, ...rest].slice(0, n);
}
