#!/usr/bin/env node
/**
 * Seeds the CMS with the content that used to live in `src/data/*.ts`, so the
 * public site looks unchanged after the switch to database-driven pages.
 *
 *   pnpm db:seed-content
 *
 * Idempotent by construction:
 *  - articles and projects insert `ON CONFLICT (slug) DO NOTHING`;
 *  - clients are only inserted when the table is empty (no natural key);
 *  - images are written under a content-hash base name, so re-running rewrites
 *    the same files rather than accumulating new ones.
 *
 * The bundled `src/assets/images/*.webp` are re-encoded into the same variant
 * ladder the admin upload path produces (see `src/lib/image-variants.ts`). The
 * ladder is duplicated here on purpose: this is a plain `.mjs` script and cannot
 * import the TypeScript module.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import postgres from 'postgres';
import sharp from 'sharp';
import { dbConfig, missingDbVars } from '../src/lib/db-env.mjs';

try {
  process.loadEnvFile('.env');
} catch {
  /* fall back to the real environment */
}

const UPLOAD_DIR = process.env.UPLOAD_DIR?.trim() || '.data/uploads';
const ASSETS_DIR = 'src/assets/images';

/** MUST match IMAGE_WIDTHS in src/lib/image-variants.ts. */
const IMAGE_WIDTHS = [320, 640, 960, 1280];

function variantWidths(width) {
  const widths = IMAGE_WIDTHS.filter((w) => w <= width);
  if (widths.length === 0) return [width];

  const top = IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  if (widths[widths.length - 1] !== width && width <= top) widths.push(width);
  return widths;
}

/** Re-encodes one bundled image into the variant ladder. Returns its stored path. */
async function storeImage(sourceFile, folder) {
  const buffer = await readFile(path.join(ASSETS_DIR, sourceFile));
  const base = createHash('sha1').update(buffer).digest('hex').slice(0, 16);
  const dir = path.join(UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });

  const meta = await sharp(buffer).metadata();
  const widths = variantWidths(meta.width);
  let largest = { width: 0, height: 0 };

  for (const width of widths) {
    const out = await sharp(buffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    await writeFile(path.join(dir, `${base}-${width}.webp`), out.data);

    if (width === widths[widths.length - 1]) {
      largest = { width: out.info.width, height: out.info.height };
      await writeFile(path.join(dir, `${base}.webp`), out.data);
    }
  }

  return { path: `/uploads/${folder}/${base}`, width: largest.width, height: largest.height };
}

// --- placeholder content, mirroring the deleted src/data modules ------------

const CLIENTS = [
  { name: 'National Manufacturing Company', category: 'Corporate Website', icon: 'building-2' },
  { name: 'Professional Services Firm', category: 'Web Application', icon: 'briefcase' },
  { name: 'Education Foundation', category: 'School Website', icon: 'graduation-cap' },
  { name: 'Logistics Company', category: 'Operations Dashboard', icon: 'truck' },
  { name: 'Retail & E-commerce Brand', category: 'Online Store', icon: 'shopping-bag' },
  { name: 'Property Developer', category: 'Company Profile', icon: 'globe' },
  { name: 'Creative & Branding Agency', category: 'White-label Build', icon: 'shield-check' },
  { name: 'Financial Services Firm', category: 'Client Portal', icon: 'credit-card' },
];

