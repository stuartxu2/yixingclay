# Meilisearch Storefront Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add typo-tolerant product search to the yixingclay.com storefront, served by a self-hosted Meilisearch on Azure and queried through the Medusa backend.

**Architecture:** A new internal-ingress Azure Container App runs Meilisearch. The `@rokmohar/medusa-plugin-meilisearch` plugin in the Medusa backend indexes products (real-time subscribers + an every-minute full re-index job it bundles) and exposes `GET /store/meilisearch/products`. The Next.js storefront calls that endpoint through the existing Medusa JS SDK — no Meilisearch credentials reach the browser.

**Tech Stack:** Meilisearch v1.13, `@rokmohar/medusa-plugin-meilisearch` v1.3.8, MedusaJS 2.15.2, Next.js 15 / React 19, Vitest (new web test harness).

**Spec:** `docs/superpowers/specs/2026-05-18-meilisearch-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `docs/azure-provisioning.md` | (modify) Add the `poet-meilisearch` provisioning runbook section |
| `apps/backend/medusa-config.ts` | (modify) Register the Meilisearch plugin |
| `apps/backend/.env`, `.env.template` | (modify) Add `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY` |
| `apps/web/vitest.config.ts` | (create) Vitest config for the web app |
| `apps/web/vitest.setup.ts` | (create) Test setup — jest-dom matchers |
| `apps/web/lib/search.ts` | (create) `searchProducts()` — calls the Medusa search endpoint, maps results |
| `apps/web/lib/search.test.ts` | (create) Unit tests for `searchProducts` |
| `apps/web/components/search/search-overlay.tsx` | (create) Search overlay UI client component |
| `apps/web/components/search/search-overlay.test.tsx` | (create) Component tests for the overlay |
| `apps/web/components/site-header.tsx` | (modify) Add the search icon button + overlay wiring |

A note on the env file: `.azure-deploy.env` at the repo root is **gitignored — never commit it**. New secrets are recorded there by hand.

---

## Task 1: Provision the Meilisearch Azure Container App

This task runs `az` commands against the live Azure subscription. It requires an
active `az login` (Azure for Students subscription, resource group `poet-rg`,
Container Apps environment `poet-env`). There is no automated test — verification
is the `curl` health check in Step 5.

**Files:**
- Modify: `docs/azure-provisioning.md` (append a new section)
- Modify: `.azure-deploy.env` (record the new secret — DO NOT commit this file)

- [ ] **Step 1: Generate the Meilisearch master key**

```bash
MEILI_KEY=$(openssl rand -hex 24)
echo "MEILI master key: $MEILI_KEY"
```

Append to `.azure-deploy.env` (repo root, gitignored):

```bash
MEILI_MASTER_KEY=<the value of $MEILI_KEY>
MEILISEARCH_HOST=http://poet-meilisearch:7700
```

- [ ] **Step 2: Create the `poet-meilisearch` Container App**

Run (substitute `$MEILI_KEY` from Step 1):

```bash
az containerapp create \
  --name poet-meilisearch \
  --resource-group poet-rg \
  --environment poet-env \
  --image getmeili/meilisearch:v1.13 \
  --target-port 7700 \
  --ingress internal \
  --min-replicas 1 --max-replicas 1 \
  --cpu 0.5 --memory 1.0Gi \
  --env-vars \
    MEILI_MASTER_KEY="$MEILI_KEY" \
    MEILI_ENV=production \
    MEILI_NO_ANALYTICS=true
```

Expected: JSON describing the created app. Internal ingress means it has no public
FQDN; it is reachable from other apps in `poet-env` at `http://poet-meilisearch:7700`.

- [ ] **Step 3: Point the backend Container App at Meilisearch**

```bash
az containerapp update \
  --name poet-backend \
  --resource-group poet-rg \
  --set-env-vars \
    MEILISEARCH_HOST=http://poet-meilisearch:7700 \
    MEILISEARCH_API_KEY="$MEILI_KEY"
```

Expected: JSON for the updated backend app. (The backend will fail to resolve the
plugin until Task 2 ships its code — that is fine; this only sets the env.)

- [ ] **Step 4: Document the runbook**

Append this section to the end of `docs/azure-provisioning.md`:

````markdown
## Meilisearch (search) — `poet-meilisearch`

A self-hosted Meilisearch instance, internal ingress only. Storage is ephemeral;
the Medusa Meilisearch plugin re-indexes every minute, so a restart self-heals.

