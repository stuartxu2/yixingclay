# Storefront Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a header search overlay with live results and a shareable `/search?q=` results page to the `apps/web` storefront, reusing the existing `searchProducts()` helper and Meilisearch backend.

**Architecture:** `lib/search.ts` gains a per-hit `href` derived from `metadata.kind` so results route to `/teapots/[slug]` or `/tea-pets/[slug]`. A shared `SearchResultItem` renders one hit. A client `SearchOverlay` (rendered by the header) does debounced live search directly against Medusa from the browser. A server-rendered `/search` page does SSR search and is `noindex`.

**Tech Stack:** Next.js 15 App Router, React 19 (client + server components), `@medusajs/js-sdk`, Tailwind, Vitest + `@testing-library/react` (jsdom). Package manager: npm.

---

## Working directory

All paths are relative to repo root `/Users/stuartxu/Documents/claude_website_building`. All commands run from `apps/web` unless noted:

```bash
cd apps/web
```

Test commands:
- Single file: `npx vitest run <path>`
- All web tests: `npm test`
- Typecheck + build: `npm run build`

---

## File Structure

- **Modify** `apps/web/lib/search.ts` — add `href` to `SearchResult`, request `*metadata`, map `metadata.kind` → route.
- **Modify** `apps/web/lib/search.test.ts` — cover the `href` mapping + `fields` param.
- **Create** `apps/web/components/search/search-result-item.tsx` — one presentational result row (shared by overlay + page).
- **Create** `apps/web/components/search/search-result-item.test.tsx` — render test.
- **Create** `apps/web/components/search/search-overlay.tsx` — client overlay: icon button + debounced live search + states + keyboard.
- **Create** `apps/web/components/search/search-overlay.test.tsx` — debounce/states test.
- **Create** `apps/web/app/search/page.tsx` — SSR results page, `noindex`.
- **Modify** `apps/web/components/site-header.tsx` — render `<SearchOverlay />` (desktop controls + mobile drawer entry).

---

## Task 1: Add `href` routing to `searchProducts`

**Files:**
- Modify: `apps/web/lib/search.ts`
- Test: `apps/web/lib/search.test.ts`

Context: hits come back from `/store/meilisearch/products`, which hydrates products honoring the `fields` param. Field tokens MUST be `*`-prefixed (bare tokens switch Medusa to explicit-selection mode and drop default scalars). Teapots carry `metadata.kind === "teapot"`; everything else is a tea-pet.

- [ ] **Step 1: Update the test file to expect `href` and the `metadata` field**

Replace the body of `apps/web/lib/search.test.ts` with:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures fetchMock is available when vi.mock factory is hoisted.
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

// Mock the Medusa SDK client used by lib/search.ts.
vi.mock("./medusa", () => ({
  medusa: { client: { fetch: fetchMock } },
}));

import { searchProducts } from "./search";

beforeEach(() => {
  fetchMock.mockReset();
});

