import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { ARTICLE_STATUSES, LEAD_STATUSES, PROJECT_STATUSES } from '../db/schema';
import { hashIp, rateLimit } from '../lib/anti-abuse';
import { createArticle, deleteArticle, getArticle, slugTaken as articleSlugTaken, updateArticle } from '../lib/articles';
import {
  ADMIN_SESSION_KEY,
  findAdminByEmail,
  markLogin,
  verifyPassword,
  type AdminSessionUser,
} from '../lib/auth';
import { createClient, deleteClient, getClient, updateClient } from '../lib/clients';
import { parseList, slugify } from '../lib/format';
import { setNote, setStatus } from '../lib/leads';
import {
  createProject,
  deleteProject,
  getProject,
  slugTaken as projectSlugTaken,
  updateProject,
} from '../lib/projects';
import { UploadError, deleteImage, saveImage, type SavedImage } from '../lib/uploads';

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
function parseId(value: string, what = 'lead'): number {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ActionError({ code: 'BAD_REQUEST', message: `ID ${what} tidak valid.` });
  }
  return id;
}

/**
 * Stores an uploaded image, or returns null when the field was left empty.
 *
 * An empty `<input type="file">` still submits a zero-byte `File`, so `size === 0`
 * — not the field's absence — is what "no upload" looks like here. `UploadError`
 * carries a message safe to show the operator; anything else is a real fault and
 * is re-thrown.
 */
async function upload(file: File | undefined, folder: string): Promise<SavedImage | null> {
  if (!file || file.size === 0) return null;

  try {
    return await saveImage(file, folder);
  } catch (err) {
    if (err instanceof UploadError) {
      throw new ActionError({ code: 'BAD_REQUEST', message: err.message });
    }
    throw err;
  }
}

/** A required slug: uses the supplied one, else derives it from the title. */
function requireSlug(supplied: string | undefined, title: string): string {
  const slug = slugify(supplied?.trim() || title);
  if (!slug) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'Slug tidak valid. Isi slug atau judul yang memuat huruf/angka.',
    });
  }
  return slug;
}

