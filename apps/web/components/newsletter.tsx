"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: wire to email provider (Klaviyo / ConvertKit) via API route
    setSubmitted(true);
  }

  return (
    <section
      className="reveal border-t border-ink-faint/20 bg-cream py-20"
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto max-w-[640px] px-6 text-center">
        <p className="eyebrow">Stay close</p>
        <h2
          id="newsletter-heading"
          className="mt-4 text-[clamp(26px,3.5vw,40px)] font-extralight tracking-[-0.02em]"
        >
          News from the{" "}
          <em className="font-normal not-italic text-clay">studio</em>.
        </h2>
        <p className="mt-4 text-[15px] font-light text-ink-soft">
          New characters, seasonal drops, and notes on the art of tea.
          No noise — just clay.
        </p>

        {submitted ? (
          <p className="mt-10 text-[15px] font-medium text-clay">
            Thank you — we&apos;ll be in touch.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-9 flex max-w-[420px] gap-3"
            aria-label="Newsletter signup"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="min-w-0 flex-1 rounded-full border border-ink-faint/35 bg-paper px-5 py-3 text-[14px] outline-none transition-colors focus:border-ink-soft"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-paper transition-opacity hover:opacity-85"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
