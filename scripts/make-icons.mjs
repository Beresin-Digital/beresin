/**
 * Generates the full icon set + the Open Graph card from the source logo.
 *
 * The single source of truth is `design-reference/beresin-dark-favicon.png`
 * (800x800, transparent corners). Every icon — and the header logo mark — is
 * derived from it, so a new logo only means dropping the new PNG here and
 * re-running this script.
 *
 * Note: there is deliberately NO favicon.svg. A hand-drawn SVG mark drifts from
 * the real logo; PNG/ICO favicons render correctly everywhere we care about.
 *
 * Re-run with:  node scripts/make-icons.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(ROOT, 'design-reference', 'beresin-dark-favicon.png');
const PUBLIC = join(ROOT, 'public');

const BRAND_DARK = '#0D0F12';
const BRAND_LIME = '#D2EB1E';

/**
 * Wraps a PNG buffer in a single-image .ico container. Browsers and Windows
 * both accept an embedded PNG, so no extra dependency is needed.
 */
function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette size
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // payload size
  entry.writeUInt32LE(22, 12); // payload offset

  return Buffer.concat([header, entry, png]);
}

/** 1200x630 OG card: dark field, real logo mark, brand wordmark. */
function ogSvg(logoDataUri) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BRAND_DARK}"/>
  <rect x="0" y="0" width="1200" height="12" fill="${BRAND_LIME}"/>
  <image href="${logoDataUri}" x="96" y="180" width="160" height="160"/>
  <text x="96" y="430" font-family="Arial, Helvetica, sans-serif" font-size="86" font-weight="bold" fill="#FFFFFF" letter-spacing="-3">beresin<tspan fill="${BRAND_LIME}">digital</tspan></text>
  <text x="96" y="490" font-family="Arial, Helvetica, sans-serif" font-size="27" fill="#A1A1AA">Website · Aplikasi Custom · SIAKAD Sekolah · Portal Pemerintah · Desain Grafis</text>
  <text x="96" y="560" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#71717A">beresindigital.id — Jakarta, Indonesia</text>
</svg>
`;
}

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  const source = await readFile(SRC);
  const meta = await sharp(source).metadata();
  console.log(`source: ${meta.width}x${meta.height} ${meta.format}\n`);

  // --- Raster icons -------------------------------------------------------
  const targets = [
    { file: 'apple-touch-icon.png', size: 180, flatten: true },
    { file: 'android-chrome-192x192.png', size: 192, flatten: false },
    { file: 'android-chrome-512x512.png', size: 512, flatten: false },
  ];

  for (const t of targets) {
    let pipeline = sharp(source).resize(t.size, t.size, {
      fit: 'contain',
      background: t.flatten ? BRAND_DARK : { r: 0, g: 0, b: 0, alpha: 0 },
    });
    if (t.flatten) pipeline = pipeline.flatten({ background: BRAND_DARK });

    const buf = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    await writeFile(join(PUBLIC, t.file), buf);
    console.log(`  ${t.file.padEnd(30)} ${t.size}x${t.size}  ${(buf.length / 1024).toFixed(1)} KB`);
  }

  // --- favicon.ico --------------------------------------------------------
  const icoPng = await sharp(source)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const ico = pngToIco(icoPng, 32);
  await writeFile(join(PUBLIC, 'favicon.ico'), ico);
  console.log(`  ${'favicon.ico'.padEnd(30)} 32x32     ${(ico.length / 1024).toFixed(1)} KB`);

  // --- Header logo mark ---------------------------------------------------
  // Displayed at 36–40 px, so 96 px keeps it sharp up to ~2.5x DPR while
  // staying under ~3 KB. Alpha is preserved (transparent corners).
  const logoMark = await sharp(source)
    .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(PUBLIC, 'logo-mark.png'), logoMark);
  console.log(`  ${'logo-mark.png'.padEnd(30)} 96x96     ${(logoMark.length / 1024).toFixed(1)} KB`);

  // --- Open Graph card ----------------------------------------------------
  const logoPng = await sharp(source)
    .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const og = await sharp(Buffer.from(ogSvg(`data:image/png;base64,${logoPng.toString('base64')}`)))
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(PUBLIC, 'og-default.png'), og);
  console.log(`  ${'og-default.png'.padEnd(30)} 1200x630  ${(og.length / 1024).toFixed(1)} KB`);

  // --- web manifest -------------------------------------------------------
  const manifest = {
    name: 'PT Beresin Urusan Digital',
    short_name: 'Beresin Digital',
    description:
      'Agensi jasa pembuatan website, aplikasi custom, SIAKAD sekolah, portal pemerintah, dan desain grafis.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: BRAND_DARK,
    lang: 'id',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  await writeFile(join(PUBLIC, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  ${'site.webmanifest'.padEnd(30)} ok`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
