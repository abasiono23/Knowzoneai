import type { Ionicons } from '@expo/vector-icons';
import i18n, { formatDate } from '@/i18n';

import { DEFAULT_REGION, examNames } from './region';

type Icon = keyof typeof Ionicons.glyphMap;

export type LearnerType = 'school' | 'university' | 'exam' | 'professional' | 'lifelong';
/** Everyone picks a type on screen 18; "teacher" branches into the educator flow. */
export type UserType = LearnerType | 'teacher';

export type FirstClass = { name: string; subject: string; level: string };

export type Personalization = {
  learnerType: UserType | null;
  ageGroup: string | null;
  educationLevel: string | null;
  /** Stream (Science/Arts/Commercial), field of study or career track. */
  track: string | null;
  institution: string;
  examGoals: string[];
  examMonth: string | null;
  subjects: string[];
  interests: string[];
  goals: string[];
  formats: string[];
  language: string;
  /** Study region (ISO country code, "ZZ" = another country); null until the region step is answered. */
  region: string | null;
  dailyMinutes: number;
  reminders: {
    enabled: boolean;
    time: string;
    days: number[];
    types: string[];
  };
  // Teacher / tutor answers
  teacherRole: string | null;
  teachLevels: string[];
  teacherGoals: string[];
  firstClass: FirstClass | null;
};

export const EMPTY_PROFILE: Personalization = {
  learnerType: null,
  ageGroup: null,
  educationLevel: null,
  track: null,
  institution: '',
  examGoals: [],
  examMonth: null,
  subjects: [],
  interests: [],
  goals: [],
  formats: [],
  language: 'en',
  region: null,
  dailyMinutes: 15,
  reminders: { enabled: true, time: '19:00', days: [1, 2, 3, 4, 5, 6, 0], types: ['daily', 'streak', 'exam'] },
  teacherRole: null,
  teachLevels: [],
  teacherGoals: [],
  firstClass: null,
};

/**
 * Learner wizard order for screens 18–30. Review is the last numbered step. The study region comes
 * early because the exams offered later depend on it.
 */
const LEARNER_STEPS = [
  'learner-type',
  'region',
  'age',
  'education',
  'pathway',
  'exams',
  'subjects',
  'interests',
  'goals',
  'formats',
  'language',
  'daily-target',
  'reminders',
  'review',
] as const;

/** Educator branch: who they teach and what they need, then their first class. */
const TEACHER_STEPS = [
  'learner-type',
  'region',
  'teacher-role',
  'teach-levels',
  'subjects',
  'teacher-goals',
  'first-class',
  'language',
  'reminders',
  'review',
] as const;

export type Step = (typeof LEARNER_STEPS)[number] | (typeof TEACHER_STEPS)[number];

/**
 * `askRegion` is false for accounts that already chose their country on the sign-up form: they skip
 * the region step. Google and Apple sign-ups never saw that form, so they get it.
 */
export const stepsFor = (type: UserType | null, askRegion = true): readonly Step[] => {
  const steps: readonly Step[] = type === 'teacher' ? TEACHER_STEPS : LEARNER_STEPS;
  return askRegion ? steps : steps.filter((s) => s !== 'region');
};
export const stepNumber = (step: Step, type: UserType | null, askRegion = true) =>
  stepsFor(type, askRegion).indexOf(step) + 1;
export const nextStep = (step: Step, type: UserType | null, askRegion = true): Step | 'plan' => {
  const steps = stepsFor(type, askRegion);
  return steps[steps.indexOf(step) + 1] ?? 'plan';
};

/** Learner-only catalogs are keyed by learner type; teachers fall back to the school catalogs. */
export const learnerKey = (type: UserType | null): LearnerType => (type && type !== 'teacher' ? type : 'school');

export type Option = { id: string; label: string; description?: string; icon?: Icon; emoji?: string };

/** Looks up a personalize string by a key built at runtime (option ids, subject names). */
const tr = (key: string, options?: { defaultValue?: string }): string =>
  (i18n.t as unknown as (k: string, o?: object) => string)(`personalize:${key}`, options);

/**
 * Catalog labels must follow the language, which can change while the app runs. Each option gets
 * `label` (and `description`) getters that read the current language whenever they're used, so
 * screens keep reading `option.label` while the constants hold only ids, icons and colours.
 *
 * - `described`: strings live at `<key>.label` and, when present, `<key>.description`.
 * - otherwise the label is the string at `<key>` itself.
 * - an item that already has a `label` (an exam name such as WAEC) keeps it untranslated.
 */
