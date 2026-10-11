import type { APIRoute } from 'astro';
import { searchRecords } from '../../lib/directory/data';
export const prerender = true;
export const GET: APIRoute = () => new Response(JSON.stringify(searchRecords()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
