/**
 * Mock study-material generator for frontend-first development.
 * Topics come from the tutor knowledge base; pasted text gets real (simple) extraction:
 * "X is Y" sentences become concepts, signal sentences become key points, and
 * concepts become flashcards and quiz questions.
 */
import i18n from '@/i18n';

import { generateAnswer } from '../tutor/brain';
import type { Block, TutorAnswer } from '../tutor/types';
import type { Concept, Difficulty, GenerateOptions, KeyPoint, MindMapNode, Question, StudyContent } from './types';

const BRANCH_COLORS = ['#9B82FF', '#2DD4BF', '#FFC857', '#FF7A93', '#4CC9FF', '#FF9F43'];
let seq = 0;
const nid = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

const shuffle = <T>(xs: T[], seed: number) =>
  xs
    .map((x, i) => ({ x, k: Math.sin(seed * 31 + i * 17) }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.x);

function sentencesOf(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 400);
}

const SIGNALS =
  /\b(important|key|must|always|never|because|therefore|so that|main|essential|remember|causes?|results? in)\b/i;
const DEFINITION =
  /^(?:(?:An?|The)\s+)?([A-Za-z][A-Za-z0-9’'()\- ]{1,48}?)\s+(?:is|are|refers to|means|is called|is defined as)\s+(.{8,220}?)[.!?]?$/;
/** Sentence openers that look like "X is Y" but aren't definitions ("It is…", "Every cell is…"). */
const NOT_A_TERM =
  /^(it|this|that|these|those|there|they|he|she|we|you|every|each|all|some|many|most|one|which|what)\b/i;

function conceptsFrom(sentences: string[]): Concept[] {
  const seen = new Set<string>();
  const out: Concept[] = [];
  for (const s of sentences) {
    const m = s.match(DEFINITION);
    if (!m) continue;
    const raw = m[1].trim();
    if (NOT_A_TERM.test(raw) || raw.split(' ').length > 5) continue;
    const term = raw.charAt(0).toUpperCase() + raw.slice(1);
    if (seen.has(term.toLowerCase())) continue;
    seen.add(term.toLowerCase());
    out.push({ term, definition: m[2].charAt(0).toUpperCase() + m[2].slice(1) });
  }
  return out;
}

function questionsFromConcepts(concepts: Concept[], difficulty: Difficulty): Question[] {
  const level: Question['difficulty'] =
    difficulty === 'Beginner' ? 'easy' : difficulty === 'Advanced' ? 'hard' : 'medium';
  return concepts.slice(0, 10).flatMap((c, i) => {
    const distractors = concepts.filter((x) => x.term !== c.term).map((x) => x.definition);
    const mcq: Question[] =
      distractors.length >= 2
        ? (() => {
            const options = shuffle([c.definition, ...distractors.slice(0, 3)], i + 1);
            return [
              {
                id: nid('q'),
                type: 'mcq',
                question: `Which best describes “${c.term}”?`,
                options,
                correctIndex: options.indexOf(c.definition),
                explanation: `${c.term}: ${c.definition}.`,
                concept: c.term,
                difficulty: level,
              },
            ];
          })()
        : [];
    // True/false: alternate a correct statement with one that swaps in another definition.
    const swap = distractors[i % Math.max(1, distractors.length)];
    const isTrue = i % 2 === 0 || !swap;
    const tf: Question = {
      id: nid('q'),
      type: 'tf',
      question: `True or false: ${c.term} — ${isTrue ? c.definition : swap}`,
      options: ['True', 'False'],
      correctIndex: isTrue ? 0 : 1,
      explanation: `${c.term} means: ${c.definition}.`,
      concept: c.term,
      difficulty: 'easy',
    };
    return [...mcq, tf];
  });
}

function mindMapFrom(center: string, notes: StudyContent['notes'], concepts: Concept[]): StudyContent['mindMap'] {
  const branches: MindMapNode[] = notes.slice(0, 4).map((n, i) => ({
    label: n.heading,
    color: BRANCH_COLORS[i % BRANCH_COLORS.length],
    children: n.blocks
      .flatMap((b) => (b.type === 'list' ? b.items : 'text' in b ? [b.text] : []))
      .map((t) => (t.length > 46 ? `${t.slice(0, 44)}…` : t))
      .slice(0, 3),
  }));
  if (concepts.length) {
    branches.push({ label: 'Key terms', color: BRANCH_COLORS[4], children: concepts.slice(0, 4).map((c) => c.term) });
  }
  return { center, branches: branches.slice(0, 6) };
}

/** Converts a tutor answer (topic mode) into a full study pack. */
function fromAnswer(a: TutorAnswer, title: string, difficulty: Difficulty): StudyContent {
  const notes: StudyContent['notes'] = [];
  let current: { heading: string; blocks: Block[] } = { heading: 'Overview', blocks: [] };
  for (const b of a.body) {
    if (b.type === 'h') {
      if (current.blocks.length) notes.push(current);
      current = { heading: b.text, blocks: [] };
    } else current.blocks.push(b);
  }
  if (current.blocks.length) notes.push(current);
  if (a.examples.length) {
    notes.push({
      heading: 'Worked examples',
      blocks: a.examples.map((e) => ({ type: 'p' as const, text: `${e.title}: ${e.scenario} ${e.explanation}` })),
    });
  }
  if (a.commonMistakes.length)
    notes.push({ heading: 'Common mistakes', blocks: [{ type: 'list', items: a.commonMistakes }] });

  const concepts: Concept[] = a.keyTerms.map((k) => ({ term: k.term, definition: k.meaning }));
  const keyPoints: KeyPoint[] = [
    ...a.body.flatMap((b): KeyPoint[] =>
      b.type === 'list'
        ? b.items.map((t) => ({ text: t, importance: 'medium' }))
        : b.type === 'tip' || b.type === 'formula'
          ? [{ text: b.text, importance: 'high' }]
          : [],
    ),
    ...a.commonMistakes.map((t) => ({ text: `Avoid: ${t}`, importance: 'high' as const })),
  ];
  const quiz: Question[] = [
    ...a.quiz.map((q) => ({
      ...q,
      id: nid('q'),
      type: 'mcq' as const,
      concept: concepts[0]?.term ?? title,
      difficulty: 'medium' as const,
    })),
    ...questionsFromConcepts(concepts, difficulty),
  ];
  const flashcards = [
    ...a.flashcards,
    ...concepts.map((c) => ({ front: `What is meant by “${c.term}”?`, back: c.definition })),
  ].map((c) => ({ ...c, id: nid('c') }));

  return {
    summary: {
      tldr: a.summary,
      overview: a.body
        .filter((b) => b.type === 'p')
        .map((b) => ('text' in b ? b.text : ''))
        .slice(0, 2),
    },
    notes,
    concepts,
    keyPoints,
    flashcards,
    quiz,
    mindMap: mindMapFrom(title, notes, concepts),
    readingMinutes: Math.max(2, Math.round(notes.reduce((n, s) => n + JSON.stringify(s).length, 0) / 1200)),
  };
}

/** Builds a study pack from pasted text. */
function fromText(text: string, title: string, opts: GenerateOptions): StudyContent {
  const sentences = sentencesOf(text);
  const concepts = conceptsFrom(sentences);
  const signal = sentences.filter((s) => SIGNALS.test(s));
  const longest = [...sentences].sort((a, b) => b.length - a.length);
  const keyPoints: KeyPoint[] = [...new Set([...signal, ...longest])]
    .slice(0, opts.depth === 'Quick' ? 4 : opts.depth === 'Deep' ? 10 : 7)
    .map((t) => ({ text: t, importance: signal.includes(t) ? 'high' : 'medium' }));

  const perSection = opts.depth === 'Quick' ? 5 : 4;
  const notes: StudyContent['notes'] = [];
  for (let i = 0; i < sentences.length && notes.length < 6; i += perSection) {
    const chunk = sentences.slice(i, i + perSection);
    // Name the section after the first concept it mentions that no earlier section used.
    // Headings must be unique: they key the sections and the mind-map branches.
    const named = concepts.find(
      (c) =>
        !notes.some((n) => n.heading === c.term) &&
        chunk.some((s) => ` ${s.toLowerCase()} `.includes(` ${c.term.toLowerCase()} `)),
    );
    notes.push({
      heading: named ? named.term : notes.length === 0 ? 'Introduction' : `Part ${notes.length + 1}`,
      blocks: [
        { type: 'p', text: chunk[0] },
        ...(chunk.length > 1 ? [{ type: 'list' as const, items: chunk.slice(1) }] : []),
      ],
    });
  }

  // Cloze cards from key points top up the definition cards.
  const cloze = keyPoints.slice(0, 6).flatMap((k) => {
    const words = k.text.split(' ').filter((w) => w.replace(/\W/g, '').length > 6);
    const hide = words[Math.floor(words.length / 2)];
    return hide ? [{ front: k.text.replace(hide, '_____'), back: hide.replace(/[^\w’'-]/g, '') }] : [];
  });
  const flashcards = [
    ...concepts.map((c) => ({ front: `What is meant by “${c.term}”?`, back: c.definition })),
    ...cloze,
  ].map((c) => ({ ...c, id: nid('c') }));
  const quiz = questionsFromConcepts(concepts, opts.difficulty);
  const tldr = sentences[0] ?? text.slice(0, 200);

  return {
    summary: { tldr, overview: sentences.slice(1, 3) },
    notes,
    concepts,
    keyPoints,
    flashcards,
    quiz,
    mindMap: mindMapFrom(title, notes, concepts),
    readingMinutes: Math.max(1, Math.round(text.split(/\s+/).length / 200)),
  };
}

const titleCase = (s: string) =>
  s
    .replace(/[_-]+/g, ' ')
    .replace(/\.\w+$/, '')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

export function suggestTitle(input: { text?: string; topic?: string; fileName?: string; title?: string }) {
  if (input.title?.trim()) return input.title.trim();
  if (input.topic?.trim()) return titleCase(input.topic.trim());
  if (input.fileName) return titleCase(input.fileName);
  // The first line, or failing that the first sentence, if it's short enough to be a title.
  const text = input.text?.trim() ?? '';
  for (const candidate of [text.split('\n')[0], text.split(/(?<=[.!?])\s/)[0]]) {
    const c = (candidate ?? '').trim().replace(/[.:]$/, '');
    if (c.length > 3 && c.length <= 60) return c;
  }
  return i18n.t('study:shared.untitled');
}

export function generate(
  input: { type: string; text?: string; topic?: string; fileName?: string; title: string },
  opts: GenerateOptions,
): { content: StudyContent; subject: string } {
  const level = opts.difficulty === 'Advanced' ? 'advanced' : 'beginner';
  const textHasEnough = (input.text ?? '').split(/\s+/).length > 80;

  if (input.type === 'text' && textHasEnough) {
    // If the text is about a topic we know well, enrich it with the knowledge base.
    const kb = generateAnswer({ question: input.text!.slice(0, 400), mode: 'explain', level });
    const content = fromText(input.text!, input.title, opts);
    if (kb.subject !== 'General') {
      const rich = fromAnswer(kb, input.title, opts.difficulty);
      content.concepts = [...content.concepts, ...rich.concepts].slice(0, 12);
      content.flashcards = [...content.flashcards, ...rich.flashcards];
      content.quiz = [...content.quiz, ...rich.quiz];
      content.mindMap = mindMapFrom(input.title, content.notes, content.concepts);
    }
    return { content, subject: kb.subject !== 'General' ? kb.subject : detectSubject(`${input.title} ${input.text}`) };
  }

  const topic = input.topic || input.title || input.fileName || 'this topic';
  const answer = generateAnswer({ question: topic, mode: 'explain', level });
  return {
    content: fromAnswer(answer, input.title, opts.difficulty),
    subject: answer.subject !== 'General' ? answer.subject : detectSubject(`${topic} ${input.title}`),
  };
}

/** Keyword scores per subject, so pasted notes and file names land in the right subject and folder. */
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  Biology: [
    'cell',
    'organism',
    'nucleus',
    'mitochondria',
    'photosynthesis',
    'enzyme',
    'dna',
    'gene',
    'osmosis',
    'diffusion',
    'ecosystem',
    'organ',
    'tissue',
    'respiration',
    'biology',
  ],
  Chemistry: [
    'atom',
    'molecule',
    'mole',
    'reaction',
    'acid',
    'base',
    'bond',
    'electrolysis',
    'compound',
    'element',
    'chemistry',
    'ion',
  ],
  Physics: [
    'force',
    'motion',
    'energy',
    'velocity',
    'acceleration',
    'wave',
    'electricity',
    'current',
    'voltage',
    'newton',
    'physics',
  ],
  Mathematics: [
    'equation',
    'algebra',
    'geometry',
    'triangle',
    'quadratic',
    'function',
    'calculus',
    'probability',
    'statistics',
    'maths',
    'mathematics',
  ],
  Economics: ['demand', 'supply', 'market', 'price', 'inflation', 'gdp', 'economy', 'economics', 'trade'],
  Government: ['constitution', 'government', 'democracy', 'legislature', 'election', 'federalism'],
  History: ['empire', 'colonial', 'independence', 'war', 'history', 'century'],
  'English Language': ['essay', 'grammar', 'comprehension', 'vocabulary', 'summary writing', 'english'],
  'Computer Science': ['algorithm', 'program', 'python', 'code', 'computer', 'software', 'data structure'],
};

function detectSubject(text: string) {
  const t = ` ${text.toLowerCase()} `;
  let best = { subject: 'General', score: 0 };
  for (const [subject, words] of Object.entries(SUBJECT_KEYWORDS)) {
    const score = words.reduce((n, w) => n + (t.split(new RegExp(`\\b${w}`, 'g')).length - 1), 0);
    if (score > best.score) best = { subject, score };
  }
  return best.subject;
}

/** Accepts YouTube links; other platforms need the backend's permitted-transcript pipeline. */
/** `reason` is an error id: show it with t(`errors.${reason}`) in the `study` namespace. */
export function checkVideoUrl(url: string): { ok: true; id: string } | { ok: false; reason: 'notLink' | 'notYoutube' } {
  const u = url.trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { ok: true, id: yt[1] };
  if (!/^https?:\/\//i.test(u)) return { ok: false, reason: 'notLink' };
  return { ok: false, reason: 'notYoutube' };
}
