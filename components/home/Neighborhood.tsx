'use client';

import dynamic from 'next/dynamic';

const NeighborhoodMap = dynamic(() => import('@/components/map/NeighborhoodMap'), {
  ssr: false,
  loading: () => <div className="map-frame" style={{ minHeight: 520 }} aria-hidden />,
});

const cards = [
  { kicker: 'Eat & drink', body: "River North's restaurant row is out the front door." },
  { kicker: 'Transit', body: 'Brown & Purple Lines at Chicago; 90/94 on-ramp one block south.' },
  { kicker: 'Outside', body: 'The Riverwalk, Ward Park and the lakefront trail, minutes away.' },
];

export default function Neighborhood() {
  return (
    <section id="neighborhood" className="section container">
      <h2>River North</h2>
      <p className="nbhd-intro">
        Galleries, the Riverwalk, the Merchandise Mart and half the city&rsquo;s best restaurants
        — all within a ten-minute walk. The Brown Line at Chicago Ave. puts the Loop six minutes
        away.
      </p>
      <NeighborhoodMap />
      <div className="nbhd-cards">
        {cards.map((c) => (
          <div key={c.kicker} className="card">
            <div className="card-kicker">{c.kicker}</div>
            <div className="card-body">{c.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
