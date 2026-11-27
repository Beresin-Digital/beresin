/**
 * The image width ladder, shared by the upload writer (`lib/uploads.ts`) and
 * the renderer (`components/ContentImage.astro`).
 *
 * Kept dependency-free on purpose: the renderer is imported by public pages and
 * must not drag `sharp` into the server bundle. The writer and the renderer must
 * agree on which variants exist, so this is the single source for both.
 *
 * The one exception is `logoSrcSet` below, which imports Node builtins only
 * (`node:fs`, `node:path`) — no package, no native module — to check whether a
 * variant file exists on disk. It never generates a variant: generation stays
 * in the writer (`lib/uploads.ts`) and the one-off backfill script
 * (`scripts/backfill-logo-variants.mjs`), so a public page never pays for
 * `sharp` in its server chunk.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * The width ladder. Variants are capped at the source width — never upscaled.
 *
 * The small rungs (48, 96, 160) exist for fixed-size thumbnails: a client logo
 * displays at 40 px in a chip and 28 px in a badge, so without them the
 * smallest file the browser could pick was the 320 rung — ~35 KiB for a
 * 40 px display. The rungs are shared by every upload (the ladder is the
 * single source), so article and project images gain the same candidates;
 * browsers only pick the rung that matches the slot, so large images are
 * unaffected.
 */
export const IMAGE_WIDTHS = [48, 96, 160, 320, 640, 960, 1280] as const;

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
 * `logoSrcSet` instead — the largest variant of a logo can be 100+ KiB for
 * a 40 px display.
 */
export function canonicalSrc(storedPath: string): string {
  return `${storedPath}.webp`;
}

/**
 * The rungs a client-logo thumbnail serves: every ladder rung at or below
 * 320 px. A logo displays at 40 px in a chip and 28 px in a badge, so the
 * browser picks 48w on a 1x screen, 96w at ~1.75x (the mobile audit's DPR),
 * 160w at higher DPRs, and 320w only past that.
 */
const LOGO_WIDTHS = IMAGE_WIDTHS.filter((w) => w <= 320);

/**
 * The `src` + `srcset` a client logo (40 px chip, 28 px badge) should load:
 * the logo rungs that actually exist on disk, smallest first.
 *
 * The rungs are checked on disk rather than derived from a stored width
 * because some callers have no width to derive from (a project's `clientLogo`
 * is a bare path), and a source narrower than a rung has no file for it at
 * all — serving it blind would 404 the image. A logo uploaded before the
 * small rungs existed has only `-320` (plus the bare file), so the srcset
 * degrades to that rung until the backfill script
 * (`scripts/backfill-logo-variants.mjs`) generates the rest. When no variant
 * exists at all, or the filesystem cannot be read, the canonical (largest)
 * file is served instead, so a thumbnail can never break for a missing
 * variant.
 *
 * The check is a few `stat`s per logo per server-rendered request. These
 * pages are SSR (`prerender = false`), so it never runs at build time.
 */
export function logoSrcSet(storedPath: string): { src: string; srcset: string } {
  const rel = storedPath.replace(/^\/uploads\//, '');
  const existing: number[] = [];
  try {
    const dir = process.env.UPLOAD_DIR?.trim() || '.data/uploads';
    for (const w of LOGO_WIDTHS) {
      if (existsSync(path.join(dir, `${rel}-${w}.webp`))) existing.push(w);
    }
  } catch {
    // Filesystem unavailable — fall through to the canonical file.
  }
  if (existing.length === 0) return { src: canonicalSrc(storedPath), srcset: '' };
  return {
    src: `${storedPath}-${existing[0]}.webp`,
    srcset: existing.map((w) => `${storedPath}-${w}.webp ${w}w`).join(', '),
  };
}
