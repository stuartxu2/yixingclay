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
