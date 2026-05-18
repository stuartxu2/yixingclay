/**
 * @yixingclay/ts-types
 *
 * The shared type contract for the yixingclay.com platform. The Medusa
 * backend produces these shapes; the web storefront and the Expo app
 * consume them. Keeping the contract in one package is what makes a
 * cross-platform change a single, type-checked edit.
 */

/* -------------------------------------------------------------------------- */
/* Money & currency                                                          */
/* -------------------------------------------------------------------------- */

export type CurrencyCode = "usd" | "eur" | "cny";

/** Monetary amounts are always integers in the currency's minor unit (cents). */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

/** Tea-pet character families used for storefront filtering. */
export type ProductCategory = "cats" | "legends" | "creatures";

/** A single photographed angle of a product. */
export interface ProductImage {
  src: string;
  label: string;
}

/**
 * The canonical catalogue product. Today it is satisfied by local seed data
 * in the web app; once the Medusa backend is live, a thin adapter maps a
 * Medusa product onto this same interface — no consumer code changes.
 */
export interface CatalogProduct {
  /** URL-safe identifier; also the Medusa product handle. */
  slug: string;
  name: string;
  /** Original Chinese name (宜兴茶宠). */
  zh: string;
  category: ProductCategory;
  /** Yixing clay body, e.g. "Zi Ni · 紫泥". */
  clay: string;
  /** Price in cents, USD. */
  price: number;
  /** A single editorial line shown beneath the name. */
  poem: string;
  /** Long-form, AEO-friendly description. */
  blurb: string;
  /** Approximate height in centimetres. */
  height: number;
  featured?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Cart                                                                       */
/* -------------------------------------------------------------------------- */

export interface CartLine {
  slug: string;
  name: string;
  /** Unit price in cents. */
  price: number;
  quantity: number;
}

export interface Cart {
  id: string;
  lines: CartLine[];
  /** Sum of line totals in cents. */
  subtotal: number;
  currency: CurrencyCode;
}

/* -------------------------------------------------------------------------- */
/* Sales channel                                                              */
/* -------------------------------------------------------------------------- */

/** yixingclay.com serves both retail (B2C) and wholesale (B2B) buyers. */
export type SalesChannel = "retail" | "wholesale";
