import { SectionHead } from "./section-head";

const CLAYS = [
  {
    no: "01",
    name: "Zi Ni",
    zh: "紫泥",
    en: "Purple Clay",
    swatch: "#7d5c4d",
    note: "The classic body of Yixing — dense, even, and forgiving. Fires a deep brown-violet and holds carved detail crisply.",
  },
  {
    no: "02",
    name: "Zhu Ni",
    zh: "朱泥",
    en: "Cinnabar Clay",
    swatch: "#9a5034",
    note: "High in iron, high in shrinkage. Difficult to fire, prized for a bell-clear ring and a red that glows warmer with tea.",
  },
  {
    no: "03",
    name: "Duan Ni",
    zh: "段泥",
    en: "Sand Clay",
    swatch: "#c7b58c",
    note: "A pale, sandy body with a soft matte surface. Starts the colour of raw biscuit and warms slowly toward honey and oat.",
  },
];

/** Educational block on Yixing clay bodies — structured for AEO extraction. */
export function ClaySection() {
  return (
    <section
      id="clay"
      className="scroll-mt-24 border-b border-ink-faint/20 bg-surface py-24 sm:py-28"
      aria-labelledby="clay-title"
    >
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10">
        <SectionHead
          id="clay-title"
          kicker="The Clay"
          title={
            <>
              One mountain,
              <br />
              three <em className="font-normal not-italic text-clay">minds</em>.
            </>
          }
          note="Every PO/ET piece — teapot and tea pet alike — begins as zisha, purple sand clay quarried near Yixing in Jiangsu, China. The ore is weathered, milled, and aged before a single form is shaped."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CLAYS.map((clay) => (
            <article
              key={clay.name}
              className="reveal group rounded-2xl border border-ink-faint/25 bg-cream p-9 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-34px_rgba(28,28,28,0.5)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium tracking-[0.14em] text-clay">
                  {clay.no}
                </span>
                <span
                  className="h-9 w-9 rounded-full ring-1 ring-ink-faint/40"
                  style={{ background: clay.swatch }}
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-6 text-[24px] font-light tracking-[-0.01em]">
                {clay.name}{" "}
                <span className="text-ink-faint">{clay.zh}</span>
              </h3>
              <p className="mt-0.5 text-[12px] uppercase tracking-[0.14em] text-ink-soft">
                {clay.en}
              </p>
              <p className="mt-4 text-[14.5px] font-light text-ink-soft">
                {clay.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
