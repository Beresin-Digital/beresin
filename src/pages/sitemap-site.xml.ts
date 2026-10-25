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
  // Rank the EN twin on its ID-equivalent path, so /en/about ranks like
  // /about rather than one depth lower.
  const base = path === '/en' ? '/' : path.replace(/^\/en\//, '/');
  if (base === '/') return { priority: '1.0', changefreq: 'weekly' };
  if (LOW_PRIORITY.has(base)) return { priority: '0.3', changefreq: 'yearly' };
  const depth = base.split('/').filter(Boolean).length;
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

// Indonesian entries first, then English: the file tree already discovers
// `en/*.astro` (toUrl maps './en/index.astro' to '/en' and './en/about.astro'
// to '/en/about'), so the only work is the partition.
const isEnPath = (path: string) => path === '/en' || path.startsWith('/en/');
const idPaths = staticPaths.filter((path) => !isEnPath(path));
const enPaths = staticPaths.filter(isEnPath);

export const GET: APIRoute = async () => {
  const [idArticles, enArticles] = await Promise.all([
    listPublishedArticles('id'),
    listPublishedArticles('en'),
  ]);

  // Static pages carry hreflang alternates: the ID URL, the EN URL, and
  // x-default pointing at the ID URL (Indonesian is the default locale).
  // Article entries carry none. Slugs are per-locale with no pair data, so a
  // cross-link would be a guess, not a pair.
  const alternateLinks = (path: string): { hreflang: string; href: string }[] => {
    const idPath = path === '/en' ? '/' : path.replace(/^\/en\//, '/');
    const enPath = idPath === '/' ? '/en' : `/en${idPath}`;
    return [
      { hreflang: 'id', href: `${site.url}${idPath}` },
      { hreflang: 'en', href: `${site.url}${enPath}` },
      { hreflang: 'x-default', href: `${site.url}${idPath}` },
    ];
  };

  const staticEntries = [...idPaths, ...enPaths].map((path) => {
    const { priority, changefreq } = rank(path);
    return {
      loc: `${site.url}${path === '/' ? '/' : path}`,
      lastmod: null as string | null, // No recorded content update date for these pages.
      changefreq,
      priority,
      alternates: alternateLinks(path),
    };
  });

  const articleEntries = [
    ...idArticles.map((article) => ({
      loc: `${site.url}/articles/${article.slug}`,
      lastmod: isoDate(article.updatedAt),
      changefreq: 'monthly',
      priority: '0.6',
      alternates: [] as { hreflang: string; href: string }[],
    })),
    ...enArticles.map((article) => ({
      loc: `${site.url}/en/articles/${article.slug}`,
      lastmod: isoDate(article.updatedAt),
      changefreq: 'monthly',
      priority: '0.6',
      alternates: [] as { hreflang: string; href: string }[],
    })),
  ];

  const entries = [...staticEntries, ...articleEntries];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map((entry) =>
      [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        ...entry.alternates.map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />`
        ),
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
