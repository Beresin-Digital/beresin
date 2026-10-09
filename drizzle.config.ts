import { defineConfig } from 'drizzle-kit';
import { dbConfig } from './src/lib/db-env.mjs';

// Load .env with Node's built-in loader (Node 24) — no dotenv dependency.
// drizzle-kit runs this file through esbuild, so types are stripped and this
// works even though `process` is not otherwise referenced in the app code.
//
// This MUST run before `dbConfig()` is called below. It does, because the helper
// only reads the environment when it is invoked, not when it is imported — so
// the import hoisting above is harmless.
try {
  process.loadEnvFile('.env');
} catch {
  // No .env file — fall back to the ambient environment (e.g. CI).
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',

  // No `migrations` block: drizzle-kit's default is already
  // `drizzle.__drizzle_migrations`, which is where the existing migrations were
  // recorded. Stating it explicitly changed nothing, so it is left out.

  dbCredentials: dbConfig(),

  strict: true,
  verbose: true,
});
