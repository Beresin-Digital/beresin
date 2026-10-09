import { and, asc, count, eq, ne } from 'drizzle-orm';
import { db } from '../db/client';
import { projects, type Project, type ProjectStatus } from '../db/schema';

export interface ProjectInput {
  slug: string;
  title: string;
  category: string;
  summary: string;
  overview: string;
  scope: string[];
  highlights: string[];
  clientName: string | null;
  clientLogo: string | null;
  status: ProjectStatus;
  statusLabel: string;
  image: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  sortOrder: number;
  isPublished: boolean;
}

/**
 * Enforces the honesty rule at the data layer, not just in the form: concept
 * work has no client to name and must carry the "Concept Project" label. This
 * runs on every save, so a crafted form post cannot produce a concept row that
 * reads as delivered client work.
 */
function normalize(input: ProjectInput): ProjectInput {
  if (input.status === 'concept') {
    return { ...input, clientName: null, statusLabel: 'Concept Project' };
  }

  return { ...input, statusLabel: input.statusLabel.trim() || 'Delivered' };
}

// --- public ---------------------------------------------------------------

/** Published projects, in the owner's order. */
export async function listPublishedProjects(): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.isPublished, true))
    .orderBy(asc(projects.sortOrder), asc(projects.id));
}

// --- admin ----------------------------------------------------------------

export async function listProjects(): Promise<Project[]> {
  return db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.id));
}

export async function getProject(id: number): Promise<Project | null> {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row ?? null;
}

export async function slugTaken(slug: string, exceptId?: number): Promise<boolean> {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(exceptId ? and(eq(projects.slug, slug), ne(projects.id, exceptId)) : eq(projects.slug, slug))
    .limit(1);

  return Boolean(row);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const [row] = await db.insert(projects).values(normalize(input)).returning();
  return row;
}

export async function updateProject(id: number, input: ProjectInput): Promise<void> {
  await db
    .update(projects)
    .set({ ...normalize(input), updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export async function deleteProject(id: number): Promise<void> {
  await db.delete(projects).where(eq(projects.id, id));
}

export interface ProjectCounts {
  delivered: number;
  concept: number;
}

export async function projectCounts(): Promise<ProjectCounts> {
  const [deliveredRow] = await db
    .select({ n: count() })
    .from(projects)
    .where(eq(projects.status, 'delivered'));

  const [conceptRow] = await db
    .select({ n: count() })
    .from(projects)
    .where(eq(projects.status, 'concept'));

  return { delivered: deliveredRow?.n ?? 0, concept: conceptRow?.n ?? 0 };
}
