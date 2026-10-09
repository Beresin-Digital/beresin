#!/usr/bin/env node
/**
 * End-to-end verification of the CMS: articles, clients, portfolio.
 *
 * Run the built server first, then this:
 *
 *   pnpm build
 *   node dist/server/entry.mjs            # in another terminal
 *   node scripts/verify-content.mjs
 *
 * `verify-admin.mjs` covers the leads inbox; this covers the content surface
 * added with it. Like that harness, the admin pages are `prerender = false`, so
 * this drives the live server over HTTP rather than the build output.
 *
 * Credentials come from the environment, never from a flag:
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' node scripts/verify-content.mjs
 *
 * Without them the authenticated assertions are reported as SKIP rather than
 * silently passing. The public-page and traversal checks still run.
 *
 * Every row it creates is namespaced under a per-run prefix and deleted again at
 * the end (via the real delete actions, so uploaded files are cleaned up too),
 * which keeps re-runs idempotent and leaves no residue on the public site.
 */
import { readFile } from 'node:fs/promises';
import postgres from 'postgres';
import { dbConfig, missingDbVars } from '../src/lib/db-env.mjs';

try {
  process.loadEnvFile('.env');
} catch {
  /* fall back to the real environment */
}

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const FORM = { 'Content-Type': 'application/x-www-form-urlencoded' };

/** Per-run namespace: every slug/name the harness writes carries it. */
const run = Date.now().toString(36);
const PREFIX = `verify-${run}`;

let passed = 0;
let failed = 0;
let skipped = 0;

function check(label, ok, detail = '') {
  if (ok === 'skip') {
    skipped++;
    console.log(`SKIP  ${label}${detail ? `  (${detail})` : ''}`);
    return;
  }
  if (ok) {
    passed++;
    console.log(`ok    ${label}`);
  } else {
    failed++;
    console.log(`FAIL  ${label}${detail ? `  → ${detail}` : ''}`);
  }
}

// --- cookie jar ------------------------------------------------------------
const jar = new Map();

function storeCookies(res) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const pair = raw.split(';')[0];
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (value === '') jar.delete(name);
    else jar.set(name, value);
  }
}

const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');

async function req(path, { method = 'GET', headers, body, auth = true } = {}) {
  const h = new Headers(headers);
  if (auth && jar.size) h.set('cookie', cookieHeader());

  const res = await fetch(`${BASE}${path}`, { method, headers: h, body, redirect: 'manual' });
  storeCookies(res);

  return { status: res.status, headers: res.headers, body: await res.text() };
}

const form = (fields) => new URLSearchParams(fields).toString();
const location = (res) => res.headers.get('location') ?? '';
const isRedirect = (res) => res.status >= 300 && res.status < 400;

// --- database handle (id lookup + row-gone assertions) ---------------------

let sql = null;
if (missingDbVars().length === 0) {
  sql = postgres(dbConfig(), { max: 1, onnotice: () => {} });
}

async function idOf(table, column, value) {
  if (!sql) return null;
  const rows = await sql`SELECT id FROM ${sql(table)} WHERE ${sql(column)} = ${value} LIMIT 1`;
  return rows[0]?.id ?? null;
}

/** Removes any residue from an earlier aborted run with the same prefix. */
async function purge(prefix) {
  if (!sql) return;
  await sql`DELETE FROM articles WHERE slug LIKE ${prefix + '%'}`;
  await sql`DELETE FROM clients WHERE name LIKE ${'Verify ' + prefix + '%'}`;
  await sql`DELETE FROM projects WHERE slug LIKE ${prefix + '%'}`;
}

// --- reachability ----------------------------------------------------------
try {
  await fetch(`${BASE}/`, { redirect: 'manual' });
} catch (err) {
  console.error(`\n✗ Tidak bisa menyambung ke ${BASE} — apakah server sudah jalan?`);
  console.error(`  node dist/server/entry.mjs\n  (${err.message})`);
  process.exit(1);
}

console.log(`\nContent verification → ${BASE}\n`);

// --- 1. uploads route (no auth, no DB) -------------------------------------
console.log('1. Rute /uploads');

{
  // Percent-encoded `../` must not escape the upload root.
  const res = await req('/uploads/%2e%2e%2f%2e%2e%2fpackage.json', { auth: false });
  check('traversal terenkode → 404', res.status === 404, String(res.status));
  check('traversal tidak membocorkan isi', !res.body.includes('"name"'), res.body.slice(0, 40));
}

