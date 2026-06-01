"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

/**
 * Cross-fades between hero slides. Both slides are server-rendered and stay in
 * the DOM (stacked in a single CSS-grid cell) so every word remains crawlable
 * for SEO/AEO and the layout never shifts — only opacity changes. Auto-advances
 * on an interval, pauses on hover/focus, and disables autoplay when the visitor
 * prefers reduced motion.
 */
export function HeroRotator({
  children,
  labels,
  interval = 7000,
}: {
  children: React.ReactNode;
  /** Accessible name for each slide, in order. */
  labels: string[];
  interval?: number;
}) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  const go = useCallback(
    (i: number) => setActive(((i % count) + count) % count),
    [count],
  );

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reducedMotion.current) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % count),
      interval,
    );
    return () => window.clearInterval(id);
  }, [count, paused, interval]);

  return (
    <section
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid">
        {slides.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${labels[i] ?? ""}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className={`col-start-1 row-start-1 transition-opacity duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              {slide}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-3 sm:bottom-8">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show slide ${i + 1}: ${labels[i] ?? ""}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-7 bg-ink"
                  : "w-2 bg-ink-faint/40 hover:bg-ink-faint/70"
              }`}
            />
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {`Slide ${active + 1} of ${count}: ${labels[active] ?? ""}`}
      </p>
    </section>
  );
}
