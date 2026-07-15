import Link from 'next/link';
import ImageSlot from '@/components/ImageSlot';

export default function HistoryBand() {
  return (
    <section id="history" className="container">
      <div className="history-band">
        <div>
          <span className="tag tag-accent">Since 1905</span>
          <h2>The House of Birkenstein</h2>
          <p>
            Built for a family scrap-trade firm at the height of Smokey Hollow&rsquo;s industrial
            boom, 401 W. Ontario spent a century as warehouse and workshop before becoming the
            lofts you see today. The posts, beams and brick are all original.
          </p>
          <Link className="history-link" href="/history/">
            Read the building&rsquo;s story &rarr;
          </Link>
        </div>
        <div className="history-photo">
          <ImageSlot
            src="/images/elevations/401-W-Ontario-No-Signs-Black-White-800w.webp"
            alt="The S. Birkenstein & Sons Building"
            label="Archival photo or 1916 advertisement"
          />
        </div>
      </div>
    </section>
  );
}
