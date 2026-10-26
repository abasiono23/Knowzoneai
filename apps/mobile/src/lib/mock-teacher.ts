/**
 * Mock teacher endpoints for frontend-first mode. A teacher's classes are seeded
 * with demo students and results so reports have something to show.
 */
import i18n from '@/i18n';

import type { FirstClass } from './personalization';
// Type-only import: a value import here would create an api → mock-api → teacher → api cycle.
import type { Assignment, ClassDetail, NewAssignment, Student } from './teacher';

const CLASS_COLORS = ['#7C5CFF', '#2DD4BF', '#FF9F43', '#4CC9FF', '#FF7A93', '#C26BFF'];

type StoredClass = Omit<ClassDetail, 'studentCount' | 'avgMastery' | 'activeAssignments' | 'topicMastery' | 'gaps'> & {
  topics: string[];
  questionStats: Record<string, { question: string; correctRate: number; commonWrong: string }[]>;
  scores: Record<string, Record<string, number | null>>;
};
export type TeacherDb = { classes: StoredClass[]; ownerName: string };

const NAMES = [
  'Adaeze Okafor',
  'Tunde Bakare',
  'Zainab Musa',
  'Chidi Eze',
  'Funmi Adeyemi',
  'Ibrahim Sani',
  'Ngozi Obi',
  'Emeka Nwosu',
  'Halima Bello',
  'Seun Ogunleye',
  'Blessing Udo',
  'Yusuf Abdullahi',
  'Kemi Alabi',
  'Daniel Etim',
];

const TOPICS: Record<string, string[]> = {
  Chemistry: ['Mole concept', 'Chemical bonding', 'Organic chemistry', 'Electrolysis', 'Rates of reaction'],
  Physics: ['Motion', 'Forces', 'Waves', 'Electricity', 'Energy'],
  Biology: ['Cell biology', 'Genetics', 'Ecology', 'Nutrition', 'Reproduction'],
  Mathematics: ['Algebra', 'Quadratic equations', 'Geometry', 'Statistics', 'Trigonometry'],
  'English Language': ['Comprehension', 'Summary writing', 'Lexis & structure', 'Essay writing', 'Oral English'],
};
const topicsFor = (subject: string) =>
  TOPICS[subject] ?? ['Foundations', 'Key concepts', 'Applications', 'Problem solving', 'Revision'];

