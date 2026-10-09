import { createHmac } from 'node:crypto';
import { sql } from '../db/client';

/**
 * Normalises an IP so the same visitor always hashes the same.
 *
 * A dual-stack socket reports IPv4 peers as `::ffff:1.2.3.4`, which would hash
 * differently from the plain `1.2.3.4` the same visitor gets on another
 * connection — splitting one sender into two rate-limit buckets.
 */
export function normaliseIp(ip: string): string {
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip.trim());
  return mapped ? mapped[1] : ip.trim();
}

/**
 * HMAC-SHA256 of the submitter's IP, keyed by LEAD_IP_HMAC_SECRET.
 *
 * The raw IP is never stored (UU PDP data minimisation). Two things read the
 * hash: triage (spotting the same sender twice) and the rate limiter.
 *
 * Be honest about the limit: this is a PSEUDONYM, not anonymisation. It is
 * deterministic, and the IPv4 space is only 2^32, so anyone holding the secret
 * can brute-force the preimage. It protects a leaked database dump; it is not a
 * promise of privacy against whoever holds the key. Rotating the secret both
 * breaks historical correlation and resets every rate-limit key.
 *
 * If the secret is missing we store `null` — never the raw IP. Falling back to
 * the raw address would defeat the entire point of the column.
 */
export function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;

  const secret = process.env.LEAD_IP_HMAC_SECRET;
  if (!secret) {
    console.warn('[anti-abuse] LEAD_IP_HMAC_SECRET is not set — storing no ip_hash.');
    return null;
  }

  return createHmac('sha256', secret).update(normaliseIp(ip)).digest('hex');
}

/**
 * Fixed-window rate limit. Returns true when the request is allowed.
 *
 * One row per key, updated with a single UPSERT, so the hot path is one indexed
 * write and there is no per-request cleanup. A fresh window resets the counter
 * inside the same statement.
 *
 * Fixed rather than sliding: a sliding window needs a row per request plus a
 * delete, and a burst straddling a window boundary is irrelevant for lead spam.
 *
 * Fails OPEN. If the database is unreachable, a visitor's message still gets
 * through — availability of the contact form matters more than strictness.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const [row] = await sql<{ count: number }[]>`
      INSERT INTO rate_limits (key, window_start, count)
      VALUES (${key}, now(), 1)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          THEN now()
          ELSE rate_limits.window_start
        END
      RETURNING count
    `;

    return (row?.count ?? 0) <= limit;
  } catch (err) {
    console.warn('[anti-abuse] rate limit check failed — allowing the request:', err);
    return true;
  }
}
