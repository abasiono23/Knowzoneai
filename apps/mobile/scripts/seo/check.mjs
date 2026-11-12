/**
 * Checks the study pages in dist after a build:
 *
 *   node scripts/seo/check.mjs
 *
 * Every page has one <h1>, a title, a description, its own canonical address and schema.org data that
 * parses; titles are unique; links between study pages lead to pages that exist; the sitemap lists
 * every page; and nothing calls the practice papers past papers. Exits with 1 if anything is wrong.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { ORIGIN, PATHS } from './lib/html.mjs';

const DIST = resolve(import.meta.dirname, '../../dist');
const roots = Object.values(PATHS);

function* pages(dir, path) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) yield* pages(join(dir, e.name), `${path}/${e.name}`);
    else if (e.name === 'index.html') yield { path, file: join(dir, e.name) };
  }
}

const problems = [];
const bad = (path, what) => problems.push(`${path}: ${what}`);
const titles = new Map();
const links = new Map();
const all = new Set();
const types = {};
let count = 0;
let bytes = 0;
let biggest = { size: 0 };
let longTitles = 0;
let longDescriptions = 0;
const unescape = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

for (const root of roots) {
  const dir = join(DIST, root.slice(1));
  if (!existsSync(dir)) {
    bad(root, 'not built');
    continue;
  }
  for (const { path, file } of pages(dir, root)) {
    const html = readFileSync(file, 'utf8');
    const size = statSync(file).size;
    count++;
    bytes += size;
    if (size > biggest.size) biggest = { size, path };
    all.add(path);

    const h1 = html.match(/<h1[\s>]/g)?.length ?? 0;
    if (h1 !== 1) bad(path, `${h1} <h1> elements`);

    const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
    if (!title) bad(path, 'no title');
    else {
      const text = unescape(title);
      if (text.length > 60) longTitles++;
      if (titles.has(text)) bad(path, `same title as ${titles.get(text)}: "${text}"`);
      titles.set(text, path);
    }

    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (!description) bad(path, 'no description');
    else if (unescape(description).length > 155) longDescriptions++;

    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/g) ?? [];
    if (canonical.length !== 1 || !canonical[0].includes(`href="${ORIGIN}${path}"`)) bad(path, `canonical is ${canonical.join(' ') || 'missing'}`);
    if (!html.includes(`<meta property="og:url" content="${ORIGIN}${path}"`)) bad(path, 'og:url is missing or wrong');
    if (!html.includes('/_vercel/insights/script.js')) bad(path, 'no analytics tag');

    const data = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    if (!data.length) bad(path, 'no schema.org data');
    let crumbs = false;
    for (const d of data) {
      try {
        const parsed = JSON.parse(d);
        if (parsed['@type'] === 'BreadcrumbList') crumbs = true;
        else types[parsed['@type']] = (types[parsed['@type']] ?? 0) + 1;
      } catch (e) {
        bad(path, `schema.org data doesn't parse (${e.message})`);
      }
    }
    if (!crumbs) bad(path, 'no BreadcrumbList');
    if (!html.includes('class="kz-crumbs"')) bad(path, 'no visible breadcrumbs');

    // The practice papers are Knowzone's own, never to be called past papers.
    const body = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    if (/past[\s-]+(question|paper)/i.test(`${title} ${description} ${body.replace(/<[^>]+>/g, ' ')}`) && path.startsWith(PATHS.practice)) bad(path, 'says "past questions" or "past papers"');

    for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) if (roots.some((r) => m[1] === r || m[1].startsWith(`${r}/`))) links.set(m[1], path);
  }
}

for (const [to, from] of links) if (!all.has(to)) bad(from, `links to ${to}, which doesn't exist`);

const sitemap = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
const listed = new Set([...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]));
let unlisted = 0;
for (const path of all) if (!listed.has(`${ORIGIN}${path}`)) unlisted++;
if (unlisted) bad('sitemap.xml', `${unlisted} study pages are not listed`);
for (const loc of listed) if (roots.some((r) => loc.startsWith(`${ORIGIN}${r}`)) && !all.has(loc.slice(ORIGIN.length))) bad('sitemap.xml', `lists ${loc}, which doesn't exist`);

console.log(`${count.toLocaleString('en')} study pages, ${(bytes / 1e6).toFixed(1)} MB (largest: ${biggest.path}, ${(biggest.size / 1e3).toFixed(0)} KB; average ${(bytes / count / 1e3).toFixed(1)} KB)`);
console.log(`sitemap.xml: ${listed.size.toLocaleString('en')} addresses`);
console.log(`links between study pages: ${links.size.toLocaleString('en')} different targets`);
console.log(`schema.org types: ${Object.entries(types).map(([t, n]) => `${t} ${n}`).join(', ')} (and a BreadcrumbList on every page)`);
console.log(`titles over 60 characters: ${longTitles}; descriptions over 155: ${longDescriptions}`);
if (problems.length) {
  console.error(`\n${problems.length} problems:`);
  for (const p of problems.slice(0, 60)) console.error(`  ${p}`);
  process.exit(1);
}
console.log('All checks passed.');
