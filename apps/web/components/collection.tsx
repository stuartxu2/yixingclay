"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type Category, type Product } from "@/lib/products";
import { ProductCard } from "./product-card";

type Filter = Category | "all";
type Sort = "default" | "price-asc" | "price-desc";

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: "default", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

export function CollectionGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("default");

  const visible = useMemo(() => {
    let list =
      filter === "all" ? products : products.filter((p) => p.category === filter);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filter, sort, products]);

  return (
    <div className="mt-12">
      {/* Filters + Sort row */}
      <div className="reveal flex flex-wrap items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Filter tea pets"
          className="flex flex-wrap gap-2.5"
        >
          {CATEGORIES.map((cat) => {
            const active = cat.id === filter;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(cat.id)}
                className={`rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-ink-faint/35 text-ink-soft hover:border-ink-soft hover:text-ink"
                }`}
              >
                {cat.label}
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
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Grid */}
      <div className="reveal mt-10 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3">
        {visible.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <p className="reveal mt-10 text-center text-[13.5px] font-light text-ink-soft">
        Showing {visible.length} of {products.length} sculpted forms — every
        piece one of a kind.
      </p>
    </div>
  );
}
