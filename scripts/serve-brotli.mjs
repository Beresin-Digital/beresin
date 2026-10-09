// Throwaway static server with Brotli, used only to make the Lighthouse numbers
// representative of production (Caddy/Cloudflare both serve Brotli).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.argv[2];
const PORT = Number(process.argv[3] || 4322);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

const cache = new Map();
const compress = (buf) =>
  zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } });

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(ROOT, p);
    try {
      if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    } catch {}
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('not found');
    }
    const type = TYPES[path.extname(f)] || 'application/octet-stream';
    const compressible = /text|javascript|json|xml|svg/.test(type);
    const wantsBr = /br/.test(req.headers['accept-encoding'] || '');
    // `no-store` keeps the browser from caching between measurements.
    // (Deliberately NOT `no-transform`: that would disable Cloudflare Web
    // Analytics injection in production.)
    const headers = { 'Content-Type': type, 'Cache-Control': 'no-store' };
    if (compressible && wantsBr) {
      headers['Content-Encoding'] = 'br';
      headers['Vary'] = 'Accept-Encoding';
      // Key the compression cache by path *and mtime*. Keying by path alone
      // serves a stale body forever: HTML paths do not change between builds,
      // so after a rebuild the cached page still pointed at the previous CSS
      // hash, which no longer existed — the page rendered unstyled and every
      // layout measurement was silently garbage. Only the hashed asset names
      // change, which is why this hid for so long.
      const key = `${f}:${fs.statSync(f).mtimeMs}`;
      let out = cache.get(key);
      if (!out) {
        out = compress(fs.readFileSync(f));
        cache.set(key, out);
      }
      res.writeHead(200, headers);
      return res.end(out);
    }
    res.writeHead(200, headers);
    res.end(fs.readFileSync(f));
  })
  .listen(PORT, () => console.log(`serving ${ROOT} with brotli on http://localhost:${PORT}`));
