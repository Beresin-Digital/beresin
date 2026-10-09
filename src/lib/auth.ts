import { verify } from '@node-rs/argon2';
import type { AstroSession } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { adminUsers } from '../db/schema';

/** Session key the admin identity is stored under. */
export const ADMIN_SESSION_KEY = 'admin';

/** What we keep in the session payload. Small on purpose: never the hash. */
export interface AdminSessionUser {
  id: number;
  email: string;
  name: string;
  /** `admin_users.session_version` at the moment this session was issued. */
  sv: number;
}

/**
 * Looks an account up by email. Emails are stored lower-cased, so the lookup
 * normalises the same way the seed script does — otherwise a login typed as
 * "Owner@Example.com" would silently never match.
 */
export async function findAdminByEmail(email: string) {
  const normalised = email.trim().toLowerCase();
  if (!normalised) return null;

  const [row] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, normalised))
    .limit(1);

  return row ?? null;
}

/**
 * Verifies a password against a stored argon2id hash.
 *
 * A malformed hash must read as "wrong password", never as a thrown error —
 * otherwise a corrupted row turns into a 500 that leaks the difference between
 * "no such user" and "bad hash".
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await verify(hash, password);
  } catch {
    return false;
  }
}

export async function markLogin(id: number): Promise<void> {
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, id));
}

/**
 * Reads the admin identity out of the session and re-checks it against the
 * database.
 *
 * The database round-trip on every admin request is deliberate. It is what
 * makes `session_version` a working "log out everywhere" switch, and it means a
 * deleted account loses access immediately rather than keeping it until the
 * cookie expires. It costs one indexed primary-key lookup per admin request,
 * which is nothing next to rendering the page.
 *
 * A session that fails the check is destroyed, so the stale cookie cannot be
 * presented again.
 */
export async function loadAdminSession(session: AstroSession): Promise<AdminSessionUser | null> {
  const raw = await session.get(ADMIN_SESSION_KEY);
  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as Partial<AdminSessionUser>;
  if (typeof candidate.id !== 'number' || typeof candidate.sv !== 'number') return null;

  const [row] = await db
    .select({ sessionVersion: adminUsers.sessionVersion })
    .from(adminUsers)
    .where(eq(adminUsers.id, candidate.id))
    .limit(1);

  // Either the account is gone, or its session_version was bumped. Both mean
  // this session is no longer valid.
  if (!row || row.sessionVersion !== candidate.sv) {
    session.destroy();
    return null;
  }

  return candidate as AdminSessionUser;
}
