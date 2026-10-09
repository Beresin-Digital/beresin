/**
 * Sitemap, generated at build time.
 *
 * Why a route instead of `@astrojs/sitemap`: that integration writes its files
 * from the `astro:build:done` hook, which runs *after* `@astrojs/node` snapshots
 * the static asset manifest. The Node server only serves paths in that manifest,
 * so the generated `sitemap-*.xml` files 404 on the origin (`astro preview` and
 * `node ./dist/server/entry.mjs` alike). A prerendered route is part of the
 * manifest, so it is served identically by the Node origin and by Caddy.
 *
 * Routes are discovered from the file tree rather than listed by hand, so adding
 * a page cannot silently leave it out of the sitemap.
 */
import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const prerender = true;

/** Raw source of every page, keyed by path relative to `src/pages`. */
const pageSources = import.meta.glob('./**/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Route prefixes that must never be indexed. */
const EXCLUDED_SEGMENTS = new Set(['admin', 'api']);

/** Pages whose content changes rarely; ranked below the marketing pages. */
const LOW_PRIORITY = new Set(['/kebijakan-privasi', '/syarat-ketentuan']);

function toUrl(relPath: string): string | null {
  // './index.astro' -> '/', './artikel/index.astro' -> '/artikel'
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

/** Build date — the sitemap is regenerated on every deploy, so this is honest. */
const lastmod = new Date().toISOString().slice(0, 10);

const paths = Object.entries(pageSources)
  // Pages that opt out of prerendering are server-only and must not be listed.
  .filter(([, source]) => !/export\s+const\s+prerender\s*=\s*false/.test(source))
  .map(([relPath]) => toUrl(relPath))
  .filter((path): path is string => path !== null)
  // '/' first, then alphabetical — stable, diff-friendly output.
  .sort((a, b) => (a === '/' ? '' : a).localeCompare(b === '/' ? '' : b));

// TODO(phase-4): append published article URLs from the `articles` table here.
const entries = paths.map((path) => {
  const { priority, changefreq } = rank(path);
  const loc = `${site.url}${path === '/' ? '/' : path}`;
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
});

const body = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  '',
].join('\n');

export const GET: APIRoute = () =>
  new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Prerendered output is written to disk, so in production Caddy owns the
      // caching headers. This applies to `astro dev` only.
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
