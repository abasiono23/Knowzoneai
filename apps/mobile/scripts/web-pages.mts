/**
 * Builds website pages that come from the app:
 * - Terms of Service and Privacy (apps/web/terms.html, privacy.html) from the app's own English legal
 *   texts (help → legal.docs), so the site and the app always say the same thing. The privacy page
 *   adds the waitlist notice at the end.
 * - share.html, the page behind the links the app shares (certificates, videos, notes, invites);
 *   web/share.js fills it in.
 * All use the home page's header and footer. Run after changing the legal texts or the site's header:
 *
 *   npm run web:pages
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import * as helpModule from '../src/i18n/locales/en/help.ts';

type Section = { title: string; body?: string[]; bullets?: string[] };
type Doc = { title: string; summary: string[]; sections: Record<string, Section> };

const root = resolve(import.meta.dirname, '..');
const web = resolve(root, '../web');
// The locale file is a default export; depending on the loader it may arrive wrapped once more.
type Help = { legal: { docs: Record<string, Doc> } };
const unwrap = (m: unknown): Help => ((m as Help).legal ? (m as Help) : unwrap((m as { default: unknown }).default));
const docs = unwrap(helpModule).legal.docs;

// The numbers and dates the app fills in, read from the same files the app uses.
const plans = readFileSync(resolve(root, 'src/lib/billing/plans.ts'), 'utf8');
const legal = readFileSync(resolve(root, 'src/lib/legal/documents.ts'), 'utf8');
const VALUES: Record<string, string> = { tutorFree: plans.match(/TUTOR_DAILY[^=]*=\s*\{\s*FREE:\s*(\d+)/)![1]! };
const dateText = (args: string) => {
  const [y, m, d] = args.split(',').map(Number);
  return new Date(y!, m!, d!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};
const UPDATED = legal.match(/const UPDATED = new Date\(([\d, ]+)\)/)![1]!;
/** When a text last changed: its own date in LEGAL_DOCS, or the shared one. */
const updated = (id: string) => {
  const own = legal.match(new RegExp(`\\n  ${id}: \\{[^}]*?updated: new Date\\(([\\d, ]+)\\)`));
  return dateText(own?.[1] ?? UPDATED);
};
const DRAFT = /export const LEGAL_DRAFT = true/.test(legal);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fill = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k: string) => VALUES[k] ?? '');
/** In-app wording that needs a web equivalent. */
const forWeb = (s: string) =>
  s.replace(
    'Reach us through Help → Contact support in the app.',
    'Reach us through Help → Contact support in the app, or email <a href="mailto:info@knowzoneai.com">info@knowzoneai.com</a>.',
  );
const text = (s: string) => forWeb(esc(fill(s)));

function body(doc: Doc) {
  const summary = `<div class="legal-summary"><h2>In short</h2><ul>${doc.summary.map((s) => `<li>${text(s)}</li>`).join('')}</ul></div>`;
  const sections = Object.values(doc.sections)
    .map(
      (s) =>
        `<h2>${text(s.title)}</h2>` +
        (s.body ?? []).map((p) => `<p>${text(p)}</p>`).join('') +
        (s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${text(b)}</li>`).join('')}</ul>` : ''),
    )
    .join('\n          ');
  return `${summary}\n          ${sections}`;
}

