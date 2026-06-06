import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Faq } from "@/components/faq";
import { Cta } from "@/components/cta";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  howToSchema,
} from "@/lib/seo";
import { SITE } from "@/lib/site";
import { GUIDES, getGuide, relatedGuides } from "@/lib/guides";

export const revalidate = 3600;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

type Params = { params: Promise<{ slug: string }> };

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found" };

  const path = `/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: `${guide.title} · ${SITE.name}`,
      description: guide.description,
      url: `${SITE.url}${path}`,
      publishedTime: guide.datePublished,
      modifiedTime: guide.dateModified,
      images: [{ url: guide.ogImage, alt: guide.ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} · ${SITE.name}`,
      description: guide.description,
      images: [guide.ogImage],
    },
  };
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = relatedGuides(slug);
  const trail = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.h1, path: `/guides/${guide.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(guide)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(trail)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(guide.faq)) }}
      />
      {guide.howTo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema(guide.howTo)),
          }}
        />
      )}


      <main id="main-content">
        <div className="mx-auto max-w-[820px] px-6 py-10 sm:px-10 sm:py-14">
          <Breadcrumbs trail={trail} />

          <article className="mt-8">
            <header>
              <p className="eyebrow">{guide.kicker}</p>
              <h1 className="mt-5 text-[clamp(32px,4.6vw,56px)] font-extralight leading-[1.05] tracking-[-0.022em]">
                {guide.h1}
              </h1>
              <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] uppercase tracking-[0.1em] text-ink-faint">
                <span>PO/ET Studio</span>
                <span aria-hidden="true">·</span>
                <time dateTime={guide.dateModified}>
                  {DATE_FMT.format(new Date(guide.dateModified))}
                </time>
                <span aria-hidden="true">·</span>
                <span>{guide.readMinutes} min read</span>
              </p>
            </header>

            {/* Hero image */}
            <figure className="relative mt-9 aspect-[16/9] overflow-hidden rounded-2xl bg-cream">
              <Image
                src={guide.ogImage}
                alt={guide.ogImageAlt}
                fill
                priority
                sizes="(max-width: 880px) 92vw, 820px"
                className="object-cover"
              />
            </figure>

            {/* Lead */}
            <div className="mt-9 space-y-4 text-[17px] font-light leading-relaxed text-ink-soft">
              {guide.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            {/* Body sections */}
            {guide.sections.map((s) => (
              <section
                key={s.id}
                className="mt-12"
                aria-labelledby={s.id}
              >
                <h2
                  id={s.id}
                  className="text-[clamp(22px,2.8vw,32px)] font-extralight tracking-[-0.02em]"
                >
                  {s.heading}
                </h2>
                <div className="mt-4 space-y-4 text-[15.5px] font-light leading-relaxed text-ink-soft">
                  {s.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            ))}

            {/* HowTo steps */}
            {guide.howTo && (
              <section className="mt-12" aria-labelledby="howto-steps">
                <h2
                  id="howto-steps"
                  className="text-[clamp(22px,2.8vw,32px)] font-extralight tracking-[-0.02em]"
                >
                  Step by step
                </h2>
                <ol className="mt-6 space-y-5">
                  {guide.howTo.steps.map((step, i) => (
                    <li key={step.name} className="flex gap-5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink-faint/35 text-[14px] font-medium text-clay">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-[17px] font-medium tracking-[-0.01em]">
                          {step.name}
                        </h3>
                        <p className="mt-1.5 text-[15px] font-light leading-relaxed text-ink-soft">
                          {step.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Glossary */}
            {guide.glossary && (
              <section className="mt-12" aria-labelledby="glossary-terms">
                <h2
                  id="glossary-terms"
                  className="text-[clamp(22px,2.8vw,32px)] font-extralight tracking-[-0.02em]"
                >
                  Glossary
                </h2>
                <dl className="mt-6 divide-y divide-ink-faint/20 border-y border-ink-faint/20">
                  {guide.glossary.map((t) => (
                    <div
                      key={t.term}
                      className="grid gap-1.5 py-5 sm:grid-cols-[0.4fr_0.6fr] sm:gap-6"
                    >
                      <dt>
                        <span className="text-[17px] font-medium tracking-[-0.01em]">
                          {t.term}
                        </span>
                        {t.zh && (
                          <span className="ml-2 text-[14px] text-ink-faint">
                            {t.zh}
                          </span>
                        )}
                        {t.pinyin && (
                          <span className="mt-0.5 block text-[12.5px] italic text-ink-faint">
                            {t.pinyin}
                          </span>
                        )}
                      </dt>
                      <dd className="text-[15px] font-light leading-relaxed text-ink-soft">
                        {t.def}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Inline CTA */}
            <aside className="mt-14 rounded-2xl bg-ink px-8 py-12 text-center sm:px-12">
              <h2 className="mx-auto max-w-[20ch] text-[clamp(22px,3vw,34px)] font-extralight leading-[1.12] tracking-[-0.02em] text-paper">
                {guide.cta.heading}
              </h2>
              <p className="mx-auto mt-4 max-w-[44ch] text-[14.5px] font-light text-paper/65">
                {guide.cta.note}
              </p>
              <div className="mt-8 flex justify-center">
                <Cta href={guide.cta.href} variant="light">
                  {guide.cta.label}
                </Cta>
              </div>
            </aside>
          </article>
        </div>

        {/* FAQ — reuses the shared component + FAQPage schema above */}
        <Faq
          items={guide.faq}
          kicker="Good to Know"
          title={
            <>
              Common{" "}
              <em className="font-normal not-italic text-clay">questions</em>.
            </>
          }
        />

        {/* Related guides */}
        {related.length > 0 && (
          <section
            className="mx-auto max-w-[1320px] px-6 py-20 sm:px-10"
            aria-labelledby="related-guides"
          >
            <h2
              id="related-guides"
              className="text-[clamp(22px,2.8vw,32px)] font-extralight tracking-[-0.02em]"
            >
              Keep reading
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-ink-faint/25 bg-surface p-6 transition-colors hover:border-ink-faint/50"
                  >
                    <p className="eyebrow">{g.kicker}</p>
                    <h3 className="mt-3 text-[18px] font-light leading-snug tracking-[-0.01em]">
                      {g.h1}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.1em] text-clay">
                      Read
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

    </>
  );
}
