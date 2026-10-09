/**
 * One-time asset script: pull the stock photography in-house.
 *
 * The original single-file page hotlinked 8 Unsplash URLs. Hotlinking stock
 * photos on a commercial site is both a ToS risk and a performance problem
 * (third-party connection, no width/height, no modern formats). This downloads
 * them once, converts to WebP, and commits them to the repo so the build never
 * depends on a network fetch.
 *
 * Re-run with:  node scripts/fetch-images.mjs
 *
 * TODO(user): replace these with real team/office photos when available. The
 * component layer reads from src/assets/images/manifest.ts, so swapping a photo
 * means replacing one file and updating one manifest entry.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const OUT_DIR = join(ROOT, 'src', 'assets', 'images');

/**
 * `width` is the intrinsic width we store. Astro's <Picture> generates the
 * responsive srcset from this, so it should be at least 2x the largest
 * rendered size.
 */
const IMAGES = [
  {
    name: 'hero-team',
    id: 'photo-1522071820081-009f0129c71c',
    width: 1600,
    alt: 'The Beresin Digital team collaborating at the office',
    credit: 'Annie Spratt',
  },
  {
    name: 'about-portrait',
    id: 'photo-1573496359142-b8d87734a5a2',
    width: 1200,
    alt: 'A creative agency specialist at work',
    credit: 'Christina @ wocintechchat.com',
  },
  {
    name: 'service-web-app',
    id: 'photo-1555066931-4365d14bab8c',
    width: 1200,
    alt: 'Code on screen for web and application development',
    credit: 'Fotis Fotopoulos',
  },
  {
    name: 'service-custom-system',
    id: 'photo-1531403009284-440f080d1e12',
    width: 1200,
    alt: 'A dashboard interface for a custom digital system',
    credit: 'Luke Chesser',
  },
  {
    name: 'service-design',
    id: 'photo-1600132806370-bf17e65e942f',
    width: 1200,
    alt: 'Graphic design tools and branding sketches',
    credit: 'Balázs Kétyi',
  },
  {
    // Fourth pillar. Subject and credit confirmed against the Unsplash photo
    // page: "gray Nest thermostat displaying at 63" by Dan LeFebvre.
    name: 'service-iot',
    id: 'photo-1545259741-2ea3ebf61fa3',
    width: 1200,
    alt: 'A smart thermostat on a wall for automatic room temperature control',
    credit: 'Dan LeFebvre',
  },
  {
    // Cover for the featured article in the homepage "Insight" section. Sized
    // for a ~700px rendered card, so 1400px covers 2x DPR.
    name: 'article-cover',
    id: 'photo-1499750310107-5fef28a66643',
    width: 1400,
    alt: 'A desk with a laptop and a notebook',
    credit: 'Andrew Neel',
  },
  {
    name: 'avatar-1',
    id: 'photo-1534528741775-53994a69daeb',
    width: 240,
    alt: 'Team member portrait',
    credit: 'Michael Dam',
  },
  {
    name: 'avatar-2',
    id: 'photo-1507003211169-0a1dd7228f2d',
    width: 240,
    alt: 'Team member portrait',
    credit: 'Joseph Gonzalez',
  },
  {
    name: 'avatar-3',
    id: 'photo-1494790108377-be9c29b29330',
    width: 240,
    alt: 'Team member portrait',
    credit: 'Christopher Campbell',
  },
];

const sourceUrl = (id, width) =>
  `https://images.unsplash.com/${id}?w=${width * 2}&fm=jpg&q=90&fit=max`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const credits = [];

  for (const img of IMAGES) {
    const res = await fetch(sourceUrl(img.id, img.width));
    if (!res.ok) throw new Error(`${img.name}: Unsplash returned ${res.status}`);
    const input = Buffer.from(await res.arrayBuffer());

    const outPath = join(OUT_DIR, `${img.name}.webp`);
    const info = await sharp(input)
      .resize({ width: img.width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(outPath);

    console.log(
      `  ${(img.name + '.webp').padEnd(26)} ${String(info.width).padStart(4)}x${String(
        info.height
      ).padStart(4)}  ${(info.size / 1024).toFixed(1)} KB`
    );

    credits.push({ name: img.name, credit: img.credit, url: `https://unsplash.com/photos/${img.id}` });
  }

  const md = [
    '# Photo credits',
    '',
    'Placeholder stock photography (Unsplash License). Replace with real team and',
    'office photos before launch — see `src/assets/images/manifest.ts`.',
    '',
    ...credits.map((c) => `- \`${c.name}.webp\` — ${c.credit} (${c.url})`),
    '',
  ].join('\n');
  await writeFile(join(OUT_DIR, 'CREDITS.md'), md);

  console.log(`\nWrote ${IMAGES.length} images to src/assets/images/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
