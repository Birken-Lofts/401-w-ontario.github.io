import ImageSlot from '@/components/ImageSlot';

export default function Hero() {
  return (
    <header className="hero container">
      <div>
        <span className="tag tag-accent-2">401 W. Ontario Street · River North, Chicago</span>
        <h1>Historic timber lofts in the heart of River North</h1>
        <p className="hero-lede">
          Fifty-seven residences inside the 1905 S. Birkenstein &amp; Sons Building — original
          brick and heavy timber, a block from the Brown Line, steps from the river.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#plans">View floor plans</a>
          <a className="btn btn-secondary" href="#contact">Contact us</a>
        </div>
      </div>
      <div className="hero-blob">
        <ImageSlot
          src="/images/elevations/401-W-Ontario-No-Signs-1920w.webp"
          srcSet="/images/elevations/401-W-Ontario-No-Signs-640w.webp 640w, /images/elevations/401-W-Ontario-No-Signs-1024w.webp 1024w, /images/elevations/401-W-Ontario-No-Signs-1920w.webp 1920w"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          alt="Birken Lofts building exterior — north facade"
          label="Building exterior — north facade"
        />
      </div>
    </header>
  );
}
