import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPostDate, getAllPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Journal | Birken Lofts',
  description:
    'Notes from the conversion of the 1905 S. Birkenstein & Sons Building into Birken Lofts — construction updates, design selections, and River North history.',
  alternates: { canonical: 'https://birkenlofts.com/blog/' },
  openGraph: {
    title: 'The Birken Lofts Journal',
    description:
      'Construction updates, design selections, and River North history from Birken Lofts.',
    type: 'website',
    url: 'https://birkenlofts.com/blog/',
    images: ['https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp'],
  },
};

export default function JournalPage() {
  const posts = getAllPosts();
  return (
    <main>
      <header className="journal-header container">
        <span className="tag tag-accent-2">The Journal</span>
        <h1>Journal</h1>
        <p className="journal-lede">
          Notes from the making of Birken Lofts &mdash; construction, selections, and the
          building&rsquo;s second century.
        </p>
      </header>
      <div className="container">
        {posts.length === 0 ? (
          <p className="journal-empty">First entries are on their way.</p>
        ) : (
          <div className="journal-grid">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}/`} className="card elev-sm journal-card">
                {p.feature_image && p.feature_image_width && p.feature_image_height && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.feature_image}
                    alt=""
                    width={p.feature_image_width}
                    height={p.feature_image_height}
                    loading="lazy"
                    className="journal-card-img"
                  />
                )}
                <div className="journal-card-meta">
                  {formatPostDate(p.published_at)} · {Math.max(1, p.reading_time)} min read
                </div>
                <div className="card-title">{p.title}</div>
                {p.custom_excerpt && <div className="card-body">{p.custom_excerpt}</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