```bash
# Generate a master key (record it in .azure-deploy.env, never commit that file)
MEILI_KEY=$(openssl rand -hex 24)

az containerapp create \
  --name poet-meilisearch \
  --resource-group poet-rg \
  --environment poet-env \
  --image getmeili/meilisearch:v1.13 \
  --target-port 7700 \
  --ingress internal \
  --min-replicas 1 --max-replicas 1 \
  --cpu 0.5 --memory 1.0Gi \
  --env-vars MEILI_MASTER_KEY="$MEILI_KEY" MEILI_ENV=production MEILI_NO_ANALYTICS=true

# Wire the backend to it
az containerapp update --name poet-backend --resource-group poet-rg \
  --set-env-vars MEILISEARCH_HOST=http://poet-meilisearch:7700 MEILISEARCH_API_KEY="$MEILI_KEY"
```

`poet-meilisearch` runs a stock public image — it is NOT built by the CI pipeline.
````

- [ ] **Step 5: Verify Meilisearch is healthy**

From inside the environment the backend can reach it; from your machine, exec into
the running Meilisearch container and check health:

```bash
az containerapp exec --name poet-meilisearch --resource-group poet-rg \
  --command "wget -qO- http://localhost:7700/health"
```

Expected output: `{"status":"available"}`

- [ ] **Step 6: Commit the runbook change**

```bash
git add docs/azure-provisioning.md
git commit -m "docs: add poet-meilisearch provisioning runbook

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Register the Meilisearch plugin in the backend

**Files:**
- Modify: `apps/backend/package.json` (add dependency)
- Modify: `apps/backend/medusa-config.ts`
- Modify: `apps/backend/.env`
- Modify: `apps/backend/.env.template`

- [ ] **Step 1: Install the plugin**

```bash
cd apps/backend
npm install --save @rokmohar/medusa-plugin-meilisearch@1.3.8
```

Expected: `package.json` gains `"@rokmohar/medusa-plugin-meilisearch": "1.3.8"`.

> Reminder (Dropbox node_modules corruption — see memory): after any install in
> this repo, `node_modules` must stay Dropbox-ignored. Run:
> `xattr -w com.dropbox.ignored 1 apps/backend/node_modules`

- [ ] **Step 2: Add the env vars to `.env` and `.env.template`**

Append to `apps/backend/.env.template`:

```env
MEILISEARCH_HOST=
MEILISEARCH_API_KEY=
```

Append to `apps/backend/.env` (use a local Meilisearch for dev, or leave blank to
disable search locally — the plugin tolerates an unreachable host at build time):

```env
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_API_KEY=
```

- [ ] **Step 3: Register the plugin in `medusa-config.ts`**

`apps/backend/medusa-config.ts` currently has no `plugins` key — it is
`defineConfig({ projectConfig: {...}, modules: [...] })`. Add a `plugins` array as
a sibling of `modules`. Insert it immediately after the closing `]` of `modules`
and before the final `})`:

```ts
  ],
  plugins: [
    {
      resolve: "@rokmohar/medusa-plugin-meilisearch",
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST ?? "",
          apiKey: process.env.MEILISEARCH_API_KEY ?? "",
        },
        settings: {
          // The key `products` is the Meilisearch index name.
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
})
```

The plugin bundles its own subscribers and an every-minute `meilisearch-products-index`
re-index job — no custom job or subscriber is needed. It also requires Medusa to run
in `shared` worker mode (the default): do NOT set `MEDUSA_WORKER_MODE` / `WORKER_MODE`.

- [ ] **Step 4: Verify the backend builds**

```bash
cd apps/backend
npm run build
```

Expected: `medusa build` completes without errors. (The plugin loading at build time
does not require a reachable Meilisearch instance.)

- [ ] **Step 5: Commit**

```bash
git add apps/backend/package.json apps/backend/package-lock.json \
  apps/backend/medusa-config.ts apps/backend/.env.template
git commit -m "feat(backend): register Meilisearch search plugin

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

(`apps/backend/.env` is gitignored — it is not staged.)

---

## Task 3: Set up Vitest in the web app

`apps/web` has no test harness today. Add Vitest with jsdom so the search code can
be developed test-first.

**Files:**
- Modify: `apps/web/package.json` (devDependencies + `test` script)
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/vitest.setup.ts`

- [ ] **Step 1: Install test dependencies**

```bash
cd apps/web
npm install --save-dev vitest@^3 jsdom@^25 @testing-library/react@^16 \
  @testing-library/dom@^10 @testing-library/jest-dom@^6 @vitejs/plugin-react@^4
```

> Reminder: after install, `xattr -w com.dropbox.ignored 1 apps/web/node_modules`

- [ ] **Step 2: Create `apps/web/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Create `apps/web/vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add the `test` script to `apps/web/package.json`**

In the `"scripts"` block, add:

```json
    "test": "vitest run"
