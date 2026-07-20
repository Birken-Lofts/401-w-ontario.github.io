import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPostDate, getAllPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Journal | Birken Lofts',
  description:
    'Notes from the conversion of the 1905 S. Birkenstein & Sons Building into Birken Lofts — construction updates, archive finds, and life in River North.',
  alternates: { canonical: 'https://birkenlofts.com/blog/' },
  openGraph: {
    title: 'The Birken Lofts Journal',
    description:
      'Construction updates, archive finds, and River North history from Birken Lofts.',
    type: 'website',
    url: 'https://birkenlofts.com/blog/',
    images: [{ url: 'https://birkenlofts.com/images/og/birken-lofts-og.jpg', width: 1200, height: 630 }],
  },
};

export default function JournalPage() {
  const posts = getAllPosts();
  return (
    <main>
      <header className="journal-header page-hero">
        <div className="section-shell">
          <span className="eyebrow eyebrow-line">Notes from 401 W. Ontario</span>
          <h1>Journal</h1>
          <p className="journal-lede">
            Progress on the building&rsquo;s conversion, finds from the archives, and life in
            River North.
          </p>
        </div>
      </header>
      <section className="journal-entries">
        <div className="section-shell">
        {posts.length === 0 ? (
          <p className="journal-empty">First entries are on their way.</p>
        ) : (
          <div className="journal-list">
            {posts.map((p, i) => (
              <Link key={p.slug} href={`/blog/${p.slug}/`} className="journal-row">
                {p.feature_image && p.feature_image_width && p.feature_image_height && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.feature_image}
                    alt={p.feature_image_alt ?? ''}
                    width={p.feature_image_width}
                    height={p.feature_image_height}
                    // The first thumbnail is the page's LCP element — lazy-loading it stalls LCP.
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : undefined}
                    className="journal-row-img"
                  />
                )}
                <div className="journal-row-copy">
                  <div className="journal-row-meta">{formatPostDate(p.published_at)}</div>
                  <h2>{p.title}</h2>
                  {p.custom_excerpt && <p>{p.custom_excerpt}</p>}
                </div>
                <span className="journal-read">Read &rarr;</span>
              </Link>
            ))}
          </div>
        )}
        </div>
      </section>
    </main>
  );
}
