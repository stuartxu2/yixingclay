"use client";

import { useEffect } from "react";

/**
 * Mounted once near the root. Watches every `.reveal` element and adds the
 * `.in` class as it scrolls into view, driving the CSS reveal transition.
 * Kept as a single observer rather than per-element wrappers so the section
 * components can stay server-rendered (good for SEO).
 */
export function RevealObserver() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");
    if (!nodes.length) return;

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

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return null;
}
