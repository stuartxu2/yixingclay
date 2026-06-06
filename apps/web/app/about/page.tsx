import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHead } from "@/components/section-head";
import { Cta } from "@/components/cta";
import { breadcrumbSchema, organizationSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About PO/ET — Lu Dou & Yaoyun Studio",
  description:
    "PO/ET is the storefront of Yaoyun Yixing Clay Studio (窑韵), founded by Lu Dou in Dingshu, Yixing — the historic home of zisha. Authentic clay, hand-shaped pots and pets.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: `About · ${SITE.name}`,
    description:
      "Lu Dou and Yaoyun Studio — authentic Yixing zisha teapots and tea pets from Dingshu, the home of Chinese purple sand clay.",
    url: `${SITE.url}/about`,
    images: [{ url: "/images/lu-dou-portrait.avif", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `About · ${SITE.name}`,
    description:
      "Lu Dou and Yaoyun Studio — authentic Yixing zisha teapots and tea pets from Dingshu, the home of Chinese purple sand clay.",
    images: ["/images/lu-dou-portrait.avif"],
  },
};

const trail = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

const PRINCIPLES = [
  {
    no: "01",
    title: "Clay first",
    note: "Lu Dou selects, blends, ages, and refines mineral-rich Yixing earth before a single pot is shaped. The vessel begins long before the wheel.",
  },
  {
    no: "02",
    title: "Form with restraint",
    note: "From classical silhouettes to designs drawn from Dunhuang, Zen aesthetics, and auspicious motifs — every form is shaped to carry the literati spirit of Chinese tea.",
  },
  {
    no: "03",
    title: "Finished by use",
    note: "A Yaoyun teapot leaves the studio half-made. The patina — the soft sheen of seasoned zisha — is written into the clay by your tea, over your years.",
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


      <main
        id="main-content"
        className="mx-auto max-w-[1320px] px-6 py-10 sm:px-10 sm:py-14"
      >
        <Breadcrumbs trail={trail} />

        {/* Hero */}
        <section className="mt-9" aria-labelledby="about-hero">
          <p className="eyebrow">The Founder</p>
          <h1
            id="about-hero"
            className="mt-5 max-w-[20ch] text-[clamp(38px,5.4vw,72px)] font-extralight leading-[1.04] tracking-[-0.022em]"
          >
            Lu Dou — Yixing clay,{" "}
            <em className="font-normal not-italic text-clay">from the ground up</em>.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[17px] font-light text-ink-soft">
            PO/ET is the storefront of{" "}
            <strong className="font-medium text-ink">Yaoyun Yixing Clay Studio</strong>{" "}
            (窑韵), founded by Lu Dou in Dingshu, Yixing — the historic home of
            Chinese zisha culture. The clay is selected, blended, and aged in his
            studio; the pots themselves are thrown by the studio&rsquo;s master
            potter,{" "}
            <Link
              href="/artists"
              className="font-medium text-ink underline decoration-ink-faint/40 underline-offset-2 hover:decoration-ink"
            >
              Xu Xuefang 许学芳
            </Link>
            .
          </p>

          <div className="relative mt-10 grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
              <Image
                src="/images/lu-dou-portrait.avif"
                alt="Lu Dou, founder of Yaoyun Yixing Clay Studio"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
              <Image
                src="/images/lu-dou-tea.avif"
                alt="Lu Dou preparing tea with a Yaoyun zisha teapot"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* The studio story */}
        <section
          className="mt-20 grid gap-10 border-t border-ink-faint/20 pt-14 lg:grid-cols-[0.9fr_1.1fr]"
          aria-labelledby="the-studio"
        >
          <h2
            id="the-studio"
            className="text-[clamp(24px,3vw,36px)] font-extralight tracking-[-0.02em]"
          >
            The studio behind the pot —{" "}
            <em className="font-normal not-italic text-clay">Yaoyun</em>.
          </h2>
          <div className="space-y-4 text-[15px] font-light text-ink-soft">
            <p>
              Lu Dou is a Yixing clay specialist and teaware designer rooted in
              Dingshu. After years of studying original clay materials, teapot
              forms, firing techniques, and the quiet philosophy of Chinese tea,
              he built Yaoyun as a studio dedicated to authentic Yixing
              craftsmanship and contemporary cultural expression.
            </p>
            <p>
              His work begins with the earth itself — selecting, blending, aging,
              and refining mineral-rich Yixing clay until it is ready to become
              a vessel for tea, time, and daily ritual.
            </p>
            <p>
              Yaoyun&rsquo;s teapots are not designed as decorative objects
              alone. Each piece is shaped to carry the spirit of Chinese
              literati tea culture — restraint, balance, warmth, and long
              companionship. From classical silhouettes to forms inspired by
              Dunhuang, Zen aesthetics, and auspicious motifs, the studio brings
              Yixing heritage into modern living spaces.
            </p>
            <p>
              The pots themselves are thrown at the bench of the studio&rsquo;s
              master potter,{" "}
              <Link
                href="/artists"
                className="font-medium text-ink underline decoration-ink-faint/40 underline-offset-2 hover:decoration-ink"
              >
                Xu Xuefang (许学芳)
              </Link>
              , a Senior Master of Arts &amp; Crafts — every pot signed with her
              seal.
            </p>
          </div>
        </section>

        {/* Maker quote */}
        <section className="mt-20 rounded-2xl bg-cream px-8 py-16 sm:px-14 sm:py-20">
          <blockquote className="mx-auto max-w-[36ch] text-center text-[clamp(24px,3.2vw,38px)] font-extralight leading-[1.3] tracking-[-0.015em]">
            &ldquo;A teapot is more than a tool. It is a meeting point of{" "}
            <em className="font-normal not-italic text-clay">
              earth, fire, hand, and time
            </em>{" "}
            — a quiet object that becomes more personal with every brew.&rdquo;
          </blockquote>
          <p className="mt-8 text-center text-[14px] font-medium tracking-[0.04em]">
            Lu Dou
            <span className="mt-1 block text-[13px] font-light tracking-normal text-ink-faint">
              Founder, Yaoyun Yixing Clay Studio · Dingshu, Yixing
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
                Three things the studio will not{" "}
                <em className="font-normal not-italic text-clay">
                  compromise
                </em>
                .
              </>
            }
            note="Yaoyun is small on purpose. These are the rules that keep it that way."
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
              ["Dingshu", "the home of zisha clay"],
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
          <h2 className="mx-auto mt-5 max-w-[20ch] text-[clamp(26px,3.4vw,42px)] font-extralight leading-[1.1] tracking-[-0.02em] text-paper">
            Find a Yaoyun pot to season.
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[15px] font-light text-paper/65">
            Browse the catalogue, or write to the studio — retail and wholesale
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

    </>
  );
}
