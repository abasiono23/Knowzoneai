/**
 * Builds explainer-video scenes from lessons and generated study content.
 * Mirrors the "template-based narrated explainer" approach in the PRD: illustrated
 * scenes, text overlays and narration rather than fully AI-generated footage.
 */
import { getSubject, type Lesson } from '../catalog';
import type { StudyContent } from '../studio/types';
import { LENGTHS } from './options';
import type { LengthId, Scene } from './types';

let n = 0;
const sid = () => `s${Date.now().toString(36)}${(n++).toString(36)}`;

/** Narration pace ≈ 150 words a minute, with a minimum on-screen time. */
const secondsFor = (caption: string) => Math.max(4, Math.round(caption.split(/\s+/).length / 2.4));

const scene = (s: Omit<Scene, 'id' | 'seconds'>): Scene => ({
  ...s,
  id: sid(),
  seconds: secondsFor(s.caption),
});

const firstSentence = (t: string) => t.split(/(?<=[.!?])\s/)[0];

export function scenesFromLesson(lesson: Lesson): Scene[] {
  const emoji = getSubject(lesson.subjectId)?.emoji ?? '📘';
  const [p1, , p3] = lesson.keyPoints;
  return [
    scene({
      kind: 'title',
      heading: lesson.title,
      body: getSubject(lesson.subjectId)?.name,
      emoji,
      caption: `Let’s learn ${lesson.title.toLowerCase()}, in under a minute.`,
    }),
    scene({
      kind: 'concept',
      heading: 'The big idea',
      body: lesson.summary,
      emoji: '💡',
      caption: lesson.summary,
    }),
    scene({
      kind: 'list',
      heading: 'Remember these',
      bullets: lesson.keyPoints,
      emoji: '📝',
      caption: `Three things to remember. ${lesson.keyPoints.join('. ')}.`,
    }),
    ...(p1
      ? [
          scene({
            kind: 'check',
            heading: 'Quick check',
            emoji: '❓',
            caption: `Quick check. True or false: ${p1}`,
            check: {
              question: `True or false: ${p1}`,
              options: ['True', 'False'],
              correctIndex: 0,
            },
          }),
        ]
      : []),
    scene({
      kind: 'recap',
      heading: 'Recap',
      body: p3 ?? p1,
      emoji: '🏁',
      caption: `To recap: ${firstSentence(lesson.summary)} Great work!`,
    }),
  ];
}

/** Picks as many scenes as the chosen length allows, from the richest parts of the content. */
export function scenesFromContent(title: string, c: StudyContent, length: LengthId): Scene[] {
  const target = LENGTHS.find((l) => l.id === length)?.scenes ?? 7;
  const pool: Scene[] = [];

  pool.push(
    scene({
      kind: 'concept',
      heading: 'In one sentence',
      body: c.summary.tldr,
      emoji: '💡',
      caption: c.summary.tldr,
    }),
  );
  c.concepts.forEach((k) =>
    pool.push(
      scene({
        kind: 'concept',
        heading: k.term,
        body: k.definition,
        emoji: '📌',
        caption: `${k.term}: ${k.definition}.`,
      }),
    ),
  );
  c.notes.forEach((s) => {
    s.blocks.forEach((b) => {
      if (b.type === 'formula')
        pool.push(
          scene({
            kind: 'formula',
            heading: s.heading,
            body: b.text,
            emoji: '🧮',
            caption: `Here’s the key formula. ${b.text}`,
          }),
        );
      else if (b.type === 'list' && b.items.length > 1)
        pool.push(
          scene({
            kind: 'list',
            heading: s.heading,
            bullets: b.items.slice(0, 4),
            emoji: '📝',
            caption: b.items.slice(0, 4).join('. '),
          }),
        );
      else if (b.type === 'p' && b.text.length > 40) {
        const isExample =
          /example|imagine|think of|for instance|e\.g\./i.test(b.text) || s.heading.toLowerCase().includes('example');
        pool.push(
          scene({
            kind: isExample ? 'example' : 'concept',
            heading: isExample ? 'For example' : s.heading,
            body: b.text,
            emoji: isExample ? '🌍' : '📖',
            caption: b.text,
          }),
        );
      }
    });
  });
  const q = c.quiz.find((x) => x.type === 'mcq' && x.options.length <= 4);
  const check = q
    ? scene({
        kind: 'check',
        heading: 'Quick check',
        emoji: '❓',
        caption: `Quick check. ${q.question}`,
        check: {
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
        },
      })
    : null;
  const highs = c.keyPoints.filter((k) => k.importance === 'high').map((k) => k.text);

  const body = pool.slice(0, Math.max(1, target - (check ? 3 : 2)));
  return [
    scene({
      kind: 'title',
      heading: title,
      emoji: '🎬',
      caption: `Welcome! In this video: ${title}.`,
    }),
    ...body,
    ...(check ? [check] : []),
    scene({
      kind: 'recap',
      heading: 'Recap',
      bullets: (highs.length ? highs : c.keyPoints.map((k) => k.text)).slice(0, 3),
      emoji: '🏁',
      caption: `Let’s recap. ${(highs.length ? highs : c.keyPoints.map((k) => k.text)).slice(0, 2).join(' ')} Nice work!`,
    }),
  ];
}