```

- [ ] **Step 5: Add a sanity test and verify the harness runs**

Create `apps/web/lib/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `cd apps/web && npm test`
Expected: PASS — 1 test passed.

- [ ] **Step 6: Delete the sanity test and commit the harness**

```bash
rm apps/web/lib/sanity.test.ts
git add apps/web/package.json apps/web/package-lock.json \
  apps/web/vitest.config.ts apps/web/vitest.setup.ts
git commit -m "test(web): add Vitest + jsdom test harness

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: `searchProducts` data helper

**Files:**
- Create: `apps/web/lib/search.ts`
- Test: `apps/web/lib/search.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/lib/search.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Medusa SDK client used by lib/search.ts.
const fetchMock = vi.fn();
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

  it("maps the store-endpoint payload to search results", async () => {
    fetchMock.mockResolvedValue({
      products: [
        {
          id: "prod_1",
          title: "The White Cat",
          handle: "cat",
          thumbnail: "https://x.blob.core.windows.net/cat.jpg",
          variants: [
            { prices: [{ amount: 6800, currency_code: "usd" }] },
          ],
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
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/store/meilisearch/products",
      expect.objectContaining({
        query: expect.objectContaining({ query: "cat", limit: 8 }),
      }),
    );
  });

  it("returns [] when the API call throws", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    expect(await searchProducts("cat")).toEqual([]);
  });

  it("defaults price to 0 when no usd price is present", async () => {
    fetchMock.mockResolvedValue({
      products: [
        { id: "p", title: "T", handle: "h", thumbnail: null, variants: [] },
      ],
    });
    const [r] = await searchProducts("t");
    expect(r.price).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/web && npx vitest run lib/search.test.ts`
Expected: FAIL — cannot resolve `./search`.

- [ ] **Step 3: Implement `lib/search.ts`**

Create `apps/web/lib/search.ts`:

```ts
import { medusa } from "./medusa";

/** A single storefront search hit. `price` is in cents, USD. */
export interface SearchResult {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
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
  variants?: StoreSearchVariant[];
}
interface StoreSearchResponse {
  products: StoreSearchProduct[];
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
          fields: "*thumbnail,*variants.prices",
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
    }));
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/web && npx vitest run lib/search.test.ts`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/search.ts apps/web/lib/search.test.ts
git commit -m "feat(web): add searchProducts Meilisearch helper

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: `SearchOverlay` component

A controlled overlay: the parent (`site-header.tsx`, Task 6) owns the `open` state
and passes `open` + `onClose`. The overlay debounces input and renders results.

**Files:**
- Create: `apps/web/components/search/search-overlay.tsx`
- Test: `apps/web/components/search/search-overlay.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/components/search/search-overlay.test.tsx`:

```tsx
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchOverlay } from "./search-overlay";

// next/image → plain img so jsdom renders it without Next's loader.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as Record<string, string>)} />;
  },
}));

// next/link → plain anchor so it renders without an app-router context.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const searchProducts = vi.fn();
vi.mock("@/lib/search", () => ({
  searchProducts: (q: string) => searchProducts(q),
}));