describe("searchProducts", () => {
  it("returns [] for an empty query without calling the API", async () => {
    expect(await searchProducts("   ")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps a tea-pet hit and requests metadata in the fields param", async () => {
    fetchMock.mockResolvedValue({
      products: [
        {
          id: "prod_1",
          title: "The White Cat",
          handle: "cat",
          thumbnail: "https://x.blob.core.windows.net/cat.jpg",
          metadata: null,
          variants: [{ prices: [{ amount: 6800, currency_code: "usd" }] }],
        },
      ],
    });

    const results = await searchProducts("cat");

    expect(results).toEqual([
      {
        id: "prod_1",
        title: "The White Cat",
        handle: "cat",
        thumbnail: "https://x.blob.core.windows.net/cat.jpg",
        price: 6800,
        href: "/tea-pets/cat",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/store/meilisearch/products",
      expect.objectContaining({
        query: expect.objectContaining({
          query: "cat",
          limit: 8,
          fields: expect.stringContaining("*metadata"),
        }),
      }),
    );
  });

  it("routes a teapot hit to /teapots/{handle}", async () => {
    fetchMock.mockResolvedValue({
      products: [
        {
          id: "prod_2",
          title: "Shi Piao",
          handle: "shi-piao",
          thumbnail: null,
          metadata: { kind: "teapot" },
          variants: [{ prices: [{ amount: 12000, currency_code: "usd" }] }],
        },
      ],
    });

    const [r] = await searchProducts("shi");
    expect(r.href).toBe("/teapots/shi-piao");
  });

  it("returns [] when the API call throws", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    expect(await searchProducts("cat")).toEqual([]);
  });

  it("defaults price to 0 when no usd price is present", async () => {
    fetchMock.mockResolvedValue({
      products: [
        { id: "p", title: "T", handle: "h", thumbnail: null, metadata: null, variants: [] },
      ],
    });
    const [r] = await searchProducts("t");
    expect(r.price).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/search.test.ts`
Expected: FAIL — results lack `href`; `fields` does not contain `*metadata`.

- [ ] **Step 3: Update `lib/search.ts`**

Replace the file contents with:

```typescript
import { medusa } from "./medusa";

/** A single storefront search hit. `price` is in cents, USD. */
export interface SearchResult {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
  /** Resolved storefront route for this hit. */
  href: string;
}

const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;

interface StoreSearchVariant {
  prices?: { amount: number; currency_code: string }[];
}
interface StoreSearchProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  metadata?: Record<string, unknown> | null;
  variants?: StoreSearchVariant[];
}
interface StoreSearchResponse {
  products: StoreSearchProduct[];
}

/** Teapots carry `metadata.kind === "teapot"`; everything else is a tea-pet. */
function hrefFor(p: StoreSearchProduct): string {
  return p.metadata?.kind === "teapot"
    ? `/teapots/${p.handle}`
    : `/tea-pets/${p.handle}`;
}

/**
 * Search the product catalogue via the Medusa Meilisearch endpoint
 * (`@rokmohar/medusa-plugin-meilisearch`). Returns up to 8 hits, ordered by
 * relevance. Returns `[]` for an empty query or on any error — callers never
 * need to guard.
 */
export async function searchProducts(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const res = await medusa.client.fetch<StoreSearchResponse>(
      "/store/meilisearch/products",
      {
        query: {
          query: q,
          limit: 8,
          region_id: REGION_ID,
          currency_code: "usd",
          // `*`-prefixed so default product scalars are kept, not replaced.
          fields: "*thumbnail,*variants.prices,*metadata",
        },
      },
    );

    return res.products.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      thumbnail: p.thumbnail ?? null,
      price:
        p.variants?.[0]?.prices?.find((pr) => pr.currency_code === "usd")
          ?.amount ?? 0,
      href: hrefFor(p),
    }));
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/search.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/search.ts apps/web/lib/search.test.ts
git commit -m "feat(web): resolve search-hit route via metadata.kind"
```

---

## Task 2: `SearchResultItem` component

**Files:**
- Create: `apps/web/components/search/search-result-item.tsx`
- Test: `apps/web/components/search/search-result-item.test.tsx`

Context: `formatPrice(cents)` lives in `@/lib/products` and returns `"$xx.xx"`. Thumbnails are remote blob URLs or null. Reuse the site's color tokens (`ink`, `ink-soft`, `ink-faint`, `clay-deep`, `cream`).

- [ ] **Step 1: Write the failing test**

Create `apps/web/components/search/search-result-item.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchResultItem } from "./search-result-item";

// next/image renders an <img>; stub to a plain img for jsdom.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as Record<string, string>)} />;
  },
}));

