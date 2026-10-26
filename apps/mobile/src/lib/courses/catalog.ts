import i18n from '../../i18n';
import { getLesson, getSubject } from '../catalog';
import type { Question } from '../studio/types';
import type { Block } from '../tutor/types';
import { scenesFromLesson } from '../videos/scenes';
import type { Scene } from '../videos/types';
import { COURSES } from './content';
import { INSTRUCTORS } from './instructors';
import {
  allLessons,
  PASS_MARK,
  type Course,
  type CourseLesson,
  type Instructor,
  type Interaction,
  type Module,
  type Resource,
} from './types';

export { COURSES };

/**
 * Replaces the course list in place with the server's (real mode). The exported arrays stay the
 * same objects, so screens keep calling getCourse(), COURSES and getInstructor() as before.
 */
export function applyCourses(courses: Course[], instructors: Instructor[]) {
  COURSES.splice(0, COURSES.length, ...courses);
  INSTRUCTORS.splice(0, INSTRUCTORS.length, ...instructors);
}

export const getCourse = (id: string) => COURSES.find((c) => c.id === id);
export const categoryOf = (c: Course) => getSubject(c.subjectId)?.category ?? 'other';
export const coursesInCategory = (categoryId: string) => COURSES.filter((c) => categoryOf(c) === categoryId);
export const coursesBy = (instructorId: string) => COURSES.filter((c) => c.instructorId === instructorId);

