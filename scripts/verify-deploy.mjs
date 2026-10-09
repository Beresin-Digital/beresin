import assert from 'node:assert/strict';

const base = process.env.BASE_URL || 'http://localhost:4321';
const headers = {
  Host: 'beresindigital.id',
  'X-Forwarded-Host': 'beresindigital.id',
  'X-Forwarded-Proto': 'https',
  'X-Forwarded-For': '203.0.113.20',
};
for (const path of ['/', '/contact', '/admin/login', '/sitemap.xml']) {
  const response = await fetch(base + path, { headers, redirect: 'manual' });
  assert.equal(response.status, 200, path);
}
let response = await fetch(base + '/admin', { headers, redirect: 'manual' });
assert.equal(response.status, 302);
assert.equal(response.headers.get('location'), '/admin/login?next=%2Fadmin');

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
  const contactBase = www && base === 'https://beresindigital.id' ? origin : base;
  response = await fetch(contactBase + '/api/contact', {
    method: 'POST',
    headers: { ...headers, ...(www ? { Host: 'www.beresindigital.id', 'X-Forwarded-Host': 'www.beresindigital.id' } : {}), Origin: origin },
    body: new URLSearchParams(fields),
    redirect: 'manual',
  });
  assert.equal(response.status, status, origin);
  assert.equal(response.headers.get('location'), location, origin);
}
console.log('Deploy smoke checks passed: pages, admin guard, proxy HTTPS, contact redirects, CSRF.');
