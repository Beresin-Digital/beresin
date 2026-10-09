import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/** The status set is closed by a CHECK constraint, not by convention. */
export const LEAD_STATUSES = ['new', 'contacted', 'won', 'spam'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Contact-form submissions.
 *
 * `ipHash` is HMAC-SHA256(LEAD_IP_HMAC_SECRET, normalised ip) — the raw IP is
 * never stored (UU PDP data minimisation). Two things read it: triage (same
 * sender twice) and the rate limiter. Note the honest limitation: an HMAC is a
 * pseudonym, not an anonymisation — it is deterministic, and the IPv4 space is
 * only 2^32, so anyone holding the secret can brute-force the preimage. It
 * protects a database dump, not the sender from the secret holder.
 *
 * `seenAt` is separate from `status` on purpose: whether an admin has READ a
 * lead is orthogonal to whether they have CONTACTED the sender. Folding the two
 * together would mean opening a lead silently claims it was handled, or the
 * unread badge never clears.
 */
export const leads = pgTable(
  'leads',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

    name: varchar('name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 254 }),
    message: text('message').notNull().default(''),

    /** Which form sent it: e.g. 'home', 'kontak-page'. */
    source: varchar('source', { length: 64 }).notNull().default(''),
    /** The path the visitor submitted from, for triage. */
    pageUrl: varchar('page_url', { length: 512 }).notNull().default(''),

    status: varchar('status', { length: 16 }).notNull().default('new'),
    /** Internal note, never shown to the visitor. */
    note: text('note'),

    ipHash: varchar('ip_hash', { length: 64 }),
    userAgent: varchar('user_agent', { length: 512 }),

    seenAt: timestamp('seen_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // The two queries the inbox actually runs: the default list (newest first)
    // and the same list filtered by status.
    index('leads_created_at_idx').on(t.createdAt),
    index('leads_status_created_idx').on(t.status, t.createdAt),
    check('leads_status_check', sql`${t.status} IN ('new', 'contacted', 'won', 'spam')`),
  ]
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