function page(o: { path: string; title: string; description: string; eyebrow: string; heading: string; intro: string; content: string }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${o.title}</title>
    <meta name="description" content="${o.description}" />
    <meta name="theme-color" content="#7c5cff" />
    <meta property="og:title" content="${o.title}" />
    <meta property="og:description" content="${o.description}" />
    <meta property="og:image" content="https://knowzoneai.com/assets/icon-512.png" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://knowzoneai.com${o.path}" />
    <link rel="canonical" href="https://knowzoneai.com${o.path}" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <!-- Made by apps/mobile/scripts/web-pages.mts from the app's legal texts. Edit those, not this file. -->
    <div class="progress" aria-hidden="true"></div>
${HEADER}
    <main>
      <section class="page-hero" style="padding-bottom: 40px">
        <div class="blob b1"></div>
        <img class="book-bg" src="/assets/book-bg.webp" alt="" aria-hidden="true" />
        <div class="wrap inner">
          <span class="eyebrow fade-in">${o.eyebrow}</span>
          <h1 class="fade-in d1">${o.heading}</h1>
          <p class="fade-in d2">${o.intro}</p>
        </div>
      </section>
      <section class="section" style="padding-top: 20px">
        <div class="prose reveal">
          ${DRAFT ? '<p class="legal-draft">This text is a draft. It is being reviewed by a lawyer before Knowzone launches, and may change.</p>' : ''}
          ${o.content}
          <p class="small">Last updated: ${updated(o.path.slice(1))}.</p>
        </div>
      </section>
    </main>
${FOOTER}
    <script src="/config.js"></script>
    <script src="/main.js" defer></script>
  </body>
</html>
`;
}

// The site's header and footer, taken from the home page so they stay the same everywhere.
const home = readFileSync(resolve(web, 'index.html'), 'utf8');
const absolute = (html: string) =>
  html
    .replace(/href="#/g, 'href="/#')
    .replace(/(href|src)="(?!https?:|mailto:|#|\/)([^"]*)"/g, '$1="/$2"')
    .replace(/href="\/index\.html(#[^"]*)?"/g, (_, hash: string | undefined) => `href="/${hash ?? ''}"`)
    .replace(/href="\/(about|waitlist|privacy|terms)\.html"/g, 'href="/$1"');
const HEADER = absolute(home.slice(home.indexOf('    <header class="nav">'), home.indexOf('</header>') + '</header>'.length));
const FOOTER = absolute(home.slice(home.indexOf('    <footer>'), home.indexOf('</footer>') + '</footer>'.length));

const WAITLIST = `<h2>Joining the waitlist</h2>
          <p>When you join the waitlist on this website we collect your name and email address; whether you’re a student, parent, teacher or school, what you’re preparing for and your country, if you tell us; and where you heard about us, if you came from a shared link.</p>
          <p>We use them only to tell you when Knowzone launches, send you launch news, and understand who is waiting so we build the right things first. We don’t sell them or share them with advertisers, and we keep them until Knowzone launches and we’ve invited you in, or until you ask us to remove you. They are stored in Knowzone’s database (hosted by Supabase).</p>
          <p>Every email we send explains how to leave the list. You can also reply to any of them, or email <a href="mailto:info@knowzoneai.com">info@knowzoneai.com</a>, and we’ll delete your details.</p>`;

writeFileSync(
  resolve(web, 'terms.html'),
  page({
    path: '/terms',
    title: 'Terms of Service · Knowzone',
    description: 'The terms for using Knowzone, the AI study app: your account, your content, AI features, plans and refunds.',
    eyebrow: 'Legal',
    heading: docs.terms!.title,
    intro: 'The agreement between you and Knowzone when you use the app. The summary comes first; the full terms follow.',
    content: body(docs.terms!),
  }),
);
writeFileSync(
  resolve(web, 'privacy.html'),
  page({
    path: '/privacy',
    title: 'Privacy Policy · Knowzone',
    description: 'How Knowzone collects, uses and protects your information, in the app and on the waitlist.',
    eyebrow: 'Privacy',
    heading: docs.privacy!.title,
    intro: 'What we collect, why, and the choices you have. The summary comes first; the full policy follows.',
    content: `${body(docs.privacy!)}\n          ${WAITLIST}`,
  }),
);
// The page behind shared links: /verify/<certificate>, /v/<video>, /m/<notes>, /invite/<code>.
writeFileSync(
  resolve(web, 'share.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Knowzone</title>
    <meta name="description" content="Shared from Knowzone, the AI study app: certificates, videos, study notes and invites." />
    <meta name="robots" content="noindex" />
    <meta name="theme-color" content="#7c5cff" />
    <meta property="og:title" content="Shared from Knowzone" />
    <meta property="og:description" content="Knowzone is the AI study app for exams and beyond. Open the link to see what was shared." />
    <meta property="og:image" content="https://knowzoneai.com/assets/icon-512.png" />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <!-- Made by apps/mobile/scripts/web-pages.mts. The content comes from share.js. -->
    <div class="progress" aria-hidden="true"></div>
${HEADER}
    <main>
      <section class="page-hero share-hero">
        <div class="blob b1"></div>
        <img class="book-bg" src="/assets/book-bg.webp" alt="" aria-hidden="true" />
        <div class="wrap inner">
          <span class="eyebrow fade-in" id="share-eyebrow">Knowzone</span>
          <h1 class="fade-in d1" id="share-title">Opening…</h1>
          <p class="fade-in d2" id="share-intro"></p>
        </div>
      </section>
      <section class="section share-section">
        <div class="wrap">
          <div id="share-body" class="share-body" aria-live="polite"><p class="share-wait">Loading…</p></div>
        </div>
      </section>
    </main>
${FOOTER}
    <script src="/config.js"></script>
    <script src="/main.js" defer></script>
    <script src="/share.js" defer></script>
  </body>
</html>
`,
);
console.log('Wrote apps/web/terms.html, privacy.html and share.html');
