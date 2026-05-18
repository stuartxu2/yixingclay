# PostHog Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture storefront behavior and server-confirmed order events into PostHog Cloud so store managers can see traffic and the purchase funnel.

**Architecture:** Two independent capture layers feed one PostHog project. The Next.js storefront (`apps/web`) uses `posthog-js` for pageviews and funnel events; the Medusa backend (`apps/backend`) uses the Analytics module + `@medusajs/analytics-posthog` to emit `order_placed`. Both ship through the existing GitHub Actions → Azure Container Apps pipeline.

**Tech Stack:** Medusa v2.15.2, `@medusajs/analytics-posthog`, Next.js 15, `posthog-js`, Azure Container Apps.

**Reference spec:** `docs/superpowers/specs/2026-05-18-posthog-analytics-design.md`

**Conventions for this codebase:**
- The backend Medusa CLI bin is missing locally (Dropbox corruption). Run builds with `node node_modules/@medusajs/cli/cli.js build`, not `npm run build`.
- After any `npm install` in `apps/backend`, re-apply `xattr -w com.dropbox.ignored 1 node_modules`.
- Deploy secrets/vars live in the gitignored `.azure-deploy.env` at the repo root — `source` it for `az`/PostHog values.
- The PostHog project key is `phc_vMNASQ9Caxi6i2pnprwVwVjYfY98pYkEidtHzWzdwLuH`; host is `https://us.i.posthog.com`.

---

## File Structure

**Backend (`apps/backend`):**
- Modify `medusa-config.ts` — register the Analytics module.
- Modify `src/subscribers/order-placed.ts` — emit `order_placed`.
- Modify `.env`, `.env.template` — PostHog env vars.

**Frontend (`apps/web`):**
- Create `lib/analytics.ts` — thin `track`/`identifyUser`/`resetUser` wrapper, no-ops without a key.
- Create `components/posthog-provider.tsx` — initializes PostHog, tracks pageviews.
- Create `components/analytics/track-on-mount.tsx` — client component to fire an event from a server-rendered page.
- Modify `app/layout.tsx` — mount the provider.
- Modify `next.config.ts` — reverse-proxy rewrites for `/ingest`.
- Modify `components/add-to-tray.tsx`, `components/checkout/checkout-flow.tsx`, `components/auth/auth-context.tsx`, `app/tea-pets/[slug]/page.tsx` — funnel events.
- Modify `.env.local` — PostHog env vars.

**Deploy:**
- Modify `apps/web/Dockerfile`, `.github/workflows/deploy.yml`, `.github/workflows/build-image.yml` — pass `NEXT_PUBLIC_POSTHOG_*` build args.

**Note on testing:** This feature is third-party SDK integration glue. There is no meaningful unit surface — verification is (a) builds succeed and (b) events appear in PostHog's Activity view. Each task's verification steps reflect that.

---

## Task 1: Register the Analytics module (backend)

**Files:**
- Modify: `apps/backend/package.json` (via npm)
- Modify: `apps/backend/medusa-config.ts`
- Modify: `apps/backend/.env`, `apps/backend/.env.template`

- [ ] **Step 1: Install the PostHog analytics provider**

```bash
cd apps/backend
npm install @medusajs/analytics-posthog@2.15.2 --save
xattr -w com.dropbox.ignored 1 node_modules
```

- [ ] **Step 2: Register the Analytics module in `medusa-config.ts`**

In `apps/backend/medusa-config.ts`, the `modules` array currently ends with the File module followed by `  ],`. Insert the Analytics module block immediately after the File module's closing `},` and before the `],` that closes the array:

```ts
    {
      // Server-side analytics. Medusa core does not auto-emit analytics
      // events — see src/subscribers/order-placed.ts for the order event.
      resolve: "@medusajs/medusa/analytics",
      options: {
        providers: [
          {
            resolve: "@medusajs/analytics-posthog",
            id: "posthog",
            options: {
              posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
              posthogHost: process.env.POSTHOG_HOST,
            },
          },
        ],
      },
    },
```

