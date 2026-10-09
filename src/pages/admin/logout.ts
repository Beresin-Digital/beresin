/**
 * Admin logout.
 *
 * A route rather than an Action, and a deliberate exception to the "admin
 * mutations go through Actions" rule: an Action returns a serialised value and
 * cannot issue a redirect, and the logout button lives in the shared shell
 * where a redirect is exactly what is needed.
 *
 * It is still a form POST, so `security.checkOrigin` covers it, and it only
 * tears down a session — it mutates no data.
 */
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ session, redirect }) => {
  await session?.destroy();
  return redirect('/admin/login', 303);
};

/** A GET must never log anyone out — link prefetchers would do it for them. */
export const GET: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
