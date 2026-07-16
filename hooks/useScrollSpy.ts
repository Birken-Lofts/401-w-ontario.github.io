'use client';

import { useEffect, useState } from 'react';

const sections = ['plans', 'amenities', 'neighborhood', 'schedule', 'contact'];

/**
 * Active = the topmost section still visible below the nav (bottom > 76px)
 * whose top has crossed 40% of the viewport height, measured on scroll/resize
 * (rAF-throttled). Replaces an IntersectionObserver band that short sections
 * could jump over entirely when top-anchored (e.g. #amenities is shorter than
 * the band, so "Neighborhood" highlighted instead). Topmost-wins also keeps a
 * short anchored section active even when its successor's top is above the
 * 40% line.
 */
export default function useScrollSpy(enabled: boolean = true) {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;

    const measure = () => {
      raf = 0;
      const threshold = window.innerHeight * 0.4;
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // 78 = 76px nav clearance + 2px slack: anchored scrolls land on
        // fractional offsets (e.g. bottom 76.06), which must count as passed.
        if (rect.top <= threshold && rect.bottom > 78) {
          current = id;
          break;
        }
      }
      // At the very bottom of the page the last section (contact) may never
      // top-out under the nav; force it active so its nav link highlights.
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        for (let j = sections.length - 1; j >= 0; j--) {
          const el = document.getElementById(sections[j]);
          if (el) {
            current = sections[j];
            break;
          }
        }
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  return active;
}
