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
  const description = post.custom_excerpt ?? `${post.title} — from the Birken Lofts Journal.`;
  return {
    title: `${post.title} | Birken Lofts Journal`,
    description,
    alternates: { canonical: `https://birkenlofts.com/blog/${post.slug}/` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `https://birkenlofts.com/blog/${post.slug}/`,
      images: post.feature_image ? [`https://birkenlofts.com${post.feature_image}`] : undefined,
    },
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
    datePublished: post.published_at,
    dateModified: post.updated_at,
    ...(post.feature_image ? { image: `https://birkenlofts.com${post.feature_image}` } : {}),
    mainEntityOfPage: `https://birkenlofts.com/blog/${post.slug}/`,
    author: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
    publisher: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="post container">
        <header className="post-header">
          <Link className="post-back" href="/blog/">
            &larr; Journal
          </Link>
          {post.tags.length > 0 && <span className="tag tag-accent-2">{post.tags[0]}</span>}
          <h1>{post.title}</h1>
          <p className="post-meta">
            {formatPostDate(post.published_at)} · {Math.max(1, post.reading_time)} min read
          </p>
        </header>
        {post.feature_image && post.feature_image_width && post.feature_image_height && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.feature_image}
            alt=""
            width={post.feature_image_width}
            height={post.feature_image_height}
            className="post-feature"
            fetchPriority="high"
          />
        )}
        <div className="post-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        <section className="history-cta">
          <p>Come see the building behind the stories.</p>
          <div className="history-cta-btns">
            <Link className="btn btn-primary" href="/#contact">Join the interest list</Link>
            <Link className="btn btn-secondary" href="/#plans">View floor plans</Link>
          </div>
        </section>
      </article>
    </main>
  );
}
