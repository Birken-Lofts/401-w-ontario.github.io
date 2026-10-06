import type { Metadata } from 'next';

// The feed is the shared Monroe progress-photos service (repo
// monroeresidential/progress-photos-app). It only answers origins listed for
// the project, so it is blank on localhost and preview URLs.
// Pinned release + SRI: a change to the service's embed can't reach this page
// until we bump both values (run `npm run embed:release` in that repo).
const EMBED_SRC = 'https://progress.monroeresidential.com/embed/1.0.1.js';
const EMBED_SRI = 'sha384-YkA1rUnt6oWfTFcgnx8JD5LcERFm6IVpiLmmHUVG9jczUsUIHdoAHhbe5tSDL/H/';

export const metadata: Metadata = {
  title: 'Construction Progress | Birken Lofts',
  description:
    'Photos from the site as 401 W. Ontario Street becomes Birken Lofts — posted by the construction team, newest first.',
  alternates: { canonical: 'https://birkenlofts.com/progress/' },
  openGraph: {
    title: 'Construction Progress',
    description: 'Photos from the site as 401 W. Ontario Street becomes Birken Lofts.',
    type: 'website',
    url: 'https://birkenlofts.com/progress/',
    images: [{ url: 'https://birkenlofts.com/images/og/birken-lofts-og.jpg', width: 1200, height: 630 }],
  },
};

export default function ProgressPage() {
  return (
    <main>
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
