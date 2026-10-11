import type { APIRoute } from 'astro';
import { directoryPaths } from '../../lib/directory/data';
import { site } from '../../data/site';
export const prerender = true;
export const GET: APIRoute = () => new Response([
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...directoryPaths.map(path => `<url><loc>${site.url}${path}</loc></url>`),
  '</urlset>',
].join('\n'), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
