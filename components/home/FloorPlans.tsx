'use client';

import { useRef, useState } from 'react';
import ImageSlot from '@/components/ImageSlot';
import PlanLightbox from '@/components/home/PlanLightbox';

const plans = [
  {
    title: 'Studio',
    body: '550–700 sq ft · oversized windows · in-unit laundry',
    thumb: '/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-108.webp',
    large: '/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-108-large.webp',
    unit: 'Unit 108',
    alt: 'Floor plan — Unit 108',
  },
  {
    title: 'One bedroom',
    body: '750–1,000 sq ft · exposed brick · walk-in closet',
    thumb: '/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-Unit-111.webp',
    large: '/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-Unit-111-large.webp',
    unit: 'Unit 111',
    alt: 'Floor plan — Unit 111',
  },
  {
    title: 'Two bedroom',
    body: '1,100–1,400 sq ft · corner exposures · original timber posts',
    thumb: '/images/floor-plans/401-W-Ontario-2-Bed-Floor-Plan-Unit-202.webp',
    large: '/images/floor-plans/401-W-Ontario-2-Bed-Floor-Plan-Unit-202-large.webp',
    unit: 'Unit 202',
    alt: 'Floor plan — Unit 202',
  },
];

export default function FloorPlans() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = () => {
    const i = openIndex;
    setOpenIndex(null);
    if (i !== null) triggerRefs.current[i]?.focus();
  };

  return (
    <section id="plans" className="section container">
      <h2>Floor plans</h2>
      <p className="section-intro">
        Studios to two-bedrooms, no two exactly alike. Original posts and beams in every plan.
      </p>
      <div className="cards-3">
        {plans.map((p, i) => (
          <div key={p.title} className="card elev-sm plan-card">
            <button
              type="button"
              className="plan-media plan-zoom"
              aria-label={`View larger floor plan — ${p.title}`}
              onClick={() => setOpenIndex(i)}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
            >
              <ImageSlot src={p.thumb} alt={p.alt} label={p.alt} fit="contain" />
            </button>
            <span className="tag tag-accent-2" style={{ alignSelf: 'flex-start' }}>Interest list open</span>
            <div className="card-title">{p.title}</div>
            <div className="card-body">{p.body}</div>
            <a className="btn btn-secondary" href="#contact" style={{ alignSelf: 'flex-start' }}>Inquire</a>
          </div>
        ))}
      </div>
      <PlanLightbox
        plans={plans.map(({ title, unit, large, alt }) => ({ title, unit, large, alt }))}
        openIndex={openIndex}
        onClose={close}
      />
    </section>
  );
}
