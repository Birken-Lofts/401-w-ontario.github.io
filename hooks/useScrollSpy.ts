'use client';

import { useEffect, useState } from 'react';

const sections = ['plans', 'history', 'amenities', 'neighborhood', 'schedule', 'contact'];

export default function useScrollSpy(enabled: boolean = true) {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -40% 0px' },
    );
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}
