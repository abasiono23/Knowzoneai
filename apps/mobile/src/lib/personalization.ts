import type { Ionicons } from '@expo/vector-icons';
import i18n, { formatDate } from '@/i18n';

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
  dailyMinutes: 15,
  reminders: { enabled: true, time: '19:00', days: [1, 2, 3, 4, 5, 6, 0], types: ['daily', 'streak', 'exam'] },
  teacherRole: null,
  teachLevels: [],
  teacherGoals: [],
  firstClass: null,
};

/** Learner wizard order for screens 18–30. Review is the last numbered step. */
const LEARNER_STEPS = [
  'learner-type',
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

export const stepsFor = (type: UserType | null): readonly Step[] =>
  type === 'teacher' ? TEACHER_STEPS : LEARNER_STEPS;
export const stepNumber = (step: Step, type: UserType | null) => stepsFor(type).indexOf(step) + 1;
export const nextStep = (step: Step, type: UserType | null): Step | 'plan' => {
  const steps = stepsFor(type);
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
const exams = (items: { id: string; label?: string }[]): Option[] =>
  localized(items, (o) => `examOptions.${o.id}`, true);

export const EXAMS: Record<LearnerType, Option[]> = {
  school: exams([
    { id: 'bece', label: 'BECE' },
    { id: 'waec', label: 'WAEC (WASSCE)' },
    { id: 'neco', label: 'NECO' },
    { id: 'jamb', label: 'JAMB (UTME)' },
    { id: 'igcse', label: 'IGCSE' },
    { id: 'sat', label: 'SAT' },
    { id: 'school-exams' },
  ]),
  exam: exams([
    { id: 'jamb', label: 'JAMB (UTME)' },
    { id: 'waec', label: 'WAEC (WASSCE)' },
    { id: 'neco', label: 'NECO' },
    { id: 'post-utme', label: 'Post-UTME' },
    { id: 'gce', label: 'GCE' },
    { id: 'ielts', label: 'IELTS' },
    { id: 'toefl', label: 'TOEFL' },
    { id: 'sat', label: 'SAT' },
    { id: 'a-levels', label: 'A-Levels / JUPEB' },
  ]),
  university: exams([
    { id: 'semester' },
    { id: 'professional' },
    { id: 'ielts', label: 'IELTS' },
    { id: 'toefl', label: 'TOEFL' },
    { id: 'gre', label: 'GRE' },
    { id: 'gmat', label: 'GMAT' },
  ]),
  professional: exams([
    { id: 'ican', label: 'ICAN' },
    { id: 'acca', label: 'ACCA' },
    { id: 'cfa', label: 'CFA' },
    { id: 'pmp', label: 'PMP' },
    { id: 'cloud' },
    { id: 'cipm', label: 'CIPM (HR)' },
    { id: 'ielts', label: 'IELTS' },
  ]),
  lifelong: exams([{ id: 'ielts', label: 'IELTS' }, { id: 'language-cert' }, { id: 'online-cert' }]),
};

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
