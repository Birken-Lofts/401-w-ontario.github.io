import ImageSlot from '@/components/ImageSlot';

const plans = [
  { title: 'Studio', body: '550–700 sq ft · oversized windows · in-unit laundry', slot: 'Studio interior' },
  { title: 'One bedroom', body: '750–1,000 sq ft · exposed brick · walk-in closet', slot: 'One-bedroom interior' },
  { title: 'Two bedroom', body: '1,100–1,400 sq ft · corner exposures · original timber posts', slot: 'Two-bedroom interior' },
];

export default function FloorPlans() {
  return (
    <section id="plans" className="section container">
      <h2>Floor plans</h2>
      <p className="section-intro">
        Studios to two-bedrooms, no two exactly alike. Original posts and beams in every plan.
      </p>
      <div className="cards-3">
        {plans.map((p) => (
          <div key={p.title} className="card elev-sm plan-card">
            <div className="plan-media">
              <ImageSlot alt={p.slot} label={p.slot} />
            </div>
            <span className="tag tag-accent-2" style={{ alignSelf: 'flex-start' }}>Interest list open</span>
            <div className="card-title">{p.title}</div>
            <div className="card-body">{p.body}</div>
            <a className="btn btn-secondary" href="#contact" style={{ alignSelf: 'flex-start' }}>Inquire</a>
          </div>
        ))}
      </div>
    </section>
  );
}
