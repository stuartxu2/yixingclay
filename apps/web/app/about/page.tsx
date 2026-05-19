import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { Cta } from "@/components/cta";
import { breadcrumbSchema, organizationSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About PO/ET",
  description:
    "PO/ET is a Yixing clay studio founded in 1983 — PO for the pot you pour from, ET for the pet that watches. One purple sand clay, shaped two ways, seasoned by years of tea.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: `About · ${SITE.name}`,
    description:
      "The story of PO/ET — a Yixing zisha studio making teapots and tea pets from one clay since 1983.",
    url: `${SITE.url}/about`,
    images: [{ url: "/images/getty_pots.jpg", width: 1200, height: 630 }],
  },
};

const trail = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

const PRINCIPLES = [
  {
    no: "01",
    title: "One clay, honestly",
    note: "Every piece is unglazed Yixing zisha — purple sand clay quarried in Jiangsu. No glaze, no slip-cast shortcuts. What you see is the fired clay itself.",
  },
  {
    no: "02",
    title: "Shaped by hand",
    note: "Pots are paddled from a flat sheet; pets are sculpted from the block. A single piece passes through a potter's hands a dozen times before the kiln.",
  },
  {
    no: "03",
    title: "Finished by you",
    note: "A pot or pet leaves the studio half-made. The patina — the deep, soft sheen of seasoned clay — is the work of your tea, over your years.",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema()),
        }}
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
        <section className="mt-9" aria-labelledby="about-hero">
          <p className="eyebrow">The Studio</p>
          <h1
            id="about-hero"
            className="mt-5 max-w-[18ch] text-[clamp(38px,5.4vw,72px)] font-extralight leading-[1.04] tracking-[-0.022em]"
          >
            One clay, shaped{" "}
            <em className="font-normal not-italic text-clay">two ways</em>.
          </h1>
          <p className="mt-6 max-w-[50ch] text-[17px] font-light text-ink-soft">
            PO/ET is a Yixing zisha studio. We have made teapots and tea pets
            from the same purple sand clay since 1983 — and we ship them, retail
            and wholesale, to tea tables in more than forty countries.
          </p>

          <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-2xl bg-cream">
            <Image
              src="/images/getty_pots.jpg"
              alt="Finished Yixing clay teapots resting in the PO/ET studio"
              fill
              priority
              sizes="(max-width: 1320px) 100vw, 1320px"
              className="object-cover"
            />
          </div>
        </section>

        {/* The name */}
        <section
          className="mt-20 grid gap-10 border-t border-ink-faint/20 pt-14 lg:grid-cols-[0.9fr_1.1fr]"
          aria-labelledby="the-name"
        >
          <h2
            id="the-name"
            className="text-[clamp(24px,3vw,36px)] font-extralight tracking-[-0.02em]"
          >
            Why we are called{" "}
            <em className="font-normal not-italic text-clay">PO/ET</em>.
          </h2>
          <div className="space-y-4 text-[15px] font-light text-ink-soft">
            <p>
              The name is a small joke that turned out to be true. <strong className="font-medium text-ink">PO</strong>{" "}
              is the pot — the Yixing teapot you pour from. <strong className="font-medium text-ink">ET</strong>{" "}
              is the pet — the small clay creature that sits on the tray and
              watches you drink.
            </p>
            <p>
              Put together they spell <em>poet</em>, which is how we think a
              teapot ought to behave: quiet, patient, and slowly saying more the
              longer you live with it.
            </p>
            <p>
              Both come from one material. The clay that is thrown into a pot
              and the clay that is sculpted into a pet are the same zisha,
              quarried from the same hills, fired in the same kiln.
            </p>
          </div>
        </section>

        {/* The maker quote */}
        <section className="mt-20 rounded-2xl bg-cream px-8 py-16 sm:px-14 sm:py-20">
          <blockquote className="mx-auto max-w-[32ch] text-center text-[clamp(24px,3.2vw,38px)] font-extralight leading-[1.3] tracking-[-0.015em]">
            &ldquo;From one clay I make two things — the pot you pour from, and
            the pet that sits and watches. Both leave my hands{" "}
            <em className="font-normal not-italic text-clay">half-made</em> —
            the rest is years of your tea.&rdquo;
          </blockquote>
          <p className="mt-8 text-center text-[14px] font-medium tracking-[0.04em]">
            Dou Lu
            <span className="mt-1 block text-[13px] font-light tracking-normal text-ink-faint">
              Founder &amp; sculptor, Yixing — since 1983
            </span>
          </p>
        </section>

        {/* Principles */}
        <section className="mt-20" aria-labelledby="principles">
          <SectionHead
            id="principles"
            kicker="How We Work"
            title={
              <>
                Three things we do not{" "}
                <em className="font-normal not-italic text-clay">
                  compromise
                </em>
                .
              </>
            }
            note="The studio is small on purpose. These are the rules that keep it that way."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <article
                key={p.no}
                className="reveal flex flex-col rounded-2xl border border-ink-faint/25 bg-surface p-8"
              >
                <span className="text-[13px] font-semibold tracking-[0.14em] text-clay">
                  {p.no}
                </span>
                <h3 className="mt-4 text-[21px] font-light tracking-[-0.01em]">
                  {p.title}
                </h3>
                <p className="mt-3 text-[14.5px] font-light text-ink-soft">
                  {p.note}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mt-20 border-t border-ink-faint/20 pt-14">
          <dl className="flex flex-wrap gap-x-16 gap-y-10">
            {[
              ["1983", "the studio's first kiln"],
              ["500+", "years of the Yixing craft"],
              ["100%", "hand-shaped, unglazed clay"],
              ["40+", "countries shipped"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="text-[clamp(40px,5vw,64px)] font-extralight tracking-[-0.02em]">
                  {n}
                </dt>
                <dd className="mt-1 text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section className="mt-20 rounded-2xl bg-ink px-8 py-16 text-center sm:px-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/55">
            Start somewhere
          </p>
          <h2 className="mx-auto mt-5 max-w-[18ch] text-[clamp(26px,3.4vw,42px)] font-extralight leading-[1.1] tracking-[-0.02em] text-paper">
            Find the pot, or the pet, to season.
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[15px] font-light text-paper/65">
            Browse the whole studio, or write to us — retail and wholesale
            enquiries are both welcome.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Cta href="/shop" variant="light">
              Shop the catalogue
            </Cta>
            <Cta href={`mailto:${SITE.email}`} variant="light" arrow={false}>
              Contact the studio
            </Cta>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
