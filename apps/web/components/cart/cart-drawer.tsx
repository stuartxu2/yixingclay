"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./cart-context";
import { formatPrice } from "@/lib/price";

export function CartDrawer() {
  const { lines, subtotal, count, open, closeCart, remove, setQuantity } =
    useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, closeCart]);

  // Trap focus / lock scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={`fixed inset-0 z-[400] bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Tea tray"
        className={`fixed inset-y-0 right-0 z-[500] flex w-full max-w-[420px] flex-col bg-surface shadow-[−24px_0_80px_rgba(0,0,0,0.12)] outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-faint/20 px-7 py-5">
          <h2 className="text-[15px] font-medium tracking-wide">
            Your Tea Tray{" "}
            {count > 0 && (
              <span className="ml-1.5 text-[13px] font-normal text-ink-faint">
                ({count})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-cream hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Line items */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-[14px] text-ink-faint">Your tray is empty.</p>
              <button
                type="button"
                onClick={closeCart}
                className="text-[13px] font-medium text-clay underline underline-offset-2 transition-opacity hover:opacity-70"
              >
                Browse the collection →
              </button>
            </div>
          ) : (
            <ul className="space-y-5" role="list">
              {lines.map((line) => {
                const href = line.href ?? `/tea-pets/${line.slug}`;
                const image =
                  line.image ?? `/products/${line.slug}/front.avif`;
                return (
                <li key={line.slug} className="flex gap-4">
                  {/* Product image */}
                  <Link
                    href={href}
                    onClick={closeCart}
                    className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-cream"
                  >
                    <Image
                      src={image}
                      alt={line.name}
                      fill
                      sizes="84px"
                      className="object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-2 py-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={href}
                        onClick={closeCart}
                        className="text-[14px] font-medium leading-snug hover:text-clay transition-colors"
                      >
                        {line.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(line.slug)}
                        aria-label={`Remove ${line.name}`}
                        className="shrink-0 text-[12px] text-ink-faint transition-colors hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-[13px] text-ink-faint">Yixing clay</p>
                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity stepper */}
                      <div className="flex items-center rounded-full border border-ink-faint/40">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(line.slug, line.quantity - 1)
                          }
                          aria-label={`Decrease ${line.name} quantity`}
                          className="grid h-8 w-8 place-items-center text-[16px] text-ink-soft transition-colors hover:text-ink"
                        >
                          −
                        </button>
                        <span
                          aria-live="polite"
                          className="w-7 text-center text-[13px] font-medium tabular-nums"
                        >
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(line.slug, line.quantity + 1)
                          }
                          aria-label={`Increase ${line.name} quantity`}
                          className="grid h-8 w-8 place-items-center text-[16px] text-ink-soft transition-colors hover:text-ink"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[14px] font-medium text-clay-deep">
                        {formatPrice(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — subtotal + checkout CTA */}
        {lines.length > 0 && (
          <div className="border-t border-ink-faint/20 px-7 py-6">
            {/* Free shipping progress */}
            {(() => {
              const FREE_SHIPPING = 15000;
              const remaining = Math.max(0, FREE_SHIPPING - subtotal);
              const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);
              return (
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between text-[12px]">
                    {remaining > 0 ? (
                      <span className="text-ink-faint">
                        Add{" "}
                        <span className="font-medium text-ink">
                          {formatPrice(remaining)}
                        </span>{" "}
                        more for free shipping
                      </span>
                    ) : (
                      <span className="font-medium text-clay">
                        You&apos;ve unlocked free shipping!
                      </span>
                    )}
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-clay transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            <div className="mb-5 flex items-center justify-between text-[14px]">
              <span className="text-ink-faint">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)} USD</span>
            </div>
            <p className="mb-4 text-[12px] text-ink-faint">
              Shipping and tax calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full rounded-full bg-ink px-6 py-4 text-center text-[14px] font-medium text-paper transition-opacity hover:opacity-85"
            >
              Proceed to Checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="mt-3 block w-full text-center text-[13px] text-ink-faint transition-colors hover:text-ink"
            >
              Continue browsing
            </button>
          </div>
        )}
      </div>
    </>
  );
}
