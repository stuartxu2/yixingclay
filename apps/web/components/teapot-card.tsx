"use client";

import Image from "next/image";
import Link from "next/link";
import { ARTISTS, type Teapot, teapotAlt, teapotHero } from "@/lib/teapots";
import { formatPrice } from "@/lib/price";
import { useCart } from "./cart/cart-context";
import { useAuth } from "./auth/auth-context";

/** Product card for a single teapot — the "pot" half of the catalogue. */
export function TeapotCard({ teapot }: { teapot: Teapot }) {
  const { add } = useCart();
  const { priceFor } = useAuth();
  const href = `/teapots/${teapot.slug}`;

  // Trade price for a signed-in wholesale customer, else the retail price.
  const price = priceFor(teapot.slug, teapot.price);
  const isTrade = price < teapot.price;
  const soldOut = teapot.stock <= 0;
  const lowStock = teapot.stock > 0 && teapot.stock <= 3;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-faint/20 bg-surface transition-all duration-500 hover:-translate-y-1.5 hover:border-ink-faint/40 hover:shadow-[0_34px_56px_-38px_rgba(28,28,28,0.55)]">
      <div className="relative aspect-square overflow-hidden bg-cream">
        <Link
          href={href}
          aria-label={teapot.name}
          className={`absolute inset-0 z-[1] block ${soldOut ? "opacity-50" : ""}`}
        >
          <Image
            src={teapotHero(teapot)}
            alt={`${teapot.name} — a ${teapot.clayKey} Yixing teapot`}
            fill
            sizes="(max-width: 680px) 50vw, (max-width: 1080px) 33vw, 420px"
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-105"
          />
          <Image
            src={teapotAlt(teapot)}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 680px) 50vw, (max-width: 1080px) 33vw, 420px"
            className="scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </Link>

        <span className="pointer-events-none absolute left-3.5 top-3.5 z-[2] rounded-full border border-ink-faint/30 bg-surface/90 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-clay">
          {teapot.clayKey}
        </span>

        {lowStock && (
          <span className="pointer-events-none absolute right-3.5 top-3.5 z-[2] rounded-full bg-clay/95 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-paper">
            Only {teapot.stock} left
          </span>
        )}

        {soldOut ? (
          <span className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/90 px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper">
            Sold
          </span>
        ) : (
          <button
            type="button"
            onClick={() =>
              add({
                slug: teapot.slug,
                name: teapot.name,
                price,
                image: teapotHero(teapot),
                href,
              })
            }
            className="absolute inset-x-3.5 bottom-3.5 z-[2] translate-y-3 rounded-xl bg-ink py-3 text-[13px] font-medium text-paper opacity-0 transition-all duration-300 hover:bg-clay group-hover:translate-y-0 group-hover:opacity-100"
          >
            Add to tea tray — {formatPrice(price)}
          </button>
        )}
      </div>

      <Link href={href} className="flex flex-1 flex-col gap-1.5 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[17px] font-medium leading-snug tracking-[-0.01em]">
            {teapot.name}
          </h3>
          {isTrade ? (
            <span className="whitespace-nowrap text-[15px]">
              <span className="text-[12.5px] text-ink-faint line-through">
                {formatPrice(teapot.price)}
              </span>{" "}
              <span className="text-clay-deep">{formatPrice(price)}</span>
            </span>
          ) : (
            <span className="whitespace-nowrap text-[15px] text-clay-deep">
              {formatPrice(teapot.price)}
            </span>
          )}
        </div>
        <p className="text-[13.5px] font-light italic text-ink-soft">
          {teapot.poem}
        </p>
        <p className="mt-auto pt-3 text-[11px] uppercase tracking-[0.07em] text-ink-faint">
          {teapot.zh} · {teapot.capacity} ml · {ARTISTS[teapot.artist].name}
        </p>
      </Link>
    </article>
  );
}
