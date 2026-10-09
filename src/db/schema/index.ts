/**
 * Schema barrel. drizzle.config.ts points here, so every table must be
 * re-exported from this file for migrations to see it.
 *
 * Adding a content resource later (articles, clients, media) means adding one
 * file next to these and one line here.
 */
export * from './auth';
export * from './leads';
export * from './rate-limits';
export * from './sessions';