function localized<T extends object>(items: T[], keyOf: (item: T) => string, described = false) {
  return items.map((item) => {
    const key = keyOf(item);
    const props: PropertyDescriptorMap = {
      description: {
        enumerable: true,
        get: () => (described && i18n.exists(`personalize:${key}.description`) ? tr(`${key}.description`) : undefined),
      },
    };
    if (!('label' in item)) props.label = { enumerable: true, get: () => tr(described ? `${key}.label` : key) };
    return Object.defineProperties({ ...item }, props) as T & { label: string; description?: string };
  });
}

/** Display name for a subject. Profiles store English names; custom subjects show as typed. */
export const subjectLabel = (name: string) => tr(`subjects.${name}`, { defaultValue: name });

export const LEARNER_TYPES = localized<{ id: UserType; icon: Icon; color: string }>(
  [
    { id: 'school', icon: 'school', color: '#7C5CFF' },
    { id: 'university', icon: 'library', color: '#4CC9FF' },
    { id: 'exam', icon: 'ribbon', color: '#FFC857' },
    { id: 'professional', icon: 'briefcase', color: '#2DD4BF' },
    { id: 'lifelong', icon: 'planet', color: '#FF7A93' },
    { id: 'teacher', icon: 'easel', color: '#FF9F43' },
  ],
  (o) => `learnerTypes.${o.id}`,
  true,
);

export const TEACHER_ROLES: Option[] = localized<{ id: string; icon: Icon }>(
  [
    { id: 'school-teacher', icon: 'school' },
    { id: 'lecturer', icon: 'library' },
    { id: 'private-tutor', icon: 'person' },
    { id: 'exam-coach', icon: 'ribbon' },
    { id: 'parent', icon: 'home' },
  ],
  (o) => `teacherRoles.${o.id}`,
  true,
);

export const TEACH_LEVELS: Option[] = localized(
  [
    { id: 'primary', emoji: '🧒' },
    { id: 'jss', emoji: '📘' },
    { id: 'sss', emoji: '🔬' },
    { id: 'exam-prep', emoji: '🎯' },
    { id: 'university', emoji: '🎓' },
    { id: 'adult', emoji: '💼' },
  ],
  (o) => `teachLevelOptions.${o.id}`,
);

export const TEACHER_GOALS: Option[] = localized<{ id: string; icon: Icon }>(
  [
    { id: 'assign', icon: 'paper-plane' },
    { id: 'gaps', icon: 'analytics' },
    { id: 'materials', icon: 'sparkles' },
    { id: 'exam-ready', icon: 'trophy' },
    { id: 'grading', icon: 'time' },
    { id: 'parents', icon: 'people' },
  ],
  (o) => `teacherGoalOptions.${o.id}`,
);

export const AGE_GROUPS: Option[] = localized(
  [
    { id: 'under-13', emoji: '🧒' },
    { id: '13-15', emoji: '🎒' },
    { id: '16-18', emoji: '📚' },
    { id: '19-24', emoji: '🎓' },
    { id: '25-34', emoji: '💼' },
    { id: '35+', emoji: '🌟' },
  ],
  (o) => `ageGroups.${o.id}`,
);

const educationLevels = (type: LearnerType, items: { id: string; icon: Icon }[]): Option[] =>
  localized(items, (o) => `educationLevels.${type}.${o.id}`, true);

export const EDUCATION_LEVELS: Record<LearnerType, Option[]> = {
  school: educationLevels('school', [
    { id: 'primary', icon: 'happy' },
    { id: 'jss', icon: 'book' },
    { id: 'sss', icon: 'flask' },
  ]),
  university: educationLevels('university', [
    { id: 'diploma', icon: 'construct' },
    { id: 'ug-early', icon: 'book' },
    { id: 'ug-late', icon: 'school' },
    { id: 'postgrad', icon: 'medal' },
  ]),
  exam: educationLevels('exam', [
    { id: 'sss', icon: 'flask' },
    { id: 'school-leaver', icon: 'school' },
    { id: 'undergraduate', icon: 'library' },
    { id: 'graduate', icon: 'medal' },
  ]),
  professional: educationLevels('professional', [
    { id: 'secondary', icon: 'book' },
    { id: 'diploma', icon: 'construct' },
    { id: 'bachelors', icon: 'school' },
    { id: 'masters', icon: 'medal' },
  ]),
  lifelong: educationLevels('lifelong', [
    { id: 'secondary', icon: 'book' },
    { id: 'tertiary', icon: 'school' },
    { id: 'postgrad', icon: 'medal' },
    { id: 'none', icon: 'remove-circle' },
  ]),
};

