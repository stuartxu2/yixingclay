import Image from "next/image";
import Link from "next/link";
import { Cta } from "./cta";
import { MakerSeal } from "./maker-seal";
import { HeroRotator } from "./hero-rotator";
import { SITE } from "@/lib/site";
import { ARTISTS, TEAPOTS } from "@/lib/teapots";

const ARTIST = ARTISTS["xu-xuefang"];
const SIGNATURE = TEAPOTS.find((t) => t.slug === "s0901") ?? TEAPOTS[0];

/** Items fade up in sequence on first paint via the `.rise` keyframe. */
function rise(delay: number) {
  return { animationDelay: `${delay}ms` } as const;
}

const SHELL =
  "mx-auto grid max-w-[1320px] items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24";

const STATS =
  "rise mt-12 flex gap-10 border-t border-ink-faint/30 pt-7";

/** Slide 1 — the brand: PO the pot, ET the pet. */
function HeroPotsPets() {
  return (
    <div className={SHELL}>
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
          Both hand-shaped from a single Yixing purple sand clay — both arrive
          unfinished, then years of tea give them their colour.
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

        <dl className={STATS} style={rise(480)}>
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
      <figure
        className="rise relative mx-auto w-full max-w-[480px]"
        style={rise(240)}
      >
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
  );
}

/** Slide 2 — the maker: Xu Xuefang and her fine-art teapots. */
function HeroArtist() {
  return (
    <div className={SHELL}>
      {/* Copy */}
      <div>
        <p className="eyebrow rise" style={rise(60)}>
          The Master — {ARTIST.name} {ARTIST.zh}
        </p>
        <h2
          className="rise mt-7 text-[clamp(46px,6.6vw,94px)] font-extralight leading-[1.02] tracking-[-0.022em]"
          style={rise(150)}
        >
          Fine art, from
          <br />
          one <em className="font-normal not-italic text-clay">master&apos;s</em>{" "}
          bench.
        </h2>
        <p
          className="rise mt-7 max-w-[30rem] text-[18px] font-light text-ink-soft"
          style={rise(260)}
        >
          {ARTIST.name} is a Senior Master of Arts &amp; Crafts and a named
          Jiangsu Ceramic Art Celebrity. From strict classical pots to her own
          gold-banded sculptural sets, every piece is paddled by hand from a
          single sheet of Yixing purple-sand clay — and signed with her seal.
        </p>
        <div
          className="rise mt-9 flex flex-wrap items-center gap-4"
          style={rise(370)}
        >
          <Cta href="/artists">Meet the artist</Cta>
          <Cta href={`/teapots/${SIGNATURE.slug}`} variant="ghost">
            Her signature set
          </Cta>
        </div>

        <dl className={STATS} style={rise(480)}>
          {[
            ["8", "national golds"],
            ["1974", "born in Yixing"],
            ["1", "master's seal"],
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

      {/* Figure — the master, with her signature set */}
      <figure
        className="rise relative mx-auto w-full max-w-[480px]"
        style={rise(240)}
      >
        <div className="blob relative aspect-square overflow-hidden bg-cream shadow-[0_40px_80px_-36px_rgba(28,28,28,0.4)]">
          <Image
            src={ARTIST.portraits[0]}
            alt={`${ARTIST.name} (${ARTIST.zh}) shaping a teapot at her Yixing bench`}
            fill
            loading="eager"
            sizes="(max-width: 1024px) 90vw, 480px"
            className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:scale-105"
          />
        </div>

        <MakerSeal className="absolute -right-3 -top-4 h-28 w-28" />

        <Link
          href={`/teapots/${SIGNATURE.slug}`}
          className="absolute -left-5 bottom-10 flex items-center gap-3 rounded-full border border-ink-faint/35 bg-surface/95 py-2 pl-2 pr-5 shadow-[0_16px_30px_-18px_rgba(28,28,28,0.4)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5"
        >
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-cream">
            <Image
              src={SIGNATURE.images[0]}
              alt={`${SIGNATURE.name} — ${SIGNATURE.zh}, a teapot set by ${ARTIST.name}`}
              fill
              sizes="56px"
              className="object-cover"
            />
          </span>
          <span className="leading-tight">
            <span className="block text-[13.5px] font-medium">
              Her signature set
            </span>
            <span className="text-[12px] text-ink-faint">
              {SIGNATURE.zh} · {SIGNATURE.name}
            </span>
          </span>
        </Link>
      </figure>
    </div>
  );
}

export function Hero() {
  return (
    <HeroRotator labels={["Pots & pets", `The artist — ${ARTIST.name}`]}>
      <HeroPotsPets />
      <HeroArtist />
    </HeroRotator>
  );
}
