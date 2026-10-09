/**
 * Display formatting for CMS content.
 *
 * All dates are rendered in Jakarta time regardless of the server's timezone, so
 * an article published at 23:30 WIB does not show as the previous day to a
 * reader, and the value is stable between the server and any local run.
 */

/** The one timezone every content date is shown in. */
const WIB = 'Asia/Jakarta';

const toDate = (value: Date | string): Date | null => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Human-readable date: "18 Sep 2026". */
export function formatDate(value: Date | string): string {
  const date = toDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: WIB,
  }).format(date);
}

/** Machine-readable date for `<time datetime>`: "2026-09-18". */
export function isoDate(value: Date | string): string {
  const date = toDate(value);
  if (!date) return '';

  // en-CA is the locale that renders as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: WIB,
  }).format(date);
}

/** Full timestamp for a `<time datetime>`: ISO 8601 in UTC. */
export function isoDateTime(value: Date | string): string {
  const date = toDate(value);
  return date ? date.toISOString() : '';
}

/**
 * Estimated reading time, in whole minutes, at ~200 words per minute.
 *
 * Derived from the body rather than stored, so it can never drift out of sync
 * with the text it describes.
 */
export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * URL-safe slug from a title. Strips diacritics, lowercases, and collapses runs
 * of anything non-alphanumeric into single hyphens.
 *
 * `\p{M}` (Unicode combining marks) is used rather than a literal U+0300–U+036F
 * range so the source carries no invisible characters.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/** Splits a textarea's value into a trimmed, blank-free list. */
export function parseList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
