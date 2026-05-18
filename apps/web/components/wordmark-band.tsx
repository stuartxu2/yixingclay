import { Wordmark } from "./wordmark";

/** Oversized wordmark band — a quiet breath between sections. */
export function WordmarkBand() {
  return (
    <section
      className="overflow-hidden border-b border-ink-faint/20 bg-surface py-20 text-center sm:py-24"
      aria-label="PO/ET"
    >
      <div className="reveal">
        <Wordmark className="block text-[clamp(88px,21vw,300px)] font-extralight leading-[0.86] tracking-[-0.03em]" />
        <p className="mx-auto mt-5 max-w-[30rem] px-6 text-[15px] font-light text-ink-soft">
          A poem is finished by its reader. A tea pet is finished by the tea.
        </p>
      </div>
    </section>
  );
}
