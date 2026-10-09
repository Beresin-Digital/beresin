/**
 * CSV export of the inbox.
 *
 * A route rather than an Action, because an Action returns a serialised value
 * and cannot set `Content-Disposition`. It reads the same query string as the
 * list (via `parseLeadQuery`), so an export can never disagree with the list it
 * was launched from — but it deliberately ignores pagination and applies the
 * `EXPORT_LIMIT` cap instead.
 */
import type { APIRoute } from 'astro';
import { parseLeadQuery } from '../../../lib/admin-query';
import { toCsv } from '../../../lib/csv';
import { formatWibStamp } from '../../../lib/datetime';
import { exportLeads } from '../../../lib/leads';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  // The middleware already guards /admin, but a mutation-adjacent route
  // re-checks rather than trusting that it will always be reached through it.
  if (!locals.admin) {
    return new Response('Unauthorized', { status: 401 });
  }

  const query = parseLeadQuery(url);
  const rows = await exportLeads(query);

  const csv = toCsv([
    [
      'Waktu (WIB)',
      'Nama',
      'Telepon',
      'Email',
      'Sumber',
      'Halaman',
      'Status',
      'Pesan',
      'Catatan',
      'ip_hash',
    ],
    ...rows.map((lead) => [
      formatWibStamp(lead.createdAt),
      lead.name,
      lead.phone,
      lead.email ?? '',
      lead.source,
      lead.pageUrl,
      lead.status,
      lead.message,
      lead.note ?? '',
      lead.ipHash ?? '',
    ]),
  ]);

  const day = formatWibStamp(new Date()).slice(0, 10);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${day}.csv"`,
      // The middleware sets `private, no-store` too; stated here so the route
      // is correct even if it is ever mounted outside /admin.
      'Cache-Control': 'no-store',
    },
  });
};
