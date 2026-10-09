import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

/**
 * Fixed-window rate limit counters, one row per key.
 *
 * Keys look like `contact:<ip_hash>` or `login:<ip_hash>`.
 *
 * Why one reusable row instead of a row per attempt: the obvious shape — insert
 * a row per request and `DELETE WHERE created_at < now()` on every call — makes
 * every submission pay for a delete over a table that grows without bound. That
 * is write amplification on the hot path. Here the table is bounded by the
 * number of distinct senders (small), the hot path is a single indexed UPSERT,
 * and there is no per-request cleanup at all.
 */
export const rateLimits = pgTable('rate_limits', {
  key: varchar('key', { length: 128 }).primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  count: integer('count').notNull().default(0),
});
