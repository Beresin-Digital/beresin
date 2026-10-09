import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { LEAD_STATUSES } from '../db/schema';
import { hashIp, rateLimit } from '../lib/anti-abuse';
import {
  ADMIN_SESSION_KEY,
  findAdminByEmail,
  markLogin,
  verifyPassword,
  type AdminSessionUser,
} from '../lib/auth';
import { setNote, setStatus } from '../lib/leads';

/** 10 attempts per 15 minutes, per IP. */
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_SECONDS = 15 * 60;

/**
 * A flat delay on every failure.
 *
 * argon2id already costs tens of milliseconds, but a *miss* (no such account)
 * returns almost instantly while a *hit* has to verify a hash — a difference
 * large enough to reveal whether an email is registered. Sleeping the same
 * amount on both paths flattens that.
 */
const FAILURE_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The middleware already guards every /admin path these actions are posted to,
 * but re-checking here costs one property read and means a future refactor of
 * the middleware cannot quietly expose a mutation.
 */
function assertAdmin(admin: AdminSessionUser | null | undefined): AdminSessionUser {
  if (!admin) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sesi berakhir. Silakan masuk lagi.' });
  }
  return admin;
}

/** Form values arrive as strings, so the id is parsed rather than coerced. */
function parseId(value: string): number {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'ID lead tidak valid.' });
  }
  return id;
}

export const server = {
  /**
   * Admin login.
   *
   * Deliberately an Action rather than a route handler: `security.checkOrigin`
   * composes *before* user middleware and only covers form posts, so keeping
   * this a form post means the CSRF check applies without us reimplementing it.
   */
  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.email(),
      password: z.string().min(1).max(256),
    }),

    handler: async ({ email, password }, context) => {
      const session = context.session;
      if (!session) {
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Sesi tidak tersedia.' });
      }

      const ipHash = hashIp(context.clientAddress);
      const allowed = await rateLimit(
        `login:${ipHash ?? 'unknown'}`,
        LOGIN_LIMIT,
        LOGIN_WINDOW_SECONDS
      );

      if (!allowed) {
        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Terlalu banyak percobaan masuk. Coba lagi dalam beberapa menit.',
        });
      }

      const user = await findAdminByEmail(email);
      const passwordOk = user ? await verifyPassword(user.passwordHash, password) : false;

      if (!user || !passwordOk) {
        await sleep(FAILURE_DELAY_MS);
        // One message for both failures: never reveal which field was wrong, or
        // whether the account exists at all.
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'Email atau kata sandi salah.' });
      }

      // Regenerate BEFORE writing the identity. If an attacker planted a known
      // session id, the logged-in session must not be that one.
      await session.regenerate();
      session.set(ADMIN_SESSION_KEY, {
        id: user.id,
        email: user.email,
        name: user.name,
        sv: user.sessionVersion,
      });

      await markLogin(user.id);

      return { name: user.name };
    },
  }),

  /** Business status of a lead. Separate from read state (see `seen_at`). */
  updateLeadStatus: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().min(1),
      status: z.enum(LEAD_STATUSES),
    }),

    handler: async ({ id, status }, context) => {
      assertAdmin(context.locals.admin);
      const leadId = parseId(id);
      await setStatus(leadId, status);
      return { id: leadId, status };
    },
  }),

  /** Internal note on a lead. Never shown to the visitor. */
  updateLeadNote: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().min(1),
      note: z.string().max(2000),
    }),

    handler: async ({ id, note }, context) => {
      assertAdmin(context.locals.admin);
      const leadId = parseId(id);
      await setNote(leadId, note);
      return { id: leadId };
    },
  }),
};
