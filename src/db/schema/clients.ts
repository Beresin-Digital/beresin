import { boolean, index, integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

/**
 * Client badges for the homepage marquee.
 *
 * HONESTY CONSTRAINT — read before adding rows:
 * `isActive` is the display gate, but it is NOT a claim that the engagement is
 * real. `isRealEngagement` is the flag that says so, and it defaults to false
 * on purpose. A row with `isActive = true, isRealEngagement = false` is a
 * generic descriptor ("National Manufacturing Company"), never a named client —
 * naming a real client without written permission is misleading advertising
 * under UU 8/1999 and a procurement risk for a PT.
 *
 * The admin list surfaces the flag so an unverified row is obvious, and flipping
 * `isActive` off removes it from the site instantly without a deploy.
 */
export const clients = pgTable(
  'clients',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

    name: varchar('name', { length: 120 }).notNull(),
    category: varchar('category', { length: 80 }).notNull().default(''),

    /** lucide icon name, used when no logo has been uploaded. */
    icon: varchar('icon', { length: 40 }).notNull().default('building-2'),
    /** `/uploads/<base>` path for an uploaded logo, or null for the icon. */
    logo: varchar('logo', { length: 512 }),
    /** Largest-variant dimensions of `logo`; see `projects.imageWidth`. */
    logoWidth: integer('logo_width'),
    logoHeight: integer('logo_height'),

    /** Shown on the public site. */
    isActive: boolean('is_active').notNull().default(true),
    /** True only for a verified, real engagement — advisory, not a gate. */
    isRealEngagement: boolean('is_real_engagement').notNull().default(false),

    sortOrder: integer('sort_order').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('clients_active_sort_idx').on(t.isActive, t.sortOrder)]
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