beforeEach(() => {
  vi.useFakeTimers();
  searchProducts.mockReset();
  searchProducts.mockResolvedValue([]);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("SearchOverlay", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <SearchOverlay open={false} onClose={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("debounces input — searches once after the delay", async () => {
    render(<SearchOverlay open onClose={() => {}} />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "c" } });
    fireEvent.change(input, { target: { value: "ca" } });
    fireEvent.change(input, { target: { value: "cat" } });
    expect(searchProducts).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(searchProducts).toHaveBeenCalledWith("cat");
  });

  it("renders result rows linking to the product page", async () => {
    searchProducts.mockResolvedValue([
      {
        id: "p1",
        title: "The White Cat",
        handle: "cat",
        thumbnail: null,
        price: 6800,
      },
    ]);
    render(<SearchOverlay open onClose={() => {}} />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "cat" },
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const link = screen.getByRole("link", { name: /The White Cat/ });
    expect(link).toHaveAttribute("href", "/tea-pets/cat");
    expect(link).toHaveTextContent("$68");
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(<SearchOverlay open onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/web && npx vitest run components/search/search-overlay.test.tsx`
Expected: FAIL — cannot resolve `./search-overlay`.

- [ ] **Step 3: Implement `components/search/search-overlay.tsx`**

Create `apps/web/components/search/search-overlay.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { searchProducts, type SearchResult } from "@/lib/search";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Storefront search overlay. Debounced live queries hit the Medusa
 * Meilisearch endpoint via `searchProducts`; results link to product pages.
 */
export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus the input and reset state when the overlay opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      inputRef.current?.focus();
    }
  }, [open]);

  // Debounced search — 250 ms after the last keystroke.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const hits = await searchProducts(q);
      setResults(hits);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-center bg-ink/40 px-4 pt-24 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="h-fit w-full max-w-[560px] overflow-hidden rounded-2xl bg-paper shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tea pets…"
          className="w-full border-b border-ink-faint/25 bg-transparent px-5 py-4 text-[16px] text-ink outline-none placeholder:text-ink-faint"
        />

        {query.trim() && (
          <ul className="max-h-[60vh] overflow-y-auto">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/tea-pets/${r.handle}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-cream"
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-cream">
                    {r.thumbnail && (
                      <Image
                        src={r.thumbnail}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="flex-1 text-[14.5px] font-medium text-ink">
                    {r.title}
                  </span>
                  <span className="text-[14px] text-ink-soft">
                    {formatPrice(r.price)}
                  </span>
                </Link>
              </li>
            ))}
            {!loading && results.length === 0 && (
              <li className="px-5 py-6 text-center text-[14px] text-ink-faint">
                No tea pets match “{query.trim()}”.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/web && npx vitest run components/search/search-overlay.test.tsx`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/search/search-overlay.tsx \
  apps/web/components/search/search-overlay.test.tsx
git commit -m "feat(web): add SearchOverlay component

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: Wire the search icon into the header

**Files:**
- Modify: `apps/web/components/site-header.tsx`

- [ ] **Step 1: Add the import and overlay state**

In `apps/web/components/site-header.tsx`, add to the imports at the top:

```tsx
import { SearchOverlay } from "./search/search-overlay";
```

Inside the `SiteHeader` component, alongside the existing `useState` calls
(`scrolled`, `menuOpen`), add:

```tsx
  const [searchOpen, setSearchOpen] = useState(false);
```

- [ ] **Step 2: Add the search button**

In the right-hand `<div className="flex items-center gap-4">`, add this button as
the FIRST child (before the Account `<Link>`):

```tsx
          {/* Search */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink-faint/40 transition-colors hover:border-ink-soft hover:bg-cream"
            aria-label="Search tea pets"
          >
            <SearchIcon />
          </button>
```

- [ ] **Step 3: Render the overlay**

Immediately before the closing `</header>` tag (after the mobile nav drawer block),
add:

```tsx
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
```

- [ ] **Step 4: Add the `SearchIcon` component**

At the bottom of the file, alongside `AccountIcon` and `CartIcon`, add:

```tsx
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

- [ ] **Step 5: Verify the web app builds**

```bash
cd apps/web && npm run build
```

Expected: `next build` completes without type errors.

- [ ] **Step 6: Run the full web test suite**

```bash
cd apps/web && npm test
```

Expected: PASS — all `search.test.ts` and `search-overlay.test.tsx` tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/site-header.tsx
git commit -m "feat(web): add search icon and overlay to site header

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: Deploy and verify end-to-end

The push-to-main pipeline (`deploy.yml`) builds and deploys both images; no CI
changes are needed (Meilisearch runs a stock image, no new web env vars).

- [ ] **Step 1: Push to main to trigger deployment**

```bash
git push origin main
```

Expected: the "Deploy to Azure" workflow runs build → migrate → deploy and goes green.

- [ ] **Step 2: Confirm the index populated**

Wait ~2 minutes after deploy for the `meilisearch-products-index` job to run, then
check the search endpoint through the public backend:

```bash
curl -s -H "x-publishable-api-key: $NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" \
  "https://api.yixingclay.com/store/meilisearch/products?query=cat&limit=5" | head -c 400
```

(`$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is the value from the GitHub repo variable.)
Expected: JSON with a non-empty `products` array including the cat tea pets.

- [ ] **Step 3: Manual storefront check**

Open `https://yixingclay.com`, click the search icon in the header, type "cat",
and confirm result rows appear and a row links to the correct `/tea-pets/<handle>`
product page.

---

## Notes for the implementer

- `.azure-deploy.env` and `apps/backend/.env` / `apps/web/.env.local` are **gitignored
  — never commit them or stage them**.
- After every `npm install` in this repo, re-apply the Dropbox ignore xattr on the
  affected `node_modules` directory (the repo lives inside Dropbox).
- Task 1 needs an active `az login`; Task 7 needs push access to `main`. If you
  cannot perform those, stop and report BLOCKED rather than guessing.
