/**
 * Minimal CSV writer. No dependency — matching this repo's posture elsewhere.
 *
 * Two things it must get right, both of which silently corrupt the file in
 * Excel rather than failing loudly:
 *
 *  1. Formula injection. A cell beginning with `=`, `+`, `-`, `@`, tab or CR is
 *     executed by Excel and Sheets as a formula. A lead whose "name" is
 *     `=HYPERLINK("http://evil","click")` becomes a live payload in the
 *     spreadsheet of whoever exports it. Such a cell is prefixed with an
 *     apostrophe, which forces it to be read as text.
 *
 *  2. Quoting. Any cell containing a quote, comma, CR or LF is wrapped in
 *     double quotes, with inner quotes doubled (RFC 4180).
 */
const RISKY_PREFIX = /^[=+\-@\t\r]/;

function cell(value: unknown): string {
  if (value === null || value === undefined) return '';

  let text = String(value);
  if (RISKY_PREFIX.test(text)) text = `'${text}`;
  if (/["\r\n,]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;

  return text;
}

/**
 * Renders rows to a CSV document.
 *
 * A UTF-8 BOM is prepended by default. Without it Excel guesses the encoding
 * and mangles Indonesian names and any en-dash or multiplication sign in the
 * data — which is most of the content here.
 *
 * Line endings are CRLF, per RFC 4180.
 */
export function toCsv(rows: unknown[][], { bom = true }: { bom?: boolean } = {}): string {
  const body = rows.map((row) => row.map(cell).join(',')).join('\r\n');
  return `${bom ? '﻿' : ''}${body}\r\n`;
}
