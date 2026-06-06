"use client";

import { formatPrice } from "@/lib/price";
import { useAuth } from "./auth/auth-context";

/**
 * Product detail price. Shows the trade price (retail struck through) for a
 * signed-in wholesale customer; the plain retail price for everyone else.
 */
export function ProductPrice({ slug, price }: { slug: string; price: number }) {
  const { priceFor } = useAuth();
  const effective = priceFor(slug, price);
  const isTrade = effective < price;

  return (
    <p className="mt-6 text-[26px] font-light text-clay-deep">
      {isTrade && (
        <span className="mr-2.5 text-[18px] text-ink-faint line-through">
          {formatPrice(price)}
        </span>
      )}
      {formatPrice(effective)}{" "}
      <span className="text-[14px] text-ink-faint">
        USD{isTrade ? " · trade price" : ""}
      </span>
    </p>
  );
}
