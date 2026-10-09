// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// Astro copies `.env` into `process.env` only during a build. In `astro dev` the
// copy is skipped: `astro/dist/env/vite-plugin-env.js` guards its `buildStart`
// hook with `if (!isBuild) return`, so dev exposes the values through
// `import.meta.env` / `astro:env` and leaves `process.env` untouched.
//
// Everything shared with Node scripts and drizzle-kit reads `process.env`
// directly (`src/lib/db-env.mjs`, `src/lib/anti-abuse.ts`, the session driver),
// because those run outside Vite where `import.meta.env` does not exist. In dev
// they would all see `undefined` — DB host empty and the port silently falling
// back to 5432, the HMAC secret missing — while `pnpm start` (which passes
// `--env-file=.env`) worked fine. Loading it here fixes dev in one place.
//
// Node's own loader does not overwrite variables already present in the
// environment, so a shell value still wins (verified on Node 24.12.0).
// `astro build` and the standalone server are unaffected: they get the values
// through this same call or through `--env-file`.
try {
  process.loadEnvFile();
} catch {
  // No .env (CI, production image) — fall back to the real environment.
}

// https://astro.build/config
export default defineConfig({
  site: 'https://beresindigital.id',

  // Static by default: every marketing page is prerendered to HTML at build.
  // Routes that need a server (admin, API) opt out individually with
  // `export const prerender = false` — the flag must live in each file.
  output: 'static',
  adapter: node({ mode: 'standalone' }),

  // The sitemap is a prerendered route (src/pages/sitemap.xml.ts), not the
  // @astrojs/sitemap integration — see that file for why.

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    // 'auto' keeps the stylesheet external (it is ~35 KB raw / 7 KB gzipped, over
    // the 4 KB inline threshold). Measured: inlining it made things *worse* —
    // Style & Layout went 328 ms → 1032 ms and Speed Index 1.5 s → 3.8 s, because
    // the whole sheet is then parsed inside the HTML document.
    inlineStylesheets: 'auto',
  },

  // CSRF origin check for form POSTs. NOTE: this only covers requests whose
  // content-type is form/multipart/text-plain — JSON bodies are NOT covered.
  // Admin mutations go through Actions (form posts) for this reason.
  security: {
    checkOrigin: true,

    // Astro caps the body of an Action at 1 MiB by default, *independently* of
    // the Node adapter's own limit. Admin saves carry an image upload, and
    // `lib/uploads.ts` accepts up to 8 MB, so the default would reject every
    // real photo with CONTENT_TOO_LARGE. 12 MB leaves headroom for multipart
    // framing around an 8 MB file.
    actionBodySizeLimit: 12 * 1024 * 1024,

    // PRODUCTION ONLY — leave unset in dev.
    //
    // Once the site sits behind Caddy, `X-Forwarded-For` is only honoured when
    // the host has been validated against `allowedDomains`. With it unset, every
    // request appears to come from 127.0.0.1: the IP rate limiter would treat
    // the entire internet as one client and block it, and ip_hash would be
    // useless. Set it to the real host before the first production deploy, e.g.
    //   allowedDomains: [{ protocol: 'https', hostname: 'beresindigital.id' }],
    // Setting it here now would break localhost during development.
    allowedDomains: [{ protocol: 'https', hostname: 'blanch-estival-donny.ngrok-free.dev' }]
  },

  // Server-side sessions for the admin area, stored in Postgres.
  session: {
    driver: {
      // MUST be a URL. Vite resolves the entrypoint against Astro's own dist
      // directory, so a bare './src/db/session-driver.ts' string does not
      // resolve. fileURLToPath() of this URL is what actually gets bundled.
      entrypoint: new URL('./src/db/session-driver.ts', import.meta.url),
      // Inlined into the build manifest — therefore NO SECRETS here. The driver
      // reads SESSION_SECRET from the environment at runtime.
      config: { ttlSeconds: 60 * 60 * 24 * 7 },
    },
    cookie: {
      name: 'beresin_admin',
      // Scoped to the admin area: the cookie is never sent with a request for
      // the public site.
      path: '/admin',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      // `secure` is deliberately NOT set. Astro's default is
      // `runtimeMode === 'production'`, which is what we want — forcing Secure
      // here would make the browser drop the cookie on http://localhost.
    },
    ttl: 60 * 60 * 24 * 7,
  },

  image: {
    // sharp is Astro's default image service.
    responsiveStyles: true,
  },
});
