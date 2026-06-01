import { FAQ } from "@/lib/seo";
import { SectionHead } from "./section-head";

/**
 * Visible FAQ. The same content is emitted as FAQPage JSON-LD on the page,
 * so answer engines and readers see one consistent source of truth.
 * Native <details> keeps it accordion-like with zero JavaScript.
 *
 * Defaults to the site-wide FAQ; pass a guide's own `items` to reuse it on
 * any page with matching FAQPage schema.
 */
export function Faq({
  items = FAQ,
  kicker = "Good to Know",
  title = (
    <>
      Questions, <em className="font-normal not-italic text-clay">answered</em>.
    </>
  ),
}: {
  items?: { q: string; a: string }[];
  kicker?: string;
  title?: React.ReactNode;
}) {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-ink-faint/20 bg-cream py-24 sm:py-28"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto max-w-[920px] px-6 sm:px-10">
        <SectionHead id="faq-title" kicker={kicker} title={title} />

        <div className="mt-12 divide-y divide-ink-faint/25 border-y border-ink-faint/25">
          {items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[18px] font-medium tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink-faint/40 text-clay transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[58ch] text-[15px] font-light text-ink-soft">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
