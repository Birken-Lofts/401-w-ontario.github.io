import fs from 'node:fs';
import path from 'node:path';

export interface Post {
  slug: string;
  title: string;
  custom_excerpt: string | null;
  meta_description: string | null;
  html: string;
  feature_image: string | null;
  feature_image_width: number | null;
  feature_image_height: number | null;
  feature_image_alt: string | null;
  published_at: string;
  updated_at: string;
  reading_time: number;
  tags: string[];
}

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const EXCLUDED_POSTS = new Set(['first-look-the-finish-selections']);

export function getAllPosts(): Post[] {
  const indexPath = path.join(POSTS_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) return [];
  const slugs: string[] = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  return slugs
    .filter((slug) => !EXCLUDED_POSTS.has(slug))
    .map((slug) => JSON.parse(fs.readFileSync(path.join(POSTS_DIR, `${slug}.json`), 'utf8')));
}

export function getPost(slug: string): Post | null {
  if (EXCLUDED_POSTS.has(slug)) return null;
  const file = path.join(POSTS_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Chicago',
  });
}