const tracks = (type: LearnerType, items: { id: string; emoji: string }[]): Option[] =>
  localized(items, (o) => `pathways.${type}.tracks.${o.id}`);

/**
 * Screen 21: the pathway question changes with the learner type. Its title, subtitle and
 * institution field text live under `personalize:pathways.<type>`.
 */
export const PATHWAYS: Record<LearnerType, { tracks: Option[] }> = {
  school: {
    tracks: tracks('school', [
      { id: 'science', emoji: '🔬' },
      { id: 'arts', emoji: '🎭' },
      { id: 'commercial', emoji: '📈' },
      { id: 'general', emoji: '📘' },
    ]),
  },
  exam: {
    tracks: tracks('exam', [
      { id: 'science', emoji: '🔬' },
      { id: 'arts', emoji: '🎭' },
      { id: 'commercial', emoji: '📈' },
      { id: 'language', emoji: '🗣️' },
    ]),
  },
  university: {
    tracks: tracks('university', [
      { id: 'medicine', emoji: '🩺' },
      { id: 'engineering', emoji: '⚙️' },
      { id: 'computing', emoji: '💻' },
      { id: 'business', emoji: '📊' },
      { id: 'law', emoji: '⚖️' },
      { id: 'sciences', emoji: '🧪' },
      { id: 'social', emoji: '🌍' },
      { id: 'humanities', emoji: '🎨' },
      { id: 'education', emoji: '🍎' },
    ]),
  },
  professional: {
    tracks: tracks('professional', [
      { id: 'tech', emoji: '💻' },
      { id: 'finance', emoji: '💰' },
      { id: 'business', emoji: '📊' },
      { id: 'health', emoji: '🩺' },
      { id: 'creative', emoji: '🎨' },
      { id: 'education', emoji: '🍎' },
      { id: 'engineering', emoji: '⚙️' },
      { id: 'law', emoji: '⚖️' },
    ]),
  },
  lifelong: {
    tracks: tracks('lifelong', [
      { id: 'science', emoji: '🔭' },
      { id: 'tech', emoji: '🤖' },
      { id: 'money', emoji: '💰' },
      { id: 'history', emoji: '🏛️' },
      { id: 'creative', emoji: '🎨' },
      { id: 'languages', emoji: '🗣️' },
    ]),
  },
};

export const NO_EXAM = 'none';

/** Exam names (with `label`) stay as written; descriptive options are translated. */
type ExamOption = { id: string; label?: string };
const exams = (items: ExamOption[]): Option[] => localized(items, (o) => `examOptions.${o.id}`, true);

const X = {
  bece: { id: 'bece', label: 'BECE' },
  waec: { id: 'waec', label: 'WAEC (WASSCE)' },
  neco: { id: 'neco', label: 'NECO' },
  jamb: { id: 'jamb', label: 'JAMB (UTME)' },
  postUtme: { id: 'post-utme', label: 'Post-UTME' },
  gce: { id: 'gce', label: 'GCE' },
  igcse: { id: 'igcse', label: 'IGCSE' },
  sat: { id: 'sat', label: 'SAT' },
  act: { id: 'act', label: 'ACT' },
  ap: { id: 'ap', label: 'AP exams' },
  ged: { id: 'ged', label: 'GED' },
  gcse: { id: 'gcse', label: 'GCSE' },
  aLevels: { id: 'a-levels', label: 'A-levels' },
  aLevelsJupeb: { id: 'a-levels', label: 'A-Levels / JUPEB' },
  kcse: { id: 'kcse', label: 'KCSE' },
  nsc: { id: 'nsc', label: 'NSC (Matric)' },
  ib: { id: 'ib', label: 'IB Diploma' },
  ielts: { id: 'ielts', label: 'IELTS' },
  toefl: { id: 'toefl', label: 'TOEFL' },
  gre: { id: 'gre', label: 'GRE' },
  gmat: { id: 'gmat', label: 'GMAT' },
  schoolExams: { id: 'school-exams' },
} satisfies Record<string, ExamOption>;

