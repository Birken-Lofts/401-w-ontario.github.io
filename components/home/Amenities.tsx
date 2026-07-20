const amenities = [
  'Exposed brick & heavy timber',
  'Oversized windows',
  'In-unit laundry',
  'Fitness center',
  'Community lounge',
  'Pet friendly',
];

export default function Amenities() {
  return (
    <section id="amenities" className="section container">
      <h2>Amenities</h2>
      <div className="amenities-grid">
        {amenities.map((a, i) => (
          <div key={a} className="amenity">
            <span className="amenity-number">{String(i + 1).padStart(2, '0')}</span>
            <span>{a}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
