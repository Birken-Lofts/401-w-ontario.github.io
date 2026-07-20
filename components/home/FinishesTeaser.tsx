import Image from 'next/image';

export default function FinishesTeaser() {
  return (
    <section className="finishes-teaser" aria-label="Finishes preview">
      <div className="finishes-inner section-shell">
        <Image
          src="/images/finishes/finishes-kitchen.png"
          alt="Loft kitchen with warm cabinetry, charcoal stone and exposed brick"
          width={411}
          height={271}
          sizes="(max-width: 768px) calc(100vw - 40px), 50vw"
        />
        <div>
          <span className="outlined-label">Coming soon</span>
          <h2>Finishes</h2>
          <p>
            Charcoal stone, warm cabinetry, satin nickel &mdash; we&rsquo;re dialing in the finish
            selections now and will share them here once they&rsquo;re final.
          </p>
        </div>
      </div>
    </section>
  );
}