/**
 * The exams school pupils and exam candidates choose from, by study region: each country's own
 * exams first, then the international ones students there commonly sit. Nigeria's lists are the
 * ones the app has always had. `other` is every region that isn't named.
 */
const WASSCE_SCHOOL = [X.bece, X.waec, X.igcse, X.sat, X.schoolExams];
const WASSCE_EXAM = [X.waec, X.gce, X.ielts, X.toefl, X.sat, X.aLevels];
const SCHOOL_EXAMS: Record<string, ExamOption[]> = {
  NG: [X.bece, X.waec, X.neco, X.jamb, X.igcse, X.sat, X.schoolExams],
  GH: WASSCE_SCHOOL,
  SL: WASSCE_SCHOOL,
  LR: WASSCE_SCHOOL,
  GM: WASSCE_SCHOOL,
  US: [X.sat, X.act, X.ap, X.schoolExams],
  GB: [X.gcse, X.aLevels, X.schoolExams],
  KE: [X.kcse, X.igcse, X.sat, X.schoolExams],
  ZA: [X.nsc, X.igcse, X.sat, X.schoolExams],
  other: [X.igcse, X.ib, X.sat, X.schoolExams],
};
const CANDIDATE_EXAMS: Record<string, ExamOption[]> = {
  NG: [X.jamb, X.waec, X.neco, X.postUtme, X.gce, X.ielts, X.toefl, X.sat, X.aLevelsJupeb],
  GH: WASSCE_EXAM,
  SL: WASSCE_EXAM,
  LR: WASSCE_EXAM,
  GM: WASSCE_EXAM,
  US: [X.sat, X.act, X.ap, X.ged, X.toefl],
  GB: [X.gcse, X.aLevels, X.ielts, X.sat],
  KE: [X.kcse, X.ielts, X.toefl, X.sat, X.aLevels],
  ZA: [X.nsc, X.ielts, X.toefl, X.sat],
  other: [X.igcse, X.aLevels, X.ib, X.sat, X.ielts, X.toefl],
};
/** Professional bodies: ICAN and CIPM are Nigeria's; the rest are sat everywhere. */
const PROFESSIONAL_EXAMS = (region: string): ExamOption[] => [
  ...(region === DEFAULT_REGION
    ? [{ id: 'ican', label: 'ICAN' }]
    : region === 'US'
      ? [{ id: 'cpa', label: 'CPA' }]
      : []),
  { id: 'acca', label: 'ACCA' },
  { id: 'cfa', label: 'CFA' },
  { id: 'pmp', label: 'PMP' },
  { id: 'cloud' },
  ...(region === DEFAULT_REGION ? [{ id: 'cipm', label: 'CIPM (HR)' }] : []),
  X.ielts,
];

const examLists = new Map<string, Option[]>();
/** The exams to offer a learner of this type in this study region (no region = Nigeria, as before regions). */
export function examsFor(type: LearnerType, region: string | null | undefined): Option[] {
  const r = region ?? DEFAULT_REGION;
  const key = `${type}.${r}`;
  let list = examLists.get(key);
  if (!list) {
    list = exams(
      type === 'school'
        ? (SCHOOL_EXAMS[r] ?? SCHOOL_EXAMS.other!)
        : type === 'exam'
          ? (CANDIDATE_EXAMS[r] ?? CANDIDATE_EXAMS.other!)
          : type === 'university'
            ? [{ id: 'semester' }, { id: 'professional' }, X.ielts, X.toefl, X.gre, X.gmat]
            : type === 'professional'
              ? PROFESSIONAL_EXAMS(r)
              : [X.ielts, { id: 'language-cert' }, { id: 'online-cert' }],
    );
    examLists.set(key, list);
  }
  return list;
}

/** Every exam option there is, to name one chosen under another type or region. */
const ALL_EXAMS = exams(
  [
    ...Object.values(X),
    ...PROFESSIONAL_EXAMS(DEFAULT_REGION),
    ...PROFESSIONAL_EXAMS('US'),
    { id: 'semester' },
    { id: 'professional' },
    { id: 'language-cert' },
    { id: 'online-cert' },
  ].filter((o, i, all) => all.findIndex((x) => x.id === o.id) === i),
);
/** An exam goal's name: as this learner's own list writes it, else as any list does. */
export const examLabel = (id: string, type: LearnerType, region: string | null | undefined) =>
  (examsFor(type, region).find((e) => e.id === id) ?? ALL_EXAMS.find((e) => e.id === id))?.label ?? id;

