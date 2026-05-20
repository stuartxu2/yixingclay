"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Mounted once near the root. Watches every `.reveal` element and adds the
 * `.in` class as it scrolls into view, driving the CSS reveal transition.
 * Kept as a single observer rather than per-element wrappers so the section
 * components can stay server-rendered (good for SEO).
 *
 * Re-runs on pathname change so client-side navigation re-observes the new
 * page's `.reveal` nodes (otherwise they stay opacity:0 until manual reload).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.in)")
        .forEach((n) => io.observe(n));
    };

    observeAll();

    // Catch nodes that mount after navigation (async sections, suspense
    // boundaries, dynamic imports).
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
