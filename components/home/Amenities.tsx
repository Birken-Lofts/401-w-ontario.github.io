import { Check } from 'lucide-react';

const amenities = [
  'Exposed brick & heavy timber',
  'Oversized windows',
  'In-unit laundry',
  'Fitness center',
  'Garage parking',
  'Pet friendly',
];

export default function Amenities() {
  return (
    <section id="amenities" className="section container">
      <h2>Amenities</h2>
      <div className="amenities-grid">
        {amenities.map((a) => (
          <div key={a} className="amenity">
            <span className="amenity-icon">
              <Check size={18} strokeWidth={2.75} />
            </span>
            <span>{a}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
