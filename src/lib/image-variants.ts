/**
 * The image width ladder, shared by the upload writer (`lib/uploads.ts`) and
 * the renderer (`components/ContentImage.astro`).
 *
 * Kept dependency-free on purpose: the renderer is imported by public pages and
 * must not drag `sharp` into the server bundle. The writer and the renderer must
 * agree on which variants exist, so this is the single source for both.
 *
 * The one exception is `thumbnailSrc` below, which imports Node builtins only
 * (`node:fs`, `node:path`) — no package, no native module — to check whether a
 * variant file exists on disk.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

/** The width ladder. Variants are capped at the source width — never upscaled. */
export const IMAGE_WIDTHS = [320, 640, 960, 1280] as const;

/**
 * The widths that exist for an image whose largest variant is `width` px wide.
 *
 * Mirrors the writer exactly: every rung at or below the source width, plus the
 * source width itself when it sits between two rungs.
 */
export function variantWidths(width: number): number[] {
  const widths: number[] = IMAGE_WIDTHS.filter((w) => w <= width);
  if (widths.length === 0) return [width];

  const top = IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  if (widths[widths.length - 1] !== width && width <= top) widths.push(width);

  return widths;
}

/** A `srcset` for a stored image, given its largest variant's width. */
export function srcSetFor(storedPath: string, width: number): string {
  return variantWidths(width)
    .map((w) => `${storedPath}-${w}.webp ${w}w`)
    .join(', ');
}

/** The default `src` — the largest variant. */
export function srcFor(storedPath: string, width: number): string {
  const widths = variantWidths(width);
  return `${storedPath}-${widths[widths.length - 1]}.webp`;
}

/**
 * The canonical file, with no width suffix — a copy of the largest variant that
 * `lib/uploads.ts` writes alongside the ladder.
 *
 * Use this where the largest file is genuinely wanted: admin previews, Open
 * Graph images, and anywhere the variant width is not known and the full file
 * is the honest choice. Fixed-size thumbnails (client logos) use
 * `thumbnailSrc` instead — the largest variant of a logo can be 100+ KiB for
 * a 40 px display.
 */
export function canonicalSrc(storedPath: string): string {
  return `${storedPath}.webp`;
}

/** The rung a fixed-size thumbnail serves: the smallest ladder rung. */
const THUMBNAIL_WIDTH = 320;

/**
 * The file a fixed-size thumbnail (a client logo at 40 px in a chip, 28 px in
 * a badge) should load: the smallest ladder rung, when it exists on disk.
 *
 * The rung is checked on disk rather than derived from a stored width because
 * some callers have no width to derive from (a project's `clientLogo` is a
 * bare path), and a source narrower than the rung has no `-320` file at all —
 * serving it blind would 404 the image. When the file is absent, or the
 * filesystem cannot be read, the canonical (largest) file is served instead,
 * so a thumbnail can never break for a missing variant.
 *
 * The check is one `stat` per logo per server-rendered request. These pages
 * are SSR (`prerender = false`), so it never runs at build time.
 */
export function thumbnailSrc(storedPath: string): string {
  const rel = storedPath.replace(/^\/uploads\//, '');
  const thumb = `${storedPath}-${THUMBNAIL_WIDTH}.webp`;
  try {
    const dir = process.env.UPLOAD_DIR?.trim() || '.data/uploads';
    if (existsSync(path.join(dir, `${rel}-${THUMBNAIL_WIDTH}.webp`))) return thumb;
  } catch {
    // Filesystem unavailable — fall through to the canonical file.
  }
  return canonicalSrc(storedPath);
}
