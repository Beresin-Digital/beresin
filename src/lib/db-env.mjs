/**
 * Database connection settings, built from the DB_* variables.
 *
 * ONE place builds these, shared by the app (`src/db/client.ts`), drizzle-kit
 * (`drizzle.config.ts`) and the Node scripts — so a rename here cannot leave a
 * caller behind reading a variable that no longer exists.
 *
 * Plain `.mjs` with JSDoc types rather than `.ts`: the scripts run without a
 * loader, and `allowJs` lets the TypeScript callers import it unchanged.
 *
 * The shape uses `user`, not `username`. That is the one field name both
 * postgres.js (`BaseOptions.user`) and drizzle-kit's postgresql `dbCredentials`
 * agree on, so a single object can be handed to either without translation.
 *
 * `dbConfig()` deliberately does NOT throw on a missing variable.
 * `src/db/client.ts` is imported by the built server and postgres.js connects
 * lazily, so an unconfigured database must not turn into an *import* error —
 * that is what keeps `pnpm build` working on a machine with no `.env`. Callers
 * that genuinely need a database check `missingDbVars()` first and fail with a
 * readable message.
 */

/** A leftover placeholder is as good as absent. */
const PLACEHOLDER = 'CHANGE_ME';

/** Variables the database connection needs. `DB_PORT` is optional. */
const REQUIRED_VARS = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

/**
 * @param {string} name
 * @returns {string}
 */
function read(name) {
  const value = process.env[name];
  if (!value) return '';

  const trimmed = value.trim();
  return trimmed === PLACEHOLDER ? '' : trimmed;
}

/** @returns {number} */
function port() {
  const parsed = Number.parseInt(read('DB_PORT') || '5432', 10);
  return Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : 5432;
}

/**
 * @typedef {object} DbConnection
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} user
 * @property {string} password
 */

/**
 * The connection, in the shape postgres.js and drizzle-kit both accept.
 *
 * @returns {DbConnection}
 */
export function dbConfig() {
  return {
    host: read('DB_HOST'),
    port: port(),
    database: read('DB_NAME'),
    user: read('DB_USER'),
    password: read('DB_PASSWORD'),
  };
}

/**
 * Names of the variables that are still unset, so a script can fail with the
 * exact list instead of a confusing connection error.
 *
 * @returns {string[]}
 */
export function missingDbVars() {
  return REQUIRED_VARS.filter((name) => !read(name));
}
