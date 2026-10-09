import { createHmac } from 'node:crypto';
import type { SessionDriver } from 'astro';
import { sql } from './client';

/**
 * Astro session driver backed by the `sessions` table.
 *
 * Astro hands this driver the raw session id, which is the cookie value itself
 * (a v4 UUID). We never store that: the row key is HMAC(id, SESSION_SECRET), so
 * a leaked database dump cannot be turned back into working session cookies.
 * `removeItem` gets the raw id too, so it hashes the same way.
 *
 * The value Astro passes to `setItem` is a `devalue` string, not JSON. It must
 * be stored and returned byte-for-byte — re-encoding it as JSON would break
 * `unflatten()` on the way back in.
 *
 * Expiry is enforced by Astro, which keeps a per-key `expires` inside that
 * payload and filters it on read. `expires_at` in this table is only so we can
 * sweep rows that would otherwise never be read again and would sit here
 * forever.
 */
function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Refuse to run rather than silently store session ids unhashed.
    throw new Error('SESSION_SECRET is not set — admin sessions cannot be stored securely.');
  }
  return secret;
}

const hashId = (id: string): string => createHmac('sha256', sessionSecret()).update(id).digest('hex');

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7;
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

let nextSweepAt = 0;

/** Deletes expired rows at most once an hour. Never fails the caller. */
async function sweepIfDue(): Promise<void> {
  const now = Date.now();
  if (now < nextSweepAt) return;
  nextSweepAt = now + SWEEP_INTERVAL_MS;
  try {
    await sql`DELETE FROM sessions WHERE expires_at < now()`;
  } catch {
    // Not worth failing a login over; the row is simply picked up next time.
  }
}

const driverFactory = (config: Record<string, unknown> | undefined): SessionDriver => {
  const ttlSeconds = Number(config?.ttlSeconds ?? DEFAULT_TTL_SECONDS);

  return {
    async getItem(key: string) {
      const [row] = await sql<{ data: string }[]>`
        SELECT data FROM sessions WHERE id = ${hashId(key)} AND expires_at > now()
      `;
      return row?.data;
    },

    async setItem(key: string, value: string) {
      await sql`
        INSERT INTO sessions (id, data, expires_at)
        VALUES (${hashId(key)}, ${value}, now() + make_interval(secs => ${ttlSeconds}))
        ON CONFLICT (id) DO UPDATE
          SET data = EXCLUDED.data, expires_at = EXCLUDED.expires_at
      `;
      await sweepIfDue();
    },

    async removeItem(key: string) {
      await sql`DELETE FROM sessions WHERE id = ${hashId(key)}`;
    },
  };
};

export default driverFactory;
