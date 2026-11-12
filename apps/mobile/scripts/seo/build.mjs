/**
 * The public study pages of app.knowzoneai.com: thousands of pages search engines can read, written
 * from Knowzone's data in apps/server/data.
 *
 *   /practice-questions   JAMB, WAEC and NECO practice questions by exam, subject, topic and paper
 *   /study-notes          summaries of school subjects and university courses, topic by topic
 *   /textbooks            books by university course, by country and subject, and one page per book
 *   /course-guides        what you study in each university course, and what to read
 *
 * scripts/web-site.mjs calls studyPages() while it builds the site (see vercel.json's buildCommand)
 * and lists the pages in sitemap.xml. To rebuild only these pages into a dist that already has the
 * site:
 *
 *   node scripts/seo/build.mjs
 *
 * Plain Node (20 or newer), no packages. The pages are static HTML and read without any script.
 * `node scripts/seo/check.mjs` checks the result; `node scripts/seo/serve.mjs` serves dist the way
 * vercel.json does.
 */
import { Buffer } from 'node:buffer';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

import { EXAMS, EXAM_SUBJECTS, loadBooks, loadCourses, loadLibraries, loadPapers } from './lib/data.mjs';
import { PATHS, setChrome } from './lib/html.mjs';
import { notesFor } from './lib/match.mjs';
import { bookIndex, bookPages } from './pages/books.mjs';
import { coursePages } from './pages/courses.mjs';
import { learnPages } from './pages/learn.mjs';
import { practicePages } from './pages/practice.mjs';

const MOBILE = resolve(import.meta.dirname, '../..');
const WEBAPP = resolve(MOBILE, '../webapp');

/**
 * The first part of every address the web app answers ("books" for /books/…, "home", "login" …):
 * the screens in src/app, with the folders in brackets left out as the router does.
 */
function appRoutes(dir = join(MOBILE, 'src/app')) {
  const names = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name.startsWith('+')) continue;
    if (e.isDirectory() && e.name.startsWith('(')) names.push(...appRoutes(join(dir, e.name)));
    else names.push(e.name.replace(/\.[jt]sx?$/, ''));
  }
  return names;
}

/**
 * The site's bar and footer. site.js writes them in the browser; running its first lines here gives
 * the same HTML to put in the page, so links are there for search engines and without scripts.
 */
function siteChrome(siteJs) {
  const top = { innerHTML: '' };
  const foot = { innerHTML: '' };
  const context = {
    document: { documentElement: { classList: { add() {} } }, getElementById: (id) => ({ top, foot })[id] ?? null },
    location: { pathname: '/' },
    matchMedia: () => ({ matches: true }),
    Date,
  };
  try {
    vm.runInNewContext(siteJs, context);
  } catch {
    // Expected: after the bar and footer, site.js goes on to things only a browser has.
  }
  if (!top.innerHTML.includes('class="links"') || !foot.innerHTML.includes('class="foot"')) throw new Error('seo: site.js no longer writes the bar and footer the way build.mjs expects');
  for (const p of [PATHS.practice, PATHS.learn, PATHS.books])
    if (!top.innerHTML.includes(`href="${p}"`)) throw new Error(`seo: the site's bar has no link to ${p} (see LINKS in apps/webapp/site.js)`);
  return { header: top.innerHTML.trim(), footer: foot.innerHTML.trim() };
}

/**
 * Writes the pages into `dist` (which already holds the app and the site) and returns their
 * addresses for the sitemap: [{ path, lastmod? }].
 */
