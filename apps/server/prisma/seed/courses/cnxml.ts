/**
 * Reads OpenStax CNXML (the books' source format) into the app's lesson blocks: paragraphs, headings,
 * lists, formulas (MathML turned into readable text), figures, code, worked examples and tips.
 * Teacher-only notes and end-of-section exercise banks are left out.
 */
import { load, type Cheerio, type CheerioAPI } from 'cheerio';
import type { AnyNode, Element } from 'domhandler';

export type Block =
  | { type: 'p' | 'h' | 'formula' | 'tip' | 'warning' | 'code'; text: string }
  | { type: 'note'; title?: string; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; caption?: string; alt?: string };

export type Section = { heading: string; blocks: Block[] };
export type ParsedModule = { title: string; objectives: string[]; sections: Section[]; keyPoints: string[] };
export type Chapter = { title: string; modules: string[] };

// ─── Book outline ─────────────────────────────────────────────────────────────

/** Chapters (with their section modules) and authors. Units that group chapters are flattened. */
export function parseCollection(xml: string): { title: string; authors: string; chapters: Chapter[] } {
  const $ = load(xml, { xml: true });
  const chapters: Chapter[] = [];
  const walk = (node: Cheerio<Element>) => {
    node.children('col\\:content').children('col\\:subcollection').each((_, el) => {
      const sub = $(el);
      const content = sub.children('col\\:content');
      if (content.children('col\\:subcollection').length) walk(sub);
      else
        chapters.push({
          title: clean(sub.children('md\\:title').text()),
          modules: content
            .children('col\\:module')
            .map((__, m) => $(m).attr('document') ?? '')
            .get()
            .filter(Boolean),
        });
    });
  };
  walk($.root().children('col\\:collection'));
  return {
    title: clean($('md\\:title').first().text()),
    authors: clean($('col\\:collection').attr('authors') ?? '').replace(/\s*,\s*/g, ', '),
    chapters,
  };
}

// ─── Text and maths ───────────────────────────────────────────────────────────

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

const SUP: Record<string, string> = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '−': '⁻', n: 'ⁿ', '(': '⁽', ')': '⁾', '=': '⁼', i: 'ⁱ' };
const SUB: Record<string, string> = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '-': '₋', '−': '₋', '(': '₍', ')': '₎', '=': '₌', a: 'ₐ', e: 'ₑ', o: 'ₒ', x: 'ₓ', i: 'ᵢ', n: 'ₙ', m: 'ₘ', t: 'ₜ' };
const script = (s: string, map: Record<string, string>, fallback: string) =>
  [...s].every((c) => map[c]) ? [...s].map((c) => map[c]).join('') : `${fallback}(${s})`;
const wrap = (s: string) => (s.length > 1 && !/^[\w.]+$/.test(s) ? `(${s})` : s);

/** MathML as plain text with Unicode: x², H₂O, (a + b)/2, √x. */
export function mathText($: CheerioAPI, el: AnyNode): string {
  if (el.type === 'text') return (el as unknown as { data: string }).data;
  if (el.type !== 'tag') return '';
  const node = el as Element;
  const name = node.name.replace(/^m:/, '');
  const kids = node.children.filter(
    (c) => c.type === 'tag' || (c.type === 'text' && (c as unknown as { data: string }).data.trim()),
  );
  const t = (i: number) => (kids[i] ? clean(mathText($, kids[i])) : '');
  switch (name) {
    case 'semantics':
      return t(0);
    case 'annotation':
    case 'annotation-xml':
    case 'mphantom':
      return '';
    case 'msup':
      return `${t(0)}${script(t(1), SUP, '^')}`;
    case 'msub':
      return `${t(0)}${script(t(1), SUB, '_')}`;
    case 'msubsup':
      return `${t(0)}${script(t(1), SUB, '_')}${script(t(2), SUP, '^')}`;
    case 'mfrac':
      return `${wrap(t(0))}/${wrap(t(1))}`;
    case 'msqrt':
      return `√${wrap(kids.map((k) => mathText($, k)).join(''))}`;
    case 'mroot':
      return `${script(t(1), SUP, '^')}√${wrap(t(0))}`;
    case 'mover':
      return /^[→⃗]$/.test(t(1)) ? `${t(0)}⃗` : t(1) === '¯' || t(1) === '‾' ? `${t(0)}̄` : t(0);
    case 'munder':
      return t(0);
    case 'munderover':
      return `${t(0)}${t(1) ? `_${wrap(t(1))}` : ''}${t(2) ? `^${wrap(t(2))}` : ''}`;
    case 'mfenced': {
      const open = node.attribs.open ?? '(';
      const close = node.attribs.close ?? ')';
      return `${open}${kids.map((k) => mathText($, k)).join(node.attribs.separators ?? ', ')}${close}`;
    }
    case 'mtable':
      return kids.map((k) => mathText($, k)).join('; ');
    case 'mtr':
    case 'mlabeledtr':
      return kids.map((k) => mathText($, k)).join('  ');
    case 'mspace':
      return ' ';
    case 'mo': {
      const op = $(node).text().trim();
      return /^[=+<>≤≥≈≠×÷→⇌±−]$/.test(op) ? ` ${op} ` : op;
    }
    default:
      return kids.map((k) => mathText($, k)).join('');
  }
}