const ARTICLES = [
  {
    slug: 'why-company-websites-feel-slow',
    title: 'Why Company Websites Feel Slow — and How to Fix It',
    excerpt:
      'The most common cause is not an expensive server, but how assets are loaded. We cover the four causes we find most often in audits, along with the order to fix them in.',
    category: 'Web Development',
    publishedAt: '2026-09-18T03:00:00Z',
    cover: 'article-cover.webp',
    body: `A slow company website is rarely a hosting problem. More often it is a delivery problem: the browser is asked to fetch, parse, and run more than the page actually needs before it can show anything useful.

## The four causes we see most

**Unoptimised images.** A single hero photograph straight from a camera can outweigh the rest of the page combined. Serving it as a modern format at the size it is actually displayed usually fixes the largest share of the problem.

**Render-blocking assets.** Stylesheets and scripts placed in the head delay the first paint. Loading only what the first screen needs — and deferring the rest — lets the page appear sooner.

**Too much third-party JavaScript.** Chat widgets, tag managers, and analytics each add a request and a main-thread cost. Each one is small on its own; together they add up.

**No caching strategy.** If every visit re-downloads unchanged files, the site feels slow on every page, not just the first.

## The order to fix them in

Start with images, because the payoff is largest and the risk is lowest. Then remove render-blocking assets, then audit third-party scripts, then set long-lived caching headers for static files. Measuring after each step tells you where the remaining time actually goes.

None of this requires a bigger server. It requires knowing what the browser is being asked to do.`,
  },
  {
    slug: 'website-redesign-checklist',
    title: 'A Website Redesign Checklist for Growing Businesses',
    excerpt: 'The decisions and content worth preparing before you brief a redesign.',
    category: 'Process',
    publishedAt: '2026-09-02T03:00:00Z',
    body: `Most redesign projects stall not on design, but on decisions that were never made. Preparing the following before the work starts keeps a rebuild moving.

## Decide what the site is for

Write down the two or three actions a visitor should be able to take — request a quote, find a location, read a case study. Every page is then judged against those goals rather than against taste.

## Gather the content you already have

Collect the current copy, product information, and contact details in one place. A redesign is the moment to delete what is out of date, and that is easier before layout begins.

## Agree on who maintains it

If the marketing team will update news and products, the structure should make that simple. Decide this early, because it shapes how the content is organised.

## Keep what works

A redesign does not have to discard everything. Pages that already bring in enquiries, and the URLs people have bookmarked, are worth preserving and improving rather than replacing.`,
  },
  {
    slug: 'custom-web-app-vs-off-the-shelf',
    title: 'Custom Web App or Off-the-Shelf Software?',
    excerpt:
      'How to tell when a tool that mostly fits starts costing more than building the right one.',
    category: 'Custom Systems',
    publishedAt: '2026-08-21T03:00:00Z',
    body: `Off-the-shelf software is usually the right first answer. It is faster to start, cheaper to try, and someone else maintains it. The question is when "mostly fits" stops being good enough.

## Signs the fit is failing

When staff keep a spreadsheet beside the tool because it cannot record something they need, the tool is no longer doing its job. The same is true when a routine process has to be broken into several manual steps, or when reports have to be assembled by hand from exports.

## What custom costs beyond the build

A custom system is a commitment: it needs hosting, occasional changes, and someone who understands it. That is worth accepting when the process is central to how the business runs — and not worth it for something a standard tool already handles well.

## A middle path

Many teams start with a standard tool and, over time, add a small custom piece that fills the specific gap. That keeps the cost proportional to the problem, and leaves the door open to building more later.`,
  },
  {
    slug: 'cost-of-a-company-profile-website',
    title: 'What Determines the Cost of a Company Profile Website',
    excerpt: 'Understanding the cost components so quotes can be compared fairly.',
    category: 'Web Development',
    publishedAt: '2026-08-05T03:00:00Z',
    body: `Two quotes for a company profile website can differ widely without either being unreasonable. The difference is usually scope, not quality — and scope is easier to compare once it is broken into parts.

## Content and structure

How many page types are there, and who writes the words? A site with a handful of fixed pages is a different project from one with a product catalogue or a news section that someone updates.

## Design

A new design built from scratch, an adaptation of an existing brand, and a template with your colours are three different amounts of work. It helps to say which one you are asking for.

## Functionality

Contact forms, language versions, integrations with other systems, and admin panels each add to the build. Listing them explicitly is what makes two quotes comparable.

## Ongoing costs

Hosting, domain, and maintenance are separate from the build. Asking about them up front avoids surprises later.`,
  },
];

