# PostHog Analytics — Design Spec

**Date:** 2026-05-18
**Status:** Approved
**Scope:** Product analytics for yixingclay.com — frontend behavior tracking + backend commerce events, sent to PostHog Cloud.

## Goal

Give store managers visibility into traffic and the purchase funnel:
where visitors come from, which teapots draw interest, where they drop
off between viewing a product and completing checkout, and reliable
revenue figures. PostHog Cloud (US region, free tier — 1M events/month)
is the analytics backend; its own dashboards are the reporting surface.

## Architecture

Two independent capture layers feeding one PostHog project:

1. **Frontend (`apps/web`)** — `posthog-js` in the Next.js storefront
   captures pageviews and funnel events from the browser. Covers traffic
   and behavior, but is subject to ad-blockers.
2. **Backend (`apps/backend`)** — Medusa's Analytics module with the
   `@medusajs/analytics-posthog` provider emits server-confirmed
   `order_placed` events. Not ad-blockable, so revenue is accurate.

The two layers do not share state. They are correlated in PostHog by the
`distinct_id` (see Data Flow).

## Backend — `apps/backend`

### Analytics module registration

Add to the `modules` array in `medusa-config.ts`:

```ts
{
  resolve: "@medusajs/medusa/analytics",
  options: {
    providers: [
      {
        resolve: "@medusajs/analytics-posthog",
        id: "posthog",
        options: {
          posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
          posthogHost: process.env.POSTHOG_HOST, // e.g. https://us.i.posthog.com
        },
      },
    ],
  },
}
```

`@medusajs/analytics-posthog@2.15.2` is added as a dependency.

### Order event

Medusa core does **not** auto-emit analytics events. The existing
`src/subscribers/order-placed.ts` subscriber is extended: after sending
the confirmation emails, resolve the Analytics module and call:

```ts
analytics.track({
  event: "order_placed",
  actor_id: order.customer_id ?? order.email,
  properties: {
    order_id: order.id,
    display_id: order.display_id,
    total: order.total,
    currency_code: order.currency_code,
    item_count: <sum of item quantities>,
    items: <[{ title, quantity, unit_price }]>,
  },
})
```

The `track()` call is wrapped so an analytics failure never blocks order
processing (same defensive pattern as the email send).

### New backend env vars

| Var | Example | Where |
|-----|---------|-------|
| `POSTHOG_EVENTS_API_KEY` | `phc_…` | Container App secret |
| `POSTHOG_HOST` | `https://us.i.posthog.com` | Container App env var |

Documented in `apps/backend/.env.template`.

## Frontend — `apps/web`

### Dependency

`posthog-js` added to `apps/web`.

### Provider

`components/posthog-provider.tsx` — a client component that initializes
PostHog once on mount:

```ts
posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: "/ingest",            // first-party reverse proxy
  ui_host: NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: false,        // handled manually for App Router
  person_profiles: "identified_only",
})
```

Mounted in `app/layout.tsx` wrapping the app. If `NEXT_PUBLIC_POSTHOG_KEY`
is unset (e.g. local dev), the provider renders children without
initializing — analytics is a no-op, not an error.

### Pageview tracking

Next.js App Router does not emit a navigation event `posthog-js` can
auto-hook. A small client component (inside the provider) uses
`usePathname()` to capture `$pageview` on every route change.

### Funnel events

Wired into existing components — no new pages:

| Event | Location | Key properties |
|-------|----------|----------------|
| `product_viewed` | product detail page | `slug`, `title`, `price` |
| `add_to_cart` | `components/add-to-tray.tsx` | `slug`, `title`, `price` |
| `checkout_started` | `components/checkout/checkout-flow.tsx` (mount) | `item_count`, `cart_total` |
| `checkout_completed` | checkout-flow, on success | `order_id`, `total` |

When a customer logs in (auth-context), call `posthog.identify(customerId)`
so frontend behavior and backend `order_placed` events resolve to the
same person. On logout, `posthog.reset()`.

### Reverse proxy

`next.config.ts` gains `rewrites()` mapping `/ingest/*` to the PostHog
ingestion endpoints (`us.i.posthog.com` / `us-assets.i.posthog.com`).
The browser only ever talks to `yixingclay.com/ingest`, so requests are
first-party and survive ad-blockers.

### New frontend env vars

| Var | Example | Where |
|-----|---------|-------|
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_…` | GitHub Actions variable (build arg) |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | GitHub Actions variable (build arg) |

`NEXT_PUBLIC_*` values are inlined at build time, so they are added as
build args in `apps/web/Dockerfile` and the CI workflows, like the
existing `NEXT_PUBLIC_MEDUSA_*` vars.

## Data flow

```
Browser ──$pageview, product_viewed, add_to_cart, checkout_* ──▶ /ingest ──▶ PostHog
   │                                                                          ▲
   └─ posthog.identify(customerId) on login                                   │
                                                                              │
Medusa order-placed subscriber ── track(order_placed, actor_id=customer) ─────┘
```

Frontend events and the backend `order_placed` event share a
`distinct_id` (the customer id once identified), letting PostHog stitch
the full funnel including server-confirmed revenue.

## Configuration & deployment

1. User creates a PostHog Cloud (US) project, retrieves the `phc_…`
   project API key.
2. Backend: `POSTHOG_EVENTS_API_KEY` set as a `poet-backend` Container
   App secret; `POSTHOG_HOST` as a plain env var.
3. Web: `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` set as
   GitHub Actions repository variables; `apps/web/Dockerfile`,
   `deploy.yml`, and `build-image.yml` pass them as build args.
4. Ships through the existing CI pipeline (push to `main`).

## Testing & verification

- **Backend build** — `medusa build` succeeds with the analytics module.
- **Frontend build** — `next build` succeeds with the provider.
- **Local** — with keys set, loading the storefront and adding an item
  produces `$pageview` / `add_to_cart` events visible in PostHog's
  Activity view.
- **Production** — after deploy: place a test order; confirm both the
  frontend `checkout_completed` and the backend `order_placed` events
  land in PostHog under the same person.
- **Graceful degradation** — with `NEXT_PUBLIC_POSTHOG_KEY` unset, the
  storefront still renders; with `POSTHOG_EVENTS_API_KEY` unset, orders
  still process.

## Out of scope

- Backend `identify` / `customer.created` subscriber — the frontend
  identifies users; the backend only tracks orders.
- Self-hosted PostHog.
- Session replay, feature flags, A/B testing (available in PostHog later
  with no code change beyond config).
- Embedding analytics dashboards inside the Medusa admin.
