import { createHash } from 'node:crypto';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dbConfig } from '../lib/db-env.mjs';
import * as schema from './schema';

/**
 * The process-wide connection pool.
 *
 * Cached on `globalThis` rather than in a module-level `const` because Vite
 * re-evaluates modules on every edit during dev. A plain module-level pool
 * would be rebuilt on each save and the old one never closed, so the dev server
 * would pile up idle connections until Postgres started refusing new ones
 * ("too many clients"). `globalThis` survives re-evaluation. In the built
 * server the module is evaluated once, so the cache never does anything.
 *
 * postgres.js opens its first socket lazily, on the first query — importing
 * this module does not require a running database. That is what lets
 * `pnpm build` succeed on a machine with no Postgres, and it is why `dbConfig()`
 * returns empty strings rather than throwing when `.env` is absent.
 */
type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as {
  __beresinSql?: Sql;
  __beresinDb?: PostgresJsDatabase<typeof schema>;
  __beresinKey?: string;
};

const config = dbConfig();

/**
 * A digest of the connection settings, used to notice when they change.
 *
 * Hashed rather than stored raw so the password does not sit in a second place
 * in memory. It is compared, never reversed.
 */
const configKey = createHash('sha256').update(JSON.stringify(config)).digest('hex');

/**
 * Rebuild the pool when the settings change.
 *
 * `globalThis` surviving re-evaluation is exactly what makes the cache work —
 * but it also means it survives an `.env` change. Vite restarts its dev server
 * in-process when `.env` changes, so modules re-evaluate and `dbConfig()` starts
 * returning the new values, while the pool from the *previous* evaluation is
 * still sitting on `globalThis`. Without this check the stale pool wins, every
 * query fails, and the server looks healthy while silently writing every lead to
 * the on-disk fallback. That failure is invisible unless you go looking.
 */
if (globalForDb.__beresinSql && globalForDb.__beresinKey !== configKey) {
  void globalForDb.__beresinSql.end({ timeout: 0 }).catch(() => {});
  globalForDb.__beresinSql = undefined;
  globalForDb.__beresinDb = undefined;
}

export const sql =
  globalForDb.__beresinSql ??
  // One object, not `postgres(config, {...})`: postgres.js only offers the
  // two-argument form for a URL string, so the pool options have to be spread
  // in alongside the connection fields.
  postgres({
    ...config,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // NOTICE chatter (e.g. "relation already exists") is noise, not signal.
    onnotice: () => {},
  });

globalForDb.__beresinSql = sql;
globalForDb.__beresinKey = configKey;

export const db = globalForDb.__beresinDb ?? drizzle(sql, { schema });
globalForDb.__beresinDb = db;

/**
 * Scripts that create their own client must call `await client.end()`. This is
 * for the long-lived server process, which should never call it.
 */
export { schema };
