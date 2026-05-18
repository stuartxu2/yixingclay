# Meilisearch Storefront Search — Design Spec

**Date:** 2026-05-18
**Status:** Approved (design, revised after plugin inspection); pending spec review

## Goal

Add fast, typo-tolerant product search to the yixingclay.com storefront, powered by
a self-hosted Meilisearch instance on Azure. The storefront searches **through the
Medusa backend** — no Meilisearch credentials reach the browser.

## Architecture

```
Medusa backend ──(plugin: index writes + search)──▶  Meilisearch
   │                                                  (Azure Container App,
   │ exposes GET /store/meilisearch/products            INTERNAL ingress)
   ▼
Storefront browser ──(Medusa publishable key)──▶ Medusa /store/meilisearch/products
```

Three moving parts:

1. **Meilisearch service** — a new Azure Container App `poet-meilisearch` running the
   official `getmeili/meilisearch` image. **Internal ingress** (reachable only from
   inside the `poet-env` Container Apps environment), port 7700, protected by a
   master key. Storage is **ephemeral** — no persistent volume; the index is rebuilt
   from Medusa automatically (see "Re-indexing").

2. **Medusa plugin** — `@rokmohar/medusa-plugin-meilisearch` v1.3.8 (compatibility
   table: `^1.3.7` ⇒ Medusa `^2.13.4`; backend runs 2.15.2 — compatible) added to the
   `plugins` array in `apps/backend/medusa-config.ts`. The plugin bundles:
   - Event subscribers that index product create/update/delete in real time.
   - A scheduled job `meilisearch-products-index` (runs every minute) that performs a
     **full re-index** via its `syncProductsWorkflow`.
   - Store API routes `GET /store/meilisearch/products` and `/products-hits`.

   Because the plugin's subscribers and job require Medusa's worker processing, the
   backend must run in `shared` mode (the default). It is a single-instance
   monolith, so **`MEDUSA_WORKER_MODE` / `WORKER_MODE` must remain unset** — no
   change needed, just don't introduce them.

3. **Storefront search overlay** — a `SearchOverlay` client component. A search icon
   in `site-header.tsx` opens it; debounced live queries call the Medusa store
   endpoint `GET /store/meilisearch/products` (via the existing `@medusajs/js-sdk`
   client, which attaches the publishable key). Results render thumbnail + title +
   price and link to `/tea-pets/[slug]`.

## Meilisearch service (Azure)

Provisioned **once**, manually, via `az` — not part of the CI build pipeline (it
runs a stock public image, nothing to build).

- App name: `poet-meilisearch`, resource group `poet-rg`, environment `poet-env`.
- Image: `getmeili/meilisearch:v1.13` (pin a concrete minor version).
- Ingress: **internal**, target port 7700.
- Env vars on the container:
  - `MEILI_MASTER_KEY` — generated secret (stored in `.azure-deploy.env`).
  - `MEILI_ENV=production`.
  - `MEILI_NO_ANALYTICS=true`.
- No volume mount — the index lives in container storage and is lost on restart;
  the every-minute re-index job repopulates it.

Provisioning commands documented in `docs/azure-provisioning.md`.

## Medusa plugin configuration

In `apps/backend/medusa-config.ts`, add to the `plugins` array:

```ts
plugins: [
  {
    resolve: "@rokmohar/medusa-plugin-meilisearch",
    options: {
      config: {
        host: process.env.MEILISEARCH_HOST ?? "",
        apiKey: process.env.MEILISEARCH_API_KEY ?? "",
      },
      settings: {
        products: {
          type: "products",
          enabled: true,
          fields: ["id", "title", "description", "handle", "thumbnail"],
          indexSettings: {
            searchableAttributes: ["title", "description"],
            displayedAttributes: ["id", "title", "handle", "thumbnail"],
            filterableAttributes: ["id", "handle"],
          },
          primaryKey: "id",
        },
      },
    },
  },
],
```

No `i18n` block — the catalog is single-language for v1. Prices are NOT indexed;
the store endpoint enriches search hits with live Medusa `calculated_price`, so the
index only needs identity/display fields.

New backend env vars:
- `MEILISEARCH_HOST` — `http://poet-meilisearch:7700` (internal Container Apps DNS).
- `MEILISEARCH_API_KEY` — the Meilisearch master key.

Both added to the backend Container App via `az containerapp update --set-env-vars`
and recorded in `.azure-deploy.env`.

## Re-indexing

No custom job is needed. The plugin's bundled `meilisearch-products-index` job runs
every minute and full-re-indexes all products, which also serves as the backfill
for the ephemeral index after any Meilisearch restart. Event subscribers keep the
index live between job runs.

## Storefront search overlay

New files in `apps/web`:
- `lib/search.ts` — `searchProducts(query)` helper. Calls
  `GET /store/meilisearch/products` through the `@medusajs/js-sdk` client, passing
  `query`, `limit`, `region_id` (`NEXT_PUBLIC_MEDUSA_REGION_ID`), and
  `currency_code`. Returns a typed array of `{ id, title, handle, thumbnail, price }`.
  Returns `[]` on error or empty query — callers never need to guard.
- `components/search/search-overlay.tsx` — client component. A dropdown/overlay with
  a text input; debounced (~250 ms) calls to `searchProducts`; renders result rows
  (thumbnail + title + price) linking to `/tea-pets/[slug]`. Closes on Escape /
  backdrop click.

Modify `components/site-header.tsx` — add a search icon button that opens the
overlay.

**No new web env vars and no `meilisearch` JS dependency** — the storefront reaches
Meilisearch only through the Medusa backend it already talks to.

## Out of scope (YAGNI)

- Faceted filtering, sorting UI, dedicated search-results page with pagination.
- Indexing collections, artisans, or blog content.
- Semantic / vector search (the plugin supports it; not enabled for v1).
- Persistent Meilisearch storage / Azure Files volume.
- i18n indexing.

## Testing

- Web unit test: `searchProducts` returns `[]` for an empty/whitespace query
  without making a request.
- Web unit test: `searchProducts` maps a store-endpoint product payload to the
  `{ id, title, handle, thumbnail, price }` result shape.
- Web component test: `SearchOverlay` debounces input and renders result rows
  linking to the correct `/tea-pets/[slug]`.
- Manual: provision `poet-meilisearch`, deploy, wait for the index job, hit
  `GET /store/meilisearch/products?query=…` and confirm hits; type a query in the
  storefront and confirm a result links to the correct product page.
