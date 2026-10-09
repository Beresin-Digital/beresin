/** All admin timestamps are shown in Jakarta time, whatever the server's TZ. */
const WIB = 'Asia/Jakarta';

/** Human-readable, for the UI: "7 Okt 2026, 14.30". */
export function formatWib(value: Date | string | null | undefined): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: WIB,
  }).format(date);
}

/**
 * Spreadsheet-friendly, for CSV: "2026-10-07 14:30".
 *
 * Built from parts rather than from a locale, because no locale guarantees this
 * exact shape and `hour12: false` alone renders midnight as "24" in some ICU
 * versions — `hourCycle: 'h23'` is the one that actually pins it.
 */
export function formatWibStamp(value: Date | string | null | undefined): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: WIB,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}
