'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxPlan {
  title: string;
  unit: string;
  large: string;
  alt: string;
}

interface PlanLightboxProps {
  plans: LightboxPlan[];
  openIndex: number | null;
  onClose: () => void;
}

export default function PlanLightbox({ plans, openIndex, onClose }: PlanLightboxProps) {
  if (openIndex === null) return null;
  return <Overlay plans={plans} initialIndex={openIndex} onClose={onClose} />;
}

function Overlay({
  plans,
  initialIndex,
  onClose,
}: {
  plans: LightboxPlan[];
  initialIndex: number;
  onClose: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [current, setCurrent] = useState(initialIndex);

  const scrollTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track || i < 0 || i >= plans.length) return;
      track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
    },
    [plans.length],
  );

  // Before first paint: jump the track to the clicked plan, focus the dialog, lock page scroll.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = track.clientWidth * initialIndex;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [initialIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') scrollTo(current + 1);
      else if (e.key === 'ArrowLeft') scrollTo(current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, onClose, scrollTo]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== current) setCurrent(Math.min(Math.max(i, 0), plans.length - 1));
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Floor plan viewer" onClick={onClose}>
      <div className="lightbox-track" ref={trackRef} onScroll={handleScroll}>
        {plans.map((p) => (
          <figure key={p.unit} className="lightbox-slide">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.large} alt={p.alt} loading="lazy" onClick={(e) => e.stopPropagation()} />
          </figure>
        ))}
      </div>
      <button
        ref={closeRef}
        type="button"
        className="lightbox-btn lightbox-close"
        aria-label="Close floor plan viewer"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={20} strokeWidth={2.5} />
      </button>
      {current > 0 && (
        <button
          type="button"
          className="lightbox-btn lightbox-prev"
          aria-label="Previous floor plan"
          onClick={(e) => {
            e.stopPropagation();
            scrollTo(current - 1);
          }}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
      )}
      {current < plans.length - 1 && (
        <button
          type="button"
          className="lightbox-btn lightbox-next"
          aria-label="Next floor plan"
          onClick={(e) => {
            e.stopPropagation();
            scrollTo(current + 1);
          }}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      )}
      <div className="lightbox-caption" onClick={(e) => e.stopPropagation()}>
        <span>
          {plans[current].title} · {plans[current].unit}
        </span>
        <span className="lightbox-counter">
          {current + 1} / {plans.length}
        </span>
      </div>
    </div>
  );
}
