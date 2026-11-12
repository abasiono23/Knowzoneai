// Runs after `expo export --platform web` (see vercel.json). Puts the public website around the web app:
// the homepage, features, pricing, about, blog and FAQ pages (from apps/webapp) at clean addresses, and
// moves the app's own page to app.html, which vercel.json serves for every other address.
//
//   /             the homepage (signed-in visitors go straight to /home)
//   /features …   the other site pages
//   /login, /sign-up, /home, /tutor …   the app
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, '../../webapp');
const DIST = resolve(here, '../dist');
if (!existsSync(join(DIST, 'index.html'))) throw new Error('Run expo export --platform web first');
if (existsSync(join(DIST, 'app.html'))) throw new Error('dist already has the site; export again first');

// iPhones before iOS 16.4 can't parse a regex lookbehind ("(?<=…)" or "(?<!…)"): one anywhere in the
// app's code stops the whole web app loading on them. Use src/lib/sentences.ts or rewrite the pattern.
const JS = join(DIST, '_expo', 'static', 'js', 'web');
for (const f of readdirSync(JS).filter((n) => n.endsWith('.js'))) {
  const hit = /\/\(\?<[=!]/.exec(readFileSync(join(JS, f), 'utf8'));
  if (hit) throw new Error(`${f} has a regex lookbehind, which breaks the web app on older iPhones`);
}

// The app's page becomes app.html, so the homepage can be index.html. It gets a loading screen that
// shows at once, in the student's language: the app is a large download, and on a phone on mobile data
// the page would otherwise stay blank white until it arrives. The app removes it once it's ready.
const LOADING = {
  en: 'Loading Knowzone…',
  pcm: 'Knowzone dey load…',
  yo: 'Knowzone ń ṣí…',
  ig: 'Knowzone na-ebudata…',
  ha: 'Ana buɗe Knowzone…',
  fr: 'Chargement de Knowzone…',
  ar: 'جارٍ تحميل Knowzone…',
  sw: 'Knowzone inapakia…',
  pt: 'A carregar o Knowzone…',
  es: 'Cargando Knowzone…',
};
const BOOT = `<div id="kz-boot" role="status" style="position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:linear-gradient(160deg,#160a4d,#2a1290 55%,#5a2fe0);font:600 16px/1.4 Manrope,system-ui,sans-serif;color:#e9e3ff;transition:opacity .35s">
<img src="/site/assets/logo.png" alt="" width="84" height="84" style="border-radius:22px;box-shadow:0 20px 50px -14px rgba(0,0,0,.6)">
<div style="width:36px;height:36px;border-radius:50%;border:3px solid rgba(255,255,255,.22);border-top-color:#fff;animation:kzspin .9s linear infinite"></div>
<div id="kz-boot-text">Loading Knowzone…</div>
<style>@keyframes kzspin{to{transform:rotate(360deg)}}</style>
<script>try{var l=(localStorage.getItem('knowzone.language')||navigator.language||'en').split('-')[0],t=${JSON.stringify(LOADING)};document.getElementById('kz-boot-text').textContent=t[l]||t.en;if(l==='ar')document.getElementById('kz-boot').dir='rtl'}catch(e){}</script>
</div>`;
const app = readFileSync(join(DIST, 'index.html'), 'utf8');
if (!app.includes('<div id="root"></div>'))
  throw new Error('The app page has changed: put the loading screen in by hand');
writeFileSync(join(DIST, 'app.html'), app.replace('<div id="root"></div>', `${BOOT}<div id="root"></div>`));
rmSync(join(DIST, 'index.html'));

// The site's own files live under /site/, apart from the app's /assets/.
mkdirSync(join(DIST, 'site'), { recursive: true });
for (const f of ['site.css', 'site.js', 'config.js']) copyFileSync(join(SITE, f), join(DIST, 'site', f));
cpSync(join(SITE, 'assets'), join(DIST, 'site', 'assets'), { recursive: true });

/** Links and file paths for the deployed site: clean addresses, and the real app's sign-in. */
function relink(text) {
  return text
    .replace(/(["'`(])assets\//g, '$1/site/assets/')
    .replace(/(["'])(site\.css|site\.js|config\.js)\1/g, '$1/site/$2$1')
    .replace(/signup\.html\?mode=login/g, '/login')
    .replace(/signup\.html/g, '/sign-up')
    .replace(/dashboard\.html/g, '/home')
    .replace(/(["'`])index\.html/g, '$1/')
    .replace(/\$\{id\}\.html/g, '/${id}')
    .replace(/(["'`])([a-z0-9-]+)\.html/g, '$1/$2');
}

/** Visitors who are already signed in skip the homepage, as in a chat app. */
const SIGNED_IN = `<script>try{for(var k in localStorage)if(/^sb-.*-auth-token$/.test(k)&&localStorage.getItem(k)){location.replace('/home');break}}catch(e){}</script>`;

// ─── Search engines and visit counts ──────────────────────────────────────────

const ORIGIN = 'https://app.knowzoneai.com';
/** Visit counts (Vercel Web Analytics): no cookies, nothing that identifies anyone. Follows the app's page changes too. */
const ANALYTICS = '<script defer src="/_vercel/insights/script.js"></script>';
const address = (page) => (page === 'index.html' ? '/' : `/${page.replace(/\.html$/, '')}`);

const pages = readdirSync(SITE).filter((f) => f.endsWith('.html') && !['dashboard.html', 'signup.html'].includes(f));
// post.html shows whichever blog post its address names, so it has no single address to give search engines.
const listed = pages.filter((p) => p !== 'post.html');
for (const page of pages) {
  let html = relink(readFileSync(join(SITE, page), 'utf8'));
  if (page === 'index.html') html = html.replace('</head>', `${SIGNED_IN}</head>`);
  const canonical = listed.includes(page) && !html.includes('rel="canonical"') ? `<link rel="canonical" href="${ORIGIN}${address(page)}">` : '';
  html = html.replace('</head>', `${canonical}${ANALYTICS}</head>`);
  writeFileSync(join(DIST, page), html);
}
writeFileSync(join(DIST, 'app.html'), readFileSync(join(DIST, 'app.html'), 'utf8').replace('</head>', `${ANALYTICS}</head>`));

// The site pages are for search engines; the app's own pages (sign-in, home, tutor …) are for signed-in students.
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed
    .map((p) => `  <url><loc>${ORIGIN}${address(p)}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
writeFileSync(join(DIST, 'site', 'site.js'), relink(readFileSync(join(DIST, 'site', 'site.js'), 'utf8')));
console.log(`site: ${pages.length} pages around the app (${pages.join(', ')})`);
