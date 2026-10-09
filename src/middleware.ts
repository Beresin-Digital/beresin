import { defineMiddleware } from 'astro:middleware';

/**
 * Guard for the admin area.
 *
 * THE ORDER OF THIS FUNCTION IS LOAD-BEARING. Astro runs middleware while
 * prerendering at build time as well — `handleMiddleware` is not skipped for
 * prerendered routes. If anything above the early return touched the database
 * or the session, `pnpm build` would require a live Postgres and fail on a
 * clean machine or in CI.
 *
 * So: return first for every non-admin path, and only then reach for the
 * session — through a dynamic `import`, so the database module is not even
 * evaluated while the public site is being built.
 */
const ADMIN_PREFIX = '/admin';

/** Paths under /admin that must work without a session. */
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/admin/logout']);

/** Rejects anything that could turn a `?next=` value into an open redirect. */
function safeNext(value: string | null): string | null {
  if (!value) return null;

  const isLocalAdminPath =
    value.startsWith(ADMIN_PREFIX) &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !/[\u0000-\u001f\u007f]/.test(value);

  return isLocalAdminPath ? value : null;
}

/**
 * Adds the headers every admin response carries.
 *
 * Mutates in place in the normal case. The copy path exists because a
 * `Response.redirect()` has an immutable header guard, so `headers.set` throws
 * on it. Cookies are attached by Astro *after* middleware returns, so a copy
 * made here still receives them.
 */
function harden(response: Response): Response {
  const apply = (headers: Headers) => {
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    headers.set('Cache-Control', 'private, no-store');
  };

  try {
    apply(response.headers);
    return response;
  } catch {
    const headers = new Headers(response.headers);
    apply(headers);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Public site — out before anything can reach for the database.
  if (!pathname.startsWith(ADMIN_PREFIX)) return next();

  if (PUBLIC_ADMIN_PATHS.has(pathname)) return harden(await next());

  const { loadAdminSession } = await import('./lib/auth');

  // Fail CLOSED. If the session store is unreachable, treat the request as
  // unauthenticated rather than letting the error become a 500 that leaks a
  // stack trace — and never let an error be mistaken for a valid session.
  let admin: Awaited<ReturnType<typeof loadAdminSession>> = null;
  try {
    admin = context.session ? await loadAdminSession(context.session) : null;
  } catch (err) {
    console.error('[middleware] admin session lookup failed', err);
  }

  if (!admin) {
    const login = new URL('/admin/login', context.url);

    // Remember where they were headed — including the query, so a filtered or
    // paginated inbox survives the round trip — and let the login page send
    // them on once they are through. `safeNext` re-checks it on the way in, and
    // login.astro re-checks it again on the way out.
    const target = safeNext(context.url.pathname + context.url.search);
    if (target) login.searchParams.set('next', target);

    return harden(context.redirect(login.pathname + login.search));
  }

  context.locals.admin = admin;

  return harden(await next());
});
