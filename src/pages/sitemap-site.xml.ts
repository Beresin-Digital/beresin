/**
 * Sitemap.
 *
 * Why a route instead of `@astrojs/sitemap`: that integration writes its files
 * from the `astro:build:done` hook, which runs *after* `@astrojs/node` snapshots
 * the static asset manifest. The Node server only serves paths in that manifest,
 * so the generated `sitemap-*.xml` files 404 on the origin (`astro preview` and
 * `node ./dist/server/entry.mjs` alike). A route is part of the manifest, so it
 * is served identically by the Node origin and by Caddy.
 *
 * Server-rendered because the article URLs come from the database. The static
 * page list is still discovered from the file tree rather than listed by hand,
 * so adding a page cannot silently leave it out.
 */
import type { APIRoute } from 'astro';
import { listPublishedArticles } from '../lib/articles';
import { isoDate } from '../lib/format';
import { site } from '../data/site';

export const prerender = false;

/** Raw source of every page, keyed by path relative to `src/pages`. */
const pageSources = import.meta.glob(['./**/*.astro', '!./sekolah/**/*.astro'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Route prefixes that must never be indexed. */
const EXCLUDED_SEGMENTS = new Set(['admin', 'api', 'sekolah']);

/** Pages whose content changes rarely; ranked below the marketing pages. */
const LOW_PRIORITY = new Set(['/privacy-policy', '/terms-and-conditions']);

function toUrl(relPath: string): string | null {
  // './index.astro' -> '/', './articles/index.astro' -> '/articles'
  const segments = relPath.replace(/^\.\//, '').replace(/\.astro$/, '').split('/');

  if (
    segments.some(
      (segment) =>
        segment.startsWith('[') || // dynamic route — enumerated separately
        segment.startsWith('_') || // private/partial
        EXCLUDED_SEGMENTS.has(segment)
    )
  ) {
    return null;
  }

  const last = segments[segments.length - 1];
  if (last === '404') return null;

  const clean = last === 'index' ? segments.slice(0, -1) : segments;
  return `/${clean.join('/')}`;
}

function rank(path: string): { priority: string; changefreq: string } {
  if (path === '/') return { priority: '1.0', changefreq: 'weekly' };
  if (LOW_PRIORITY.has(path)) return { priority: '0.3', changefreq: 'yearly' };
  const depth = path.split('/').filter(Boolean).length;
  return depth === 1
    ? { priority: '0.8', changefreq: 'monthly' }
    : { priority: '0.6', changefreq: 'monthly' };
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Every route discovered from the file tree, including the ones that render
 * server-side. Unlike the earlier build-time version, this no longer drops pages
 * that carry `export const prerender = false` — `/`, `/articles` and `/portfolio`
 * are exactly those pages now, and they are the ones that matter most.
 */
const staticPaths = Object.entries(pageSources)
  .map(([relPath]) => toUrl(relPath))
  .filter((path): path is string => path !== null)
  // '/' first, then alphabetical — stable, diff-friendly output.
  .sort((a, b) => (a === '/' ? '' : a).localeCompare(b === '/' ? '' : b));

export const GET: APIRoute = async () => {
  const articles = await listPublishedArticles();

  const entries = [
    ...staticPaths.map((path) => {
      const { priority, changefreq } = rank(path);
      return {
        loc: `${site.url}${path === '/' ? '/' : path}`,
        lastmod: null, // No recorded content update date for these pages.
        changefreq,
        priority,
      };
    }),
    ...articles.map((article) => ({
      loc: `${site.url}/articles/${article.slug}`,
      lastmod: isoDate(article.updatedAt),
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) =>
      [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        ...(entry.lastmod ? [`    <lastmod>${entry.lastmod}</lastmod>`] : []),
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        '  </url>',
      ].join('\n')
    ),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
