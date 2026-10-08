/**
 * Spread into every page's `openGraph`: Next replaces the layout's openGraph
 * wholesale when a page sets its own, so site-wide OG fields live here.
 */
export const OG_DEFAULTS = { siteName: 'Birken Lofts', locale: 'en_US' } as const;