/**
 * Two or three exams to name in a line like "Preparing for JAMB, WAEC, IELTS and more", for the
 * region (the device's guess before the student has chosen one).
 */
export function examExamples(region: string | null | undefined) {
  const r = region ?? DEFAULT_REGION;
  if (r === DEFAULT_REGION) return 'JAMB, WAEC, IELTS';
  const own = examNames(r);
  return [...(own.length ? own.slice(0, 2) : ['IGCSE', 'SAT']), 'IELTS'].join(', ');
}

const SUBJECTS_BY_TRACK: Record<string, string[]> = {
  science: [
    'Mathematics',
    'English Language',
    'Physics',
    'Chemistry',
    'Biology',
    'Further Mathematics',
    'Agricultural Science',
    'Computer Studies',
    'Geography',
  ],
  arts: [
    'English Language',
    'Mathematics',
    'Literature in English',
    'Government',
    'History',
    'CRS',
    'IRS',
    'Yoruba',
    'Igbo',
    'Hausa',
    'French',
    'Civic Education',
  ],
  commercial: [
    'English Language',
    'Mathematics',
    'Economics',
    'Accounting',
    'Commerce',
    'Business Studies',
    'Marketing',
    'Office Practice',
  ],
  general: [
    'English Language',
    'Mathematics',
    'Basic Science',
    'Basic Technology',
    'Social Studies',
    'Civic Education',
    'Business Studies',
    'Computer Studies',
    'Cultural & Creative Arts',
  ],
  language: ['Reading', 'Writing', 'Listening', 'Speaking', 'Grammar', 'Vocabulary'],
  medicine: ['Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Pathology', 'Microbiology', 'Community Health'],
  engineering: [
    'Engineering Maths',
    'Mechanics',
    'Thermodynamics',
    'Circuits',
    'Materials Science',
    'Engineering Drawing',
    'Programming',
  ],
  computing: [
    'Programming',
    'Data Structures',
    'Algorithms',
    'Databases',
    'Networks',
    'Operating Systems',
    'AI & Machine Learning',
    'Web Development',
  ],
  business: ['Accounting', 'Economics', 'Finance', 'Marketing', 'Management', 'Statistics', 'Business Law'],
  law: ['Constitutional Law', 'Contract Law', 'Criminal Law', 'Torts', 'Land Law', 'Legal Methods'],
  sciences: ['Calculus', 'Physics', 'Chemistry', 'Biology', 'Statistics', 'Genetics', 'Biochemistry'],
  social: ['Economics', 'Political Science', 'Sociology', 'Psychology', 'Statistics', 'Geography'],
  humanities: ['Literature', 'History', 'Philosophy', 'Languages', 'Religious Studies', 'Theatre Arts', 'Music'],
  education: ['Educational Psychology', 'Curriculum Studies', 'Teaching Methods', 'Assessment', 'Classroom Management'],
  tech: [
    'Python',
    'Excel',
    'SQL',
    'Data Analysis',
    'Cloud Computing',
    'Cybersecurity',
    'Product Management',
    'AI Literacy',
  ],
  finance: ['Financial Accounting', 'Taxation', 'Audit', 'Financial Management', 'Excel', 'Corporate Finance'],
  health: ['Clinical Skills', 'Pharmacology', 'Public Health', 'Nursing Practice', 'Medical Ethics'],
  creative: ['Graphic Design', 'UI/UX Design', 'Photography', 'Video Editing', 'Writing', 'Branding'],
  money: ['Personal Finance', 'Investing', 'Entrepreneurship', 'Economics', 'Marketing'],
  history: ['African History', 'World History', 'Philosophy', 'Art History', 'Religions'],
  languages: ['English', 'French', 'Spanish', 'Yoruba', 'Igbo', 'Hausa', 'Arabic'],
};

/** Subjects suggested for the chosen track, plus everything else to search through. */
export function subjectCatalog(track: string | null) {
  const suggested = (track && SUBJECTS_BY_TRACK[track]) || SUBJECTS_BY_TRACK.general;
  const all = [...new Set(Object.values(SUBJECTS_BY_TRACK).flat())].filter((s) => !suggested.includes(s)).sort();
  return { suggested, all };
}