export function searchCourses(query: string, from = COURSES) {
  const q = query.trim().toLowerCase();
  if (!q) return from;
  return from.filter((c) =>
    [c.title, c.subtitle, getSubject(c.subjectId)?.name ?? '', ...c.tags, ...allLessons(c).map((l) => l.title)]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}

/** Same category first, then shared tags or exams; never the course itself. */
export function relatedCourses(c: Course, limit = 6) {
  const score = (o: Course) =>
    (categoryOf(o) === categoryOf(c) ? 3 : 0) +
    o.tags.filter((t) => c.tags.includes(t)).length +
    (o.exams ?? []).filter((e) => c.exams?.includes(e)).length * 0.5 +
    o.rating / 10;
  return COURSES.filter((o) => o.id !== c.id)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

export type LessonRef = {
  course: Course;
  module: Module;
  moduleIndex: number;
  lesson: CourseLesson;
  /** Position in the whole course, from 0. */
  index: number;
  prev?: CourseLesson;
  next?: CourseLesson;
};

export function findLesson(courseId: string, lessonId: string): LessonRef | undefined {
  const course = getCourse(courseId);
  if (!course) return undefined;
  const flat = allLessons(course);
  const index = flat.findIndex((l) => l.id === lessonId);
  if (index < 0) return undefined;
  const moduleIndex = course.modules.findIndex((m) => m.lessons.some((l) => l.id === lessonId));
  return {
    course,
    module: course.modules[moduleIndex],
    moduleIndex,
    lesson: flat[index],
    index,
    prev: flat[index - 1],
    next: flat[index + 1],
  };
}

// ─── Content, authored or derived from the linked catalogue lesson ────────────
// Lesson text stays as authored; only the interface wording the app adds around it is translated.

export function readingFor(l: CourseLesson): { heading: string; blocks: Block[] }[] {
  if (l.content?.reading) return l.content.reading;
  const src = l.catalogId ? getLesson(l.catalogId) : undefined;
  if (!src) return [{ heading: l.title, blocks: [{ type: 'p', text: l.summary }] }];
  const sections: { heading: string; blocks: Block[] }[] = [
    { heading: i18n.t('courses:generated.bigIdea'), blocks: [{ type: 'p', text: src.summary }] },
    {
      heading: i18n.t('courses:generated.needToKnow'),
      blocks: [
        { type: 'list', items: src.keyPoints },
        { type: 'p', text: i18n.t('courses:generated.teachIt') },
      ],
    },
  ];
  if (src.exams?.length)
    sections.push({
      heading: i18n.t('courses:generated.inExam'),
      blocks: [
        {
          type: 'tip',
          text: i18n.t('courses:generated.examTip', { topic: src.topic, exams: src.exams.join(', ') }),
        },
      ],
    });
  return sections;
}

export function keyPointsFor(l: CourseLesson): string[] {
  if (l.content?.keyPoints) return l.content.keyPoints;
  const src = l.catalogId ? getLesson(l.catalogId) : undefined;
  if (src) return src.keyPoints;
  if (l.content?.quiz)
    return [...new Set(l.content.quiz.map((q) => q.concept))].map((c) =>
      i18n.t('courses:generated.revise', { topics: c }),
    );
  if (l.content?.interactive) return l.content.interactive.map(interactionTitle);
  return [l.summary];
}

export function objectivesFor(l: CourseLesson): string[] {
  if (l.content?.objectives) return l.content.objectives;
  if (l.kind === 'quiz')
    return [
      i18n.t('courses:generated.quizObjectives.remember'),
      i18n.t('courses:generated.quizObjectives.revise'),
      i18n.t('courses:generated.quizObjectives.pass', { pass: Math.round(PASS_MARK * 100) }),
    ];
  if (l.kind === 'interactive')
    return [
      i18n.t('courses:generated.interactiveObjectives.practise'),
      i18n.t('courses:generated.interactiveObjectives.feedback'),
    ];
  return keyPointsFor(l).map((k) =>
    i18n.t('courses:generated.understand', { point: `${k.charAt(0).toLowerCase()}${k.slice(1)}` }),
  );
}

export function scenesFor(l: CourseLesson): Scene[] {
  const src = l.catalogId ? getLesson(l.catalogId) : undefined;
  return src ? scenesFromLesson(src) : [];
}

/** The activity's name ("Pick the answer"…) in the current language. */
export function interactionTitle(i: Interaction) {
  return i18n.t(`courses:generated.interactions.${i.kind}`);
}

/**
 * An answer option for display. True/false options are stored in English ('True', 'False') and
 * shown in the current language; every other option is learning content and shown as written.
 */
export function optionLabel(q: Question, k: number) {
  const o = q.options[k] ?? '';
  if (q.type !== 'tf') return o;
  if (o === 'True') return i18n.t('courses:quiz.trueOption');
  if (o === 'False') return i18n.t('courses:quiz.falseOption');
  return o;
}

/** Downloadable extras. Summary sheets and practice sets are generated from the lesson itself. */
export function resourcesFor(c: Course, l: CourseLesson): Resource[] {
  const out: Resource[] = l.content?.resources ? [...l.content.resources] : [];
  const points = keyPointsFor(l);
  out.push({
    id: 'sheet',
    kind: 'pdf',
    title: i18n.t('courses:generated.summarySheet', { title: l.title }),
    meta: i18n.t('courses:generated.pdfMeta'),
    body: [l.title.toUpperCase(), l.summary, '', ...points.map((p) => `• ${p}`)].join('\n'),
  });
  if (l.content?.quiz?.length)
    out.push({
      id: 'practice',
      kind: 'worksheet',
      title: i18n.t('courses:generated.practiceSet'),
      meta: i18n.t('courses:generated.worksheetMeta', { count: l.content.quiz.length }),
      body: l.content.quiz
        .map(
          (q, i) =>
            `${i + 1}. ${q.question}\n${q.options.map((_, j) => `   ${String.fromCharCode(65 + j)}. ${optionLabel(q, j)}`).join('\n')}`,
        )
        .join('\n\n'),
    });
  if (c.exams?.length) {
    const subject = getSubject(c.subjectId);
    out.push({
      id: 'past',
      kind: 'past-paper',
      title: i18n.t('courses:generated.pastTitle', {
        exam: c.exams[0],
        subject: subject
          ? i18n.t(`home:catalog.subjects.${subject.id}` as 'home:catalog.subjects.biology', {
              defaultValue: subject.name,
            })
          : c.title,
      }),
      meta: i18n.t('courses:generated.pastMeta'),
      body: i18n.t('courses:generated.pastBody', { exams: c.exams.join(' / ') }),
    });
  }
  out.push({
    id: 'glossary',
    kind: 'link',
    title: i18n.t('courses:generated.askTutor'),
    meta: i18n.t('courses:generated.askTutorMeta'),
  });
  return out;
}

/** Authored activities, or "explain it back" cards built from the lesson's key points. */
export function interactiveFor(l: CourseLesson): Interaction[] {
  if (l.content?.interactive?.length) return l.content.interactive;
  return keyPointsFor(l).map((k, i) => ({
    kind: 'reveal',
    prompt: i18n.t('courses:generated.keyIdea', { number: i + 1 }),
    answer: k,
  }));
}

/** Authored questions, or true/false checks built from the lesson's key points. */
export function quizFor(l: CourseLesson): Question[] {
  if (l.content?.quiz?.length) return l.content.quiz;
  return keyPointsFor(l).map((k, i) => ({
    id: `${l.id}-tf${i}`,
    type: 'tf',
    question: k,
    options: ['True', 'False'],
    correctIndex: 0,
    explanation: i18n.t('courses:generated.tfExplanation'),
    concept: l.title,
    difficulty: 'easy',
  }));
}
