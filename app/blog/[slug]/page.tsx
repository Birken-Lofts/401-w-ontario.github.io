import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPostDate, getAllPosts, getPost } from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  const posts = getAllPosts();
  // "output: export" fails the build if a dynamic route prerenders zero paths,
  // so emit a placeholder (rendered as 404 via notFound) until the first post syncs.
  if (posts.length === 0) return [{ slug: 'coming-soon' }];
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const description = post.meta_description ?? post.custom_excerpt ?? `${post.title} — from the Birken Lofts Journal.`;
  return {
    title: `${post.title} | Birken Lofts Journal`,
    description,
    alternates: { canonical: `https://birkenlofts.com/blog/${post.slug}/` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `https://birkenlofts.com/blog/${post.slug}/`,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: post.feature_image
        ? [
            {
              url: `https://birkenlofts.com${post.feature_image}`,
              ...(post.feature_image_width && post.feature_image_height
                ? { width: post.feature_image_width, height: post.feature_image_height }
                : {}),
              ...(post.feature_image_alt ? { alt: post.feature_image_alt } : {}),
            },
          ]
        : [{ url: 'https://birkenlofts.com/images/og/birken-lofts-og.jpg', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description ?? post.custom_excerpt ?? `${post.title} — from the Birken Lofts Journal.`,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    ...(post.feature_image ? { image: `https://birkenlofts.com${post.feature_image}` } : {}),
    mainEntityOfPage: `https://birkenlofts.com/blog/${post.slug}/`,
    author: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
    publisher: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <header className="post-header-band">
        <div className="post-header post-shell">
          <Link className="post-back" href="/blog/">
            &larr; Journal
          </Link>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span>{formatPostDate(post.published_at)}</span>
            <span className="post-meta-dot">&bull;</span>
            <span>{post.tags[0] ?? `${Math.max(1, post.reading_time)} min read`}</span>
          </div>
        </div>
      </header>
      <article className="post-body">
        <div className="post-shell">
          {post.feature_image && post.feature_image_width && post.feature_image_height && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.feature_image}
              alt={post.feature_image_alt ?? ''}
              width={post.feature_image_width}
              height={post.feature_image_height}
              className="post-feature"
              fetchPriority="high"
            />
          )}
          <div className="post-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
          <div className="post-end">
            <Link className="btn btn-primary" href="/#contact">Join the interest list</Link>
            <Link className="btn btn-secondary" href="/blog/">More from the Journal</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
