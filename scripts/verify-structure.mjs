/**
 * Structural audit of the built HTML.
 *
 * Why a script and not a one-off: these are the checks that keep silently
 * regressing as pages are added — a second <h1>, a heading level that skips
 * from h2 to h4, a duplicated id (which breaks every in-page anchor pointing at
 * it), an in-page link whose target no longer exists, or a JSON-LD block that
 * no longer parses. They are cheap to assert and invisible in a browser.
 *
 * Run after `pnpm build`. Exits non-zero on any failure.
 *
 * Usage: node scripts/verify-structure.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = 'dist/client';
/** Directories that hold assets, not pages. */
const SKIP_DIRS = new Set(['_astro', 'fonts']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (SKIP_DIRS.has(entry)) continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

/** `dist/client/kontak/index.html` → `/kontak` */
function routeOf(file) {
  const rel = relative(ROOT, file).split(sep).join('/');
  const stripped = rel.replace(/index\.html$/, '').replace(/\.html$/, '');
  return '/' + stripped.replace(/\/$/, '');
}

const failures = [];
const report = (file, message) => failures.push(`${routeOf(file)}: ${message}`);

const files = walk(ROOT).sort();

for (const file of files) {
  const html = readFileSync(file, 'utf8');

  // --- Headings: exactly one h1, and no level skipped going down. ---------
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const h1Count = levels.filter((l) => l === 1).length;
  if (h1Count !== 1) report(file, `expected exactly 1 <h1>, found ${h1Count}`);

  let prev = levels[0] ?? 1;
  for (const level of levels.slice(1)) {
    if (level > prev + 1) report(file, `heading jump: h${prev} → h${level}`);
    prev = level;
  }

  // --- ids: duplicates break anchors. ------------------------------------
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) report(file, `duplicate id="${id}"`);
    seen.add(id);
  }

  // --- In-page anchors must resolve. -------------------------------------
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!seen.has(m[1])) report(file, `dangling anchor href="#${m[1]}"`);
  }

  // --- JSON-LD blocks must parse and expose a @graph. --------------------
  const blocks = [...html.matchAll(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )];
  if (blocks.length === 0) report(file, 'no JSON-LD block found');
  for (const [i, block] of blocks.entries()) {
    let data;
    try {
      data = JSON.parse(block[1]);
    } catch (err) {
      report(file, `JSON-LD block ${i + 1} does not parse: ${err.message}`);
      continue;
    }
    if (!Array.isArray(data['@graph'])) {
      report(file, `JSON-LD block ${i + 1} has no @graph array`);
    }
  }
}

console.log(`Checked ${files.length} pages.`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('✓ structure OK');
