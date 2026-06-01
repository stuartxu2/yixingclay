import type { ReactNode } from "react";

/** Shared section masthead: kicker, headline, and an optional side note. */
export function SectionHead({
  kicker,
  title,
  note,
  id,
  tone = "light",
  as: Heading = "h2",
}: {
  kicker: string;
  title: ReactNode;
  note?: ReactNode;
  id?: string;
  tone?: "light" | "dark";
  /** Heading level — defaults to h2; pass "h1" when this is the page title. */
  as?: "h1" | "h2";
}) {
  return (
    <div className="reveal flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">{kicker}</p>
        <Heading
          id={id}
          className={`mt-5 max-w-[12ch] text-[clamp(34px,4.4vw,56px)] font-extralight leading-[1.06] tracking-[-0.02em] ${
            tone === "dark" ? "text-paper" : ""
          }`}
        >
          {title}
        </Heading>
      </div>
      {note && (
        <p
          className={`max-w-[22rem] text-[15px] font-light ${
            tone === "dark" ? "text-paper/65" : "text-ink-soft"
          }`}
        >
          {note}
        </p>
      )}
    </div>
  );
}
