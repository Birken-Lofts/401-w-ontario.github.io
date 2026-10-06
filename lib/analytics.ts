export const PRODUCTION_HOST = 'birkenlofts.com';

/** GA runs only on the real site — never on previews, workers.dev or localhost. */
export function shouldLoadAnalytics(hostname: string): boolean {
  return hostname === PRODUCTION_HOST;
}
