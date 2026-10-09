import { and, count, desc, eq, ilike, isNull, ne, or } from 'drizzle-orm';
import { db } from '../db/client';
import { leads, type Lead, type LeadStatus } from '../db/schema';

export const PAGE_SIZE = 25;
/** Upper bound on a single CSV export, so one click cannot stream forever. */
export const EXPORT_LIMIT = 10_000;

export interface LeadFilters {
  status?: LeadStatus | null;
  q?: string | null;
}

/**
 * The shared WHERE clause, so the list, its count and the CSV export can never
 * disagree about which rows are in scope.
 */
function whereFor(filters: LeadFilters) {
  const parts = [];

  if (filters.status) parts.push(eq(leads.status, filters.status));

  const q = filters.q?.trim();
  if (q) {
    // ILIKE over name/phone/email. Unindexed, and fine at this scale — a lead
    // table that needs a text index is a problem worth having later.
    const pattern = `%${q}%`;
    parts.push(
      or(ilike(leads.name, pattern), ilike(leads.phone, pattern), ilike(leads.email, pattern))
    );
  }

  return parts.length ? and(...parts) : undefined;
}

export async function listLeads(filters: LeadFilters, page: number): Promise<Lead[]> {
  const safePage = Math.max(1, Math.floor(page) || 1);

  return db
    .select()
    .from(leads)
    .where(whereFor(filters))
    .orderBy(desc(leads.createdAt))
    .limit(PAGE_SIZE)
    .offset((safePage - 1) * PAGE_SIZE);
}

export async function countLeads(filters: LeadFilters): Promise<number> {
  const [row] = await db.select({ n: count() }).from(leads).where(whereFor(filters));
  return row?.n ?? 0;
}

/** Every matching lead, ignoring pagination. Used only by the CSV export. */
export async function exportLeads(filters: LeadFilters): Promise<Lead[]> {
  return db
    .select()
    .from(leads)
    .where(whereFor(filters))
    .orderBy(desc(leads.createdAt))
    .limit(EXPORT_LIMIT);
}

export async function getLead(id: number): Promise<Lead | null> {
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return row ?? null;
}

export interface NewLead {
  name: string;
  phone: string;
  email: string | null;
  message: string;
  source: string;
  pageUrl: string;
  ipHash: string | null;
  userAgent: string | null;
}

export async function insertLead(input: NewLead): Promise<void> {
  await db.insert(leads).values(input);
}

/**
 * Marks a lead as read. Idempotent: the `IS NULL` guard means the timestamp
 * records when it was FIRST opened, not the most recent view.
 */
export async function markSeen(id: number): Promise<void> {
  await db
    .update(leads)
    .set({ seenAt: new Date(), updatedAt: new Date() })
    .where(and(eq(leads.id, id), isNull(leads.seenAt)));
}

export async function setStatus(id: number, status: LeadStatus): Promise<void> {
  await db.update(leads).set({ status, updatedAt: new Date() }).where(eq(leads.id, id));
}

export async function setNote(id: number, note: string): Promise<void> {
  await db
    .update(leads)
    .set({ note: note.trim() || null, updatedAt: new Date() })
    .where(eq(leads.id, id));
}

/**
 * Unread = never opened AND not already dismissed as spam.
 *
 * Read state and business status are separate on purpose: opening a lead to
 * read it must not claim it has been handled, and marking it spam must not
 * leave a permanent unread badge.
 */
export async function unreadCount(): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(leads)
    .where(and(isNull(leads.seenAt), ne(leads.status, 'spam')));

  return row?.n ?? 0;
}