export function studyPages({ dist, analytics }) {
  const started = Date.now();

  // None of these names may also be a screen of the app or a page of the site: the page would hide it.
  const taken = new Set([...appRoutes(), ...readdirSync(WEBAPP).map((f) => f.replace(/\.html$/, '')), 'site', 'assets', '_expo', 'app', 'index']);
  for (const p of Object.values(PATHS)) {
    const name = p.slice(1);
    if (taken.has(name)) throw new Error(`seo: ${p} is already an address of the app or the site. Choose another name in lib/html.mjs.`);
    rmSync(join(dist, name), { recursive: true, force: true });
    if (existsSync(join(dist, `${name}.html`))) throw new Error(`seo: dist already has ${name}.html`);
  }

  setChrome({ ...siteChrome(readFileSync(join(dist, 'site', 'site.js'), 'utf8')), analytics });
  copyFileSync(join(WEBAPP, 'pages.css'), join(dist, 'site', 'pages.css'));

  const groups = loadPapers();
  const libraries = loadLibraries();
  const bookData = loadBooks();
  const courses = loadCourses();
  const index = bookIndex(bookData);

  // Courses with something to show: books, or a summary.
  courses.all = [...new Set([...courses.faculties.flatMap((f) => f.courses), ...index.courseIds, ...libraries.filter((l) => l.course).map((l) => l.course)])].filter(
    (id) => index.courseBooks(id).length || libraries.some((l) => l.course === id),
  );
  courses.has = (id) => courses.all.includes(id);
  const unnamed = courses.all.filter((id) => !courses.named(id));
  if (unnamed.length) console.warn(`seo: courses the app has no name for (shown by id): ${unnamed.join(', ')}`);

  // Exam topics and summaries, paired both ways.
  const practiceLinks = new Map();
  for (const g of groups) {
    const library = libraries.find((l) => l.id === g.subject);
    if (!library) continue;
    for (const t of g.topics)
      for (const note of notesFor(library, t.name)) {
        const key = `${library.id}/${note.id}`;
        if (!practiceLinks.has(key)) practiceLinks.set(key, []);
        practiceLinks.get(key).push({ href: `${PATHS.practice}/${g.exam}/${g.subject}/${t.id}`, name: `${EXAMS[g.exam].name} ${EXAM_SUBJECTS[g.subject]}: ${t.name}` });
      }
  }
  const practiceFor = (library, topic) => (practiceLinks.get(`${library.id}/${topic}`) ?? []).slice(0, 9);

  const kinds = {
    practice: practicePages({ groups, libraries, notesFor, books: index }),
    learn: learnPages({ libraries, groups, practiceFor, books: index, courses }),
    books: bookPages({ index, courses, libraries, groups }),
    courses: coursePages({ index, courses, libraries }),
  };

  const type = (kind, path) => {
    const parts = path.split('/').slice(2);
    if (!parts.length) return `${kind}: hub`;
    if (kind === 'practice') return ['practice: exam', 'practice: subject', /^paper-\d+$/.test(parts[2] ?? '') ? 'practice: paper' : 'practice: topic'][parts.length - 1];
    if (kind === 'learn') return parts.length === 1 ? 'learn: subject or course' : 'learn: topic';
    if (kind === 'courses') return 'courses: course guide';
    if (parts[0] === 'course') return 'books: course list';
    if (index.country(parts[0])) return parts.length === 1 ? 'books: country' : 'books: country subject';
    return 'books: book';
  };

  const seen = new Set();
  const counts = {};
  let bytes = 0;
  const listed = [];
  for (const [kind, pages] of Object.entries(kinds))
    for (const p of pages) {
      if (!/^(\/[a-z0-9]+(-[a-z0-9]+)*)+$/.test(p.path)) throw new Error(`seo: bad page address ${p.path}`);
      if (seen.has(p.path)) throw new Error(`seo: two pages share the address ${p.path}`);
      seen.add(p.path);
      // "/study-notes/biology" is the file study-notes/biology/index.html, which the host serves at that address.
      const dir = join(dist, p.path.slice(1));
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), p.html);
      bytes += Buffer.byteLength(p.html);
      counts[type(kind, p.path)] = (counts[type(kind, p.path)] ?? 0) + 1;
      // Book pages change when the book lists do; the other data files carry no date.
      listed.push(kind === 'books' ? { path: p.path, lastmod: bookData.updated } : { path: p.path });
    }

  console.log(`seo: ${listed.length.toLocaleString('en')} study pages, ${(bytes / 1e6).toFixed(1)} MB, in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  for (const [name, n] of Object.entries(counts).sort()) console.log(`  ${name.padEnd(28)} ${String(n).padStart(6)}`);
  console.log(`  (${bookData.entries.toLocaleString('en')} book entries in the lists are ${bookData.books.length.toLocaleString('en')} different books)`);
  return listed;
}

// Run on its own: rebuild the pages in a dist that already has the site. The sitemap is web-site.mjs's.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const dist = resolve(MOBILE, 'dist');
  if (!existsSync(join(dist, 'site', 'site.js'))) throw new Error('Build the site first: npx expo export --platform web && node scripts/web-site.mjs');
  studyPages({ dist, analytics: '<script defer src="/_vercel/insights/script.js"></script>' });
  console.log('seo: sitemap.xml was left as it is; scripts/web-site.mjs writes it');
}
