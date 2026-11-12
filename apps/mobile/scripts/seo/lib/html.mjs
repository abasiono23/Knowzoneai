/**
 * Shared pieces for the public study pages: addresses, escaping, titles and descriptions,
 * schema.org data, and the page shell (the public site's bar and footer around the content).
 */
export const ORIGIN = 'https://app.knowzoneai.com';
/** The language these pages are written in. Other languages can later be built under /<lang>/…. */
export const LANG = 'en';

/**
 * Where each kind of page lives. The web app is served from the same domain, and its screens already
 * use /books, /courses, /exams and /learn, so these names are different on purpose; the build stops
 * if one of them is ever also a screen of the app (see build.mjs).
 */
export const PATHS = {
  practice: '/practice-questions',
  learn: '/study-notes',
  books: '/textbooks',
  courses: '/course-guides',
};

/** Screens of the app that these pages send people to (same domain). */
export const APP = {
  signUp: '/sign-up',
  exams: '/exams',
  examSubject: (exam, subject) => `/exams/${exam}/${subject}`,
  paper: (id) => `/exams/paper/${id}`,
  books: '/books',
  summary: (library, topic = 'overview') => `/books/summary/${library}/${topic}`,
  textbook: '/tutor/textbook',
};

// ─── Text ─────────────────────────────────────────────────────────────────────

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Only http(s) addresses from the data become links. */
export const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\/[^\s"<>]+$/i.test(u) ? u : null);

/** Lowercase kebab-case from any text ("Newton’s laws and momentum" → "newtons-laws-and-momentum"). */
export const slug = (s) =>
  String(s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Cut at a word, with an ellipsis, so it fits in `max` characters. */
export function clip(s, max) {
  const text = String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.–-]+$/, '')}…`;
}

/** Text from the data with line breaks: blank lines make paragraphs, single ones make lines. */
export const paragraphs = (s) =>
  String(s ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.split('\n').map(esc).join('<br />')}</p>`)
    .join('');

export const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;
export const list = (items) => (items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);

const titles = new Set();
/**
 * The first candidate that fits in 60 characters and no other page has used. Candidates go from the
 * fullest wording to the shortest; if none fits, the shortest is cut.
 */
export function pageTitle(...candidates) {
  const all = candidates.filter(Boolean);
  const free = all.filter((c) => !titles.has(c.toLowerCase()));
  let title = free.find((c) => c.length <= 60) ?? clip(free.at(-1) ?? all.at(-1), 60);
  for (let n = 2; titles.has(title.toLowerCase()); n++) title = `${clip(free.at(-1) ?? all.at(-1), 56)} (${n})`;
  titles.add(title.toLowerCase());
  return title;
}

// ─── schema.org ───────────────────────────────────────────────────────────────

export const ORG = { '@type': 'Organization', '@id': `${ORIGIN}/#organization`, name: 'Knowzone AI', url: `${ORIGIN}/` };

// "<" is written as an escape so nothing in the data can end the script element.
const ld = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

const breadcrumbLd = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${ORIGIN}${c.path}` })),
});

// ─── The page shell ───────────────────────────────────────────────────────────

let chrome = null;
/** The site's bar and footer (made by site.js in the browser; build.mjs runs it once to get them) and the analytics tag. */
export function setChrome(c) {
  chrome = c;
}

export const crumbsHtml = (crumbs) =>
  `<nav class="kz-crumbs" aria-label="Breadcrumb"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${esc(c.path)}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;

/**
 * A whole page.
 * path: "/practice-questions/jamb/biology" · section: which bar link is current (a PATHS value) ·
 * crumbs: [{ name, path }] ending with this page · eyebrow, h1 and intro are plain text · body is
 * HTML · cta: the closing band { title, text, href, label, alt? } · jsonLd: schema.org objects.
 */
export function page(o) {
  const url = `${ORIGIN}${o.path}`;
  const title = esc(o.title);
  const description = esc(clip(o.description, 155));
  const image = safeUrl(o.image) ?? `${ORIGIN}/site/assets/logo.png`;
  const data = [breadcrumbLd(o.crumbs), ...(o.jsonLd ?? [])].map(ld).join('\n    ');
  const header = o.section ? chrome.header.replace(`href="${o.section}"`, `href="${o.section}" aria-current="page"`) : chrome.header;
  return `<!doctype html>
<html lang="${LANG}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#2a1290" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:type" content="${o.ogType ?? 'article'}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="Knowzone" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" type="image/png" sizes="32x32" href="/site/assets/favicon-32.png" />
    <link rel="apple-touch-icon" href="/site/assets/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/site/site.css" />
    <link rel="stylesheet" href="/site/pages.css" />
    ${data}
    ${chrome.analytics}
  </head>
  <body>
    <!-- Made by apps/mobile/scripts/seo/build.mjs from Knowzone's own data. Edit the data or the build, not this file. -->
    <header class="top" id="top">${header}</header>
    <section class="stage page-head kz-head">
      <div class="blob a"></div><div class="blob b"></div>
      <div class="wrap">
        ${crumbsHtml(o.crumbs)}
        ${o.eyebrow ? `<span class="kz-eyebrow">${esc(o.eyebrow)}</span>` : ''}
        <h1>${esc(o.h1)}</h1>
        ${o.intro ? `<p>${esc(o.intro)}</p>` : ''}
      </div>
    </section>
    <main class="kz-main">
      <div class="wrap kz-body${o.wide ? ' kz-wide' : ''}">
${o.body}
      </div>
    </main>
    <section class="stage end kz-end">
      <div class="blob a"></div><div class="blob b"></div>
      <div class="wrap">
        <h2>${esc(o.cta.title)}</h2>
        <p>${esc(o.cta.text)}</p>
        <a class="btn light" href="${esc(o.cta.href)}">${esc(o.cta.label)} →</a>
        ${
          o.cta.alt === false
            ? ''
            : // After signing up, the app opens the page the button points to (src/lib/return-to.ts).
              `<a class="kz-end-alt" href="${esc(o.cta.href.startsWith('/') ? `${APP.signUp}?next=${encodeURIComponent(o.cta.href)}` : APP.signUp)}">New here? Sign up free</a>`
        }
      </div>
    </section>
    <footer id="foot">${chrome.footer}</footer>
    <script src="/site/site.js" defer></script>
  </body>
</html>
`;
}

// ─── Blocks used by several page types ────────────────────────────────────────

/** A grid of link tiles: [{ href, title, text?, tag? }]. */
export const tiles = (items) =>
  `<ul class="kz-tiles">${items
    .map((t) => `<li><a class="kz-tile" href="${esc(t.href)}"><b>${esc(t.title)}</b>${t.text ? `<span>${esc(t.text)}</span>` : ''}${t.tag ? `<em>${esc(t.tag)}</em>` : ''}</a></li>`)
    .join('')}</ul>`;

/** A row of small links: [{ href, name }]. */
export const chips = (items) => `<ul class="kz-chips">${items.map((c) => `<li><a href="${esc(c.href)}">${esc(c.name)}</a></li>`).join('')}</ul>`;

export const section = (heading, html, id) => `        <section class="kz-section"${id ? ` id="${id}"` : ''}>
          <h2>${esc(heading)}</h2>
          ${html}
        </section>`;
