import Image from 'next/image';
import Link from 'next/link';

export default function FinishesTeaser() {
  return (
    <section className="container" aria-label="Finishes preview">
      <div className="fin-teaser">
        <div className="fin-teaser-img">
          <Image
            src="/images/finishes/kitchen-render.webp"
            alt="Concept rendering of a Birken Lofts kitchen"
            fill
            className="img-cover"
            sizes="(max-width: 768px) 100vw, 220px"
          />
        </div>
        <div>
          <h2>Finishes</h2>
          <p>
            Charcoal stone, warm cabinetry, satin nickel &mdash; see what&rsquo;s going into
            the residences.
          </p>
        </div>
        <Link className="history-link" href="/finishes/">
          Explore the finish selections &rarr;
        </Link>
      </div>
    </section>
  );
}
