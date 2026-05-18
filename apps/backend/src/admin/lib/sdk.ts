import Medusa from "@medusajs/js-sdk"

/**
 * Admin JS SDK instance for use inside admin extensions (widgets, routes).
 *
 * The admin SPA and the Medusa API are served from the same origin, so a
 * relative `baseUrl` is enough, and `session` auth reuses the dashboard's
 * existing login cookie.
 */
export const sdk = new Medusa({
  baseUrl: "/",
  auth: { type: "session" },
})
