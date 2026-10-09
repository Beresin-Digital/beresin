import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

/**
 * Admin accounts.
 *
 * Deliberately minimal — there is exactly one admin and no UI for managing
 * them, so there is no `role`, `is_active`, `failed_attempts` or `locked_until`
 * column. Each of those would be a field nothing reads, and a per-account
 * lockout would hand an attacker a way to lock the owner out of their own
 * system.
 *
 * `sessionVersion` is the exception: bumping it invalidates every existing
 * session for the account (see loadAdminSession), which is the "log me out
 * everywhere" lever. `lastLoginAt` is a plain audit trail.
 */
export const adminUsers = pgTable('admin_users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

  /** Stored lower-cased; the app normalises before lookup and before insert. */
  email: varchar('email', { length: 254 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),

  /** argon2id, encoded in the standard `$argon2id$v=19$m=...` form. */
  passwordHash: text('password_hash').notNull(),

  sessionVersion: integer('session_version').notNull().default(0),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
