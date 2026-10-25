import assert from 'node:assert/strict';

const base = process.env.BASE_URL || 'http://localhost:4321';
const headers = {
  Host: 'beresindigital.id',
  'X-Forwarded-Host': 'beresindigital.id',
  'X-Forwarded-Proto': 'https',
  'X-Forwarded-For': '203.0.113.20',
};
for (const path of ['/', '/portfolio', '/articles', '/contact', '/admin/login', '/sitemap.xml', '/sitemap-site.xml', '/sekolah', '/sekolah/cari', '/sekolah/tentang-data', '/sekolah/sitemap.xml']) {
  const response = await fetch(base + path, { headers, redirect: 'manual' });
  assert.equal(response.status, 200, path);
}
const siteSitemapResponse = await fetch(base + '/sitemap-site.xml', { headers });
const siteSitemap = await siteSitemapResponse.text();
const sitemapEntries = [...siteSitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)];
assert.ok(sitemapEntries.length > 0, 'Nonempty site sitemap');
for (const [, entry] of sitemapEntries) {
  const loc = entry.match(/<loc>(.*?)<\/loc>/)?.[1];
  assert.ok(loc, 'Sitemap URL');
  const path = new URL(loc).pathname;
  if (!path.startsWith('/articles/')) {
    assert.ok(!entry.includes('<lastmod>'), `Unknown content update date must be omitted: ${path}`);
    continue;
  }
  const articleResponse = await fetch(base + path, { headers });
  assert.equal(articleResponse.status, 200, path);
  const html = await articleResponse.text();
  const nodes = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].flatMap(match => JSON.parse(match[1])['@graph']);
  const article = nodes.find(node => node['@type'] === 'BlogPosting');
  assert.ok(article?.dateModified, `Article update timestamp: ${path}`);
  const updatedOn = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(new Date(article.dateModified));
  assert.equal(entry.match(/<lastmod>(.*?)<\/lastmod>/)?.[1], updatedOn, `Article sitemap date matches content: ${path}`);
}
const llmsResponse = await fetch(base + '/llms.txt', { headers });
assert.equal(llmsResponse.status, 200, '/llms.txt');
assert.match(llmsResponse.headers.get('content-type'), /^text\/plain\b/);
const llms = await llmsResponse.text();
assert.match(llms, /^# Beresin Digital\n/);
for (const [, url] of llms.matchAll(/\]\((https:\/\/beresindigital\.id[^)]+)\)/g)) {
  const response = await fetch(base + new URL(url).pathname, { headers, redirect: 'manual' });
  assert.equal(response.status, 200, `llms.txt link: ${url}`);
}
const directoryResponse = await fetch(base + '/sekolah/index-pencarian.json', { headers });
assert.equal(directoryResponse.status, 200);
const directoryIndex = await directoryResponse.json();
assert.ok(directoryIndex.length > 0);
const profileResponse = await fetch(base + directoryIndex[0].path, { headers });
assert.equal(profileResponse.status, 200);
assert.ok((await profileResponse.text()).includes(directoryIndex[0].npsn));
let response = await fetch(base + '/admin', { headers, redirect: 'manual' });
assert.equal(response.status, 302);
assert.equal(response.headers.get('location'), '/admin/login?next=%2Fadmin');

// Node fetch does not send `sec-fetch-site` the way a browser does, and
// Astro's origin check (security.checkOrigin) lets `same-origin` through
// immediately. Without it these POSTs fall back to an Origin-vs-URL
// comparison that fails behind the staging proxy, even though a real
// browser submit succeeds. The evil-origin case deliberately omits the
// header so it still exercises the 403 path.
for (const [origin, fields, status, location] of [
  ['https://beresindigital.id', { company_website: 'bot', page_url: '/contact' }, 303, '/contact?terkirim=1'],
  ['https://beresindigital.id', { page_url: '/contact' }, 303, '/contact?gagal=nama'],
  // A non-local `page_url` is refused and the visitor is sent to the homepage
  // instead; the homepage form lives under the `#contact` anchor.
  ['https://beresindigital.id', { company_website: 'bot', page_url: '//evil.example' }, 303, '/?terkirim=1#contact'],
  ['https://www.beresindigital.id', { company_website: 'bot', page_url: '/contact' }, 303, '/contact?terkirim=1'],
  ['https://evil.example', { company_website: 'bot' }, 403, null],
]) {
  const www = origin === 'https://www.beresindigital.id';
  const evil = origin === 'https://evil.example';
  const contactBase = www && base === 'https://beresindigital.id' ? origin : base;
  response = await fetch(contactBase + '/api/contact', {
    method: 'POST',
    headers: { ...headers, ...(www ? { Host: 'www.beresindigital.id', 'X-Forwarded-Host': 'www.beresindigital.id' } : {}), Origin: origin, ...(evil ? {} : { 'sec-fetch-site': 'same-origin' }) },
    body: new URLSearchParams(fields),
    redirect: 'manual',
  });
  assert.equal(response.status, status, origin);
  assert.equal(response.headers.get('location'), location, origin);
}
console.log('Deploy smoke checks passed: pages, accurate sitemap dates, llms.txt and public links, admin guard, proxy HTTPS, contact redirects, CSRF.');
