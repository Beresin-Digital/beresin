/**
 * Contact form endpoint.
 *
 * Order matters and is deliberate:
 *
 *   honeypot → Zod → HMAC the IP → rate limit → insert → redirect
 *
 * The honeypot runs before validation so a bot that fills every field gets a
 * cheerful success and does not retry. Validation runs before the rate limiter
 * so junk traffic does not consume a real visitor's quota. The IP is hashed
 * before anything is stored — the raw address never touches the database.
 *
 * Still deferred, and where they would go:
 *   - Brevo notification email → will become an `outbox` row written in the
 *     same transaction as the lead, sent by a separate worker. Sending inline
 *     would make a visitor's success depend on the mail relay being up.
 *   - signed-timestamp timing check → structurally impossible while every
 *     public page is prerendered: a timestamp baked in at build time is stale
 *     by the time anyone submits. Needs on-demand rendering to be meaningful.
 *   - Cloudflare Turnstile → code path below, enabled by setting the env var.
 *     It needs third-party JavaScript, so switching it on now would break the
 *     no-JS form and the 100/100 Lighthouse budget.
 */
import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { hashIp, rateLimit } from '../../lib/anti-abuse';
import { insertLead, type NewLead } from '../../lib/leads';

export const prerender = false;

/** 5 submissions per 10 minutes, per IP. */
const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_SECONDS = 10 * 60;

/** Truncated so a hostile client cannot store an unbounded header. */
const USER_AGENT_MAX = 512;

/**
 * Where a lead goes when Postgres is unreachable.
 *
 * A dropped lead is a lost customer, and this file is durable, so a lead that
 * cannot be inserted is appended here and replayed later. The write is awaited
 * before we report success — we do not claim to have saved something we have
 * not.
 */
const FALLBACK_DIR = process.env.UPLOAD_DIR || '.data';
const FALLBACK_FILE = join(FALLBACK_DIR, 'leads-fallback.ndjson');

/**
 * Validation messages double as the `?gagal=` vocabulary the public form
 * already understands, so `FormStatus.astro` needs no new plumbing. Only the
 * `path` is read; the wording is for logs.
 */
const LeadInput = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20),
  email: z
    .string()
    .trim()
    .max(254)
    .refine((value) => value === '' || z.email().safeParse(value).success),
  message: z.string().trim().max(2000),
  source: z.string().trim().max(64),
  page_url: z.string(),
});

/** Zod field name → the `?gagal=` token the form already renders. */
const FIELD_TO_GAGAL: Record<string, string> = {
  name: 'nama',
  phone: 'telepon',
  email: 'email',
  message: 'pesan',
};

/**
 * Return the visitor to the page they submitted from. `page_url` is a hidden
 * field the form fills with `Astro.url.pathname`. Anything that is not a plain
 * local path is rejected, so this cannot be turned into an open redirect.
 */
function returnPath(form: FormData): string {
  const raw = String(form.get('page_url') ?? '');

  // Must be a local, single-slash path. This rejects `//host` and `https://host`
  // (cross-origin) as well as `/\host`, which browsers normalise to a
  // protocol-relative URL — the classic open-redirect bypass.
  const isLocalPath = raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\');

  // Control characters would corrupt the Location header (a bare \n throws and
  // turns the request into a 500 instead of a clean fallback).
  const hasControlChars = /[\u0000-\u001f\u007f]/.test(raw);

  return isLocalPath && !hasControlChars ? raw : '/';
}

function withStatus(path: string, params: string): string {
  return `${path}?${params}${path === '/' ? '#kontak' : ''}`;
}

/**
 * Best-effort append of one NDJSON line. Returns false only if the disk itself
 * refused the write — the one case where the visitor must be told.
 */
async function writeFallback(lead: NewLead & { pageUrl: string }): Promise<boolean> {
  try {
    await mkdir(FALLBACK_DIR, { recursive: true });
    await appendFile(
      FALLBACK_FILE,
      `${JSON.stringify({ ...lead, receivedAt: new Date().toISOString() })}\n`,
      'utf8'
    );
    return true;
  } catch (err) {
    console.error('[contact] fallback write failed', err);
    return false;
  }
}

export const POST: APIRoute = async ({ request, redirect, clientAddress }) => {
  const form = await request.formData();
  const back = returnPath(form);

  // Honeypot: bots fill every field. Pretend success so they do not retry.
  if (String(form.get('company_website') ?? '').trim()) {
    return redirect(withStatus(back, 'terkirim=1'), 303);
  }

  const fail = (reason: string) =>
    redirect(withStatus(back, `gagal=${encodeURIComponent(reason)}`), 303);

  const parsed = LeadInput.safeParse({
    name: form.get('name') ?? '',
    phone: form.get('phone') ?? '',
    email: form.get('email') ?? '',
    message: form.get('message') ?? '',
    source: form.get('source') ?? '',
    page_url: back,
  });

  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? '');
    return fail(FIELD_TO_GAGAL[field] ?? 'umum');
  }

  const { name, phone, email, message, source, page_url } = parsed.data;

  // The raw address is never stored; only its HMAC, keyed by a server secret.
  const ipHash = hashIp(clientAddress);

  const allowed = await rateLimit(
    `contact:${ipHash ?? 'unknown'}`,
    CONTACT_LIMIT,
    CONTACT_WINDOW_SECONDS
  );

  if (!allowed) return fail('terlalu-sering');

  const lead: NewLead = {
    name,
    phone,
    email: email || null,
    message,
    source,
    pageUrl: page_url,
    ipHash,
    userAgent: request.headers.get('user-agent')?.slice(0, USER_AGENT_MAX) ?? null,
  };

  try {
    await insertLead(lead);
  } catch (err) {
    // The database is unreachable. Do NOT surface an error to the visitor: the
    // lead is still valuable and this file is durable. Best-effort append; only
    // if that fails too does the visitor see a failure.
    console.error('[contact] insert failed — writing fallback', err);
    if (!(await writeFallback(lead))) return fail('sistem');
  }

  return redirect(withStatus(back, 'terkirim=1'), 303);
};

/** Any non-POST verb is not allowed on this route. */
export const GET: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
