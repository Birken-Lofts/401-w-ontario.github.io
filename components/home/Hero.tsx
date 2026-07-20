import ImageSlot from '@/components/ImageSlot';

export default function Hero() {
  return (
    <section id="top" className="hero">
      <ImageSlot
        src="/images/elevations/401-W-Ontario-No-Signs-1920w.webp"
        srcSet="/images/elevations/401-W-Ontario-No-Signs-640w.webp 640w, /images/elevations/401-W-Ontario-No-Signs-1024w.webp 1024w, /images/elevations/401-W-Ontario-No-Signs-1920w.webp 1920w"
        sizes="100vw"
        priority
        alt="The S. Birkenstein & Sons Building at 401 W. Ontario"
        label="The S. Birkenstein & Sons Building at 401 W. Ontario"
      />
      <div className="hero-overlay" />
      <div className="hero-content section-shell">
        <div className="eyebrow eyebrow-line">
          <span className="hero-text-long">401 W. Ontario Street · River North, Chicago</span>
          <span className="hero-text-short">River North, Chicago</span>
        </div>
        <h1>Historic timber lofts in the heart of River North</h1>
        <p className="hero-lede">
          <span className="hero-text-long">
            Fifty-seven residences inside the 1905 S. Birkenstein &amp; Sons Building &mdash;
            original brick and heavy timber, a block from the Brown Line, steps from the river.
          </span>
          <span className="hero-text-short">
            Fifty-seven residences inside the 1905 S.&nbsp;Birkenstein &amp; Sons Building.
          </span>
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#plans">View floor plans</a>
          <a className="btn btn-secondary" href="#contact">Contact us</a>
        </div>
      </div>
    </section>
  );
}
