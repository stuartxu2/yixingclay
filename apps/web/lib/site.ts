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
  { label: "Shop", href: "/shop" },
  { label: "The Pots", href: "/teapots" },
  { label: "The Pets", href: "/tea-pets" },
  { label: "The Clay", href: "/#clay" },
  { label: "The Artists", href: "/artists" },
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { label: "Everything", href: "/shop" },
      { label: "The Pots", href: "/teapots" },
      { label: "The Pets", href: "/tea-pets" },
      { label: "The Artists", href: "/artists" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "All Guides", href: "/guides" },
      { label: "What Is Yixing Clay?", href: "/guides/what-is-yixing-clay" },
      {
        label: "Season a Teapot",
        href: "/guides/how-to-season-a-yixing-teapot",
      },
      { label: "What Is a Tea Pet?", href: "/guides/tea-pets-explained" },
      { label: "Tea Glossary", href: "/guides/yixing-tea-glossary" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { label: "About PO/ET", href: "/about" },
      { label: "The Artists", href: "/artists" },
      { label: "The Clay", href: "/#clay" },
      { label: "Our Craft", href: "/#craft" },
    ],
  },
  {
    heading: "Trade",
    links: [
      { label: "Wholesale", href: "/#wholesale" },
      { label: "Shipping", href: "/#wholesale" },
      { label: "Care Guide", href: "/guides/how-to-care-for-a-tea-pet" },
      { label: "Contact", href: `mailto:${SITE.email}` },
    ],
  },
] as const;
