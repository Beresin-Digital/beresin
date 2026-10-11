import type { APIRoute } from 'astro';
import { regencies, searchRecords } from '../../../../lib/directory/data';
export const prerender = true;
export function getStaticPaths() { return regencies.map(regency => ({ params: { provinsi: regency.provinceSlug, kabupaten: regency.slug } })); }
export const GET: APIRoute = ({ params }) => new Response(JSON.stringify(searchRecords(params.provinsi, params.kabupaten)), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