- [ ] **Step 3: Add env vars to `apps/backend/.env`**

Append:

```
# PostHog server-side analytics
POSTHOG_EVENTS_API_KEY=phc_vMNASQ9Caxi6i2pnprwVwVjYfY98pYkEidtHzWzdwLuH
POSTHOG_HOST=https://us.i.posthog.com
```

- [ ] **Step 4: Add placeholders to `apps/backend/.env.template`**

Append:

```
# PostHog server-side analytics
POSTHOG_EVENTS_API_KEY=
POSTHOG_HOST=https://us.i.posthog.com
```

- [ ] **Step 5: Verify the backend builds**

Run: `cd apps/backend && node node_modules/@medusajs/cli/cli.js build`
Expected: ends with `Backend build completed successfully` and `Frontend build completed successfully`, exit 0.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/package.json apps/backend/package-lock.json apps/backend/medusa-config.ts apps/backend/.env.template
git commit -m "feat(backend): register PostHog analytics module"
```

---

## Task 2: Emit `order_placed` from the order subscriber (backend)

**Files:**
- Modify: `apps/backend/src/subscribers/order-placed.ts`

- [ ] **Step 1: Add the analytics track call**

In `apps/backend/src/subscribers/order-placed.ts`, the handler `orderPlacedHandler` currently ends after the staff-alert block (the `else { console.warn("[order-placed] ORDER_NOTIFICATION_EMAIL not set …") }`). Add this block as the last statement inside the handler, after that staff-alert `if/else`:

```ts
  // ── 3. Analytics: server-confirmed order event ────────────────────────────
  // Not ad-blockable, unlike the storefront's checkout_completed event.
  try {
    const analytics = container.resolve(Modules.ANALYTICS)
    await analytics.track({
      event: "order_placed",
      actor_id: order.customer_id ?? email,
      properties: {
        order_id: order.id,
        display_id: displayId,
        total,
        currency_code: currency,
        item_count: items.reduce((n, i) => n + i.quantity, 0),
        items: items.map((i) => ({
          title: i.title,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      },
    })
    console.log(`[order-placed] analytics tracked order #${displayId}`)
  } catch (e) {
    console.warn(
      `[order-placed] analytics track failed: ${(e as Error).message}`,
    )
  }
```

`Modules` is already imported at the top of the file (`import { Modules } from "@medusajs/framework/utils"`). `container`, `order`, `email`, `displayId`, `total`, `currency`, and `items` are all already in scope in the handler.

- [ ] **Step 2: Verify the backend builds**

Run: `cd apps/backend && node node_modules/@medusajs/cli/cli.js build`
Expected: `Backend build completed successfully`, exit 0.

> If the build reports a TypeScript error that `Modules.ANALYTICS` does not exist, use the string literal `"analytics"` in `container.resolve(...)` instead. The build is the check.

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/subscribers/order-placed.ts
git commit -m "feat(backend): track order_placed analytics event"
```

---

## Task 3: PostHog dependency, env, and reverse proxy (web)

**Files:**
- Modify: `apps/web/package.json` (via npm)
- Modify: `apps/web/.env.local`
- Modify: `apps/web/next.config.ts`

- [ ] **Step 1: Install `posthog-js`**

```bash
cd apps/web
npm install posthog-js --save
```

- [ ] **Step 2: Add env vars to `apps/web/.env.local`**

Append:

```
NEXT_PUBLIC_POSTHOG_KEY=phc_vMNASQ9Caxi6i2pnprwVwVjYfY98pYkEidtHzWzdwLuH
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

- [ ] **Step 3: Add reverse-proxy rewrites to `next.config.ts`**

In `apps/web/next.config.ts`, add these two properties to the `nextConfig` object (alongside the existing `images`, `output`, etc.):

```ts
  // Proxy PostHog ingestion through our own origin so the browser only ever
  // talks to yixingclay.com/ingest — first-party requests survive ad-blockers.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ]
  },
  // PostHog ingestion paths must not be trailing-slash-redirected.
  skipTrailingSlashRedirect: true,
```

- [ ] **Step 4: Verify the web app builds**

Run: `cd apps/web && npx next build`
Expected: build completes, exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json apps/web/next.config.ts
git commit -m "feat(web): add posthog-js and ingestion reverse proxy"
```

---

## Task 4: PostHog provider and pageview tracking (web)

**Files:**
- Create: `apps/web/lib/analytics.ts`
- Create: `apps/web/components/posthog-provider.tsx`
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Create the analytics helper `apps/web/lib/analytics.ts`**

```ts
import posthog from "posthog-js";

// Every helper is a no-op when NEXT_PUBLIC_POSTHOG_KEY is unset (e.g. local
// dev without a key), so callers never need to guard.
const enabled = !!process.env.NEXT_PUBLIC_POSTHOG_KEY;

/** Capture a custom product/funnel event. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (enabled) posthog.capture(event, properties);
}

/** Associate subsequent events with a signed-in customer. */
export function identifyUser(
  customerId: string,
  properties?: Record<string, unknown>,
) {
  if (enabled) posthog.identify(customerId, properties);
}

/** Drop the identity link on logout. */
export function resetUser() {
  if (enabled) posthog.reset();
}
```

- [ ] **Step 2: Create `apps/web/components/posthog-provider.tsx`**

```tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/** Captures a $pageview on every App Router navigation. */
function PageviewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    posthog.capture("$pageview");
  }, [pathname]);
  return null;
}

/**
 * Initializes PostHog once and provides it to the tree. Without a key the
 * children render untouched and analytics is a silent no-op.
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!KEY) return;
    posthog.init(KEY, {
      api_host: "/ingest",
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // handled by PageviewTracker
      person_profiles: "identified_only",
    });
  }, []);

  if (!KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PageviewTracker />
      {children}
    </PHProvider>
  );
}
```

- [ ] **Step 3: Mount the provider in `app/layout.tsx`**

In `apps/web/app/layout.tsx`, add the import alongside the other component imports:

```tsx
import { PostHogProvider } from "@/components/posthog-provider";
```

Then wrap the existing body content. The current body content is:

```tsx
        <AnnouncementBar />
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
        <RevealObserver />
```

Wrap the `AuthProvider` block in `PostHogProvider` so it sits above auth and cart (auth-context will emit identify/reset events):

```tsx
        <AnnouncementBar />
        <PostHogProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </PostHogProvider>
        <RevealObserver />
```

- [ ] **Step 4: Verify the web app builds**

Run: `cd apps/web && npx next build`
Expected: build completes, exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/analytics.ts apps/web/components/posthog-provider.tsx apps/web/app/layout.tsx
git commit -m "feat(web): PostHog provider and pageview tracking"
```

---

## Task 5: Funnel events (web)

**Files:**
- Create: `apps/web/components/analytics/track-on-mount.tsx`
- Modify: `apps/web/app/tea-pets/[slug]/page.tsx`
- Modify: `apps/web/components/add-to-tray.tsx`
- Modify: `apps/web/components/checkout/checkout-flow.tsx`
- Modify: `apps/web/components/auth/auth-context.tsx`

- [ ] **Step 1: Create `apps/web/components/analytics/track-on-mount.tsx`**

The product page is a server component, so it can't call `track()` directly. This small client component fires one event when it mounts in the browser.

```tsx
"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires a single analytics event when mounted. Renders nothing. */
export function TrackOnMount({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) {
  useEffect(() => {
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
```

- [ ] **Step 2: Emit `product_viewed` from the product page**

In `apps/web/app/tea-pets/[slug]/page.tsx`, add the import alongside the other component imports:

```tsx
import { TrackOnMount } from "@/components/analytics/track-on-mount";
```

Inside the returned JSX, immediately after the opening `<>` fragment and before the first `<script ...ld+json>` tag, add:

```tsx
      <TrackOnMount
        event="product_viewed"
        properties={{
          slug: product.slug,
          title: product.name,
          price: product.price,
        }}
      />
```

- [ ] **Step 3: Emit `add_to_cart` from the add-to-tray button**

In `apps/web/components/add-to-tray.tsx`, add the import:

```tsx
import { track } from "@/lib/analytics";
```

The button currently has `onClick={() => add({ slug, name, price: unit }, qty)}`. Replace that handler with one that also tracks:

```tsx
        onClick={() => {
          add({ slug, name, price: unit }, qty);
          track("add_to_cart", { slug, title: name, price: unit, quantity: qty });
        }}
```

- [ ] **Step 4: Emit `checkout_started` and `checkout_completed`**

In `apps/web/components/checkout/checkout-flow.tsx`, add the import near the top:

```tsx
import { track } from "@/lib/analytics";
```

`checkout_started` — inside the `CheckoutFlow` component, add a mount-only effect (next to the existing `useEffect` near the top of the component body):

```tsx
  useEffect(() => {
    track("checkout_started");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

`checkout_completed` — find where the order id is read on success. The code reads `const orderId = (result as { type: string; order?: { id: string } })?.order?.id;` and later calls `router.push(`/order/${orderId}`)`. Immediately before that `router.push`, add:

```tsx
      track("checkout_completed", { order_id: orderId });
```

- [ ] **Step 5: Identify customers in `auth-context.tsx`**

In `apps/web/components/auth/auth-context.tsx`, add the import:

```tsx
import { identifyUser, resetUser } from "@/lib/analytics";
```

This file has a `useEffect` that restores the session and `setCustomer(c)`, plus `login`, `register`, and `logout` functions. Make these changes:

1. In the session-restore `useEffect`, the `.then(({ customer: c }) => setCustomer(c as Customer))` becomes:

```tsx
      .then(({ customer: c }) => {
        setCustomer(c as Customer);
        identifyUser((c as Customer).id, { email: (c as Customer).email });
      })
```

2. Wherever `login` sets the customer after a successful sign-in (`setCustomer(...)`), add right after it:

```tsx
    identifyUser(c.id, { email: c.email });
```

(use whatever local variable name holds the customer object at that point).

3. Same for `register` — after it sets the customer, call `identifyUser(c.id, { email: c.email })`.

4. In `logout`, after the customer is cleared (`setCustomer(null)`), add:

```tsx
    resetUser();
```

If the exact customer variable name differs, adapt — the requirement is: identify on login/register/restore, reset on logout.

- [ ] **Step 6: Verify the web app builds**

Run: `cd apps/web && npx next build`
Expected: build completes, exit 0.

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/analytics/track-on-mount.tsx apps/web/app/tea-pets apps/web/components/add-to-tray.tsx apps/web/components/checkout/checkout-flow.tsx apps/web/components/auth/auth-context.tsx
git commit -m "feat(web): product, cart, checkout funnel events"
```

---

## Task 6: Deploy wiring — build args and secrets

**Files:**
- Modify: `apps/web/Dockerfile`
- Modify: `.github/workflows/deploy.yml`
- Modify: `.github/workflows/build-image.yml`

- [ ] **Step 1: Add build args to `apps/web/Dockerfile`**

In `apps/web/Dockerfile`, the builder stage declares several `ARG NEXT_PUBLIC_*` lines and an `ENV` block. Add two new args next to the existing ones:

```dockerfile
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
```

And add them to the `ENV` block (the block that already sets `NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL` etc.):

```dockerfile
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST \
```

- [ ] **Step 2: Pass the build args in `.github/workflows/deploy.yml`**

In `.github/workflows/deploy.yml`, the "Build & push web image" step has a `docker build` with several `--build-arg NEXT_PUBLIC_MEDUSA_* ...` lines. Add two more, before the final `\` and `.`:

```yaml
            --build-arg NEXT_PUBLIC_POSTHOG_KEY='${{ vars.NEXT_PUBLIC_POSTHOG_KEY }}' \
            --build-arg NEXT_PUBLIC_POSTHOG_HOST='${{ vars.NEXT_PUBLIC_POSTHOG_HOST }}' \
```

- [ ] **Step 3: Pass the build args in `.github/workflows/build-image.yml`**

In `.github/workflows/build-image.yml`, the "Build & push web" step has the same `--build-arg NEXT_PUBLIC_MEDUSA_* ...` lines. Add the same two lines there too:

```yaml
            --build-arg NEXT_PUBLIC_POSTHOG_KEY='${{ vars.NEXT_PUBLIC_POSTHOG_KEY }}' \
            --build-arg NEXT_PUBLIC_POSTHOG_HOST='${{ vars.NEXT_PUBLIC_POSTHOG_HOST }}' \
```

- [ ] **Step 4: Set the GitHub repository variables**

```bash
gh variable set NEXT_PUBLIC_POSTHOG_KEY --repo stuartxu2/yixingclay \
  --body "phc_vMNASQ9Caxi6i2pnprwVwVjYfY98pYkEidtHzWzdwLuH"
gh variable set NEXT_PUBLIC_POSTHOG_HOST --repo stuartxu2/yixingclay \
  --body "https://us.i.posthog.com"
```

- [ ] **Step 5: Set the backend Container App secret and env vars**

```bash
cd /Users/stuartxu/Documents/claude_website_building
source .azure-deploy.env
az containerapp secret set -n poet-backend -g "$RG" \
  --secrets "posthog-events-key=phc_vMNASQ9Caxi6i2pnprwVwVjYfY98pYkEidtHzWzdwLuH"
az containerapp update -n poet-backend -g "$RG" \
  --set-env-vars \
    "POSTHOG_EVENTS_API_KEY=secretref:posthog-events-key" \
    "POSTHOG_HOST=https://us.i.posthog.com"
```

Expected: both commands print `Succeeded`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/Dockerfile .github/workflows/deploy.yml .github/workflows/build-image.yml
git commit -m "ci: pass NEXT_PUBLIC_POSTHOG_* build args to the web image"
```

---

## Task 7: Deploy and verify

**Files:** none (deploy + verification only)

- [ ] **Step 1: Push to trigger the pipeline**

```bash
git push origin main
```

- [ ] **Step 2: Watch the deploy pipeline**

```bash
gh run watch "$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
```

Expected: `build`, `migrate`, and `deploy` jobs all succeed.

- [ ] **Step 3: Verify the backend is healthy**

Run: `curl -s -o /dev/null -w '%{http_code}\n' https://api.yixingclay.com/health`
Expected: `200` (confirms the backend booted with the Analytics module — a bad provider config would crash boot).

- [ ] **Step 4: Verify the storefront loads**

Run: `curl -s -o /dev/null -w '%{http_code}\n' https://yixingclay.com/`
Expected: `200`.

- [ ] **Step 5: Verify ingestion is proxied**

Run: `curl -s -o /dev/null -w '%{http_code}\n' https://yixingclay.com/ingest/static/array.js`
Expected: `200` (the reverse proxy forwards to PostHog assets).

- [ ] **Step 6: Manual smoke test in PostHog**

In a browser: open `https://yixingclay.com`, navigate to a tea pet, click "Add to tea tray". Then in the PostHog project's **Activity** view, confirm `$pageview`, `product_viewed`, and `add_to_cart` events arrived.

Optionally place a test order and confirm both `checkout_completed` (frontend) and `order_placed` (backend) appear.

- [ ] **Step 7: Final commit (if any verification fixups were needed)**

If steps 3–6 required no changes, there is nothing to commit — the feature is complete.

---

## Notes for the implementer

- The PostHog key is a *publishable* project key (`phc_`), safe to expose in the client bundle — that is by design.
- If `npx next build` fails because `useSearchParams`/Suspense is mentioned, note this plan deliberately uses `usePathname` only (no `useSearchParams`) to avoid a Suspense boundary requirement.
- If the backend build fails on `Modules.ANALYTICS`, fall back to the string `"analytics"` in `container.resolve()` (see Task 2 Step 2 note).
