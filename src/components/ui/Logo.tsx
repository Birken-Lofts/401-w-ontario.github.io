interface Props {
  /** Rendered height of the window mark, in px. */
  markHeight?: number;
  /** Font size of the "Birken Lofts" wordmark, in px. */
  wordmarkSize?: number;
  className?: string;
}

/**
 * The Birken Lofts mark: an arched window (the building's defining feature)
 * divided by a transom + muntin, with "B" / "L" set in the lower panes.
 * Terracotta lines, cream letters — for use on dark surfaces (nav, footer).
 */
export default function Logo({ markHeight = 48, wordmarkSize = 27, className = '' }: Props) {
  return (
    <a href="#hero" className={`flex items-center gap-3 ${className}`} aria-label="Birken Lofts — home">
      <svg
        viewBox="16 12 32 38"
        style={{ height: markHeight }}
        className="w-auto flex-none"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#bf5e34" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M19 47 V28 a13 13 0 0 1 26 0 V47 Z" />
          <path d="M19 28 H45" />
          <path d="M32 28 V47" />
        </g>
        <text x="25.5" y="43.5" textAnchor="middle" fontFamily="'Instrument Serif', serif" fontSize="13" fill="#f4efe7">B</text>
        <text x="38.5" y="43.5" textAnchor="middle" fontFamily="'Instrument Serif', serif" fontSize="13" fill="#f4efe7">L</text>
      </svg>
      <span
        className="font-display tracking-[0.03em] text-cream leading-none"
        style={{ fontSize: wordmarkSize }}
      >
        Birken Lofts
      </span>
    </a>
  );
}
