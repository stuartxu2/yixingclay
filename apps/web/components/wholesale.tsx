"use client";

import { useState } from "react";

/** Wholesale / B2B invitation with an email capture (client-validated). */
export function Wholesale() {
  const [done, setDone] = useState(false);

  return (
    <section
      id="wholesale"
      className="scroll-mt-24 py-20 sm:py-24"
      aria-labelledby="wholesale-title"
    >
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10">
        <div className="relative grid items-center gap-12 overflow-hidden rounded-3xl bg-ink px-7 py-16 text-paper sm:px-12 lg:grid-cols-[1fr_0.9fr] lg:px-16 lg:py-20">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-6 select-none text-[200px] font-extralight tracking-[-0.03em] text-paper/[0.04]"
          >
            PO/ET
          </span>

          <div className="relative">
            <p className="eyebrow text-clay-soft before:bg-clay-soft">
              Wholesale &amp; Trade
            </p>
            <h2
              id="wholesale-title"
              className="mt-6 text-[clamp(30px,3.4vw,46px)] font-extralight leading-[1.1] tracking-[-0.02em]"
            >
              Stock PO/ET in your{" "}
              <em className="font-normal not-italic text-clay-soft">
                tea room
              </em>
              .
            </h2>
            <p className="mt-4 max-w-[25rem] text-[15px] font-light text-paper/65">
              Tea shops and distributors in 40+ countries carry our pets. Open a
              trade account for tiered pricing, and join the list for new
              releases first.
            </p>
          </div>

          <div className="relative">
            {done ? (
              <p className="rounded-2xl border border-paper/20 bg-paper/5 px-6 py-7 text-[15px] font-light text-paper/85">
                Thank you — we&rsquo;ll be in touch from{" "}
                <span className="text-clay-soft">the studio</span> shortly.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDone(true);
                }}
                noValidate
              >
                <label
                  htmlFor="trade-email"
                  className="text-[12px] uppercase tracking-[0.12em] text-paper/55"
                >
                  Email address
                </label>
                <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    id="trade-email"
                    type="email"
                    required
                    placeholder="you@teahouse.com"
                    className="flex-1 rounded-full bg-paper px-5 py-3.5 text-[14.5px] text-ink outline-none placeholder:text-ink-faint focus:ring-2 focus:ring-clay-soft"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-clay px-7 py-3.5 text-[14px] font-medium text-paper transition-colors hover:bg-clay-deep"
                  >
                    Enquire
                  </button>
                </div>
                <p className="mt-3 text-[12px] font-light text-paper/45">
                  Trade enquiries and the slow list. No noise, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
