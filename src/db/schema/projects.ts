import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/** The status set is closed by a CHECK constraint, not by convention. */
export const PROJECT_STATUSES = ['delivered', 'concept'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/**
 * Portfolio items for /portfolio and the homepage "Selected Work" section.
 *
 * HONESTY CONSTRAINT — read before adding rows:
 * Only work that was actually delivered to a real client may carry
 * `status: 'delivered'`. Anything self-initiated must be `'concept'` and is
 * rendered with a visible "Concept Project" label. The save action enforces
 * this server-side: a concept row has `clientName` cleared and `statusLabel`
 * forced to "Concept Project", so the rule cannot be bypassed by a crafted
 * form post.
 *
 * `clientName` is nullable and omitted for concept work, which has no client.
 */
export const projects = pgTable(
  'projects',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

    slug: varchar('slug', { length: 120 }).notNull().unique(),
    title: varchar('title', { length: 160 }).notNull(),
    /** Solution type, e.g. "Corporate Website". */
    category: varchar('category', { length: 80 }).notNull().default(''),
    summary: text('summary').notNull().default(''),
    /** Longer description shown in the detail modal. */
    overview: text('overview').notNull().default(''),

    /** What was delivered, shown as a list in the detail modal. */
    scope: text('scope').array().notNull().default(sql`'{}'::text[]`),
    /** Short capability tags shown on the card. */
    highlights: text('highlights').array().notNull().default(sql`'{}'::text[]`),

    clientName: varchar('client_name', { length: 120 }),
    clientLogo: varchar('client_logo', { length: 512 }),

    status: varchar('status', { length: 16 }).notNull().default('concept'),
    /** Visible badge text. Concept work must read "Concept Project". */
    statusLabel: varchar('status_label', { length: 40 }).notNull().default('Concept Project'),

    /** `/uploads/<base>` path for the card/modal image, or null. */
    image: varchar('image', { length: 512 }),
    /**
     * Largest-variant dimensions of `image`. The width is what the renderer
     * uses to rebuild the `srcset` ladder (`src/lib/image-variants.ts`), so it
     * cannot be derived at render time; the pair also lets `<img width height>`
     * reserve the right box.
     */
    imageWidth: integer('image_width'),
    imageHeight: integer('image_height'),

    sortOrder: integer('sort_order').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('projects_published_sort_idx').on(t.isPublished, t.sortOrder),
    check('projects_status_check', sql`${t.status} IN ('delivered', 'concept')`),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
