/**
 * Serves dist on this computer the way the host does with vercel.json, to look at the built site:
 *
 *   node scripts/seo/serve.mjs [port]      (default 4173)
 *
 * In the host's order: a file that exists is served first (a folder by its index.html); otherwise the
 * first rewrite in vercel.json whose source matches decides; otherwise 404. So this shows which
 * addresses reach the study pages, the site pages and the app.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const MOBILE = resolve(import.meta.dirname, '../..');
const DIST = join(MOBILE, 'dist');
const { rewrites } = JSON.parse(readFileSync(join(MOBILE, 'vercel.json'), 'utf8'));
const rules = rewrites.map((r) => ({ source: new RegExp(`^${r.source}$`), destination: r.destination }));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };

/** The file for an address, if one exists: the file itself, or a folder's index.html. */
function file(path) {
  const full = normalize(join(DIST, decodeURIComponent(path)));
  if (!full.startsWith(DIST) || !existsSync(full)) return null;
  if (statSync(full).isFile()) return full;
  const index = join(full, 'index.html');
  return existsSync(index) ? index : null;
}

/** Which file answers an address, and why. */
export function route(path) {
  const direct = file(path);
  if (direct) return { file: direct, via: 'file' };
  for (const rule of rules) {
    const m = rule.source.exec(path);
    if (!m) continue;
    const to = file(rule.destination.replace(/\$(\d)/g, (_, n) => m[n] ?? ''));
    return to ? { file: to, via: `rewrite to ${rule.destination}` } : { file: null, via: `rewrite to ${rule.destination}, which doesn't exist` };
  }
  return { file: null, via: 'nothing matches' };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const port = Number(process.argv[2]) || 4173;
  createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    const found = route(path);
    if (!found.file) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('404: not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(found.file)] ?? 'application/octet-stream' }).end(readFileSync(found.file));
  }).listen(port, () => console.log(`dist at http://localhost:${port}`));
}
