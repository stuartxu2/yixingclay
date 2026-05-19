"use client";

import { useMemo, useState } from "react";
import { type Teapot, clayKeys } from "@/lib/teapots";
import { TeapotCard } from "./teapot-card";

type Sort = "default" | "price-asc" | "price-desc";

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: "default", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

/** Filterable, sortable grid of teapots — filtered by Yixing clay body. */
export function TeapotCollection({ teapots }: { teapots: Teapot[] }) {
  const [clay, setClay] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("default");

  const filters = useMemo(() => ["all", ...clayKeys(teapots)], [teapots]);

  const visible = useMemo(() => {
    let list =
      clay === "all" ? teapots : teapots.filter((t) => t.clayKey === clay);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [clay, sort, teapots]);

  return (
    <div className="mt-12">
      <div className="reveal flex flex-wrap items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Filter teapots by clay"
          className="flex flex-wrap gap-2.5"
        >
          {filters.map((id) => {
            const active = id === clay;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setClay(id)}
                className={`rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-ink-faint/35 text-ink-soft hover:border-ink-soft hover:text-ink"
                }`}
              >
                {id === "all" ? "All Clays" : id}
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
            aria-label="Sort teapots"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="reveal mt-10 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3">
        {visible.map((teapot) => (
          <TeapotCard key={teapot.slug} teapot={teapot} />
        ))}
      </div>

      <p className="reveal mt-10 text-center text-[13.5px] font-light text-ink-soft">
        Showing {visible.length} of {teapots.length} teapots — each one thrown
        and fired by hand in the studio.
      </p>
    </div>
  );
}
