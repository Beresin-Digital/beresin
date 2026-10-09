import { asc, count, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { clients, type Client } from '../db/schema';

export interface ClientInput {
  name: string;
  category: string;
  icon: string;
  logo: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  isActive: boolean;
  isRealEngagement: boolean;
  sortOrder: number;
}

// --- public ---------------------------------------------------------------

/**
 * Clients shown on the homepage marquee: active rows, in the owner's order.
 * `isRealEngagement` is deliberately not part of this filter — it is advisory
 * (see the schema), and the display gate is `isActive` alone.
 */
export async function listActiveClients(): Promise<Client[]> {
  return db
    .select()
    .from(clients)
    .where(eq(clients.isActive, true))
    .orderBy(asc(clients.sortOrder), asc(clients.id));
}

// --- admin ----------------------------------------------------------------

export async function listClients(): Promise<Client[]> {
  return db.select().from(clients).orderBy(asc(clients.sortOrder), asc(clients.id));
}

export async function getClient(id: number): Promise<Client | null> {
  const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return row ?? null;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const [row] = await db.insert(clients).values(input).returning();
  return row;
}

export async function updateClient(id: number, input: ClientInput): Promise<void> {
  await db
    .update(clients)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(clients.id, id));
}

export async function deleteClient(id: number): Promise<void> {
  await db.delete(clients).where(eq(clients.id, id));
}

export interface ClientCounts {
  active: number;
  total: number;
}

export async function clientCounts(): Promise<ClientCounts> {
  const [activeRow] = await db
    .select({ n: count() })
    .from(clients)
    .where(eq(clients.isActive, true));

  const [totalRow] = await db.select({ n: count() }).from(clients);

  return { active: activeRow?.n ?? 0, total: totalRow?.n ?? 0 };
}