/** A paragraph's text: terms, emphasis and inline maths kept, cross-references dropped. */
function inlineText($: CheerioAPI, el: AnyNode): string {
  if (el.type === 'text') return (el as unknown as { data: string }).data;
  if (el.type !== 'tag') return '';
  const node = el as Element;
  switch (node.name) {
    case 'm:math':
      return clean(mathText($, node));
    case 'link':
      // "(See Figure 2.1)" style references point at numbering this app doesn't show.
      return node.children.map((c) => inlineText($, c)).join('');
    case 'footnote':
    case 'label':
      return '';
    case 'newline':
      return '\n';
    case 'sup':
      return script(clean($(node).text()), SUP, '^');
    case 'sub':
      return script(clean($(node).text()), SUB, '_');
    default:
      return node.children.map((c) => inlineText($, c)).join('');
  }
}

const textOfNodes = ($: CheerioAPI, nodes: AnyNode[]) =>
  clean(
    nodes
      .map((n) => inlineText($, n))
      .join('')
      // Cross-references ("See Figure 2.1") point at numbering this app doesn't show; drop what's left of them.
      .replace(/\(\s*(see(\s+also)?)?\s*[.,;:]?\s*\)/gi, '')
      .replace(/\s+(and|or)\s*\)/gi, ')'),
  ).replace(/\s+([.,;:])/g, '$1');
const textOf = ($: CheerioAPI, el: AnyNode | undefined) => (el ? textOfNodes($, [el]) : '');

// ─── Blocks ───────────────────────────────────────────────────────────────────

/** Section classes that are exercise banks, glossaries or back matter rather than teaching. */
const SKIP_SECTIONS =
  /\b(multiple-choice|short-answer|extended-response|critical-thinking|practice-problems|problems|concept|check-understanding|review-questions|references|key-equations|section-key-terms|key-terms|exercises|performance-task|test-prep|bring-it-together|chapter-review|section-exercises|free-response|homework|try-it|glossary|lab-overview|summary)\b/;
/** Teacher notes, objectives (shown separately) and notes that point to videos or simulations elsewhere. */
const SKIP_NOTES = /\b(os-teacher|learning-objectives|teacher|snap-lab|virtual-physics|watch-physics|interactive|link-to-learning)\b/;

function isSkipped(el: Element) {
  const cls = el.attribs.class ?? '';
  if (el.name === 'note' && SKIP_NOTES.test(cls)) return true;
  if (el.name === 'section' && (SKIP_SECTIONS.test(cls) || el.attribs.id === 'keyterms')) return true;
  if (el.name === 'exercise') return true;
  return false;
}

const isTag = (n: AnyNode, ...names: string[]): n is Element => n.type === 'tag' && names.includes((n as Element).name);
const codeText = ($: CheerioAPI, el: AnyNode) => $(el).text().replace(/^\n+|\s+$/g, '');

