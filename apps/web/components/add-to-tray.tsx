"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/products";
import { useCart } from "./cart/cart-context";
import { useAuth } from "./auth/auth-context";

/** Quantity stepper + add-to-tray action for the product detail page. */
export function AddToTray({
  slug,
  name,
  price,
  soldOut,
}: {
  slug: string;
  name: string;
  price: number;
  soldOut?: boolean;
}) {
  const { add } = useCart();
  const { priceFor } = useAuth();
  const [qty, setQty] = useState(1);

  // Trade price for a signed-in wholesale customer, else the retail price.
  const unit = priceFor(slug, price);

  // A one-of-a-kind piece that has sold can no longer be added to a tray.
  if (soldOut) {
    return (
      <div className="rounded-full border border-ink-faint/40 bg-cream px-7 py-4 text-center text-[14px] font-medium text-ink-soft">
        Sold — this piece has found its home.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-full border border-ink-faint/40">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
          className="grid h-12 w-11 place-items-center text-[18px] text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
          disabled={qty === 1}
        >
          −
        </button>
        <span
          aria-live="polite"
          className="w-8 text-center text-[15px] font-medium tabular-nums"
        >
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(9, q + 1))}
          aria-label="Increase quantity"
          className="grid h-12 w-11 place-items-center text-[18px] text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
          disabled={qty === 9}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => add({ slug, name, price: unit }, qty)}
        className="group inline-flex flex-1 items-center justify-center gap-2.5 rounded-full bg-ink px-8 py-4 text-[14px] font-medium text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-clay"
      >
        Add to tea tray
        <span className="text-paper/60 transition-colors group-hover:text-paper/85">
          {formatPrice(unit * qty)}
        </span>
      </button>
    </div>
  );
}
