/**
 * Site-wide constants for the PO/ET storefront.
 * Single source of truth for metadata, navigation, and brand facts.
 */

export const SITE = {
  name: "PO/ET",
  legalName: "PO/ET — Yixing Clay Studio",
  domain: "yixingclay.com",
  url: "https://yixingclay.com",
  tagline: "Handmade Yixing clay teapots & tea pets",
  description:
    "PO/ET makes handmade Yixing zisha teapots (宜兴紫砂壶) and tea pets (茶宠) — pots and pets shaped from the same purple sand clay, raised at the tea table and seasoned by years of tea. Retail and wholesale, shipped worldwide.",
  email: "studio@yixingclay.com",
  founded: 1983,
  currency: "USD",
} as const;

export const NAV = [
  { label: "Teapots", href: "/teapots" },
  { label: "Tea Pets", href: "/tea-pets" },
  { label: "The Clay", href: "/#clay" },
  { label: "Our Craft", href: "/#craft" },
  { label: "Wholesale", href: "/#wholesale" },
] as const;

export const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { label: "Teapots", href: "/teapots" },
      { label: "All Tea Pets", href: "/tea-pets" },
      { label: "Cats", href: "/tea-pets" },
      { label: "Creatures", href: "/tea-pets" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { label: "The Clay", href: "/#clay" },
      { label: "Our Craft", href: "/#craft" },
      { label: "The Maker", href: "/#story" },
      { label: "Journal", href: "/#journal" },
    ],
  },
  {
    heading: "Trade",
    links: [
      { label: "Wholesale", href: "/#wholesale" },
      { label: "Shipping", href: "/#wholesale" },
      { label: "Care Guide", href: "/#craft" },
      { label: "Contact", href: "/#wholesale" },
    ],
  },
] as const;