function blocksOf($: CheerioAPI, nodes: AnyNode[], media: (src: string) => string): Block[] {
  const out: Block[] = [];
  for (const n of nodes) {
    if (n.type !== 'tag') continue;
    const el = n as Element;
    if (isSkipped(el)) continue;
    const kids = el.children;
    switch (el.name) {
      case 'title':
      case 'label':
      case 'metadata':
        break;
      case 'para': {
        // A paragraph can hold block code, figures, lists or equations; pull those out in order.
        let run: AnyNode[] = [];
        const flush = () => {
          const text = textOfNodes($, run);
          if (text) out.push({ type: 'p', text });
          run = [];
        };
        for (const k of kids) {
          const blockCode = isTag(k, 'code') && !/inline/.test((k as Element).attribs.class ?? '');
          if (blockCode || isTag(k, 'list', 'figure', 'equation', 'preformat')) {
            flush();
            out.push(...blocksOf($, [k], media));
          } else run.push(k);
        }
        flush();
        break;
      }
      case 'code':
        if (!/inline/.test(el.attribs.class ?? '')) out.push({ type: 'code', text: codeText($, el) });
        break;
      case 'preformat':
        out.push({ type: 'code', text: codeText($, el) });
        break;
      case 'list': {
        const items = $(el)
          .children('item')
          .map((_, it) => textOf($, it))
          .get()
          .filter(Boolean);
        if (items.length) out.push({ type: 'list', items });
        break;
      }
      case 'equation': {
        const math = $(el).find('m\\:math').first();
        const text = math.length ? clean(mathText($, math[0])) : textOf($, el);
        if (text) out.push({ type: 'formula', text });
        break;
      }
      case 'figure':
      case 'subfigure': {
        const subs = $(el).children('subfigure');
        if (subs.length) {
          out.push(...blocksOf($, subs.get(), media));
          const caption = textOf($, $(el).children('caption')[0]);
          if (caption) out.push({ type: 'p', text: caption });
          break;
        }
        const mediaEl = $(el).find('media').first();
        const img = mediaEl
          .find('image')
          .filter((_, i) => !/print/.test($(i).attr('for') ?? ''))
          .first();
        const src = img.attr('src');
        const caption = textOf($, $(el).children('caption')[0]);
        const alt = mediaEl.attr('alt');
        if (src && /\.(jpe?g|png|gif|webp)$/i.test(src))
          out.push({ type: 'image', src: media(src), ...(caption && { caption }), ...(alt && { alt: clean(alt) }) });
        break;
      }
      case 'example': {
        const title = clean($(el).children('title').first().text());
        out.push({ type: 'h', text: title ? `Worked example: ${title}` : 'Worked example' });
        out.push(...blocksOf($, kids, media));
        break;
      }
      case 'problem':
      case 'solution':
      case 'commentary':
      case 'content':
      case 'div':
        out.push(...blocksOf($, kids, media));
        break;
      case 'note': {
        const title = clean($(el).children('title').first().text());
        const body = blocksOf($, kids, media);
        const text = body
          .filter((b): b is Extract<Block, { text: string }> => 'text' in b && b.type !== 'code')
          .map((b) => b.text)
          .join(' ');
        const rest = body.filter((b) => !('text' in b) || b.type === 'code');
        // The book's boxes ("History: Galileo's Ship", "Careers in Biology"…) keep their own title.
        if (text)
          out.push(
            /warning|caution/.test(el.attribs.class ?? '')
              ? { type: 'warning', text: title ? `${title}: ${text}` : text }
              : { type: 'note', ...(title && { title }), text },
          );
        out.push(...rest);
        break;
      }
      case 'table': {
        if (/key-terms|unstyled/.test(el.attribs.class ?? '')) break;
        const rows = $(el)
          .find('row')
          .map((_, r) =>
            $(r)
              .children('entry')
              .map((__, e) => textOf($, e))
              .get()
              .filter(Boolean)
              .join(' | '),
          )
          .get()
          .filter(Boolean);
        if (rows.length) out.push({ type: 'list', items: rows.slice(0, 30) });
        break;
      }
      case 'section': {
        const title = clean($(el).children('title').first().text());
        if (title) out.push({ type: 'h', text: title });
        out.push(...blocksOf($, kids, media));
        break;
      }
      default:
        break;
    }
  }
  return out.filter((b) => !('text' in b) || b.text.trim());
}

/**
 * One section of the book: its title, learning objectives, reading split at its top-level sections,
 * and the summary points (from the section summary, when the book has one).
 */
export function parseModule(xml: string, media: (src: string) => string): ParsedModule {
  const $ = load(xml, { xml: true });
  const doc = $('document');
  const content = doc.children('content');
  const objectives = content
    .find('note[class*="learning-objectives"] item')
    .map((_, it) => textOf($, it))
    .get()
    .filter(Boolean);
  const keyPoints = content
    .find('section[class*="summary"] para, section[class*="summary"] item')
    .map((_, p) => textOf($, p))
    .get()
    .filter((t) => t.length > 20)
    .slice(0, 8);

  // Split the reading at top-level sections; anything before the first one is the opening.
  const sections: Section[] = [];
  const opening: AnyNode[] = [];
  for (const n of content[0]?.children ?? []) {
    if (isTag(n, 'section') && !isSkipped(n)) {
      const title = clean($(n).children('title').first().text());
      const blocks = blocksOf($, n.children, media);
      if (blocks.length) sections.push({ heading: title || 'Section', blocks });
    } else if (!sections.length) opening.push(n);
  }
  const intro = blocksOf($, opening, media);
  if (intro.length) sections.unshift({ heading: 'Introduction', blocks: intro });

  // Some books write objectives as a plain "By the end of this section…" paragraph and list.
  const first = sections[0]?.blocks;
  if (!objectives.length && first?.[0]?.type === 'p' && /^by the end of this section/i.test(first[0].text) && first[1]?.type === 'list') {
    objectives.push(...first[1].items);
    first.splice(0, 2);
    if (!first.length) sections.shift();
  }

  return { title: clean(doc.children('title').text()), objectives, sections, keyPoints };
}
