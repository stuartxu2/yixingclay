# Storefront Search — Design

**Date:** 2026-05-25
**Status:** Approved (design)
**Scope:** `apps/web` only. No backend changes.

## Goal

Give the storefront a product search: a header search icon that opens a live-results
overlay, plus a shareable `/search?q=` results page. Both reuse the existing
`searchProducts()` helper and the already-configured Meilisearch backend.

## Existing state (do not rebuild)

- **Backend:** `@rokmohar/medusa-plugin-meilisearch` is configured in `apps/backend`
  with a single `products` index. Searchable attributes: `title`, `description`.
  Teapots and tea-pets both live in this one index.
- **Web logic:** `apps/web/lib/search.ts` exposes `searchProducts(query)` →
  `SearchResult[]` (id, title, handle, thumbnail, price), capped at 8 hits, errors
  swallowed to `[]`. `apps/web/lib/search.test.ts` covers it.
- **Missing:** all UI — no search box, no route, no header entry.

## The routing problem

The site splits products across two routes:

- Teapots → `/teapots/[slug]`, identified by `metadata.kind === "teapot"`.
- Tea-pets → `/tea-pets/[slug]` (everything else).

A search hit only knows its `handle`, not its `kind`, so it cannot pick the right
route. The `/store/meilisearch/products` plugin endpoint hydrates full products from
the DB via `queryService.graph` honoring the `fields` query param (verified in the
plugin's route source). So requesting `metadata` returns `metadata.kind` with no
Meilisearch reindex.

## Components

### 1. `lib/search.ts` — add `href`

- Extend the `fields` query param to include `metadata` (e.g. append `,metadata`).
- Read `metadata.kind` off each hydrated product.
- Add `href: string` to `SearchResult`:
  - `kind === "teapot"` → `/teapots/${handle}`
  - otherwise → `/tea-pets/${handle}`
- Keep all existing behavior (empty-query short-circuit, 8-hit cap, error → `[]`).

### 2. `components/search/search-result-item.tsx` — shared result row

Minimal presentational component used by both the overlay and the results page:
thumbnail (`next/image`), title, formatted price, wrapped in a `Link` to
`result.href`. Takes a `SearchResult`. Existing `product-card`/`teapot-card` expect
full domain types, so a dedicated minimal item is cleaner than reshaping hits.

### 3. `components/search/search-overlay.tsx` — header overlay (client)

- A search icon button rendered inside `site-header.tsx` (desktop nav region +
  mobile drawer). Owns its own open/close state.
- Open state renders an overlay with a text input (autofocused).
- Debounced ~250ms; on change calls `searchProducts(q)` **directly in the browser**
  (same pattern as `cart-context`, which already calls Medusa client-side;
  `NEXT_PUBLIC_MEDUSA_REGION_ID` and the publishable key are already public).
- Renders up to 8 `SearchResultItem`s. States: idle (prompt), loading, results,
  no-results.
- Keyboard/interaction: `Esc` closes; `Enter` navigates to `/search?q={q}` (via
  `next/navigation` router) and closes; click-outside / backdrop closes.
- Guard against out-of-order async responses (ignore a resolved query that is no
  longer the current input value).

### 4. `app/search/page.tsx` — results page (server component, SSR)

- Reads `searchParams.q`. Calls `searchProducts(q)` server-side.
- Renders semantic markup: `<main>` → `<section>` with an `<h1>` ("Search") and a
  results list of `SearchResultItem`s. Empty-query state and no-results state.
- `generateMetadata`: `title = "Search · {q}"` (or just "Search" when empty), and
  **`robots: { index: false, follow: true }`**. Search-results pages must not be
  indexed — this is the one deliberate exception to the CLAUDE.md "everything SSR +
  indexable" rule. No JSON-LD (not catalogue content).

### 5. `site-header.tsx` integration

- Add the search icon/button next to the account + tray controls (desktop) and an
  entry in the mobile drawer.
- Render `<SearchOverlay />` once; the button toggles it. Keep the header a client
  component (it already is).

## Data flow

```
overlay input ──debounce──▶ searchProducts(q)  [browser → /store/meilisearch/products]
                                   │
                                   ▼
                          SearchResult[] (+href)
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                  ▼
        overlay top-8 list                  Enter → /search?q=
                                                     │
                                            page SSR searchProducts(q)
                                                     ▼
                                            results grid (same items)
```

## Error handling

`searchProducts` already catches and returns `[]`. UI never throws: overlay and page
both fall through to the no-results state on error or empty input.

## Testing

- **`lib/search.test.ts` (extend):** assert `href` maps `metadata.kind === "teapot"`
  → `/teapots/{handle}` and absent/other kind → `/tea-pets/{handle}`. Assert
  `metadata` is requested in the `fields` param.
- **`components/search/search-overlay.test.tsx` (new):** with `@testing-library/react`
  (jsdom env already configured, `searchProducts` mocked) — typing triggers a
  (debounced) search, results render, empty query shows no API call / idle state,
  no-results state renders. Use fake timers for the debounce.

## Out of scope (YAGNI)

- Artist/content search (would need a new Meilisearch index + backend work).
- Search suggestions/history, faceted filters, pagination on `/search`.
- Semantic search (the plugin supports it; not enabled here).
