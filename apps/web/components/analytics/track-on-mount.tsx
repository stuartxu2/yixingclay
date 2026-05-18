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
