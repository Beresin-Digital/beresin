import { and, count, desc, eq, ne } from 'drizzle-orm';
import { db } from '../db/client';
import { articles, type Article, type ArticleLocale, type ArticleStatus } from '../db/schema';

export interface ArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  coverImage: string | null;
  coverAlt: string;
  coverWidth: number | null;
  coverHeight: number | null;
  status: ArticleStatus;
  locale: ArticleLocale;
}

// --- public ---------------------------------------------------------------

/** Published articles of one locale, newest first. */
export async function listPublishedArticles(locale: ArticleLocale): Promise<Article[]> {
  return db
    .select()
    .from(articles)
    .where(and(eq(articles.locale, locale), eq(articles.status, 'published')))
    .orderBy(desc(articles.publishedAt));
}

/** A single published article of one locale, or null if it does not exist or is still a draft. */
export async function getPublishedArticleBySlug(
  slug: string,
  locale: ArticleLocale
): Promise<Article | null> {
  const [row] = await db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.slug, slug),
        eq(articles.locale, locale),
        eq(articles.status, 'published')
      )
    )
    .limit(1);

  return row ?? null;
}

// --- admin ----------------------------------------------------------------

/** Every article, drafts included, most recently edited first. */
export async function listArticles(): Promise<Article[]> {
  return db.select().from(articles).orderBy(desc(articles.updatedAt));
}

export async function getArticle(id: number): Promise<Article | null> {
  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return row ?? null;
}

/** True when another article already uses this slug (optionally excluding one). */
export async function slugTaken(slug: string, exceptId?: number): Promise<boolean> {
  const [row] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(exceptId ? and(eq(articles.slug, slug), ne(articles.id, exceptId)) : eq(articles.slug, slug))
    .limit(1);

  return Boolean(row);
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const [row] = await db
    .insert(articles)
    .values({
      ...input,
      // Stamped on first publish only; a draft has no date yet.
      publishedAt: input.status === 'published' ? new Date() : null,
    })
    .returning();

  return row;
}

export async function updateArticle(id: number, input: ArticleInput): Promise<void> {
  const existing = await getArticle(id);
  if (!existing) throw new Error('Artikel tidak ditemukan.');

  await db
    .update(articles)
    .set({
      ...input,
      // First publish sets the date; later edits keep it so the article does not
      // jump to the top of the list on every typo fix.
      publishedAt:
        input.status === 'published' ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id));
}

export async function deleteArticle(id: number): Promise<void> {
  await db.delete(articles).where(eq(articles.id, id));
}

export interface ArticleCounts {
  published: number;
  draft: number;
}

export async function articleCounts(): Promise<ArticleCounts> {
  const [row] = await db
    .select({
      published: count(),
    })
    .from(articles)
    .where(eq(articles.status, 'published'));

  const [total] = await db.select({ n: count() }).from(articles);
  const published = row?.published ?? 0;

  return { published, draft: (total?.n ?? 0) - published };
}
