// Ad-hoc verification of the /en/sekolah/* -> /sekolah/* 301 contract.
// Run against a local built server: BASE_URL=http://localhost:4321 node scripts/verify-en-sekolah-redirect.mjs
// The redirect happens in middleware before any session/database access, so
// it must return 301 even when no database is configured.
const BASE = process.env.BASE_URL ?? 'http://localhost:4321';

const cases = [
  // [label, path, expectedStatus, expectedLocation]
  ['bare /en/sekolah', '/en/sekolah', 301, '/sekolah'],
  ['trailing slash', '/en/sekolah/', 301, '/sekolah/'],
  ['school page', '/en/sekolah/sulawesi-selatan/bulukumba/69951874', 301, '/sekolah/sulawesi-selatan/bulukumba/69951874'],
  ['query preserved', '/en/sekolah/sulawesi-selatan/bulukumba/69951874?x=1', 301, '/sekolah/sulawesi-selatan/bulukumba/69951874?x=1'],
];

let failures = 0;
for (const [label, path, expectedStatus, expectedLocation] of cases) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  const loc = res.headers.get('location') ?? '(none)';
  const ok = res.status === expectedStatus && loc === expectedLocation;
  if (!ok) failures++;
  console.log(`${ok ? 'ok   ' : 'FAIL '} ${String(res.status).padEnd(4)} ${loc.padEnd(60)} <- ${label}`);
}

// Negative cases: must NOT 301.
for (const [label, path] of [
  ['lookalike /en/sekolahfoo', '/en/sekolahfoo'],
  ['ID page untouched', '/sekolah/sulawesi-selatan/bulukumba/69951874'],
]) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  const ok = res.status !== 301;
  if (!ok) failures++;
  console.log(
    `${ok ? 'ok   ' : 'FAIL '} ${String(res.status).padEnd(4)} ${(res.headers.get('location') ?? '(none)').padEnd(60)} <- ${label} (must not 301)`,
  );
}

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('\nAll redirect checks passed');