describe("SearchResultItem", () => {
  it("renders title, price, and a link to the hit href", () => {
    render(
      <SearchResultItem
        result={{
          id: "p1",
          title: "The White Cat",
          handle: "cat",
          thumbnail: "https://x/cat.jpg",
          price: 6800,
          href: "/tea-pets/cat",
        }}
      />,
    );

    expect(screen.getByText("The White Cat")).toBeInTheDocument();
    expect(screen.getByText("$68.00")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tea-pets/cat");
  });

  it("renders without a thumbnail", () => {
    render(
      <SearchResultItem
        result={{
          id: "p2",
          title: "No Image",
          handle: "x",
          thumbnail: null,
          price: 0,
          href: "/tea-pets/x",
        }}
      />,
    );
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/search/search-result-item.test.tsx`
Expected: FAIL — `Failed to resolve import "./search-result-item"`.

- [ ] **Step 3: Write the component**

Create `apps/web/components/search/search-result-item.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import type { SearchResult } from "@/lib/search";

/** One search hit: thumbnail, title, price. Links to the resolved route. */
export function SearchResultItem({
  result,
  onNavigate,
}: {
  result: SearchResult;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={result.href}
      onClick={onNavigate}
      className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-cream"
    >
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
        {result.thumbnail && (
          <Image
            src={result.thumbnail}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        )}
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="truncate text-[15px] font-medium text-ink">
          {result.title}
        </span>
        <span className="whitespace-nowrap text-[14px] text-clay-deep">
          {formatPrice(result.price)}
        </span>
      </span>
    </Link>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/search/search-result-item.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/search/search-result-item.tsx apps/web/components/search/search-result-item.test.tsx
git commit -m "feat(web): add SearchResultItem"
```

---

## Task 3: `SearchOverlay` component

**Files:**
- Create: `apps/web/components/search/search-overlay.tsx`
- Test: `apps/web/components/search/search-overlay.test.tsx`

Context: client component. Calls `searchProducts(q)` directly in the browser (consistent with `cart-context`). Debounce ~250ms. Guard against out-of-order responses by comparing the resolved query to the latest input. `Enter` routes to `/search?q=` via `useRouter` from `next/navigation`. The component renders a toggle button plus the overlay; it owns its open state.

- [ ] **Step 1: Write the failing test**

Create `apps/web/components/search/search-overlay.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";

const { searchMock, pushMock } = vi.hoisted(() => ({
  searchMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("@/lib/search", () => ({ searchProducts: searchMock }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as Record<string, string>)} />;
  },
}));

import { SearchOverlay } from "./search-overlay";

beforeEach(() => {
  searchMock.mockReset();
  pushMock.mockReset();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

function openOverlay() {
  render(<SearchOverlay />);
  fireEvent.click(screen.getByRole("button", { name: /search/i }));
}

describe("SearchOverlay", () => {
  it("opens to an idle state with no API call", () => {
    openOverlay();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("debounces input then renders results", async () => {
    searchMock.mockResolvedValue([
      {
        id: "p1",
        title: "The White Cat",
        handle: "cat",
        thumbnail: null,
        price: 6800,
        href: "/tea-pets/cat",
      },
    ]);
    openOverlay();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "cat" } });
    // Not called before the debounce window elapses.
    expect(searchMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(searchMock).toHaveBeenCalledWith("cat");
    await waitFor(() => {
      expect(screen.getByText("The White Cat")).toBeInTheDocument();
    });
  });

  it("shows a no-results state when search returns []", async () => {
    searchMock.mockResolvedValue([]);
    openOverlay();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzz" } });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });

  it("routes to /search on Enter", () => {
    openOverlay();
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "cat" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(pushMock).toHaveBeenCalledWith("/search?q=cat");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/search/search-overlay.test.tsx`
Expected: FAIL — `Failed to resolve import "./search-overlay"`.

- [ ] **Step 3: Write the component**

Create `apps/web/components/search/search-overlay.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchProducts, type SearchResult } from "@/lib/search";
import { SearchResultItem } from "./search-result-item";

const DEBOUNCE_MS = 250;

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input whenever the overlay opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Debounced search; ignore stale responses that no longer match the input.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    let active = true;
    const t = setTimeout(async () => {
      const hits = await searchProducts(q);
      if (!active) return;
      setResults(hits);
      setSearched(true);
      setLoading(false);
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSearched(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "Enter") {
      const q = query.trim();
      if (q) {
        router.push(`/search?q=${encodeURIComponent(q)}`);
        close();
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-ink-faint/40 px-4 py-2 text-[13.5px] font-medium transition-colors hover:border-ink-soft hover:bg-cream"
        aria-label="Search"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Search</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/40 backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            className="mt-[12vh] w-full max-w-[640px] overflow-hidden rounded-2xl border border-ink-faint/25 bg-paper shadow-[0_40px_80px_-40px_rgba(28,28,28,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-ink-faint/20 px-5 py-4">
              <SearchIcon />
              <input
                ref={inputRef}
                type="search"
                role="searchbox"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search tea pets and teapots…"
                className="flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-faint"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="text-[13px] text-ink-faint hover:text-ink"
              >
                Esc
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-6 text-center text-[14px] text-ink-faint">
                  Searching…
                </p>
              )}
              {!loading && searched && results.length === 0 && (
                <p className="px-3 py-6 text-center text-[14px] text-ink-faint">
                  No results.
                </p>
              )}
              {!loading && !searched && (
                <p className="px-3 py-6 text-center text-[14px] text-ink-faint">
                  Start typing to search the collection.
                </p>
              )}
              {!loading &&
                results.map((r) => (
                  <SearchResultItem key={r.id} result={r} onNavigate={close} />
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m20 20-3.2-3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/search/search-overlay.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/search/search-overlay.tsx apps/web/components/search/search-overlay.test.tsx
git commit -m "feat(web): add live search overlay"
```

---

## Task 4: `/search` results page (SSR, noindex)

**Files:**
- Create: `apps/web/app/search/page.tsx`

Context: server component. Reads `searchParams.q` (a Promise in Next 15). Calls `searchProducts(q)` server-side. Uses semantic markup and `SiteHeader`/`SiteFooter` like other pages. `robots: { index: false }` — search results must not be indexed (the one deliberate exception to the CLAUDE.md indexing rule). No JSON-LD.

- [ ] **Step 1: Write the page**

Create `apps/web/app/search/page.tsx`:

```tsx
import type { Metadata } from "next";
import { searchProducts } from "@/lib/search";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchResultItem } from "@/components/search/search-result-item";

type SearchParams = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({
  searchParams,
}: SearchParams): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  return {
    title: query ? `Search · ${query}` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchParams) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchProducts(query) : [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[60vh] max-w-[860px] px-6 py-16 sm:px-10">
        <section>
          <h1 className="text-[28px] font-light tracking-[-0.01em] text-ink">
            {query ? (
              <>
                Results for <span className="text-clay-deep">“{query}”</span>
              </>
            ) : (
              "Search"
            )}
          </h1>

          {!query && (
            <p className="mt-4 text-[15px] text-ink-soft">
              Enter a search term to explore the collection.
            </p>
          )}

          {query && results.length === 0 && (
            <p className="mt-4 text-[15px] text-ink-soft">
              No results for “{query}”. Try a different term.
            </p>
          )}

          {results.length > 0 && (
            <ul className="mt-8 flex flex-col gap-1">
              {results.map((r) => (
                <li key={r.id}>
                  <SearchResultItem result={r} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 2: Verify it typechecks and builds**

Run: `npm run build`
Expected: build succeeds; `/search` appears in the route list (as a dynamic route). No type errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/search/page.tsx
git commit -m "feat(web): add /search results page (noindex)"
```

---

## Task 5: Wire the overlay into the header

**Files:**
- Modify: `apps/web/components/site-header.tsx`

Context: `site-header.tsx` is already a client component. The controls cluster (`<div className="flex items-center gap-4">`) is always visible — including on mobile — so a single `<SearchOverlay />` there covers all breakpoints (the icon shows everywhere; the "Search" label is `hidden sm:inline`). No separate mobile-drawer entry is needed. The overlay owns its own state, so the header just renders it.

- [ ] **Step 1: Add the import**

In `apps/web/components/site-header.tsx`, add to the import block (after the `useAuth` import on line 9):

```tsx
import { SearchOverlay } from "./search/search-overlay";
```

- [ ] **Step 2: Render the overlay button in the desktop controls**

In the `<div className="flex items-center gap-4">` cluster, insert `<SearchOverlay />` immediately before the Account `<Link>` (before the comment `{/* Account link */}`):

```tsx
        <div className="flex items-center gap-4">
          <SearchOverlay />

          {/* Account link */}
          <Link
            href="/account"
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: build succeeds, no type errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/site-header.tsx
git commit -m "feat(web): mount search overlay in site header"
```

---

## Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full web test suite**

Run: `npm test`
Expected: all tests pass, including the new `search.test.ts`, `search-result-item.test.tsx`, `search-overlay.test.tsx`.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: succeeds; `/search` listed in routes.

- [ ] **Step 3: Manual smoke test (requires backend + Meilisearch running)**

Per project memory, the backend needs Meilisearch on `:7700`. With backend + `npm run dev` running:
1. Click the header Search button → overlay opens, input focused.
2. Type a known product name → results appear after ~250ms.
3. Click a result → lands on `/teapots/{slug}` or `/tea-pets/{slug}` correctly.
4. Press Enter on a query → navigates to `/search?q=...`, SSR results render.
5. View source on `/search?q=x` → `<meta name="robots" content="noindex">` present.

If backend/Meilisearch is not running, note that step 3 is deferred and rely on the unit tests + build for verification.

- [ ] **Step 4: Final commit (if any cleanup)**

```bash
git add -A
git commit -m "chore(web): search feature verification" --allow-empty
```

---

## Self-Review Notes

- **Spec coverage:** routing fix (Task 1), shared item (Task 2), overlay w/ states+keyboard+debounce (Task 3), SSR noindex page (Task 4), header integration (Task 5), testing of search.ts + overlay + item (Tasks 1–3), full verification (Task 6). All spec sections mapped.
- **Type consistency:** `SearchResult` gains `href` in Task 1 and is consumed unchanged in Tasks 2–4. `searchProducts(q): Promise<SearchResult[]>` signature stable across overlay and page.
- **Out of scope (per spec):** artist search, suggestions/history, faceting, pagination, semantic search — none added.