/** Deterministic pseudo-random so demo data is stable between reloads. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
const code = (seed: number) =>
  Array.from({ length: 6 }, (_, i) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(rand(seed + i) * 32)]).join('');
const id = () => Math.random().toString(36).slice(2, 10);
const day = 86_400_000;

function makeClass(input: FirstClass, index: number, withDemo: boolean): StoredClass {
  const seed = index * 100 + input.name.length;
  const topics = topicsFor(input.subject);
  const students: Student[] = withDemo
    ? NAMES.slice(0, 10 + (index % 4)).map((name, i) => {
        const m = 0.35 + rand(seed + i) * 0.6;
        return {
          id: `s${seed}-${i}`,
          name,
          mastery: Math.round(m * 100) / 100,
          streak: Math.floor(rand(seed + i + 50) * 14),
          lastActive: new Date(Date.now() - Math.floor(rand(seed + i + 7) * 5) * day).toISOString(),
          completed: Math.floor(rand(seed + i + 3) * 8) + 1,
          weakTopics:
            m < 0.6
              ? [topics[i % topics.length], topics[(i + 2) % topics.length]]
              : m < 0.75
                ? [topics[i % topics.length]]
                : [],
        };
      })
    : [];
  const cls: StoredClass = {
    id: id(),
    name: input.name,
    subject: input.subject,
    level: input.level,
    joinCode: code(seed),
    color: CLASS_COLORS[index % CLASS_COLORS.length],
    students,
    assignments: [],
    topics,
    questionStats: {},
    scores: {},
  };
  if (withDemo) {
    addAssignment(
      cls,
      {
        classId: cls.id,
        title: `${topics[0]} check-in`,
        topic: topics[0],
        source: 'ai',
        questionCount: 10,
        dueAt: new Date(Date.now() - 2 * day).toISOString(),
        allowRetries: false,
        showAnswers: true,
      },
      1,
    );
    addAssignment(
      cls,
      {
        classId: cls.id,
        title: `${topics[1]} practice`,
        topic: topics[1],
        source: 'ai',
        questionCount: 8,
        dueAt: new Date(Date.now() + 3 * day).toISOString(),
        allowRetries: true,
        showAnswers: true,
      },
      0.55,
    );
  }
  return cls;
}

/** Adds an assignment; `completion` simulates how many students have already submitted. */
function addAssignment(cls: StoredClass, input: NewAssignment, completion = 0): Assignment {
  const seed = cls.assignments.length + cls.name.length * 7;
  const a: Assignment = {
    id: id(),
    classId: cls.id,
    title: input.title,
    topic: input.topic,
    dueAt: input.dueAt,
    questionCount: input.questionCount,
    submitted: 0,
    total: cls.students.length,
    avgScore: null,
    createdAt: new Date().toISOString(),
  };
  const scores: Record<string, number | null> = {};
  cls.students.forEach((s, i) => {
    const done = rand(seed + i) < completion;
    scores[s.id] = done ? Math.min(1, Math.max(0.2, s.mastery + (rand(seed + i + 9) - 0.5) * 0.3)) : null;
  });
  const done = Object.values(scores).filter((v): v is number => v !== null);
  a.submitted = done.length;
  a.avgScore = done.length ? done.reduce((x, y) => x + y, 0) / done.length : null;
  cls.scores[a.id] = scores;
  cls.questionStats[a.id] = Array.from({ length: Math.min(input.questionCount, 6) }, (_, q) => ({
    question: `Q${q + 1}. ${input.topic}: ${['define the key term', 'apply the rule', 'interpret the diagram', 'solve the calculation', 'explain the process', 'compare two cases'][q % 6]}`,
    correctRate: Math.round((0.3 + rand(seed + q * 3) * 0.65) * 100) / 100,
    commonWrong: [
      'Mixed up the units',
      'Reversed cause and effect',
      'Used the wrong formula',
      'Missed a key step',
      'Confused two similar terms',
    ][q % 5],
  }));
  cls.assignments.unshift(a);
  return a;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function summary(c: StoredClass) {
  return {
    id: c.id,
    name: c.name,
    subject: c.subject,
    level: c.level,
    joinCode: c.joinCode,
    color: c.color,
    studentCount: c.students.length,
    avgMastery: avg(c.students.map((s) => s.mastery)),
    activeAssignments: c.assignments.filter((a) => new Date(a.dueAt).getTime() > Date.now()).length,
  };
}

function detail(c: StoredClass): ClassDetail {
  const topicMastery = c.topics.map((topic, i) => ({
    topic,
    mastery: c.students.length
      ? avg(c.students.map((s) => (s.weakTopics.includes(topic) ? s.mastery * 0.6 : Math.min(1, s.mastery + 0.1))))
      : 0,
  }));
  const gaps = c.topics
    .map((topic) => ({ topic, studentsStruggling: c.students.filter((s) => s.weakTopics.includes(topic)).length }))
    .filter((g) => g.studentsStruggling > 0)
    .sort((a, b) => b.studentsStruggling - a.studentsStruggling)
    .slice(0, 3)
    .map((g) => ({
      ...g,
      suggestion: i18n.t('teacher:insights.gapSuggestion', { topic: g.topic.toLowerCase() }),
    }));
  const { topics: _t, questionStats: _q, scores: _s, ...rest } = c;
  return { ...rest, ...summary(c), topicMastery, gaps };
}

export function seedTeacher(db: TeacherDb, firstClass: FirstClass | null) {
  if (db.classes.length) return;
  db.classes.push(makeClass(firstClass ?? { name: 'My first class', subject: 'Mathematics', level: 'sss' }, 0, true));
}

export function teacherMock(
  path: string,
  method: string,
  body: Record<string, unknown>,
  db: TeacherDb,
): unknown | undefined {
  if (path === '/teacher/overview') {
    const classes = db.classes.map(summary);
    const all = db.classes.flatMap((c) => c.assignments.map((a) => ({ ...a, className: c.name })));
    return {
      classes,
      totals: {
        students: classes.reduce((n, c) => n + c.studentCount, 0),
        activeAssignments: classes.reduce((n, c) => n + c.activeAssignments, 0),
        avgMastery: avg(classes.filter((c) => c.studentCount).map((c) => c.avgMastery)),
        submissionsThisWeek: all.reduce((n, a) => n + a.submitted, 0),
      },
      needsAttention: db.classes.flatMap((c) =>
        detail(c)
          .gaps.slice(0, 1)
          .map((g) => ({ classId: c.id, className: c.name, topic: g.topic, studentsStruggling: g.studentsStruggling })),
      ),
      upcoming: all
        .filter((a) => new Date(a.dueAt).getTime() > Date.now())
        .sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    };
  }
  if (path === '/teacher/classes' && method === 'GET') return { classes: db.classes.map(summary) };
  if (path === '/teacher/classes' && method === 'POST') {
    const cls = makeClass(body as FirstClass, db.classes.length, false);
    db.classes.push(cls);
    return { class: summary(cls) };
  }
  const classMatch = path.match(/^\/teacher\/classes\/([^/]+)$/);
  if (classMatch) {
    const c = db.classes.find((x) => x.id === classMatch[1]);
    return c ? { class: detail(c) } : null;
  }
  if (path === '/teacher/assignments' && method === 'POST') {
    const input = body as unknown as NewAssignment;
    const c = db.classes.find((x) => x.id === input.classId);
    return c ? { assignment: addAssignment(c, input) } : null;
  }
  const asgMatch = path.match(/^\/teacher\/assignments\/([^/]+)$/);
  if (asgMatch) {
    for (const c of db.classes) {
      const a = c.assignments.find((x) => x.id === asgMatch[1]);
      if (!a) continue;
      const scores = c.scores[a.id] ?? {};
      const results = c.students
        .map((s) => ({
          studentId: s.id,
          name: s.name,
          score: scores[s.id] ?? null,
          submittedAt: scores[s.id] != null ? a.createdAt : null,
        }))
        .sort((x, y) => (y.score ?? -1) - (x.score ?? -1));
      const questions = c.questionStats[a.id] ?? [];
      const hardest = [...questions].sort((x, y) => x.correctRate - y.correctRate)[0];
      return {
        assignment: {
          ...a,
          className: c.name,
          questions,
          results,
          reteach: hardest
            ? i18n.t('teacher:insights.reteach', {
                question: hardest.question.replace(/^Q\d+\. /, ''),
                mistake: hardest.commonWrong.toLowerCase(),
              })
            : i18n.t('teacher:insights.noResults'),
        },
      };
    }
    return null;
  }
  return undefined;
}

/** Students joining by code look across every teacher's classes. */
export function findClassByCode(all: Record<string, TeacherDb>, joinCode: string) {
  for (const t of Object.values(all)) {
    const c = t.classes.find((x) => x.joinCode === joinCode.trim().toUpperCase());
    if (c) return { cls: c, teacherName: t.ownerName };
  }
  return null;
}
