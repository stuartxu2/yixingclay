import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TeapotCard } from "@/components/teapot-card";
import { breadcrumbSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { ARTISTS, TEAPOTS, getTeapot } from "@/lib/teapots";
import { fetchTeapots } from "@/lib/medusa";

export const revalidate = 3600;

const ARTIST = ARTISTS["xu-xuefang"];

export const metadata: Metadata = {
  title: "The Artist — Xu Xuefang 许学芳",
  description:
    "Xu Xuefang (许学芳) is a Senior Master of Arts & Crafts and a named Jiangsu Ceramic Art Celebrity, working Yixing purple-sand clay since 1974. Her bench runs from classical bi-disc and bridge-handle pots to her own gold-banded sculptural sets.",
  alternates: { canonical: "/artists" },
  openGraph: {
    type: "website",
    title: `The Artist · ${SITE.name}`,
    description:
      "Xu Xuefang (许学芳), Senior Master of Arts & Crafts — every PO/ET teapot leaves her bench in Yixing.",
    url: `${SITE.url}/artists`,
    images: [{ url: "/artists/xu-xuefang/portrait-1.avif" }],
  },
};

const trail = [
  { name: "Home", path: "/" },
  { name: "The Artist", path: "/artists" },
];

export default async function ArtistsPage() {
  const live = await fetchTeapots();
  const teapots = live.length > 0 ? live : TEAPOTS;

  const works = teapots.filter((t) => t.artist === ARTIST.key);
  const signature = getTeapot(teapots, "s0901");
  const grid = works.filter((t) => t.slug !== signature?.slug).slice(0, 8);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: ARTIST.name,
    alternateName: ARTIST.zh,
    jobTitle: ARTIST.title,
    description: ARTIST.bio.join(" "),
    award: ARTIST.awards,
    nationality: "Chinese",
    homeLocation: { "@type": "Place", name: "Yixing, Jiangsu, China" },
    worksFor: { "@id": `${SITE.url}/#organization` },
    image: `${SITE.url}${ARTIST.portraits[0]}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />

      <SiteHeader />

      <main
        id="main-content"
        className="mx-auto max-w-[1320px] px-6 py-10 sm:px-10 sm:py-14"
      >
        <Breadcrumbs trail={trail} />

        {/* Hero */}
        <section className="mt-9" aria-labelledby="artist-hero">
          <p className="eyebrow">The Master</p>
          <h1
            id="artist-hero"
            className="mt-5 max-w-[16ch] text-[clamp(38px,5.4vw,72px)] font-extralight leading-[1.04] tracking-[-0.022em]"
          >
            One master, one{" "}
            <em className="font-normal not-italic text-clay">bench</em>.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[17px] font-light text-ink-soft">
            Every PO/ET teapot is paddled by hand from a flat sheet of Yixing
            purple-sand clay and signed with a single seal — that of Xu Xuefang,
            a Senior Master of Arts &amp; Crafts who has worked the clay of her
            home city since 1974.
          </p>
        </section>

        {/* Profile */}
        <section className="mt-20" aria-labelledby="artist-name">
          <article className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
              <Image
                src={ARTIST.portraits[0]}
                alt={`${ARTIST.name} carving a teapot at her bench`}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 620px"
                className="object-cover"
              />
              <div className="absolute bottom-5 left-5 rounded-full bg-paper/92 px-4 py-2 text-[12px] font-medium tracking-[0.04em] text-ink-soft backdrop-blur-sm">
                {ARTIST.signature}
              </div>
            </div>

            <div>
              <p className="eyebrow">{ARTIST.title}</p>
              <h2
                id="artist-name"
                className="mt-4 text-[clamp(30px,3.6vw,46px)] font-extralight tracking-[-0.02em]"
              >
                {ARTIST.name}{" "}
                <span className="text-ink-faint">{ARTIST.zh}</span>
              </h2>
              <p className="mt-2 text-[13.5px] italic text-ink-faint">
                {ARTIST.pinyin}
              </p>
              <div className="mt-6 space-y-4 text-[15px] font-light text-ink-soft">
                {ARTIST.bio.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
              <p className="mt-7 border-t border-ink-faint/25 pt-5 text-[13px] uppercase tracking-[0.1em] text-ink-faint">
                {works.length} teapots in the collection
              </p>
            </div>
          </article>

          {/* Portrait strip — at the bench */}
          <div className="mt-12 grid grid-cols-3 gap-3.5 sm:gap-5">
            {ARTIST.portraits.slice(1).map((src, i) => (
              <div
                key={src}
                className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream"
              >
                <Image
                  src={src}
                  alt={`${ARTIST.name} at work, ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 30vw, 400px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Selected awards */}
        <section className="mt-24" aria-labelledby="awards">
          <p className="eyebrow">2012 – 2024</p>
          <h2
            id="awards"
            className="mt-4 max-w-[20ch] text-[clamp(26px,3.2vw,40px)] font-extralight tracking-[-0.02em]"
          >
            Gold at the country&apos;s leading{" "}
            <em className="font-normal not-italic text-clay">exhibitions</em>.
          </h2>
          <ul className="mt-8 divide-y divide-ink-faint/20 border-y border-ink-faint/20">
            {ARTIST.awards.map((award) => (
              <li
                key={award}
                className="py-4 text-[15px] font-light text-ink-soft"
              >
                {award}
              </li>
            ))}
          </ul>
        </section>

        {/* Signature work */}
        {signature && (
          <section className="mt-24" aria-labelledby="signature-work">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Link
                href={`/teapots/${signature.slug}`}
                className="group relative block aspect-square overflow-hidden rounded-2xl bg-cream lg:order-2"
              >
                <Image
                  src={signature.images[0]}
                  alt={`${signature.name} — ${signature.zh}`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 620px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </Link>
              <div>
                <p className="eyebrow">The signature piece</p>
                <h2
                  id="signature-work"
                  className="mt-4 text-[clamp(28px,3.4vw,44px)] font-extralight tracking-[-0.02em]"
                >
                  {signature.name}{" "}
                  <span className="text-ink-faint">{signature.zh}</span>
                </h2>
                <p className="mt-5 max-w-[46ch] text-[15px] font-light text-ink-soft">
                  {signature.blurb}
                </p>
                <Link
                  href={`/teapots/${signature.slug}`}
                  className="mt-7 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.1em] text-clay hover:underline"
                >
                  View the set →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Her teapots */}
        <section className="mt-24" aria-labelledby="her-work">
          <div className="flex items-end justify-between gap-6">
            <h2
              id="her-work"
              className="text-[clamp(24px,3vw,38px)] font-extralight tracking-[-0.02em]"
            >
              From her bench
            </h2>
            <Link
              href="/shop"
              className="shrink-0 text-[13px] uppercase tracking-[0.1em] text-clay hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
            {grid.map((t) => (
              <TeapotCard key={t.slug} teapot={t} />
            ))}
          </div>
        </section>

        {/* The studio note */}
        <section className="mt-24 rounded-2xl bg-ink px-8 py-16 text-center sm:px-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/55">
            Yixing, Jiangsu
          </p>
          <h2 className="mx-auto mt-5 max-w-[22ch] text-[clamp(26px,3.4vw,42px)] font-extralight leading-[1.1] tracking-[-0.02em] text-paper">
            One pair of hands, from the raw clay to the seal.
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-[15px] font-light text-paper/65">
            Xu Xuefang trained under the Chinese Arts &amp; Crafts Master Wu Ming
            and fires in her own studio in Yixing — the source town for every pot
            in this catalogue. Nothing here is cast, glazed, or finished by
            another hand.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
