import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-static';

const BASE = 'https://birkenlofts.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newestPost = posts[0]?.published_at;
  return [
    { url: `${BASE}/`, lastModified: '2026-03-18', changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/history/`, lastModified: '2026-07-15', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/finishes/`, lastModified: '2026-07-15', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/`, lastModified: newestPost ?? '2026-07-16', changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/ohio-feeder-ramp-cam/`, lastModified: '2026-07-14', changeFrequency: 'monthly', priority: 0.6 },
    ...posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}/`,
      lastModified: p.updated_at,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
