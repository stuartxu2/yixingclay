const PHRASES = [
  "Pots & pets, one clay",
  "Hand-shaped, not moulded",
  "Fired in Yixing, Jiangsu",
  "Unglazed zisha clay",
  "Seasoned by your tea",
  "Retail & wholesale",
  "Shipped worldwide",
];

/** Continuous ticker band — the track is doubled so the loop is seamless. */
export function Marquee() {
  return (
    <div className="marquee-host overflow-hidden border-y border-ink-faint/25 bg-cream py-4">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0"
            aria-hidden={copy === 1}
          >
            {PHRASES.map((phrase) => (
              <li
                key={phrase}
                className="flex items-center gap-7 whitespace-nowrap px-7 text-[14px] text-ink-soft"
              >
                {phrase}
                <span className="text-[10px] text-clay">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
