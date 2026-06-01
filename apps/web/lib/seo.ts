/**
 * JSON-LD builders for AEO (AI Answer Engine Optimization).
 *
 * Every block returned here is valid schema.org and is injected via a
 * <script type="application/ld+json"> tag. Keeping the builders pure makes
 * them trivial to unit-test and reuse on product/collection routes later.
 */

import { SITE } from "./site";
import { PRODUCTS, PRICE_FLOOR, heroImage, type Product } from "./products";
import { ARTISTS, type Teapot } from "./teapots";
import type { Guide, GuideHowTo } from "./guides";

const abs = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${SITE.url}${path}`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    foundingDate: String(SITE.founded),
    description: SITE.description,
    logo: abs("/brand/logo.avif"),
    slogan: SITE.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dingshu, Yixing",
      addressRegion: "Jiangsu",
      addressCountry: "CN",
    },
    areaServed: "Worldwide",
    knowsAbout: [
      "Yixing clay",
      "Zisha purple sand pottery",
      "Yixing teapots (宜兴紫砂壶)",
      "Tea pets (茶宠)",
      "Gongfu tea",
      "Chinese tea ceremony",
    ],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Handmade Yixing zisha teapots and tea pets",
        category: "Yixing teaware",
      },
      priceCurrency: SITE.currency,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { "@id": `${SITE.url}/#organization` },
    inLanguage: "en",
  };
}

function productSchema(p: Product, url: string = SITE.url) {
  return {
    "@type": "Product",
    name: p.name,
    description: p.blurb,
    sku: p.slug,
    category: p.category,
    image: abs(heroImage(p)),
    material: p.clay,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      price: (p.price / 100).toFixed(2),
      priceCurrency: SITE.currency,
      availability: p.soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url,
    },
  };
}

/** Standalone Product schema for a single product detail page. */
export function productDetailSchema(p: Product) {
  return {
    "@context": "https://schema.org",
    ...productSchema(p, `${SITE.url}/tea-pets/${p.slug}`),
  };
}

/** Standalone Product schema for a single teapot detail page. */
export function teapotDetailSchema(t: Teapot) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${t.name} (${t.zh})`,
    description: t.blurb,
    sku: t.sku,
    category: "Yixing teapot",
    image: abs(t.images[0]),
    material: t.clay,
    brand: { "@type": "Brand", name: SITE.name },
    width: { "@type": "QuantitativeValue", value: t.capacity, unitCode: "MLT" },
    weight: { "@type": "QuantitativeValue", value: t.weight, unitCode: "GRM" },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Maker",
        value: `${ARTISTS[t.artist].name} (${ARTISTS[t.artist].zh})`,
      },
      { "@type": "PropertyValue", name: "Capacity", value: `${t.capacity} ml` },
      { "@type": "PropertyValue", name: "Form", value: t.shape },
    ],
    offers: {
      "@type": "Offer",
      price: (t.price / 100).toFixed(2),
      priceCurrency: SITE.currency,
      availability:
        t.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE.url}/teapots/${t.slug}`,
    },
  };
}

/** BreadcrumbList schema — gives crawlers the page's place in the hierarchy. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

/** ItemList schema for the on-page collection grid. */
export function collectionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "PO/ET Tea Pets",
    description:
      "Handmade Yixing clay tea pets, fired from purple sand clay and finished at the tea table.",
    numberOfItems: PRODUCTS.length,
    itemListElement: PRODUCTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: productSchema(p),
    })),
  };
}

/**
 * FAQ schema — gives answer engines clean, extractable Q&A snippets.
 * Defaults to the site-wide FAQ; pass a guide's own Q&A to reuse on any page.
 */
export function faqSchema(items: { q: string; a: string }[] = FAQ) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * Article schema for a guide page — the core AEO/GEO unit. Gives answer
 * engines an authored, dated, attributed source they can cite.
 */
export function articleSchema(g: Guide) {
  const url = `${SITE.url}/guides/${g.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    image: abs(g.ogImage),
    datePublished: g.datePublished,
    dateModified: g.dateModified,
    inLanguage: "en",
    author: { "@id": `${SITE.url}/#organization` },
    publisher: { "@id": `${SITE.url}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

/** HowTo schema — for step-by-step care/seasoning guides. */
export function howToSchema(h: GuideHowTo) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: h.name,
    description: h.description,
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/** Shared FAQ content — rendered as visible HTML *and* as FAQ schema. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is a Yixing clay tea pet?",
    a: "A tea pet (茶宠) is a small unglazed clay figure kept on the tea tray. During gongfu tea sessions it is bathed in leftover tea; over months the porous Yixing clay absorbs the tea and develops a deep, soft sheen called a patina.",
  },
  {
    q: "Why is Yixing clay special?",
    a: "Yixing clay, or zisha (紫砂, 'purple sand'), is a mineral-rich stoneware quarried only near Yixing in Jiangsu, China. Its open pore structure lets it breathe and absorb tea, which is why it has been used for teaware for over 500 years.",
  },
  {
    q: "How do I season a tea pet?",
    a: "Pour warm leftover tea over the pet after each session and brush it gently with a soft tea brush. Never use soap. With regular tea baths the clay darkens and gains a lustre that is unique to your own brewing.",
  },
  {
    q: "Are your Yixing teapots authentic and handmade?",
    a: "Yes. Every PO/ET teapot is hand-shaped from genuine Yixing zisha (purple sand) clay quarried in Yixing, Jiangsu, and thrown at the bench of master potter Xu Xuefang — never slip-cast, never machine-pressed, and signed with the maker's seal. Each piece is unglazed single-walled clay.",
  },
  {
    q: "How much does a real Yixing teapot cost?",
    a: "Authentic handmade Yixing teapots vary with the clay, the form, and the maker. PO/ET pots are priced for their hand work and named-master provenance rather than factory output; browse the teapots collection for current prices, with the full range shown on each product page.",
  },
  {
    q: "Do you ship worldwide, and do you sell wholesale?",
    a: "Yes to both. PO/ET ships retail orders worldwide, and supplies tea shops and distributors with wholesale pricing and tiered minimum orders. Contact the studio to open a trade account.",
  },
];
