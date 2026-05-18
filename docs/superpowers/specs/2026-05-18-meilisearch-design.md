# Meilisearch Storefront Search — Design Spec

**Date:** 2026-05-18
**Status:** Approved (design); pending spec review

## Goal

Add fast, typo-tolerant product search to the yixingclay.com storefront, powered by
a self-hosted Meilisearch instance on Azure. The storefront browser queries
Meilisearch directly with a search-only key; Medusa keeps the index in sync.

## Architecture

```
Medusa backend ──(admin key, index writes)──▶  Meilisearch (Azure Container App)
                                                       ▲
Storefront browser ──(search-only key, queries)────────┘
```

Three moving parts:

1. **Meilisearch service** — a new Azure Container App `poet-meilisearch` running the
   official `getmeili/meilisearch` image. External ingress, port 7700, protected by a
   master key. Storage is **ephemeral**: the container has no persistent volume, so the
   index is rebuilt from Medusa after any restart (see "Re-sync job").

2. **Medusa plugin** — `@rokmohar/medusa-plugin-meilisearch` v1.3.8 (peer-dep
   `@medusajs/medusa ^2.13.4`; backend runs 2.15.2 — compatible) added to
   `apps/backend/medusa-config.ts`. It subscribes to product create/update/delete
   events and writes to the `products` index.

3. **Storefront search overlay** — a `SearchOverlay` client component using the
   `meilisearch` JS client. A search icon in `site-header.tsx` opens it; debounced
   live queries hit Meilisearch directly; results link to `/tea-pets/[slug]`.

## Meilisearch service (Azure)

Provisioned **once**, manually, via `az` — not part of the CI build pipeline (it
runs a stock public image, nothing to build).

- App name: `poet-meilisearch`, resource group `poet-rg`, env `poet-env`.
- Image: `getmeili/meilisearch:v1.x` (pin a concrete minor version).
- Ingress: external, target port 7700.
- Env vars on the container:
  - `MEILI_MASTER_KEY` — generated secret (stored in `.azure-deploy.env`).
  - `MEILI_ENV=production`.
  - `MEILI_NO_ANALYTICS=true`.
- No volume mount — index lives in container memory/disk and is lost on restart.
- After first deploy, derive two scoped keys from the master key via the Meilisearch
  `/keys` API:
  - **Admin key** — search + write on `products`. Used by the Medusa backend.
  - **Search-only key** — `search` action on `products`. Safe to ship in the
    browser bundle.

Document the provisioning commands in `docs/azure-provisioning.md`.

## Medusa plugin configuration

In `apps/backend/medusa-config.ts`, add the plugin to `plugins` (or `modules` per
the plugin's README) with this `products` index config:

- **searchableAttributes:** `title`, `description`, clay type / 泥料 attribute.
- **displayedAttributes:** `id`, `title`, `handle`, `thumbnail`, `price`.
- **filterableAttributes:** (none required for v1; keep minimal).

New backend env vars:
- `MEILISEARCH_HOST` — `https://poet-meilisearch.<region>.azurecontainerapps.io`.
- `MEILISEARCH_ADMIN_API_KEY` — the scoped admin key.

Both added to the backend Container App via `az containerapp update --set-env-vars`
and recorded in `.azure-deploy.env`.

## Re-sync job (ephemeral-index backfill)

Because the index is ephemeral, a Medusa scheduled job in
`apps/backend/src/jobs/meilisearch-resync.ts` performs a periodic **full re-index**:
list all products via the product module and upsert them into the `products` index.

- Schedule: every 6 hours (cron `0 */6 * * *`).
- This is the safety net if the container restarts between event-driven updates;
  event subscriptions keep the index live in between.

## Storefront search overlay

New files in `apps/web`:
- `components/search/search-overlay.tsx` — client component. Full-screen / dropdown
  overlay with a text input; debounced (~250 ms) queries via the `meilisearch` JS
  client; renders result rows (thumbnail + title + price) linking to
  `/tea-pets/[slug]`. Closes on Escape / backdrop click.
- `lib/search.ts` — constructs the `meilisearch` client from env; exposes a typed
  `searchProducts(query)` helper. No-ops gracefully if env is unset.

Modify `components/site-header.tsx` — add a search icon button that opens the
overlay.

New web env vars (inlined at build time, so passed as Docker build args in
`deploy.yml` and `build-image.yml`):
- `NEXT_PUBLIC_MEILISEARCH_HOST`
- `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` — the search-only scoped key.

## Out of scope (YAGNI)

- Faceted filtering, sorting UI, search-result pages with pagination.
- Indexing collections, artisans, or blog content.
- Persistent Meilisearch storage / Azure Files volume.

## Testing

- Backend: unit-test the re-sync job's product-to-document mapping.
- Web: test `searchProducts` no-ops without env; test the debounce/overlay behavior
  of `SearchOverlay`.
- Manual: provision `poet-meilisearch`, confirm products index, type a query in the
  storefront, confirm a result links to the correct `/tea-pets/[slug]`.
