"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryShot } from "@/lib/products";

/** Detail-page gallery: a large active frame plus a thumbnail rail. */
export function ProductGallery({
  shots,
  productName,
}: {
  shots: GalleryShot[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const current = shots[active];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
        <Image
          key={current.src}
          src={current.src}
          alt={`${productName} — ${current.label.toLowerCase()}`}
          fill
          priority
          sizes="(max-width: 1024px) 92vw, 620px"
          className="object-cover"
        />
        <span className="absolute bottom-3.5 left-3.5 rounded-full bg-surface/90 px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          {current.label}
        </span>
      </div>

      <ul className="grid grid-cols-7 gap-2">
        {shots.map((shot, i) => (
          <li key={shot.src}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View ${shot.label.toLowerCase()}`}
              aria-current={i === active}
              className={`relative block aspect-square w-full overflow-hidden rounded-lg bg-cream ring-1 transition-all ${
                i === active
                  ? "ring-2 ring-clay"
                  : "ring-ink-faint/25 hover:ring-ink-soft"
              }`}
            >
              <Image
                src={shot.src}
                alt=""
                fill
                sizes="90px"
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
