import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

type Params = { params: Promise<{ id: string }> };

export default async function OrderPage({ params }: Params) {
  const { id } = await params;
  // Display ID is the human-readable order number (e.g. "1"); the route ID is
  // the internal UUID. We show both so the customer can reference either.
  const displayId = id.startsWith("order_") ? null : id;
  const shortId = id.replace("order_", "").slice(0, 8).toUpperCase();

  return (
    <>
      <main className="mx-auto flex max-w-[680px] flex-col items-center px-6 py-20 text-center sm:px-10 sm:py-28">
        {/* Confirmation mark */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-jade/30">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l5 5L19 7" stroke="#3a7a54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <p className="eyebrow mb-3">Order confirmed</p>
        <h1 className="text-[clamp(30px,4vw,48px)] font-extralight leading-tight tracking-[-0.02em]">
          Thank you for your order.
        </h1>
        <p className="mt-4 max-w-[42ch] text-[15px] font-light text-ink-soft">
          A confirmation email is on its way. Your tea pet will be carefully packed
          and shipped within 3–5 business days.
        </p>

        {/* Order reference */}
        <div className="mt-8 w-full max-w-sm rounded-2xl border border-ink-faint/20 bg-cream/60 px-7 py-6 text-left">
          <p className="text-[12.5px] font-medium uppercase tracking-widest text-ink-faint">
            Order reference
          </p>
          <p className="mt-2 font-mono text-[22px] font-medium tracking-widest text-ink">
            #{shortId}
          </p>
          {displayId && (
            <p className="mt-1 text-[13px] text-ink-faint">ID: {id}</p>
          )}
        </div>

        {/* Seasoning note */}
        <div className="mt-8 max-w-[44ch] rounded-2xl border border-ink-faint/15 bg-cream/40 px-7 py-6 text-[13.5px] font-light text-ink-soft">
          <span className="font-medium text-ink">While you wait —</span>{" "}
          prepare a small tea tray and choose which tea you will dedicate to your
          new pet. The first session sets the tone of the patina it will develop
          over years of use.
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/tea-pets"
            className="rounded-full border border-ink-faint/40 px-7 py-3.5 text-[14px] font-medium transition-colors hover:border-ink hover:text-clay"
          >
            Browse more tea pets
          </Link>
          <Link
            href="/"
            className="rounded-full bg-ink px-7 py-3.5 text-[14px] font-medium text-paper transition-opacity hover:opacity-85"
          >
            Return home
          </Link>
        </div>
      </main>
    </>
  );
}
