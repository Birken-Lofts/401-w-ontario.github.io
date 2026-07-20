'use client';

import dynamic from 'next/dynamic';

const NeighborhoodMap = dynamic(() => import('@/components/map/NeighborhoodMap'), {
  ssr: false,
  loading: () => <div className="map-frame" style={{ minHeight: 520 }} aria-hidden />,
});

const cards = [
  { kicker: 'Eat & drink', body: "River North's restaurant row is out the front door." },
  { kicker: 'Transit', body: 'Brown & Purple Lines at Chicago Ave., six minutes to the Loop.' },
  { kicker: 'Outside', body: 'The Riverwalk, Ward Park and the lakefront trail, minutes away.' },
];

export default function Neighborhood() {
  return (
    <section id="neighborhood" className="neighborhood-section">
      <div className="section-shell">
        <div className="section-heading-row">
          <h2>River North</h2>
          <p className="nbhd-intro">
            Galleries, the Riverwalk, the Merchandise Mart and half the city&rsquo;s best restaurants
            &mdash; all within a ten-minute walk. The Brown Line at Chicago Ave. puts the Loop six
            minutes away.
          </p>
        </div>
        <NeighborhoodMap />
        <div className="nbhd-cards">
          {cards.map((c) => (
            <div key={c.kicker} className="nbhd-card">
              <h3>{c.kicker}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