const PROJECTS = [
  {
    slug: 'company-profile-website',
    title: 'Company Profile Website',
    category: 'Corporate Website',
    summary:
      'A corporate profile site for a national manufacturing company — clear product and capability pages, an editable news section, and an enquiry flow that routes messages to the right team.',
    overview:
      'A national manufacturing company needed a corporate profile site that read clearly to buyers and partners alike, and that its marketing team could keep current without calling a developer. We structured it around their product lines and capabilities, with an editable news and product section and an enquiry flow that routes each message to the right team.',
    scope: [
      'Corporate profile & product pages',
      'Editable news & product content',
      'Enquiry routing to the right team',
      'Core Web Vitals & technical SEO',
    ],
    highlights: ['Custom design', 'Editable CMS', 'Core Web Vitals'],
    clientName: 'Client name',
    status: 'delivered',
    statusLabel: 'Delivered',
    image: 'service-web-app.webp',
    sortOrder: 0,
  },
  {
    slug: 'school-website',
    title: 'School Website',
    category: 'Education Website',
    summary:
      'A website for an education foundation — programme and admissions information, a news and announcements feed, and a structure parents can navigate comfortably on a phone.',
    overview:
      'An education foundation needed one place for programme information, admissions, and announcements — readable on the phones most parents actually use. We organised the content around what families look for first, and gave the school an announcements feed it can update itself.',
    scope: [
      'Programme & admissions pages',
      'News & announcements feed',
      'Mobile-first content structure',
      'Admin panel for staff updates',
    ],
    highlights: ['Admissions pages', 'News & announcements', 'Mobile-first'],
    clientName: 'Client name',
    status: 'delivered',
    statusLabel: 'Delivered',
    image: 'service-design.webp',
    sortOrder: 1,
  },
  {
    slug: 'product-launch-landing-page',
    title: 'Product Launch Landing Page',
    category: 'Landing Page',
    summary:
      'A self-initiated concept exploring a focused, single-goal campaign page: one message, one call to action, and a measurable conversion path.',
    overview:
      'A self-initiated concept rather than client work — our take on a focused campaign page with a single goal. One message, one call to action, and a measurable conversion path, built to load fast and to be tested in sections.',
    scope: [
      'Single-goal campaign structure',
      'Conversion-focused copy layout',
      'A/B-ready sections',
      'Fast by default',
    ],
    highlights: ['Conversion-focused', 'Fast by default', 'A/B-ready sections'],
    clientName: null,
    status: 'concept',
    statusLabel: 'Concept Project',
    image: 'article-cover.webp',
    sortOrder: 2,
  },
];

// --- run --------------------------------------------------------------------

const missing = missingDbVars();
if (missing.length) {
  console.error(`\n✗ Belum diisi: ${missing.join(', ')}. Copy .env.example → .env lalu isi.`);
  process.exit(1);
}

const sql = postgres(dbConfig(), { max: 1, onnotice: () => {} });

try {
  // Images first: a failure here should abort before any rows are written.
  const articleCover = await storeImage('article-cover.webp', 'articles');
  const projectImages = new Map();
  for (const project of PROJECTS) {
    if (!projectImages.has(project.image)) {
      projectImages.set(project.image, await storeImage(project.image, 'projects'));
    }
  }

  let articleCount = 0;
  for (const article of ARTICLES) {
    const cover = article.cover ? articleCover : null;
    const rows = await sql`
      INSERT INTO articles
        (slug, title, excerpt, body, category, cover_image, cover_alt, cover_width, cover_height, status, published_at)
      VALUES
        (${article.slug}, ${article.title}, ${article.excerpt}, ${article.body}, ${article.category},
         ${cover?.path ?? null}, ${cover ? article.title : ''}, ${cover?.width ?? null}, ${cover?.height ?? null},
         'published', ${article.publishedAt})
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;
    articleCount += rows.length;
  }

  let clientCount = 0;
  const [{ n: existingClients }] = await sql`SELECT count(*)::int AS n FROM clients`;
  if (existingClients === 0) {
    for (const [index, client] of CLIENTS.entries()) {
      await sql`
        INSERT INTO clients (name, category, icon, is_active, is_real_engagement, sort_order)
        VALUES (${client.name}, ${client.category}, ${client.icon}, true, false, ${index})
      `;
      clientCount++;
    }
  }

  let projectCount = 0;
  for (const project of PROJECTS) {
    const image = projectImages.get(project.image) ?? null;
    const rows = await sql`
      INSERT INTO projects
        (slug, title, category, summary, overview, scope, highlights, client_name, status, status_label,
         image, image_width, image_height, sort_order, is_published)
      VALUES
        (${project.slug}, ${project.title}, ${project.category}, ${project.summary}, ${project.overview},
         ${project.scope}::text[], ${project.highlights}::text[], ${project.clientName},
         ${project.status}, ${project.statusLabel},
         ${image?.path ?? null}, ${image?.width ?? null}, ${image?.height ?? null},
         ${project.sortOrder}, true)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;
    projectCount += rows.length;
  }

  console.log('\n✓ Seed konten selesai.');
  console.log(`  artikel ditambahkan : ${articleCount} (dari ${ARTICLES.length})`);
  console.log(`  klien ditambahkan   : ${clientCount} (dari ${CLIENTS.length})`);
  console.log(`  proyek ditambahkan  : ${projectCount} (dari ${PROJECTS.length})`);
  console.log(`  gambar di           : ${UPLOAD_DIR}\n`);
} catch (err) {
  console.error(`\n✗ Gagal: ${err.message}`);
  process.exitCode = 1;
} finally {
  await sql.end();
}
