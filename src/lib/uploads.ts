import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { Metadata } from 'sharp';
import { variantWidths } from './image-variants';

/**
 * Image uploads for the CMS.
 *
 * An uploaded file is re-encoded to WebP at a fixed ladder of widths and written
 * under a content-hash base name. Two consequences worth stating:
 *
 *  - The stored filename is derived from the bytes, so replacing an image with
 *    an identical one reuses the same files, and a changed image gets a new
 *    name. That is what makes the long `immutable` cache header on the serving
 *    route safe.
 *  - The original upload is never written to disk. Only the generated variants
 *    exist, so an uploaded PNG with a malicious trailing payload cannot be
 *    served back out.
 *
 * The format is sniffed with `sharp` rather than trusted from the request's
 * `Content-Type`, which is client-controlled.
 */

/** 8 MB. Generous for a photo, small enough that a stray upload cannot fill the disk. */
const MAX_BYTES = 8 * 1024 * 1024;

/** ~40 MP. Guards against a decompression bomb before any pixels are decoded. */
const MAX_PIXELS = 40_000_000;

const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff']);

/** A bad upload, as opposed to an I/O failure — the message is safe to show. */
export class UploadError extends Error {}

/** Where uploads live. `.data/uploads` is the gitignored dev fallback. */
export function uploadDir(): string {
  return process.env.UPLOAD_DIR?.trim() || '.data/uploads';
}

/** A stored image: the base path plus the largest variant's dimensions. */
export interface SavedImage {
  /** Stored path, e.g. `/uploads/articles/1a2b3c4d5e6f7788`. */
  path: string;
  /** Dimensions of the largest variant, for `<img width height>`. */
  width: number;
  height: number;
}

/**
 * Validates, re-encodes and stores one uploaded image.
 *
 * @param file   the `File` from a multipart form field
 * @param folder subdirectory, e.g. `articles` | `clients` | `projects`
 */
export async function saveImage(file: File, folder: string): Promise<SavedImage> {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new UploadError('Berkas tidak terbaca.');
  }
  if (file.size === 0) {
    throw new UploadError('Berkas kosong.');
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`Ukuran gambar melebihi ${Math.round(MAX_BYTES / 1024 / 1024)} MB.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // `metadata()` parses only the header; it throws on anything that is not an
  // image, which is how a non-image upload is rejected here.
  let meta: Metadata;
  try {
    meta = await sharp(buffer).metadata();
  } catch {
    throw new UploadError('Format gambar tidak dikenali.');
  }

  const format = meta.format ?? '';
  if (!ALLOWED_FORMATS.has(format)) {
    throw new UploadError(`Format ${format || 'tidak dikenal'} tidak didukung.`);
  }
  if (!meta.width || !meta.height) {
    throw new UploadError('Dimensi gambar tidak terbaca.');
  }
  if (meta.width * meta.height > MAX_PIXELS) {
    throw new UploadError('Resolusi gambar terlalu besar.');
  }

  const base = createHash('sha1').update(buffer).digest('hex').slice(0, 16);
  const dir = path.join(uploadDir(), folder);
  await mkdir(dir, { recursive: true });

  const widths = variantWidths(meta.width);
  let largest = { width: 0, height: 0 };

  for (const width of widths) {
    const out = await sharp(buffer)
      .rotate() // honour EXIF orientation before stripping metadata
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    await writeFile(path.join(dir, `${base}-${width}.webp`), out.data);

    if (width === widths[widths.length - 1]) {
      largest = { width: out.info.width, height: out.info.height };
      // Also write the largest variant under the bare base name. Callers that
      // have no stored width to build a `srcset` from (a client logo) can then
      // still resolve a URL — see `canonicalSrc` in lib/image-variants.ts.
      await writeFile(path.join(dir, `${base}.webp`), out.data);
    }
  }

  return { path: `/uploads/${folder}/${base}`, width: largest.width, height: largest.height };
}

/**
 * Removes every variant of a stored image. Best-effort: a file that is already
 * gone is not an error.
 */
export async function deleteImage(storedPath: string | null | undefined): Promise<void> {
  if (!storedPath) return;

  const rel = storedPath.replace(/^\/uploads\//, '');
  const dir = path.join(uploadDir(), path.dirname(rel));
  const base = path.basename(rel);

  try {
    const files = await readdir(dir);
    await Promise.all(
      files
        .filter((name) => name === `${base}.webp` || name.startsWith(`${base}-`))
        .map((name) => rm(path.join(dir, name), { force: true }))
    );
  } catch {
    // Directory gone — nothing to clean up.
  }
}
