/**
 * Serves CMS uploads from `UPLOAD_DIR`.
 *
 * A route rather than a static mount because the upload directory is outside
 * `public/` and is configurable at runtime. In production Caddy can be pointed
 * at `UPLOAD_DIR` directly and this route becomes a fallback; locally it is the
 * only way the images resolve.
 *
 * The stored names are content-hashed and never overwritten, so the response is
 * safe to cache forever. The path is resolved and re-checked against the upload
 * root — a `..` in the request must not be able to read anything else on disk.
 */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';
import { uploadDir } from '../../lib/uploads';

export const prerender = false;

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const notFound = () => new Response('Not found', { status: 404 });

export const GET: APIRoute = async ({ params }) => {
  const rel = params.file ?? '';
  if (!rel || rel.includes('\0')) return notFound();

  const root = path.resolve(uploadDir());
  const full = path.resolve(root, rel);

  // `full` must be the root itself or sit underneath it. The `root + sep` check
  // is what rejects `/uploads/../../etc/passwd`.
  if (full !== root && !full.startsWith(root + path.sep)) return notFound();

  const type = CONTENT_TYPES[path.extname(full).toLowerCase()];
  if (!type) return notFound();

  try {
    const info = await stat(full);
    if (!info.isFile()) return notFound();

    const body = await readFile(full);
    return new Response(body, {
      headers: {
        'Content-Type': type,
        'Content-Length': String(info.size),
        // Content-hashed names — a changed image is a new URL.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return notFound();
  }
};
