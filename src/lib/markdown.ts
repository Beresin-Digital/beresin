import { marked } from 'marked';

/**
 * Renders an article body (Markdown) to HTML.
 *
 * Two guards, because the output is injected into public pages:
 *
 *  1. Raw HTML is neutralised before parsing — `<` becomes `&lt;`. `marked`
 *     ships no sanitiser (it was removed upstream), so this is what stops a body
 *     from smuggling a `<script>` or an `<img onerror>` into the page. Only `<`
 *     is escaped, not `>`: a bare `>` is harmless and escaping it would break
 *     Markdown blockquotes.
 *
 *  2. Dangerous link/image schemes are stripped from the rendered output. A
 *     `[click](javascript:…)` link would otherwise survive parsing intact.
 *
 * The author is the trusted site owner, so this is defence in depth rather than
 * the primary control — but the content lands on the public site, and "trusted
 * author" is not a reason to ship an XSS.
 */
export function renderMarkdown(source: string): string {
  const escaped = source.replace(/</g, '&lt;');

  const html = marked.parse(escaped, {
    async: false,
    gfm: true,
    breaks: false,
  }) as string;

  return html.replace(/(href|src)="(?:javascript|data|vbscript):[^"]*"/gi, '$1="#"');
}
