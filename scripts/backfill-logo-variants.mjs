#!/usr/bin/env node
/**
 * Backfill the small logo variants (48/96/160) for client logos uploaded
 * before those rungs joined the ladder (`IMAGE_WIDTHS` in
 * `src/lib/image-variants.ts`).
 *
 * New uploads get the rungs automatically from the writer (`lib/uploads.ts`);
 * this covers the logos already on disk. It is idempotent — run it after
 * every deploy that adds a rung, or once by hand:
 *
 *   node scripts/backfill-logo-variants.mjs [upload-dir]
 *
 * `upload-dir` defaults to `$UPLOAD_DIR` or `.data/uploads`. Each missing
 * variant is resized from the bare (largest) file with the writer's settings
 * (WebP, quality 82, never upscaled) and written atomically (temp file +
 * rename), so an interrupted run leaves no partial variant behind.
 */
import { readdir, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/** The small rungs to ensure, smallest first. Keep in sync with the ladder. */
const SMALL_WIDTHS = [48, 96, 160];

const uploadDir = process.argv[2]?.trim() || process.env.UPLOAD_DIR?.trim() || '.data/uploads';
const clientsDir = path.join(uploadDir, 'clients');

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

let names;
try {
  names = await readdir(clientsDir);
} catch {
  console.error(`No clients directory at ${clientsDir} — nothing to do.`);
  process.exit(0);
}

// Bare base files only: 16 hex chars, e.g. `45144f6b807b4870.webp` —
// not the `-320` variants.
const bases = names
  .filter((name) => /^[0-9a-f]{16}\.webp$/.test(name))
  .map((name) => name.slice(0, -'.webp'.length));

let created = 0;
let skipped = 0;
let failed = 0;

for (const base of bases) {
  const bare = path.join(clientsDir, `${base}.webp`);
  let source;
  try {
    source = await sharp(bare).metadata();
  } catch (error) {
    console.error(`FAIL  ${base}: cannot read ${bare} (${error.message})`);
    failed++;
    continue;
  }
  if (!source.width) {
    console.error(`FAIL  ${base}: no width in ${bare}`);
    failed++;
    continue;
  }
  for (const width of SMALL_WIDTHS) {
    const out = path.join(clientsDir, `${base}-${width}.webp`);
    if (await exists(out)) {
      skipped++;
      continue;
    }
    if (width >= source.width) {
      // Never upscale: a source narrower than the rung gets no file for it,
      // and the renderer falls back to the variants that do exist.
      skipped++;
      continue;
    }
    const tmp = `${out}.tmp-${process.pid}`;
    try {
      const { data } = await sharp(bare)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      await writeFile(tmp, data);
      await rename(tmp, out);
      console.log(`ok    ${base}-${width}.webp (${data.length} B)`);
      created++;
    } catch (error) {
      console.error(`FAIL  ${base}-${width}: ${error.message}`);
      failed++;
    }
  }
}

console.log(`\nDone: ${created} created, ${skipped} skipped, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
