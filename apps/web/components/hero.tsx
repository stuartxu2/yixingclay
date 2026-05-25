import Image from "next/image";
import { Cta } from "./cta";
import { MakerSeal } from "./maker-seal";
import { SITE } from "@/lib/site";

/** Items fade up in sequence on first paint via the `.rise` keyframe. */
function rise(delay: number) {
  return { animationDelay: `${delay}ms` } as const;
}

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        {/* Copy */}
        <div>
          <p className="eyebrow rise" style={rise(60)}>
            Yixing Studio — Est. {SITE.founded}
          </p>
          <h1
            id="hero-title"
            className="rise mt-7 text-[clamp(46px,6.6vw,94px)] font-extralight leading-[1.02] tracking-[-0.022em]"
            style={rise(150)}
          >
            Pots &amp; pets,
            <br />
            <em className="font-normal not-italic text-clay">raised</em> at the
            table.
          </h1>
          <p
            className="rise mt-7 max-w-[28rem] text-[18px] font-light text-ink-soft"
            style={rise(260)}
          >
            PO is the pot you pour from; ET is the pet that watches you do it.
            Both hand-shaped from a single Yixing purple sand clay — both
            arrive unfinished, then years of tea give them their colour.
          </p>
          <div
            className="rise mt-9 flex flex-wrap items-center gap-4"
            style={rise(370)}
          >
            <Cta href="/teapots">The teapots</Cta>
            <Cta href="/tea-pets" variant="ghost">
              The tea pets
            </Cta>
          </div>

          <dl
            className="rise mt-12 flex gap-10 border-t border-ink-faint/30 pt-7"
            style={rise(480)}
          >
            {[
              ["3", "teapot forms"],
              ["18", "tea pets"],
              ["6", "Yixing clays"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="text-[28px] font-extralight tracking-[-0.02em]">
                  {n}
                </dt>
                <dd className="mt-0.5 text-[11.5px] uppercase tracking-[0.1em] text-ink-soft">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Figure — the pot, with its pet */}
        <figure className="rise relative mx-auto w-full max-w-[480px]" style={rise(240)}>
          <div className="blob relative aspect-square overflow-hidden bg-cream shadow-[0_40px_80px_-36px_rgba(28,28,28,0.4)]">
            <Image
              src="/images/teapot2.avif"
              alt="A Zhu Ni cinnabar Xishi teapot by PO/ET"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 480px"
              className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:scale-105"
            />
          </div>

          <MakerSeal className="absolute -right-3 -top-4 h-28 w-28" />

          <figcaption className="absolute -left-5 bottom-10 flex items-center gap-3 rounded-full border border-ink-faint/35 bg-surface/95 py-2 pl-2 pr-5 shadow-[0_16px_30px_-18px_rgba(28,28,28,0.4)] backdrop-blur-sm">
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-cream">
              <Image
                src="/products/wukong/front.avif"
                alt="Wukong — a Yixing clay tea pet by PO/ET"
                fill
                sizes="56px"
                className="object-cover"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-[13.5px] font-medium">
                &hellip; and its pet
              </span>
              <span className="text-[12px] text-ink-faint">悟空 · Wukong</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
