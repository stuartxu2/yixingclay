import Image from "next/image";
import { SectionHead } from "./section-head";
import { Cta } from "./cta";
import { TEAPOTS } from "@/lib/teapots";

/** Homepage section for the "pot" half of PO/ET — a teapot showcase. */
export function Teapots() {
  return (
    <section
      id="teapots"
      className="scroll-mt-24 border-t border-ink-faint/20 bg-surface py-24 sm:py-28"
      aria-labelledby="teapots-title"
    >
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10">
        <SectionHead
          id="teapots-title"
          kicker="The Pots"
          title={
            <>
              Pots, for the{" "}
              <em className="font-normal not-italic text-clay">daily pour</em>.
            </>
          }
          note="The other half of PO/ET. Yixing teapots thrown from the same purple sand clay as the tea pets — unglazed, single-walled, made to season with the tea you brew."
        />

        <div className="reveal mt-14 grid gap-6 md:grid-cols-3">
          {TEAPOTS.map((pot) => (
            <article
              key={pot.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-ink-faint/25 bg-cream transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-34px_rgba(28,28,28,0.5)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={pot.image}
                  alt={`${pot.name} — a ${pot.clay} Yixing teapot by PO/ET`}
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-105"
                />
                <span className="absolute left-3.5 top-3.5 rounded-full bg-paper/90 px-3 py-1 text-[11px] font-medium tracking-[0.04em] text-ink-soft">
                  Made to order
                </span>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <h3 className="text-[21px] font-light tracking-[-0.01em]">
                  {pot.name}{" "}
                  <span className="text-ink-faint">{pot.zh}</span>
                </h3>
                <p className="mt-0.5 text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                  {pot.clay}
                </p>
                <p className="mt-4 text-[14.5px] font-light text-ink-soft">
                  {pot.blurb}
                </p>
                <p className="mt-5 border-t border-ink-faint/20 pt-4 text-[12.5px] text-ink-faint">
                  {pot.shape} · {pot.capacity}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="reveal mt-12 flex justify-center">
          <Cta href="/teapots">Explore the teapots</Cta>
        </div>
      </div>
    </section>
  );
}
