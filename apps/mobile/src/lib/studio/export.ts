import i18n, { formatDate } from '@/i18n';
import type en from '@/i18n/locales/en/study';

import { subjectLabel } from '../tutor/format';
import { blockText, type Block } from '../tutor/types';
import type { Material, StudyContent } from './types';

export type ExportPart = 'summary' | 'notes' | 'concepts' | 'points' | 'flashcards' | 'quiz';

/** Headings and labels inside the exported file, in the current language (called at export time). */
type DocKey = keyof typeof en.export.doc;
const L = (key: DocKey, opts: Record<string, string> = {}): string =>
  i18n.t(`study:export.doc.${key}` as 'study:export.doc.meta', opts as { subject: string; date: string });
const UP = (key: DocKey) => L(key).toLocaleUpperCase();

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function blocksText(blocks: Block[]) {
  return blocks.map((b) => (b.type === 'list' ? b.items.map((i) => `• ${i}`).join('\n') : blockText(b))).join('\n');
}

function blocksHtml(blocks: Block[]) {
  return blocks
    .map((b) => {
      if (b.type === 'list') return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
      if (b.type === 'h') return `<h3>${esc(b.text)}</h3>`;
      if (b.type === 'formula') return `<p class="formula">${esc(b.text)}</p>`;
      if (b.type === 'tip' || b.type === 'warning' || b.type === 'note') return `<p class="tip">${esc(blockText(b))}</p>`;
      if (b.type === 'code') return `<pre>${esc(b.text)}</pre>`;
      if (b.type === 'image') return b.caption ? `<p><em>${esc(b.caption)}</em></p>` : '';
      return `<p>${esc(b.text)}</p>`;
    })
    .join('');
}

export function toText(m: Material & { content: StudyContent }, parts: ExportPart[]) {
  const c = m.content;
  const out: string[] = [m.title.toUpperCase(), L('madeWith', { subject: subjectLabel(m.subject) }), ''];
  if (parts.includes('summary')) out.push(UP('summary'), c.summary.tldr, ...c.summary.overview, '');
  if (parts.includes('notes')) c.notes.forEach((n) => out.push(n.heading.toUpperCase(), blocksText(n.blocks), ''));
  if (parts.includes('concepts')) out.push(UP('concepts'), ...c.concepts.map((k) => `${k.term}: ${k.definition}`), '');
  if (parts.includes('points'))
    out.push(UP('points'), ...c.keyPoints.map((p) => `${p.importance === 'high' ? '★' : '•'} ${p.text}`), '');
  if (parts.includes('flashcards'))
    out.push(
      UP('flashcards'),
      ...c.flashcards.map(
        (f, i) => `${i + 1}. ${L('question', { text: f.front })}\n   ${L('answer', { text: f.back })}`,
      ),
      '',
    );
  if (parts.includes('quiz'))
    out.push(
      UP('quiz'),
      ...c.quiz.map(
        (q, i) =>
          `${i + 1}. ${q.question}\n${q.options.map((o, j) => `   ${String.fromCharCode(65 + j)}. ${o}`).join('\n')}`,
      ),
      '',
    );
  if (parts.includes('quiz'))
    out.push(UP('answers'), ...c.quiz.map((q, i) => `${i + 1}. ${String.fromCharCode(65 + q.correctIndex)}`));
  return out.join('\n').trim();
}

export function toHtml(m: Material & { content: StudyContent }, parts: ExportPart[]) {
  const c = m.content;
  const sections: string[] = [];
  if (parts.includes('summary'))
    sections.push(
      `<section class="summary"><h2>${esc(L('summary'))}</h2><p><strong>${esc(c.summary.tldr)}</strong></p>${c.summary.overview.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`,
    );
  if (parts.includes('notes'))
    sections.push(
      `<section><h2>${esc(L('notes'))}</h2>${c.notes.map((n) => `<h3>${esc(n.heading)}</h3>${blocksHtml(n.blocks)}`).join('')}</section>`,
    );
  if (parts.includes('concepts'))
    sections.push(
      `<section><h2>${esc(L('concepts'))}</h2><dl>${c.concepts.map((k) => `<dt>${esc(k.term)}</dt><dd>${esc(k.definition)}</dd>`).join('')}</dl></section>`,
    );
  if (parts.includes('points'))
    sections.push(
      `<section><h2>${esc(L('points'))}</h2><ul>${c.keyPoints.map((p) => `<li>${p.importance === 'high' ? '<strong>★ </strong>' : ''}${esc(p.text)}</li>`).join('')}</ul></section>`,
    );
  if (parts.includes('flashcards'))
    sections.push(
      `<section><h2>${esc(L('flashcards'))}</h2><table>${c.flashcards.map((f) => `<tr><td>${esc(f.front)}</td><td>${esc(f.back)}</td></tr>`).join('')}</table></section>`,
    );
  if (parts.includes('quiz'))
    sections.push(
      `<section><h2>${esc(L('quiz'))}</h2><ol>${c.quiz.map((q) => `<li>${esc(q.question)}<ol type="A">${q.options.map((o) => `<li>${esc(o)}</li>`).join('')}</ol></li>`).join('')}</ol><p class="answers">${esc(L('answersLine', { list: c.quiz.map((q, i) => `${i + 1}${String.fromCharCode(65 + q.correctIndex)}`).join(' · ') }))}</p></section>`,
    );
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(m.title)}</title><style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#141833;margin:40px;line-height:1.55}
header{border-bottom:4px solid #7C5CFF;padding-bottom:12px;margin-bottom:24px}
h1{margin:0;font-size:28px}.meta{color:#6E76A8;font-size:13px}
h2{color:#6A45FF;font-size:20px;margin-top:28px}h3{font-size:16px;margin-bottom:4px}
.summary{background:#F2EFFF;border-radius:12px;padding:4px 16px}.formula{font-weight:700;text-align:center;background:#F5F6FB;padding:8px;border-radius:8px}
.tip{background:#E8FBF8;padding:8px;border-radius:8px}dt{font-weight:700;margin-top:8px}dd{margin:0 0 4px 0}
table{border-collapse:collapse;width:100%}td{border:1px solid #DDE0F0;padding:8px;vertical-align:top;width:50%}.answers{color:#6E76A8;font-size:13px}
footer{margin-top:40px;color:#6E76A8;font-size:12px;text-align:center}
</style></head><body><header><h1>${esc(m.title)}</h1><div class="meta">${esc(L('meta', { subject: subjectLabel(m.subject), date: formatDate(Date.now(), {}) }))}</div></header>${sections.join('')}<footer>${esc(L('footer'))}</footer></body></html>`;
}
