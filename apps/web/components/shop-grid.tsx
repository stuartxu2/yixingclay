"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import type { Teapot } from "@/lib/teapots";
import { ProductCard } from "./product-card";
import { TeapotCard } from "./teapot-card";

type Filter = "all" | "pots" | "pets";
type Sort = "default" | "price-asc" | "price-desc";

type Entry =
  | { kind: "pot"; price: number; teapot: Teapot }
  | { kind: "pet"; price: number; product: Product };

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "pots", label: "The Pots" },
  { id: "pets", label: "The Pets" },
];

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: "default", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

/** The combined storefront grid — teapots and tea pets in one place. */
export function ShopGrid({
  products,
  teapots,
}: {
  products: Product[];
  teapots: Teapot[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("default");

  const pots: Entry[] = useMemo(
    () => teapots.map((t) => ({ kind: "pot" as const, price: t.price, teapot: t })),
    [teapots],
  );
  const pets: Entry[] = useMemo(
    () =>
      products.map((p) => ({ kind: "pet" as const, price: p.price, product: p })),
    [products],
  );

  const visible = useMemo(() => {
    let list: Entry[] =
      filter === "pots" ? pots : filter === "pets" ? pets : [...pots, ...pets];
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc")
      list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filter, sort, pots, pets]);

  return (
    <div className="mt-12">
      <div className="reveal flex flex-wrap items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Filter the catalogue"
          className="flex flex-wrap gap-2.5"
        >
          {FILTERS.map(({ id, label }) => {
            const active = id === filter;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(id)}
                className={`rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-ink-faint/35 text-ink-soft hover:border-ink-soft hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-[13px] text-ink-faint">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-ink-faint/35 bg-transparent px-4 py-2 text-[13px] text-ink outline-none transition-colors hover:border-ink-soft"
            aria-label="Sort the catalogue"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/*
        No `reveal` on this grid: with 40+ cards it is taller than ~8× the
        viewport, so it could never reach the observer's 12% intersection
        threshold and would stay hidden. The grid renders immediately instead.
      */}
      <div className="mt-10 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3">
        {visible.map((entry) =>
          entry.kind === "pot" ? (
            <TeapotCard key={`pot-${entry.teapot.slug}`} teapot={entry.teapot} />
          ) : (
            <ProductCard key={`pet-${entry.product.slug}`} product={entry.product} />
          ),
        )}
      </div>

      <p className="reveal mt-10 text-center text-[13.5px] font-light text-ink-soft">
        Showing {visible.length} pieces — {pots.length} teapots and {pets.length}{" "}
        tea pets, every one shaped by hand.
      </p>
    </div>
  );
}
