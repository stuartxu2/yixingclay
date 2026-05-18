/**
 * Maker's seal — a chop-stamp set into the hero. The ringed text rotates
 * slowly; the centre character stays still. Decorative, hidden from a11y.
 */
export function MakerSeal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <path
          id="seal-arc"
          d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
        />
      </defs>
      <g className="seal-spin">
        <text className="fill-clay-deep text-[12px] font-medium tracking-[0.16em]">
          <textPath href="#seal-arc" startOffset="0%">
            · HANDMADE IN YIXING · ZISHA PURPLE CLAY
          </textPath>
        </text>
      </g>
      <circle
        cx="60"
        cy="60"
        r="27"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-clay-deep/40"
      />
      <text
        x="60"
        y="67"
        textAnchor="middle"
        className="fill-clay-deep text-[19px] font-light tracking-[0.04em]"
      >
        宜興
      </text>
    </svg>
  );
}
