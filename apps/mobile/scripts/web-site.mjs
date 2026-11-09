// Runs after `expo export --platform web` (see vercel.json). Puts the public website around the web app:
// the homepage, features, pricing, about, blog and FAQ pages (from apps/webapp) at clean addresses, and
// moves the app's own page to app.html, which vercel.json serves for every other address.
//
//   /             the homepage (signed-in visitors go straight to /home)
//   /features …   the other site pages
//   /login, /sign-up, /home, /tutor …   the app
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, '../../webapp');
const DIST = resolve(here, '../dist');
if (!existsSync(join(DIST, 'index.html'))) throw new Error('Run expo export --platform web first');
if (existsSync(join(DIST, 'app.html'))) throw new Error('dist already has the site; export again first');

// The app's page becomes app.html, so the homepage can be index.html.
renameSync(join(DIST, 'index.html'), join(DIST, 'app.html'));

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

const pages = readdirSync(SITE).filter((f) => f.endsWith('.html') && !['dashboard.html', 'signup.html'].includes(f));
for (const page of pages) {
  let html = relink(readFileSync(join(SITE, page), 'utf8'));
  if (page === 'index.html') html = html.replace('</head>', `${SIGNED_IN}</head>`);
  writeFileSync(join(DIST, page), html);
}
writeFileSync(join(DIST, 'site', 'site.js'), relink(readFileSync(join(DIST, 'site', 'site.js'), 'utf8')));
console.log(`site: ${pages.length} pages around the app (${pages.join(', ')})`);
