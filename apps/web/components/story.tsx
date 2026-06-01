import Image from "next/image";

/** The maker — a quote-led story block with a seasoning badge. */
export function Story() {
  return (
    <section
      id="story"
      className="scroll-mt-24 py-24 sm:py-28"
      aria-labelledby="story-title"
    >
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="reveal relative mx-auto w-full max-w-[420px]">
          <Image
            src="/images/getty_pots.avif"
            alt="Finished Yixing clay teapots resting in the PO/ET studio"
            width={840}
            height={1050}
            sizes="(max-width: 1024px) 90vw, 420px"
            className="aspect-[4/5] rounded-2xl object-cover"
          />
          <div className="absolute -right-5 top-8 grid h-32 w-32 place-items-center rounded-full bg-clay text-center text-[12px] font-medium leading-snug text-paper shadow-[0_22px_38px_-22px_rgba(28,28,28,0.7)]">
            Seasons
            <br />
            with your
            <br />
            tea
          </div>
        </div>

        <div className="reveal">
          <p className="eyebrow">The Maker</p>
          <blockquote
            id="story-title"
            className="mt-6 text-[clamp(26px,3vw,40px)] font-extralight leading-[1.3] tracking-[-0.015em]"
          >
            &ldquo;From one clay I make two things — the pot you pour from, and
            the pet that sits and watches. Both leave my hands{" "}
            <em className="font-normal not-italic text-clay">
              half-made
            </em>{" "}
            — the rest is years of your tea.&rdquo;
          </blockquote>
          <p className="mt-7 text-[14px] font-medium tracking-[0.04em]">
            Xu Xuefang 许学芳
            <span className="mt-1 block text-[13px] font-light tracking-normal text-ink-faint">
              Senior Master of Arts &amp; Crafts, Yixing
            </span>
          </p>

          <dl className="mt-10 flex flex-wrap gap-10 border-t border-ink-faint/30 pt-8">
            {[
              ["500+", "years of the craft"],
              ["100%", "hand-sculpted"],
              ["40+", "countries shipped"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="text-[40px] font-extralight tracking-[-0.02em]">
                  {n}
                </dt>
                <dd className="text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
