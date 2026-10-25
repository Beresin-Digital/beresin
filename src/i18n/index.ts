/**
 * Locale helpers and the per-locale dictionaries.
 *
 * Indonesian is the default locale and has no URL prefix: `/about` is the
 * Indonesian page. English lives under `/en/...`. The helpers below are the
 * single place that knows this mapping, so components never hand-roll it.
 */
import { id } from "./id";
import { en } from "./en";
import type { Dict } from "./types";

export type Locale = "id" | "en";

export const locales: Locale[] = ["id", "en"];
export const defaultLocale: Locale = "id";

export const dicts: Record<Locale, Dict> = { id, en };

export type { Dict };

/** Locale for a URL path: `/en` or `/en/*` is English, everything else Indonesian. */
export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "id";
}

/** Strip a trailing slash, except for the root. */
export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

/** The same page in the given locale: `/about` <-> `/en/about`, `/` <-> `/en`. */
export function localizePath(pathname: string, locale: Locale): string {
  const path = normalizePath(pathname);
  const idPath = path === "/en" ? "/" : path.startsWith("/en/") ? path.slice(3) : path;
  if (locale === "id") return idPath;
  return idPath === "/" ? "/en" : `/en${idPath}`;
}

/**
 * Language-switcher target for a page.
 *
 * Article detail pages have per-locale slugs with no translation-pair data,
 * so the switcher falls back to the other locale article index instead of
 * guessing a slug that does not exist.
 */
export function switchPath(pathname: string): string {
  const path = normalizePath(pathname);
  const locale = localeFromPath(path);
  const other: Locale = locale === "id" ? "en" : "id";
  if (/^\/(en\/)?articles\/[^/]+$/.test(path)) {
    return other === "id" ? "/articles" : "/en/articles";
  }
  return localizePath(path, other);
}
