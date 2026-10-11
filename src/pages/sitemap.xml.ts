import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const prerender = true;
export const GET: APIRoute = () => new Response([
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...['/sitemap-site.xml', '/sekolah/sitemap.xml'].map(path => `<sitemap><loc>${site.url}${path}</loc></sitemap>`),
  '</sitemapindex>',
].join('\n'), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
