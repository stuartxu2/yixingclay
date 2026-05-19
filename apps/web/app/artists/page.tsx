import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { TeapotCard } from "@/components/teapot-card";
import { breadcrumbSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { ARTISTS, TEAPOTS, getTeapot, type ArtistKey } from "@/lib/teapots";
import { fetchTeapots } from "@/lib/medusa";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Artists",
  description:
    "Meet the two hands behind PO/ET — Yao Yun, who throws the round classical Yixing forms, and Yi Fou, who carves the botanical and figural teapots. Every pot signed by its maker.",
  alternates: { canonical: "/artists" },
  openGraph: {
    type: "website",
    title: `The Artists · ${SITE.name}`,
    description:
      "The two potters of the PO/ET studio in Yixing — their work, their hands, their seals.",
    url: `${SITE.url}/artists`,
  },
};

const trail = [
  { name: "Home", path: "/" },
  { name: "The Artists", path: "/artists" },
];

const ORDER: ArtistKey[] = ["yao-yun", "yi-fou"];

export default async function ArtistsPage() {
  const live = await fetchTeapots();
  const teapots = live.length > 0 ? live : TEAPOTS;

  const peopleSchema = ORDER.map((key) => {
    const a = ARTISTS[key];
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name: a.name,
      alternateName: a.zh,
      jobTitle: a.title,
      description: a.bio.join(" "),
      worksFor: { "@id": `${SITE.url}/#organization` },
    };
  });

  return (
    <>
      {peopleSchema.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
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
        <section className="mt-9" aria-labelledby="artists-hero">
          <p className="eyebrow">The Makers</p>
          <h1
            id="artists-hero"
            className="mt-5 max-w-[15ch] text-[clamp(38px,5.4vw,72px)] font-extralight leading-[1.04] tracking-[-0.022em]"
          >
            Two hands, one{" "}
            <em className="font-normal not-italic text-clay">studio</em>.
          </h1>
          <p className="mt-6 max-w-[50ch] text-[17px] font-light text-ink-soft">
            Every PO/ET teapot leaves the bench of one of two potters. Each
            works the clay a different way — one to the round classical forms,
            one to the botanical and figural — and each signs the underside of
            their pots with their own seal.
          </p>
        </section>

        {/* Artist profiles */}
        <div className="mt-20 flex flex-col gap-24">
          {ORDER.map((key, i) => {
            const artist = ARTISTS[key];
            const portrait = getTeapot(teapots, artist.portrait);
            const works = teapots.filter((t) => t.artist === key);
            return (
              <section
                key={key}
                className="reveal"
                aria-labelledby={`artist-${key}`}
              >
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div
                    className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream ${
                      i % 2 === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    {portrait && (
                      <Image
                        src={portrait.images[0]}
                        alt={`A teapot thrown by ${artist.name}`}
                        fill
                        sizes="(max-width: 1024px) 90vw, 620px"
                        className="object-cover"
                      />
                    )}
                    <div className="absolute bottom-5 left-5 rounded-full bg-paper/92 px-4 py-2 text-[12px] font-medium tracking-[0.04em] text-ink-soft backdrop-blur-sm">
                      {artist.signature}
                    </div>
                  </div>

                  <div>
                    <p className="eyebrow">{artist.title}</p>
                    <h2
                      id={`artist-${key}`}
                      className="mt-4 text-[clamp(30px,3.6vw,46px)] font-extralight tracking-[-0.02em]"
                    >
                      {artist.name}{" "}
                      <span className="text-ink-faint">{artist.zh}</span>
                    </h2>
                    <p className="mt-2 text-[13.5px] italic text-ink-faint">
                      {artist.pinyin}
                    </p>
                    <div className="mt-6 space-y-4 text-[15px] font-light text-ink-soft">
                      {artist.bio.map((para) => (
                        <p key={para}>{para}</p>
                      ))}
                    </div>
                    <p className="mt-7 border-t border-ink-faint/25 pt-5 text-[13px] uppercase tracking-[0.1em] text-ink-faint">
                      {works.length} teapots in the collection
                    </p>
                  </div>
                </div>

                {/* The artist's teapots */}
                <div className="mt-12 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
                  {works.slice(0, 4).map((t) => (
                    <TeapotCard key={t.slug} teapot={t} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* The studio note */}
        <section className="mt-24 rounded-2xl bg-ink px-8 py-16 text-center sm:px-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/55">
            Since 1983
          </p>
          <h2 className="mx-auto mt-5 max-w-[20ch] text-[clamp(26px,3.4vw,42px)] font-extralight leading-[1.1] tracking-[-0.02em] text-paper">
            Both potters work under one roof, and one founder.
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-[15px] font-light text-paper/65">
            The PO/ET studio was founded by the sculptor Dou Lu in Yixing in
            1983. Yao Yun and Yi Fou both trained at his bench, and both still
            fire in his kiln.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
