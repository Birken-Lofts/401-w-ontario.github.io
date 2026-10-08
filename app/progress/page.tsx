import type { Metadata } from 'next';
import { OG_DEFAULTS } from '@/lib/seo';

// The feed is the shared Monroe progress-photos service (repo
// monroeresidential/progress-photos-app). It only answers origins listed for
// the project, so it is blank on localhost and preview URLs.
// Pinned release + SRI: a change to the service's embed can't reach this page
// until we bump both values (run `npm run embed:release` in that repo).
const EMBED_SRC = 'https://progress.monroeresidential.com/embed/1.0.2.js';
const EMBED_SRI = 'sha384-gEC75a+f5HdcWFTRUFksuKQ/st1iD7bNdZCc64mASxg187X7soLjyN61QfyqYhq6';

const URL = 'https://birkenlofts.com/progress/';
const DESCRIPTION =
  'Photos from the site as 401 W. Ontario Street becomes Birken Lofts — posted by the construction team, newest first.';

export const metadata: Metadata = {
  title: 'Construction Progress | Birken Lofts',
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: 'Construction Progress',
    description: DESCRIPTION,
    type: 'website',
    url: URL,
    images: [
      {
        url: 'https://birkenlofts.com/images/og/progress-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Birken Lofts progress photos: the timber-framed 4th floor after demolition',
      },
    ],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Construction Progress',
  description: DESCRIPTION,
  url: URL,
  image: 'https://birkenlofts.com/images/og/progress-og.jpg',
  isPartOf: { '@type': 'WebSite', name: 'Birken Lofts', url: 'https://birkenlofts.com/' },
  publisher: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  about: {
    '@type': 'Place',
    name: 'Birken Lofts',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '401 W. Ontario Street',
      addressLocality: 'Chicago',
      addressRegion: 'IL',
      postalCode: '60654',
      addressCountry: 'US',
    },
  },
};

export default function ProgressPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="progress-header container">
        <span className="tag tag-accent">From the site</span>
        <h1>Construction Progress</h1>
        <p className="progress-lede">
          The conversion of 401 W. Ontario, photographed as it happens &mdash; posted by the
          team on site, newest first.
        </p>
      </header>
      <section className="progress-feed container">
        <progress-feed project="birken-lofts">
          <p className="progress-fallback">
            Progress photos load here. If they don&rsquo;t appear, check that JavaScript is
            enabled.
          </p>
        </progress-feed>
      </section>
      <script type="module" async src={EMBED_SRC} integrity={EMBED_SRI} crossOrigin="anonymous" />
    </main>
  );
}
