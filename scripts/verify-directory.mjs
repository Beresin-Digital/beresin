import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { directory, directoryPaths, listingPath, regencies, sourceLabel, DIRECTORY_PAGE_SIZE } from '../src/lib/directory/data.ts';

const started = performance.now();
const base = 'https://beresindigital.id';
const paths = new Set([...directoryPaths, '/sekolah/cari']);
const readPage = path => readFileSync(`dist/client${path}/index.html`, 'utf8');
const index = JSON.parse(readFileSync('dist/client/sekolah/index-pencarian.json', 'utf8'));
assert.equal(index.length, directory.schools.length);
assert.deepEqual(index.map(school => school.npsn), directory.schools.map(school => school.npsn));
assert.ok(index.every(school => !('phone' in school) && !('email' in school) && !('website' in school)));
const sitemap = readFileSync('dist/client/sekolah/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(sitemapUrls, directoryPaths.map(path => base + path));
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length);
assert.ok(!sitemap.includes('/cari'));
assert.match(readFileSync('dist/client/sitemap.xml', 'utf8'), /sitemapindex/);
assert.match(readPage('/sekolah/cari'), /name="robots" content="noindex, nofollow"/);
assert.match(readPage('/sekolah/cari'), /id="school-level"/);
const llms = readFileSync('dist/client/llms.txt', 'utf8');
assert.match(llms, /^# Beresin Digital\n\n> /);
assert.ok(llms.includes(`${directory.schools.length} sekolah dan lembaga pendidikan`));
assert.ok(llms.includes('belum seluruhnya diverifikasi ulang'));
for (const dataset of directory.datasets) {
  assert.ok(llms.includes(sourceLabel(dataset)));
  assert.ok(readPage('/sekolah/tentang-data').includes(sourceLabel(dataset)));
  if (dataset.sourceUrl) {
    assert.ok(llms.includes(dataset.sourceUrl));
    assert.ok(readPage('/sekolah/tentang-data').includes(`href="${dataset.sourceUrl}"`));
  }
}
for (const regency of regencies) assert.ok(llms.includes(base + listingPath(regency.provinceSlug, regency.slug)));
assert.ok(!/\/admin\b|\/api\b|\.data\/|data\/directory/.test(llms));
for (const regency of regencies) assert.ok(readPage('/sekolah').includes(`href="${listingPath(regency.provinceSlug, regency.slug)}"`));

const pageTitles = new Set();
for (const path of [...directoryPaths, '/sekolah/cari']) {
  const html = readPage(path);
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title?.trim(), `Missing page title: ${path}`);
  assert.ok(!pageTitles.has(title), `Duplicate page title: ${path}`);
  pageTitles.add(title);
  assert.match(html, /<html lang="id">/, path);
  assert.ok(html.includes(`<link rel="canonical" href="${base}${path}">`), path);
  if (path !== '/sekolah/cari') assert.match(html, /rel="describedby" href="\/llms.txt"/);
  for (const match of html.matchAll(/href="(\/sekolah[^"?#]*)"/g)) {
    const target = match[1].replace(/\/$/, '');
    assert.ok(paths.has(target), `Broken directory link ${target} in ${path}`);
  }
}
for (const school of directory.schools) {
  const html = readPage(school.path);
  assert.ok(html.match(/<title>(.*?)<\/title>/s)?.[1].includes(school.npsn), `NPSN in profile title: ${school.npsn}`);
  assert.ok(html.includes(school.npsn), school.npsn);
  assert.ok(html.includes(sourceLabel(school)), school.npsn);
  assert.ok(html.indexOf(sourceLabel(school)) < html.indexOf('id="school-contact"'), `Source date precedes contact: ${school.npsn}`);
  assert.ok(html.indexOf('id="school-contact"') < html.indexOf('id="school-facts"'), `Contact precedes identity: ${school.npsn}`);
  assert.match(html, /id="school-contact"/);
  assert.match(html, /data-share-profile/);
  assert.match(html, /data-copy-profile/);
  assert.ok(html.includes(`value="${base}${school.path}"`));
  if (school.phone || school.email || school.website) {
    assert.match(html, /href="#school-contact"/);
    assert.ok(html.includes('Kontak di atas berasal dari dataset.'), school.npsn);
    assert.ok(!html.includes('Informasi kontak belum tersedia pada dataset.'), school.npsn);
  } else {
    assert.ok(!html.includes('href="#school-contact"'), school.npsn);
    assert.ok(!html.includes('Kontak di atas berasal dari dataset.'), school.npsn);
    assert.ok(html.includes('Informasi kontak belum tersedia pada dataset.'), school.npsn);
  }
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
  const entity = blocks.flatMap(block => block['@graph']).find(node => node['@type'] === 'School');
  assert.equal(entity.name, school.name);
  assert.equal(entity.identifier.value, school.npsn);
  const ctas = [...html.matchAll(/href="(https:\/\/wa.me\/[^" ]+)"[^>]*data-directory-click="(?:whatsapp_consult_click|profile_claim_click)"/g)];
  assert.equal(ctas.length, 2);
  for (const match of ctas) {
    const link = new URL(match[1].replace(/&amp;/g, '&'));
    if (!link.searchParams.has('text')) continue;
    assert.equal(link.pathname, '/6281511112814');
    const message = link.searchParams.get('text');
    assert.ok(message.includes(school.name) && message.includes(school.npsn) && message.includes(base + school.path));
  }
}
for (const regency of regencies) {
  const records = directory.schools.filter(school => school.provinceSlug === regency.provinceSlug && school.regencySlug === regency.slug);
  const regionalIndex = JSON.parse(readFileSync(`dist/client${listingPath(regency.provinceSlug, regency.slug)}/index-pencarian.json`, 'utf8'));
  assert.deepEqual(regionalIndex.map(school => school.npsn), records.map(school => school.npsn), `Complete regional search index: ${regency.slug}`);
  assert.ok(regionalIndex.every(school => school.province === regency.province && school.regency === regency.name));
  const expected = new Set(records.map(school => school.path));
  const links = new Set();
  for (let page = 1; page <= Math.ceil(records.length / DIRECTORY_PAGE_SIZE); page++) {
    const html = readPage(listingPath(regency.provinceSlug, regency.slug, page));
    for (const [, target] of html.matchAll(/href="(\/sekolah[^"?#]*)"/g)) if (expected.has(target)) links.add(target);
  }
  assert.equal(links.size, records.length, 'All profiles must be reachable from paginated HTML');
}

function size(path) { return statSync(path).isDirectory() ? readdirSync(path).reduce((total, file) => total + size(join(path, file)), 0) : statSync(path).size; }
const assetSizes = [...readPage('/sekolah/cari').matchAll(/<script[^>]*src="([^" ]+)"/g)].map(match => ({ path: match[1], bytes: statSync('dist/client' + match[1]).size }));
const report = { ...JSON.parse(readFileSync('.data/directory-report.json', 'utf8')), profilePages: directory.schools.length, directoryPages: directoryPaths.length + 1, directoryOutputBytes: size('dist/client/sekolah'), searchIndexBytes: statSync('dist/client/sekolah/index-pencarian.json').size, searchPageScripts: assetSizes, verificationMs: Math.round(performance.now() - started) };
writeFileSync('.data/directory-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Directory build checks passed: ${report.profilePages} profiles, crawlable pagination, sitemap, metadata, canonical share links, llms.txt, and contextual WhatsApp links.`);
console.log(JSON.stringify(report, null, 2));
