import Image from "next/image";

const STEPS = [
  {
    k: "01",
    title: "Weather the ore",
    body: "Raw zisha rock is left to the open air for months, then milled and aged into a workable clay.",
  },
  {
    k: "02",
    title: "Sculpt by hand",
    body: "Each form is pressed and carved by hand — no moulds. Every pet keeps the maker's fingerprints.",
  },
  {
    k: "03",
    title: "Dry the greenware",
    body: "The piece dries slowly and evenly for weeks so the clay will not crack or warp in the kiln.",
  },
  {
    k: "04",
    title: "Fire at 1,200°C",
    body: "A single high firing vitrifies the body, locking in the open pores that let the clay drink tea.",
  },
];

/** Dark editorial split — the making of a tea pet. */
export function Craft() {
  return (
    <section
      id="craft"
      className="scroll-mt-24 bg-kogecha text-paper"
      aria-labelledby="craft-title"
    >
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden lg:min-h-[640px]">
          <Image
            src="/products/wukong/pottery.avif"
            alt="A Yixing clay tea pet as unfired greenware in the PO/ET studio"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-kogecha/60 to-transparent" />
        </div>

        <div className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:px-16 lg:py-24">
          <p className="eyebrow text-clay-soft before:bg-clay-soft">
            Our Craft
          </p>
          <h2
            id="craft-title"
            className="mt-6 max-w-[14ch] text-[clamp(32px,3.6vw,50px)] font-extralight leading-[1.08] tracking-[-0.02em]"
          >
            From riverbank ore to{" "}
            <em className="font-normal not-italic text-clay-soft">
              tea-table
            </em>{" "}
            companion.
          </h2>
          <p className="mt-5 max-w-[27rem] text-[15.5px] font-light text-paper/65">
            Nothing about a PO/ET tea pet is rushed. The clay is older than the
            sculptor's hands; the firing is a single, unrepeatable event.
          </p>

          <ol className="mt-9">
            {STEPS.map((step) => (
              <li
                key={step.k}
                className="flex gap-5 border-t border-paper/15 py-5 last:border-b"
              >
                <span className="text-[13px] font-medium text-clay-soft">
                  {step.k}
                </span>
                <div>
                  <b className="block text-[16px] font-medium">
                    {step.title}
                  </b>
                  <span className="text-[14px] font-light text-paper/55">
                    {step.body}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
