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
export const ARTICLE_STATUSES = ['draft', 'published'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

/**
 * Articles for the public /articles section and the homepage "Insight" block.
 *
 * `body` is Markdown, rendered to HTML at request time. It is stored as the
 * author typed it — the renderer escapes raw HTML before parsing, so a body
 * cannot smuggle markup into the public page.
 *
 * `publishedAt` is the moment of FIRST publish and is kept stable across later
 * edits, so an article does not jump back to the top of the list every time a
 * typo is fixed. `updatedAt` carries the edit time instead, and feeds the
 * sitemap's per-entry `lastmod`.
 *
 * Reading time is deliberately NOT a column: it is derived from `body` at
 * render (see `src/lib/format.ts`), so it can never drift out of sync with the
 * text it describes.
 */
export const articles = pgTable(
  'articles',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

    /** URL segment for `/articles/[slug]`. */
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    title: varchar('title', { length: 200 }).notNull(),
    excerpt: text('excerpt').notNull().default(''),
    /** Markdown source. */
    body: text('body').notNull().default(''),
    category: varchar('category', { length: 64 }).notNull().default(''),

    /** `/uploads/<base>` path, or null. Served by src/pages/uploads/[...file].ts. */
    coverImage: varchar('cover_image', { length: 512 }),
    coverAlt: varchar('cover_alt', { length: 255 }).notNull().default(''),
    /** Largest-variant dimensions of `coverImage`; see `projects.imageWidth`. */
    coverWidth: integer('cover_width'),
    coverHeight: integer('cover_height'),

    status: varchar('status', { length: 16 }).notNull().default('draft'),
    /** Null while draft; set on first publish, then left alone. */
    publishedAt: timestamp('published_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // The only public query: published rows, newest first.
    index('articles_status_published_idx').on(t.status, t.publishedAt),
    check('articles_status_check', sql`${t.status} IN ('draft', 'published')`),
  ]
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