export const INTERESTS: Option[] = localized(
  [
    { id: 'space', emoji: '🚀' },
    { id: 'coding', emoji: '💻' },
    { id: 'ai', emoji: '🤖' },
    { id: 'nature', emoji: '🌿' },
    { id: 'health', emoji: '🫀' },
    { id: 'art', emoji: '🎨' },
    { id: 'music', emoji: '🎵' },
    { id: 'sports', emoji: '⚽' },
    { id: 'business', emoji: '💼' },
    { id: 'money', emoji: '💰' },
    { id: 'history', emoji: '🏛️' },
    { id: 'games', emoji: '🎮' },
    { id: 'writing', emoji: '✍️' },
    { id: 'film', emoji: '🎬' },
    { id: 'environment', emoji: '🌍' },
    { id: 'puzzles', emoji: '🧩' },
  ],
  (o) => `interestOptions.${o.id}`,
);

export const GOALS: Option[] = localized<{ id: string; icon: Icon }>(
  [
    { id: 'pass-exam', icon: 'trophy' },
    { id: 'grades', icon: 'trending-up' },
    { id: 'understand', icon: 'bulb' },
    { id: 'homework', icon: 'create' },
    { id: 'consistency', icon: 'repeat' },
    { id: 'skill', icon: 'construct' },
    { id: 'career', icon: 'briefcase' },
    { id: 'fun', icon: 'happy' },
  ],
  (o) => `goalOptions.${o.id}`,
);

export const FORMATS = localized<{ id: string; icon: Icon; color: string }>(
  [
    { id: 'videos', icon: 'play-circle', color: '#2DD4BF' },
    { id: 'summaries', icon: 'document-text', color: '#9B82FF' },
    { id: 'flashcards', icon: 'albums', color: '#FFC857' },
    { id: 'quizzes', icon: 'help-circle', color: '#FF7A93' },
    { id: 'tutor', icon: 'chatbubbles', color: '#4CC9FF' },
    { id: 'audio', icon: 'headset', color: '#7CEBDD' },
    { id: 'games', icon: 'game-controller', color: '#C26BFF' },
    { id: 'mindmaps', icon: 'git-network', color: '#FF9F43' },
  ],
  (o) => `formatOptions.${o.id}`,
  true,
);

/** One list for the whole app; choosing a language switches the interface and the AI. */
export { LANGUAGES } from '@/i18n/languages';

export const DAILY_TARGETS = localized(
  [
    { id: 'casual', minutes: 5, emoji: '🌱' },
    { id: 'steady', minutes: 10, emoji: '🙂' },
    { id: 'regular', minutes: 15, emoji: '💪' },
    { id: 'serious', minutes: 30, emoji: '🔥' },
    { id: 'intense', minutes: 45, emoji: '🚀' },
  ],
  (o) => `dailyTargets.${o.id}`,
  true,
);

export const REMINDER_TIMES = localized(
  [
    { id: 'morning', time: '07:00', emoji: '🌅' },
    { id: 'afterSchool', time: '16:00', emoji: '🎒' },
    { id: 'evening', time: '19:00', emoji: '🌆' },
    { id: 'night', time: '21:00', emoji: '🌙' },
  ],
  (o) => `reminderTimes.${o.id}`,
);

export const REMINDER_TYPES = localized<{ id: string; icon: Icon }>(
  [
    { id: 'daily', icon: 'flag' },
    { id: 'streak', icon: 'flame' },
    { id: 'revision', icon: 'albums' },
    { id: 'exam', icon: 'calendar' },
  ],
  (o) => `reminderTypes.${o.id}`,
  true,
);

/**
 * One-letter weekday names, Sunday first (index = JS weekday). Each entry is a getter, so it
 * reads `common:weekdays.short` in the current language whenever it's used.
 */
export const WEEKDAYS: readonly string[] = Object.defineProperties(
  [] as string[],
  Object.fromEntries(
    Array.from({ length: 7 }, (_, i) => [
      i,
      {
        enumerable: true,
        get: () => i18n.t('common:weekdays.short', { returnObjects: true })[i],
      },
    ]),
  ),
);

/** Exam month choices: the next 12 months. */
export function upcomingMonths(count = 12, from = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() + i + 1, 1);
    return {
      id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: formatDate(d, { month: 'short', year: 'numeric' }),
    };
  });
}

export const labelOf = (options: Option[], id: string | null) => options.find((o) => o.id === id)?.label ?? '—';

/** Adds or removes an id from a multi-select list, respecting an optional maximum. */
export function toggleIn<T>(list: T[], id: T, max?: number): T[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (max && list.length >= max) return list;
  return [...list, id];
}
