/**
 * The image width ladder, shared by the upload writer (`lib/uploads.ts`) and
 * the renderer (`components/ContentImage.astro`).
 *
 * Kept dependency-free on purpose: the renderer is imported by public pages and
 * must not drag `sharp` into the server bundle. The writer and the renderer must
 * agree on which variants exist, so this is the single source for both.
 */

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
 * Use this where the variant width is not known or not needed, e.g. a client
 * logo rendered at a fixed 28 px: there is no stored width to build a `srcset`
 * from, and responsive variants would be wasted on a thumbnail.
 */
export function canonicalSrc(storedPath: string): string {
  return `${storedPath}.webp`;
}
