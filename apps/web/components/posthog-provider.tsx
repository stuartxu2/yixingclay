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
