'use client';

import { useEffect } from 'react';
import { shouldLoadAnalytics } from '@/lib/analytics';

const GA_ID = 'G-YVPGP24V3P';

declare global {
  interface Window {
    dataLayer?: unknown[];
    __gaLoaded?: boolean;
  }
}

/**
 * Loads GA on the first user interaction (scroll/tap/key) instead of at page
 * load — gtag.js costs ~550ms of main-thread time on a mid-tier phone, which
 * was the site's dominant Total Blocking Time. Real readers always scroll;
 * a session with zero interaction is a bounce GA would record and nothing else.
 */
export default function Analytics() {
  useEffect(() => {
    if (!shouldLoadAnalytics(location.hostname)) return;
    const load = () => {
      if (window.__gaLoaded) return;
      window.__gaLoaded = true;
      events.forEach(([t, o]) => removeEventListener(t, load, o));
      window.dataLayer = window.dataLayer || [];
      // Must push the `arguments` object, exactly as Google's snippet does:
      // gtag.js only treats [object Arguments] entries as commands. A rest
      // parameter produces a real Array, which it silently ignores — that
      // left `config` unprocessed and GA recorded nothing from 2026-07-20
      // to 2026-10-24.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function gtag(..._args: unknown[]) {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', GA_ID);
      const s = document.createElement('script');
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      s.async = true;
      document.head.appendChild(s);
    };
    const events: [string, AddEventListenerOptions][] = [
      ['scroll', { once: true, passive: true }],
      ['pointerdown', { once: true }],
      ['keydown', { once: true }],
      ['touchstart', { once: true, passive: true }],
    ];
    events.forEach(([t, o]) => addEventListener(t, load, o));
    return () => events.forEach(([t, o]) => removeEventListener(t, load, o));
  }, []);

  return null;
}
