// Ad-hoc verification of the /api/contact redirect contract.
const B = 'http://localhost:4321/api/contact';

const cases = [
  ['valid from /kontak', { name: 'Andi', phone: '08123456789', email: 'a@b.com', message: 'x', page_url: '/kontak' }],
  ['valid from /', { name: 'Andi', phone: '08123456789', message: 'x', page_url: '/' }],
  ['missing name', { name: '', phone: '08123', page_url: '/kontak' }],
  ['honeypot filled', { name: 'Bot', phone: '08123', company_website: 'spam', page_url: '/kontak' }],
  ['protocol-relative //evil.com', { name: 'A', phone: '08123', page_url: '//evil.com' }],
  ['absolute https://evil.com', { name: 'A', phone: '08123', page_url: 'https://evil.com' }],
  ['backslash /\\evil.com', { name: 'A', phone: '08123', page_url: '/' + '\\' + 'evil.com' }],
  ['backslash mid /a\\..\\b', { name: 'A', phone: '08123', page_url: '/a' + '\\' + '..' + '\\' + 'b' }],
  ['tab/newline injection', { name: 'A', phone: '08123', page_url: '/x\nSet-Cookie: a=b' }],
  ['no page_url', { name: 'A', phone: '08123' }],
];

for (const [label, fields] of cases) {
  const res = await fetch(B, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
    redirect: 'manual',
  });
  const loc = res.headers.get('location') ?? '(none)';
  const safe = loc.startsWith('/') && !loc.startsWith('//');
  console.log(
    String(res.status).padEnd(4),
    (safe ? 'SAFE  ' : 'UNSAFE'),
    loc.padEnd(28),
    '<-',
    label
  );
}
