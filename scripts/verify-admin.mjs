#!/usr/bin/env node
/**
 * End-to-end verification of the admin area.
 *
 * Run the built server first, then this:
 *
 *   pnpm build
 *   node dist/server/entry.mjs            # in another terminal
 *   node scripts/verify-admin.mjs
 *
 * The admin pages are `prerender = false`, so they never appear in
 * `dist/client` and `verify-structure.mjs` cannot see them. This harness drives
 * the live server over HTTP instead.
 *
 * Credentials come from the environment, never from a flag (argv is visible in
 * shell history and `ps`):
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' node scripts/verify-admin.mjs
 *
 * Without them the authenticated assertions are reported as SKIP rather than
 * silently passing.
 */
import { existsSync } from 'node:fs';
import postgres from 'postgres';
import { dbConfig, missingDbVars } from '../src/lib/db-env.mjs';

try {
  process.loadEnvFile('.env');
} catch {
  /* fall back to the real environment */
}

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const FORM = { 'Content-Type': 'application/x-www-form-urlencoded' };

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
// fetch does not persist cookies, so the session is tracked by hand.
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

async function req(path, { method = 'GET', headers, body, auth = true } = {}) {
  const h = new Headers(headers);
  if (auth && jar.size) h.set('cookie', [...jar].map(([k, v]) => `${k}=${v}`).join('; '));

  const res = await fetch(`${BASE}${path}`, { method, headers: h, body, redirect: 'manual' });
  storeCookies(res);

  // `Response.text()` strips a leading UTF-8 BOM (per the fetch spec's
  // "UTF-8 decode"), so keep the raw bytes as well — the CSV export's BOM can
  // only be asserted on the bytes, never on the decoded string.
  const raw = new Uint8Array(await res.arrayBuffer());

  return { status: res.status, headers: res.headers, body: new TextDecoder().decode(raw), raw };
}

const form = (fields) => new URLSearchParams(fields).toString();
const location = (res) => res.headers.get('location') ?? '';

// --- reachability ----------------------------------------------------------
try {
  await fetch(`${BASE}/`, { redirect: 'manual' });
} catch (err) {
  console.error(`\n✗ Tidak bisa menyambung ke ${BASE} — apakah server sudah jalan?`);
  console.error(`  node dist/server/entry.mjs\n  (${err.message})`);
  process.exit(1);
}

console.log(`\nAdmin verification → ${BASE}\n`);

// --- 1. unauthenticated ----------------------------------------------------
console.log('1. Tanpa sesi');

{
  const res = await req('/admin/leads', { auth: false });
  const loc = location(res);
  check(
    'GET /admin/leads → redirect ke /admin/login',
    res.status >= 300 && res.status < 400 && loc.startsWith('/admin/login'),
    `${res.status} ${loc}`
  );
  check('redirect membawa ?next=', loc.includes('next='), loc);
}

{
  const res = await req('/admin/login', { auth: false });
  check('halaman login → 200', res.status === 200, String(res.status));
  check(
    'login punya <meta robots noindex>',
    /<meta name="robots" content="noindex, nofollow"/.test(res.body)
  );
  check(
    'login punya X-Robots-Tag',
    res.headers.get('x-robots-tag') === 'noindex, nofollow',
    res.headers.get('x-robots-tag') ?? '(kosong)'
  );
  check(
    'login Cache-Control memuat no-store',
    (res.headers.get('cache-control') ?? '').includes('no-store'),
    res.headers.get('cache-control') ?? '(kosong)'
  );
}

{
  const res = await req('/admin/logout', { auth: false });
  check('GET /admin/logout → 405', res.status === 405, String(res.status));
  check('405 membawa Allow: POST', res.headers.get('allow') === 'POST', res.headers.get('allow') ?? '');
}

{
  const res = await req('/admin/leads/export.csv', { auth: false });
  check(
    'CSV tanpa sesi → redirect, bukan data',
    res.status >= 300 && res.status < 400,
    `${res.status} (body ${res.body.length} byte)`
  );
}

check('dist/client/admin/ tidak ada', !existsSync('dist/client/admin'));

/**
 * Clears the contact rate-limit buckets so the assertions are deterministic: a
 * previous run (or a manual poke) leaves the window spent, and the next valid
 * POST would otherwise be reported as rate-limited. Only `contact:%` is touched
 * — the login limiter is left alone. Called before section 2 (one valid POST
 * must succeed) and again before section 3 (exactly five must).
 */
async function resetContactBuckets() {
  if (missingDbVars().length > 0) return false;
  const sql = postgres(dbConfig(), { max: 1, onnotice: () => {} });
  try {
    await sql`DELETE FROM rate_limits WHERE key LIKE 'contact:%'`;
    return true;
  } catch (err) {
    console.log(`  (gagal mereset rate limit: ${err.message})`);
    return false;
  } finally {
    await sql.end();
  }
}

let canReset = await resetContactBuckets();

// --- 2. contact endpoint ---------------------------------------------------
console.log('\n2. Endpoint contact');

const unique = `Verify ${Date.now()}`;
const submit = (fields) =>
  req('/api/contact', { method: 'POST', headers: FORM, body: form(fields), auth: false });

{
  const res = await submit({
    name: unique,
    phone: '08123456789',
    email: 'verify@example.com',
    message: 'pesan verifikasi',
    source: 'verify',
    page_url: '/contact',
  });
  check('POST valid → 303', res.status === 303, String(res.status));
  check('redirect memuat terkirim=1', location(res).includes('terkirim=1'), location(res));
}

