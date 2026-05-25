"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NAV } from "@/lib/site";
import { Wordmark } from "./wordmark";
import { useCart } from "./cart/cart-context";
import { useAuth } from "./auth/auth-context";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart } = useCart();
  const { customer } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-500 ${
        scrolled
          ? "border-b border-ink-faint/30 bg-paper/95"
          : "border-b border-transparent bg-paper/80"
      }`}
    >
      <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-6 sm:px-10">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3" aria-label="PO/ET home">
          <Image
            src="/brand/logo.avif"
            alt=""
            width={42}
            height={42}
            className="rounded-full"
            priority
          />
          <Wordmark className="text-[22px] font-medium tracking-[0.16em]" />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex gap-5 xl:gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group relative py-1.5 text-[13px] font-medium tracking-[0.04em] text-ink-soft transition-colors hover:text-ink"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-clay transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {/* Account link */}
          <Link
            href="/account"
            className="hidden items-center gap-1.5 rounded-full border border-ink-faint/40 px-4 py-2 text-[13.5px] font-medium transition-colors hover:border-ink-soft hover:bg-cream sm:flex"
            aria-label={customer ? "Your account" : "Sign in"}
          >
            <AccountIcon />
            <span className="hidden sm:inline">
              {customer ? (customer.first_name ?? "Account") : "Sign in"}
            </span>
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 rounded-full border border-ink-faint/40 px-4 py-2 text-[13.5px] font-medium transition-colors hover:border-ink-soft hover:bg-cream"
            aria-label={`Tea tray, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <CartIcon />
            <span className="hidden sm:inline">Tray</span>
            <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-clay px-1 text-[11px] font-semibold text-paper">
              {count}
            </span>
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-[5px] p-1.5 lg:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`h-[1.6px] w-[22px] bg-ink transition-transform duration-300 ${
                menuOpen ? "translate-y-[6.6px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1.6px] w-[22px] bg-ink transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-[1.6px] w-[22px] bg-ink transition-transform duration-300 ${
                menuOpen ? "-translate-y-[6.6px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <nav
          aria-label="Mobile"
          className="border-t border-ink-faint/25 bg-paper px-6 py-5 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2.5 text-[15px] font-medium text-ink-soft transition-colors hover:text-clay"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-ink-faint/20 pt-2 mt-1">
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-[15px] font-medium text-ink-soft transition-colors hover:text-clay"
              >
                {customer ? (customer.first_name ?? "Account") : "Sign in"}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function AccountIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 5h2l2.4 11.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.78L21 8H6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17.5" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}
