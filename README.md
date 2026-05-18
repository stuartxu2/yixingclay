# PO/ET — yixingclay.com storefront

The customer storefront for **PO/ET**, a studio of handmade Yixing clay tea
pets (宜兴紫砂茶宠). This is step one of the wider yixingclay.com platform
described in [`DEV_BLUEPRINT.md`](./DEV_BLUEPRINT.md) — a standalone Next.js
app, built to migrate into the Turborepo monorepo as `apps/web` later.

## Stack

- **Next.js 15** (App Router) · React 19 · TypeScript strict
- **Tailwind CSS v4** (CSS-first `@theme`)
- **Ekster** typeface, self-hosted via `next/font/local`
- Colour palette sourced entirely from [nipponcolors.com](https://nipponcolors.com)

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Routes

| Route | Rendering | Notes |
|---|---|---|
| `/` | Static | Homepage — hero, collection, craft, story, FAQ |
| `/tea-pets` | Static | Full collection grid with filters |
| `/tea-pets/[slug]` | SSG + ISR (1h) | 18 product detail pages — 7-angle gallery |

## Layout

```
app/             App Router — layout, pages, robots, sitemap, fonts
  tea-pets/      Collection route + [slug] detail pages
components/      UI — header, hero, collection, gallery, craft, footer …
  cart/          Client tea-tray state (placeholder for MedusaJS cart)
lib/             site config · product catalogue · JSON-LD builders
public/          logo, product photography, imagery
old-site-archive/  the previous static site, kept for reference
```

## SEO / AEO

Per [`CLAUDE.md`](./CLAUDE.md) the storefront is built for search and AI
answer engines:

- Statically prerendered HTML — full content for crawlers, no client fetch
- `generateMetadata`-grade metadata: title, description, canonical, OpenGraph
- JSON-LD: `Organization`, `WebSite`, `ItemList` + `Product`, `FAQPage`
- Semantic landmarks (`main` / `section` / `article` / `nav`) throughout
- `next/image` with AVIF/WebP for Core Web Vitals

## Notes

- The cart (`components/cart`) is client-side only — it holds the storefront
  UX so the MedusaJS backend can drop straight in without UI changes.
- The product catalogue lives in `lib/products.ts` as seed data, shaped close
  to a Medusa product for the same reason.