await submit({ name: '=1+1', phone: '08123', message: 'x', source: 'verify', page_url: '/contact' });

{
  const res = await submit({ name: '', phone: '08123', source: 'verify', page_url: '/contact' });
  check('nama kosong → gagal=nama', location(res).includes('gagal=nama'), location(res));
}

{
  const res = await submit({ name: 'Bot', phone: '08123', company_website: 'spam', page_url: '/contact' });
  check('honeypot → terkirim=1 (ditolak diam-diam)', location(res).includes('terkirim=1'), location(res));
}

{
  const res = await submit({ name: 'X', phone: '08123', page_url: '//evil.com' });
  const loc = location(res);
  check('page_url jahat tidak bocor ke Location', loc.startsWith('/') && !loc.startsWith('//'), loc);
}

// --- 3. rate limit ---------------------------------------------------------
console.log('\n3. Rate limit');

// Section 2 already spent some of the window; start this section clean.
canReset = await resetContactBuckets();

if (!canReset) {
  check('submission ke-6 ditolak', 'skip', 'butuh DB_* di .env');
} else {
  const outcomes = [];
  for (let i = 0; i < 6; i++) {
    const res = await submit({
      name: `${unique} rl${i}`,
      phone: '08123',
      message: 'rate limit',
      source: 'verify',
      page_url: '/contact',
    });
    outcomes.push(location(res).includes('terlalu-sering') ? 'blocked' : 'ok');
  }
  check('5 submission pertama lolos', outcomes.slice(0, 5).every((o) => o === 'ok'), outcomes.join(','));
  check('submission ke-6 → gagal=terlalu-sering', outcomes[5] === 'blocked', outcomes.join(','));
}

// --- 4. authenticated ------------------------------------------------------
console.log('\n4. Dengan sesi');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  check('login dan inbox', 'skip', 'set ADMIN_EMAIL dan ADMIN_PASSWORD');
} else {
  const login = await req('/admin/login?_action=login', {
    method: 'POST',
    headers: FORM,
    body: form({ email, password }),
    auth: false,
  });

  const cookies = login.headers.getSetCookie?.().join(' | ') ?? '';
  check('login benar → redirect', login.status === 302 || login.status === 303, String(login.status));
  check('men-set cookie beresin_admin', cookies.includes('beresin_admin='), cookies || '(tidak ada Set-Cookie)');
  check('cookie HttpOnly', /httponly/i.test(cookies));
  check('cookie Path=/admin', /path=\/admin/i.test(cookies));

  if (!jar.size) {
    check('inbox, CSV, ip_hash', 'skip', 'login gagal, tidak ada cookie untuk dilanjutkan');
  } else {
    const inbox = await req(`/admin/leads?q=${encodeURIComponent(unique)}`);
    check('inbox → 200', inbox.status === 200, String(inbox.status));
    check('lead hasil submit muncul di inbox', inbox.body.includes(unique));
    check(
      'inbox punya X-Robots-Tag',
      inbox.headers.get('x-robots-tag') === 'noindex, nofollow',
      inbox.headers.get('x-robots-tag') ?? '(kosong)'
    );

    const id = /\/admin\/leads\/(\d+)/.exec(inbox.body)?.[1];
    if (!id) {
      check('halaman detail', 'skip', 'tidak menemukan tautan detail di inbox');
    } else {
      const detail = await req(`/admin/leads/${id}`);
      check('halaman detail → 200', detail.status === 200, String(detail.status));
      check(
        'detail menjelaskan ip_hash bukan IP',
        detail.body.includes('bukan alamat IP')
      );
    }

    const csv = await req('/admin/leads/export.csv');
    check('CSV → 200', csv.status === 200, String(csv.status));
    check(
      'CSV diawali BOM',
      csv.raw[0] === 0xef && csv.raw[1] === 0xbb && csv.raw[2] === 0xbf,
      [...csv.raw.slice(0, 3)].map((b) => b.toString(16).padStart(2, '0')).join(' ') || '(kosong)'
    );
    check(
      'CSV Content-Disposition attachment',
      /attachment; filename="leads-\d{4}-\d{2}-\d{2}\.csv"/.test(
        csv.headers.get('content-disposition') ?? ''
      ),
      csv.headers.get('content-disposition') ?? '(kosong)'
    );
    check("CSV meng-escape formula menjadi '=1+1", csv.body.includes("'=1+1"));

    const line = csv.body.split('\r\n').find((row) => row.includes(unique));
    if (!line) {
      check('ip_hash di CSV', 'skip', 'baris lead tidak ditemukan');
    } else {
      const cells = line.split(',');
      const hashed = cells.some((c) => /^[0-9a-f]{64}$/.test(c));
      const dottedQuad = cells.some((c) => /^\d{1,3}(\.\d{1,3}){3}$/.test(c));
      check('ip_hash cocok /^[0-9a-f]{64}$/', hashed);
      check('ip_hash bukan dotted quad', !dottedQuad, line.slice(0, 120));
    }
  }
}

// --- summary ---------------------------------------------------------------
console.log(`\n${passed} lolos · ${failed} gagal · ${skipped} dilewati\n`);
process.exit(failed === 0 ? 0 : 1);