{
  const res = await req('/uploads/%2e%2e%2f.env', { auth: false });
  check('traversal .env → 404', res.status === 404, String(res.status));
}

{
  const res = await req('/uploads/articles/tidak-ada.webp', { auth: false });
  check('gambar tidak ada → 404', res.status === 404, String(res.status));
}

// --- 2. public pages reachable ---------------------------------------------
console.log('\n2. Halaman publik');

for (const path of ['/', '/articles', '/portfolio']) {
  const res = await req(path, { auth: false });
  check(`GET ${path} → 200`, res.status === 200, String(res.status));
}

// --- 3. authenticated CMS flow ---------------------------------------------
console.log('\n3. Alur CMS (dengan sesi)');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  check('alur CMS', 'skip', 'set ADMIN_EMAIL dan ADMIN_PASSWORD');
} else {
  await purge(PREFIX);

  const login = await req('/admin/login?_action=login', {
    method: 'POST',
    headers: FORM,
    body: form({ email, password }),
    auth: false,
  });
  check('login → redirect', isRedirect(login), String(login.status));

  if (!jar.size) {
    check('alur CMS', 'skip', 'login gagal, tidak ada cookie untuk dilanjutkan');
  } else {
    // --- article (published, with a cover upload) --------------------------
    const articleTitle = `Verify Article ${run}`;
    const articleSlug = PREFIX + '-article';
    const articleBody = `Marker-${run}-BODY`;
    const coverBytes = await readFile('src/assets/images/article-cover.webp');

    const articleForm = new FormData();
    articleForm.set('title', articleTitle);
    articleForm.set('slug', articleSlug);
    articleForm.set('excerpt', 'Ringkasan verifikasi.');
    articleForm.set('body', `## Bagian\n\n${articleBody}`);
    articleForm.set('category', 'Verification');
    articleForm.set('status', 'published');
    articleForm.set('cover', new Blob([coverBytes], { type: 'image/webp' }), 'cover.webp');

    const saveArticle = await req('/admin/articles/new?_action=saveArticle', {
      method: 'POST',
      body: articleForm,
    });
    check('POST saveArticle → redirect', isRedirect(saveArticle), String(saveArticle.status));
    check('redirect ke /admin/articles', location(saveArticle).includes('/admin/articles'), location(saveArticle));

    const articleId = await idOf('articles', 'slug', articleSlug);
    check('artikel tersimpan di DB', articleId !== null, articleId ?? 'tidak ditemukan');

    {
      const res = await req('/articles', { auth: false });
      check('artikel muncul di /articles', res.body.includes(articleTitle));
    }
    {
      const res = await req('/', { auth: false });
      check('artikel muncul di /', res.body.includes(articleTitle));
    }

    let coverUrl = null;
    {
      const res = await req(`/articles/${articleSlug}`, { auth: false });
      check('detail artikel → 200', res.status === 200, String(res.status));
      check('detail memuat isi', res.body.includes(articleBody));
      coverUrl = /\/uploads\/articles\/[0-9a-f]+-\d+\.webp/.exec(res.body)?.[0] ?? null;
    }

    if (!coverUrl) {
      check('sampul tersaji', 'skip', 'tidak menemukan URL sampul di halaman');
    } else {
      const res = await fetch(`${BASE}${coverUrl}`, { redirect: 'manual' });
      check('sampul → 200', res.status === 200, String(res.status));
      check('sampul image/webp', res.headers.get('content-type') === 'image/webp', res.headers.get('content-type') ?? '(kosong)');
      check(
        'sampul immutable',
        (res.headers.get('cache-control') ?? '').includes('immutable'),
        res.headers.get('cache-control') ?? '(kosong)'
      );
    }

    // --- article (draft) ---------------------------------------------------
    const draftSlug = PREFIX + '-draft';
    const saveDraft = await req('/admin/articles/new?_action=saveArticle', {
      method: 'POST',
      headers: FORM,
      body: form({
        title: `Verify Draft ${run}`,
        slug: draftSlug,
        body: 'belum terbit',
        status: 'draft',
      }),
    });
    check('POST draf → redirect', isRedirect(saveDraft), String(saveDraft.status));
    const draftId = await idOf('articles', 'slug', draftSlug);

    {
      const res = await req(`/articles/${draftSlug}`, { auth: false });
      check('draf → 404 di halaman publik', res.status === 404, String(res.status));
    }

    // --- client ------------------------------------------------------------
    const clientName = `Verify Client ${run}`;
    const saveClient = await req('/admin/clients/new?_action=saveClient', {
      method: 'POST',
      headers: FORM,
      body: form({
        name: clientName,
        category: 'Verification',
        icon: 'building-2',
        isActive: 'on',
      }),
    });
    check('POST saveClient → redirect', isRedirect(saveClient), String(saveClient.status));

    {
      const res = await req('/', { auth: false });
      check('klien aktif muncul di /', res.body.includes(clientName));
    }

    // --- project (concept — the honesty rule) ------------------------------
    const projectSlug = PREFIX + '-project';
    const projectTitle = `Verify Concept ${run}`;
    const wrongClient = `SENTINEL-CLIENT-${run}`;
    const wrongLabel = `SENTINEL-LABEL-${run}`;
    const saveProject = await req('/admin/portfolio/new?_action=saveProject', {
      method: 'POST',
      headers: FORM,
      body: form({
        title: projectTitle,
        slug: projectSlug,
        category: 'Verification',
        summary: 'Proyek konsep verifikasi.',
        overview: 'Proyek konsep verifikasi.',
        scope: 'Satu\nDua',
        highlights: 'Satu\nDua',
        status: 'concept',
        // Both of these must be overridden for concept work.
        clientName: wrongClient,
        statusLabel: wrongLabel,
        isPublished: 'on',
      }),
    });
    check('POST saveProject → redirect', isRedirect(saveProject), String(saveProject.status));

    {
      const res = await req('/portfolio', { auth: false });
      check('proyek muncul di /portfolio', res.body.includes(projectTitle));
      check('proyek konsep berlabel "Concept Project"', res.body.includes('Concept Project'));
      check('label palsu diabaikan', !res.body.includes(wrongLabel));
      check('nama klien konsep dibuang', !res.body.includes(wrongClient));
    }

    if (sql) {
      const [row] = await sql`
        SELECT client_name, status_label FROM projects WHERE slug = ${projectSlug} LIMIT 1
      `;
      check('DB: client_name konsep = null', row ? row.client_name === null : false, String(row?.client_name));
      check('DB: status_label konsep = "Concept Project"', row?.status_label === 'Concept Project', String(row?.status_label));
    }

    // --- cleanup (exercises the delete actions) ----------------------------
    console.log('\n4. Pembersihan');

    for (const [label, id] of [
      ['deleteArticle (terbit)', articleId],
      ['deleteArticle (draf)', draftId],
    ]) {
      if (id === null) continue;
      const del = await req('/admin/articles?_action=deleteArticle', {
        method: 'POST',
        headers: FORM,
        body: form({ id: String(id) }),
      });
      check(`${label} → redirect`, isRedirect(del), String(del.status));
    }

    const clientId = await idOf('clients', 'name', clientName);
    if (clientId !== null) {
      const del = await req('/admin/clients?_action=deleteClient', {
        method: 'POST',
        headers: FORM,
        body: form({ id: String(clientId) }),
      });
      check('deleteClient → redirect', isRedirect(del), String(del.status));
    }

    const projectId = await idOf('projects', 'slug', projectSlug);
    if (projectId !== null) {
      const del = await req('/admin/portfolio?_action=deleteProject', {
        method: 'POST',
        headers: FORM,
        body: form({ id: String(projectId) }),
      });
      check('deleteProject → redirect', isRedirect(del), String(del.status));
    }

    if (sql) {
      const [{ n: articles }] = await sql`SELECT count(*)::int AS n FROM articles WHERE slug LIKE ${PREFIX + '%'}`;
      const [{ n: projects }] = await sql`SELECT count(*)::int AS n FROM projects WHERE slug LIKE ${PREFIX + '%'}`;
      const [{ n: clients }] = await sql`SELECT count(*)::int AS n FROM clients WHERE name = ${clientName}`;
      check('baris uji terhapus', articles + projects + clients === 0, `artikel ${articles} · proyek ${projects} · klien ${clients}`);
    }
  }
}

// --- summary ---------------------------------------------------------------
console.log(`\n${passed} lolos · ${failed} gagal · ${skipped} dilewati\n`);
if (sql) await sql.end();
process.exit(failed === 0 ? 0 : 1);
