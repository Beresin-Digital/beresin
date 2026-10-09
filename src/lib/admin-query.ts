import { LEAD_STATUSES, type LeadStatus } from '../db/schema';
import type { LeadFilters } from './leads';

export interface LeadQuery extends LeadFilters {
  page: number;
}

const isLeadStatus = (value: string | null): value is LeadStatus =>
  value !== null && (LEAD_STATUSES as readonly string[]).includes(value);

/**
 * Parses the inbox query string. The list and the CSV export both go through
 * here, so an export can never disagree with the list it was launched from.
 *
 * Every value is validated rather than trusted: `status` must be one of the
 * four known values, `q` is length-capped, and `page` is coerced to a positive
 * integer. Anything else is ignored.
 */
export function parseLeadQuery(url: URL): LeadQuery {
  const statusParam = url.searchParams.get('status');

  return {
    status: isLeadStatus(statusParam) ? statusParam : null,
    q: url.searchParams.get('q')?.slice(0, 100) || null,
    page: Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1),
  };
}

/** Rebuilds the current filters as a query string, for pagination links. */
export function queryString(query: LeadQuery, overrides: Partial<LeadQuery> = {}): string {
  const merged = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (merged.status) params.set('status', merged.status);
  if (merged.q) params.set('q', merged.q);
  if (merged.page && merged.page > 1) params.set('page', String(merged.page));

  const value = params.toString();
  return value ? `?${value}` : '';
}