/** Rejects a duplicate slug with a message the form can show verbatim. */
function assertSlugFree(taken: boolean, slug: string) {
  if (taken) {
    throw new ActionError({ code: 'CONFLICT', message: `Slug "${slug}" sudah dipakai.` });
  }
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

  // --- articles ------------------------------------------------------------

  /**
   * Create or update an article.
   *
   * Multipart, because the same form may carry a cover upload. The image is
   * only ever the *new* upload or the row's existing value — the stored path is
   * never taken from the form, so a crafted post cannot point a row at someone
   * else's file.
   */
  saveArticle: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().optional(),
      slug: z.string().max(200).optional(),
      title: z.string().min(1).max(200),
      excerpt: z.string().max(1000).default(''),
      body: z.string().max(200000).default(''),
      category: z.string().max(64).default(''),
      coverAlt: z.string().max(255).default(''),
      status: z.enum(ARTICLE_STATUSES),
      removeCover: z.boolean().default(false),
      cover: z.instanceof(File).optional(),
    }),

    handler: async (input, context) => {
      assertAdmin(context.locals.admin);

      const existing = input.id ? await getArticle(parseId(input.id, 'artikel')) : null;
      if (input.id && !existing) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Artikel tidak ditemukan.' });
      }

      const slug = requireSlug(input.slug, input.title);
      assertSlugFree(await articleSlugTaken(slug, existing?.id), slug);

      const uploaded = await upload(input.cover, 'articles');

      // Precedence: a new upload wins, else an explicit remove, else keep.
      let coverImage = existing?.coverImage ?? null;
      let coverWidth = existing?.coverWidth ?? null;
      let coverHeight = existing?.coverHeight ?? null;
      if (uploaded) {
        coverImage = uploaded.path;
        coverWidth = uploaded.width;
        coverHeight = uploaded.height;
      } else if (input.removeCover) {
        coverImage = null;
        coverWidth = null;
        coverHeight = null;
      }

      // Only discard the old files once the replacement has been written.
      if (uploaded && existing?.coverImage && existing.coverImage !== uploaded.path) {
        await deleteImage(existing.coverImage);
      }

      const data = {
        slug,
        title: input.title,
        excerpt: input.excerpt,
        body: input.body,
        category: input.category,
        coverImage,
        coverAlt: input.coverAlt,
        coverWidth,
        coverHeight,
        status: input.status,
      };

      const id = existing
        ? (await updateArticle(existing.id, data), existing.id)
        : (await createArticle(data)).id;

      return { id };
    },
  }),

  deleteArticle: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().min(1) }),

    handler: async ({ id }, context) => {
      assertAdmin(context.locals.admin);
      const articleId = parseId(id, 'artikel');

      const existing = await getArticle(articleId);
      await deleteArticle(articleId);
      // The row is gone; the files are best-effort cleanup.
      await deleteImage(existing?.coverImage);

      return { id: articleId };
    },
  }),

  // --- clients -------------------------------------------------------------

  saveClient: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().optional(),
      name: z.string().min(1).max(120),
      category: z.string().max(80).default(''),
      icon: z.string().max(40).default('building-2'),
      isActive: z.boolean().default(false),
      isRealEngagement: z.boolean().default(false),
      sortOrder: z.string().optional(),
      removeLogo: z.boolean().default(false),
      logo: z.instanceof(File).optional(),
    }),

    handler: async (input, context) => {
      assertAdmin(context.locals.admin);

      const existing = input.id ? await getClient(parseId(input.id, 'klien')) : null;
      if (input.id && !existing) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Klien tidak ditemukan.' });
      }

      const uploaded = await upload(input.logo, 'clients');

      let logo = existing?.logo ?? null;
      let logoWidth = existing?.logoWidth ?? null;
      let logoHeight = existing?.logoHeight ?? null;
      if (uploaded) {
        logo = uploaded.path;
        logoWidth = uploaded.width;
        logoHeight = uploaded.height;
      } else if (input.removeLogo) {
        logo = null;
        logoWidth = null;
        logoHeight = null;
      }

      if (uploaded && existing?.logo && existing.logo !== uploaded.path) {
        await deleteImage(existing.logo);
      }

      const sortOrder = Number.parseInt(input.sortOrder ?? '', 10);

      const data = {
        name: input.name,
        category: input.category,
        icon: input.icon,
        logo,
        logoWidth,
        logoHeight,
        isActive: input.isActive,
        isRealEngagement: input.isRealEngagement,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      };

      const id = existing
        ? (await updateClient(existing.id, data), existing.id)
        : (await createClient(data)).id;

      return { id };
    },
  }),

  deleteClient: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().min(1) }),

    handler: async ({ id }, context) => {
      assertAdmin(context.locals.admin);
      const clientId = parseId(id, 'klien');

      const existing = await getClient(clientId);
      await deleteClient(clientId);
      await deleteImage(existing?.logo);

      return { id: clientId };
    },
  }),

  // --- projects ------------------------------------------------------------

  /**
   * Create or update a portfolio project.
   *
   * The honesty rule is enforced downstream in `lib/projects.ts` (`normalize`),
   * so a `concept` row always ends up with no client name and the forced
   * "Concept Project" label regardless of what this form posts.
   */
  saveProject: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().optional(),
      slug: z.string().max(120).optional(),
      title: z.string().min(1).max(160),
      category: z.string().max(80).default(''),
      summary: z.string().max(2000).default(''),
      overview: z.string().max(20000).default(''),
      scope: z.string().max(8000).default(''),
      highlights: z.string().max(4000).default(''),
      clientName: z.string().max(120).default(''),
      status: z.enum(PROJECT_STATUSES),
      statusLabel: z.string().max(40).default(''),
      sortOrder: z.string().optional(),
      isPublished: z.boolean().default(false),
      removeImage: z.boolean().default(false),
      image: z.instanceof(File).optional(),
    }),

    handler: async (input, context) => {
      assertAdmin(context.locals.admin);

      const existing = input.id ? await getProject(parseId(input.id, 'proyek')) : null;
      if (input.id && !existing) {
        throw new ActionError({ code: 'NOT_FOUND', message: 'Proyek tidak ditemukan.' });
      }

      const slug = requireSlug(input.slug, input.title);
      assertSlugFree(await projectSlugTaken(slug, existing?.id), slug);

      const uploaded = await upload(input.image, 'projects');

      let image = existing?.image ?? null;
      let imageWidth = existing?.imageWidth ?? null;
      let imageHeight = existing?.imageHeight ?? null;
      if (uploaded) {
        image = uploaded.path;
        imageWidth = uploaded.width;
        imageHeight = uploaded.height;
      } else if (input.removeImage) {
        image = null;
        imageWidth = null;
        imageHeight = null;
      }

      if (uploaded && existing?.image && existing.image !== uploaded.path) {
        await deleteImage(existing.image);
      }

      const sortOrder = Number.parseInt(input.sortOrder ?? '', 10);

      const data = {
        slug,
        title: input.title,
        category: input.category,
        summary: input.summary,
        overview: input.overview,
        scope: parseList(input.scope),
        highlights: parseList(input.highlights),
        clientName: input.clientName.trim() || null,
        // Preserved, not edited here — the form has no client-logo field.
        clientLogo: existing?.clientLogo ?? null,
        status: input.status,
        statusLabel: input.statusLabel,
        image,
        imageWidth,
        imageHeight,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isPublished: input.isPublished,
      };

      const id = existing
        ? (await updateProject(existing.id, data), existing.id)
        : (await createProject(data)).id;

      return { id };
    },
  }),

  deleteProject: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().min(1) }),

    handler: async ({ id }, context) => {
      assertAdmin(context.locals.admin);
      const projectId = parseId(id, 'proyek');

      const existing = await getProject(projectId);
      await deleteProject(projectId);
      await deleteImage(existing?.image);
      await deleteImage(existing?.clientLogo);

      return { id: projectId };
    },
  }),
};
