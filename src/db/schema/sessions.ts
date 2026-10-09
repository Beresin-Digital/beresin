import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Server-side sessions, written by the custom Astro session driver
 * (src/db/session-driver.ts).
 *
 * `id` is HMAC(cookie value, SESSION_SECRET) — NOT the cookie value itself.
 * A database dump therefore cannot be turned into a set of working session
 * cookies, and the row cannot be replayed against the site.
 *
 * `data` holds Astro's own serialised payload. Astro uses `devalue`, which is
 * NOT JSON — the driver must store and return it verbatim.
 *
 * Astro keeps a per-key TTL inside that payload and filters expired keys on
 * read, so `expiresAt` here is not what enforces expiry. It exists so the
 * driver can sweep rows that are never read again and would otherwise sit in
 * the table forever.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    data: text('data').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sessions_expires_at_idx').on(t.expiresAt)]
);
