import type { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { request } from '@/lib/api';

/**
 * "Check out your books": the learner says where they study and what (secondary class and stream;
 * university, polytechnic or college level and course; a master's or their own course) so their
 * books can be picked for them. Answers are kept on the phone.
 */
export type Stage = 'secondary' | 'undergraduate' | 'polytechnic' | 'college' | 'masters' | 'independent';
export const STAGES: Stage[] = ['secondary', 'undergraduate', 'polytechnic', 'college', 'masters', 'independent'];

/** Countries with their own school books. "other" gets the free books from everywhere. */
export type Country = 'ng' | 'gh' | 'ke' | 'za' | 'uk' | 'other';
export const COUNTRIES: Country[] = ['ng', 'gh', 'ke', 'za', 'uk', 'other'];
export const COUNTRY_FLAG: Record<Country, string> = {
  ng: '🇳🇬',
  gh: '🇬🇭',
  ke: '🇰🇪',
  za: '🇿🇦',
  uk: '🇬🇧',
  other: '🌍',
};
/** The server's book list for a country. */
export const catalogueFor = (c: Country) => (c === 'other' ? 'world' : c);

/** Levels after secondary school (secondary classes come from the server, per country). */
export const LEVELS: Record<'undergraduate' | 'polytechnic' | 'college', string[]> = {
  undergraduate: ['100', '200', '300', '400', '500', '600'],
  polytechnic: ['nd1', 'nd2', 'hnd1', 'hnd2'],
  college: ['nce1', 'nce2', 'nce3'],
};
export const hasLevels = (s?: Stage): s is keyof typeof LEVELS => !!s && s in LEVELS;

export type BooksProfile = { country?: Country } & (
  | {
      stage: 'secondary';
      /** The server's book list these answers belong to. */
      catalogue: string;
      level: string;
      stream?: string;
      /** Names from the server, for classes and streams without a translation. */
      levelName?: string;
      streamName?: string;
    }
  | { stage: 'undergraduate' | 'polytechnic' | 'college'; level: string; course: string; otherCourse?: string }
  | { stage: 'masters' | 'independent'; course: string; otherCourse?: string }
);

/** Typed in by the learner when their course isn't on the list. */
export const OTHER_COURSE = 'other';

/** University courses by faculty. Names are translated (books:courses.<id>). */
export const FACULTIES: { id: string; courses: string[]; mastersOnly?: string[] }[] = [
  {
    id: 'agriculture',
    courses: [
      'agriculture',
      'agricultural-economics',
      'agricultural-extension',
      'agronomy',
      'animal-science',
      'crop-science',
      'fisheries',
      'forestry',
      'food-science',
      'soil-science',
    ],
  },
  {
    id: 'arts',
    courses: [
      'english',
      'history',
      'linguistics',
      'philosophy',
      'religious-studies',
      'theatre-arts',
      'music',
      'fine-arts',
      'french',
      'arabic',
      'yoruba',
      'igbo',
      'hausa',
    ],
  },
  {
    id: 'education',
    courses: [
      'education-biology',
      'education-chemistry',
      'education-physics',
      'education-mathematics',
      'education-english',
      'education-economics',
      'guidance-counselling',
      'educational-management',
      'early-childhood',
      'adult-education',
      'physical-health-education',
      'library-science',
    ],
  },
  {
    id: 'engineering',
    courses: [
      'agricultural-engineering',
      'biomedical-engineering',
      'chemical-engineering',
      'civil-engineering',
      'computer-engineering',
      'electrical-engineering',
      'mechanical-engineering',
      'mechatronics',
      'metallurgical-engineering',
      'petroleum-engineering',
      'production-engineering',
      'marine-engineering',
      'aerospace-engineering',
      'telecommunications-engineering',
    ],
  },
  {
    id: 'environmental',
    courses: [
      'architecture',
      'building',
      'estate-management',
      'quantity-surveying',
      'surveying',
      'urban-planning',
      'environmental-management',
    ],
  },
  { id: 'law', courses: ['law', 'islamic-law'], mastersOnly: ['llm'] },
  {
    id: 'management',
    courses: [
      'accounting',
      'banking-finance',
      'business-administration',
      'entrepreneurship',
      'insurance',
      'marketing',
      'public-administration',
      'hospitality-tourism',
      'human-resources',
      'actuarial-science',
      'taxation',
    ],
    mastersOnly: ['mba', 'mpa'],
  },
  {
    id: 'health',
    courses: [
      'medicine',
      'dentistry',
      'nursing',
      'pharmacy',
      'medical-laboratory-science',
      'physiotherapy',
      'radiography',
      'optometry',
      'public-health',
      'nutrition',
      'anatomy',
      'physiology',
      'health-information',
      'veterinary-medicine',
    ],
    mastersOnly: ['mph'],
  },
  {
    id: 'sciences',
    courses: [
      'biology',
      'biochemistry',
      'botany',
      'zoology',
      'microbiology',
      'biotechnology',
      'chemistry',
      'industrial-chemistry',
      'physics',
      'geology',
      'mathematics',
      'statistics',
      'science-laboratory-technology',
    ],
  },
  {
    id: 'social',
    courses: [
      'economics',
      'political-science',
      'international-relations',
      'sociology',
      'psychology',
      'mass-communication',
      'geography',
      'criminology',
      'social-work',
      'demography',
      'peace-conflict',
    ],
  },
  {
    id: 'computing',
    courses: [
      'computer-science',
      'software-engineering',
      'information-technology',
      'information-systems',
      'cyber-security',
      'data-science',
      'artificial-intelligence',
    ],
  },
];

/** The courses to choose from, by faculty (master's adds MBA, MPA, MPH and LL.M). */
export const coursesFor = (stage: Stage) =>
  FACULTIES.map((f) => ({
    id: f.id,
    courses: stage === 'masters' ? [...f.courses, ...(f.mastersOnly ?? [])] : f.courses,
  }));

const KEY = 'knowzone.books.profile';

/** The learner's answers, saved on the phone. `null` until they've answered; `undefined` while loading. */
export function useBooksProfile() {
  const [profile, setProfile] = useState<BooksProfile | null | undefined>(undefined);
  // Read again whenever the screen comes back into view (answers may have changed on another screen).
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(KEY)
        .then((raw) => setProfile(raw ? upgrade(JSON.parse(raw) as BooksProfile & { schoolClass?: string }) : null))
        .catch(() => setProfile(null));
    }, []),
  );
  const save = useCallback((p: BooksProfile | null) => {
    setProfile(p);
    void (p ? AsyncStorage.setItem(KEY, JSON.stringify(p)) : AsyncStorage.removeItem(KEY)).catch(() => {});
  }, []);
  return { profile, save };
}

/** Answers saved before countries (Nigerian secondary classes only). */
function upgrade(p: BooksProfile & { schoolClass?: string }): BooksProfile {
  if (p.stage !== 'secondary' || !p.schoolClass) return p;
  const { schoolClass, ...rest } = p;
  return { ...rest, country: 'ng', catalogue: 'ng', level: schoolClass };
}

type T = (key: string, options?: Record<string, unknown>) => string;

/** "SS 2", "Grade 10", "Year 12", "ND 1", "300 Level"; else the server's name. */
export function levelName(id: string, t: T, name?: string) {
  if (/^\d{3}$/.test(id)) return t('level.option', { level: id });
  if (id === 'lower' || id === 'upper') return t(`levelName.${id}`);
  // Course books: first year, later years, master's.
  if (id === 'intro' || id === 'core' || id === 'masters') return t(`shelf.courseLevel.${id}`);
  const m = id.match(/^(jss|ss|jhs|shs|grade|year|igcse|form|nd|hnd|nce)(\d+)$/);
  return m ? t(`levelName.${m[1]}`, { n: m[2] }) : (name ?? id);
}

/** A stream's name: translated for the ones we know, else the server's. */
export const streamName = (id: string, t: T, name?: string) => t(`stream.${id}.title`, { defaultValue: name ?? id });

/** A course's name: from the list, or what the learner typed. */
export const courseName = (p: { course: string; otherCourse?: string }, t: T) =>
  p.course === OTHER_COURSE ? (p.otherCourse ?? '') : t(`courses.${p.course}`);

/** "SS 2 · Science", "300 Level · Computer Science", "HND 1 · Accounting", "Master’s · Public Health". */
export function booksSummary(p: BooksProfile, t: T) {
  if (p.stage === 'secondary')
    return [levelName(p.level, t, p.levelName), p.stream && streamName(p.stream, t, p.streamName)]
      .filter(Boolean)
      .join(' · ');
  if ('level' in p) return `${levelName(p.level, t)} · ${courseName(p, t)}`;
  return `${t(`summary.${p.stage}`)} · ${courseName(p, t)}`;
}

// ─── Secondary school shelves (from the server) ───────────────────────────────

export type SchoolLevel = {
  id: string;
  name?: string;
  stage: 'lower' | 'upper';
  /** What students choose between in this class (science/arts/commercial, pathways, exam routes). */
  streams: { id: string; name: string }[];
};
export type SubjectShelf = { id: string; name: string; books: number; free: number };
export type ShelfBook = {
  id: string;
  title: string;
  series?: string | null;
  authors: string[];
  publisher: string | null;
  edition?: string | null;
  year?: number | null;
  cover?: string | null;
  /** Free: read in the app. Otherwise bought in the app (later). */
  free: boolean;
  readUrl?: string | null;
  /** The official file to save in the app for offline reading, and its size. */
  downloadUrl?: string | null;
  downloadType?: 'pdf' | 'html' | null;
  downloadBytes?: number | null;
  provider?: string | null;
  license?: string | null;
  levels: string[];
};

export const booksApi = {
  /** A country's classes. Countries without their own books yet answer as "world". */
  classes: (country: string) =>
    request<{ country: string; name: string; levels: SchoolLevel[] }>(`/books/countries/${country}`),
  subjects: (catalogue: string, level: string, stream?: string) =>
    request<{ subjects: SubjectShelf[] }>(
      `/books/countries/${catalogue}/shelves?level=${level}${stream ? `&stream=${stream}` : ''}`,
    ),
  /** A university, polytechnic or college course's books, ordered for the student's stage. */
  course: (id: string, stage: string) =>
    request<{ course: string; books: ShelfBook[]; free: number }>(`/books/courses/${id}?stage=${stage}`),
  subject: (catalogue: string, id: string, level: string) =>
    request<{ subject: string; name: string; books: ShelfBook[] }>(
      `/books/countries/${catalogue}/subjects/${id}?level=${level}`,
    ),
  /** A school subject's course summary and topics, with the ones for the student's class first. */
  summaries: (catalogue: string, id: string, level: string) =>
    request<SummaryList>(`/books/countries/${catalogue}/subjects/${id}/summaries?level=${level}`),
  summary: (library: string, topic: string, english?: boolean) =>
    request<{ summary: Summary }>(`/books/summaries/${library}/${topic}${english ? '?lang=en' : ''}`),
};

/** Summaries in these languages are AI translations still waiting for native speakers to check them. */
export const summariesUnderReview = (language: string) => ['yo', 'ig', 'ha'].includes(language.split('-')[0]!);

/** A line in a subject's Summaries tab. A course summary has no `id`. */
export type SummaryCard = {
  library: string;
  libraryName: string;
  id?: string;
  yours?: boolean;
  title: string;
  short: string;
  keywords: string[];
};
export type SummaryList = { translated: boolean; courses: SummaryCard[]; topics: SummaryCard[] };
export type Summary = {
  library: string;
  libraryName: string;
  id: string;
  /** False when this language's translation isn't out yet and the text is English. */
  translated: boolean;
  title: string;
  short: string;
  sections: { heading: string; text: string }[];
  keyPoints: string[];
};

/**
 * A subject's name: translated for the ones we know, else the server's. A country's own name for a
 * shared subject (Kenya's "Home Science" for Home Economics) is kept as the country says it.
 */
export function subjectName(id: string, t: T, name?: string) {
  const english = t(`subjects.${id}`, { lng: 'en', defaultValue: '' });
  return name && english && english !== name ? name : t(`subjects.${id}`, { defaultValue: name ?? id });
}

/** Each subject's icon and colours on its card. */
export const SUBJECT_LOOK: Record<string, { icon: keyof typeof Ionicons.glyphMap; colors: readonly [string, string] }> =
  {
    english: { icon: 'text', colors: ['#3BA9FF', '#1F6FE5'] },
    mathematics: { icon: 'calculator', colors: ['#9B6BFF', '#6A45FF'] },
    'further-mathematics': { icon: 'infinite', colors: ['#7C5CFF', '#3B2DBF'] },
    'basic-science': { icon: 'flask', colors: ['#3DDCB0', '#14A88E'] },
    'basic-technology': { icon: 'construct', colors: ['#FFB547', '#FF8A1F'] },
    'social-studies': { icon: 'people', colors: ['#FF7A93', '#E5486A'] },
    'civic-education': { icon: 'flag', colors: ['#2DD4BF', '#0E8F6E'] },
    'business-studies': { icon: 'briefcase', colors: ['#FFC857', '#D99000'] },
    'agricultural-science': { icon: 'leaf', colors: ['#7CE38B', '#0E8F6E'] },
    'home-economics': { icon: 'home', colors: ['#FF9F43', '#FF5A7A'] },
    'computer-studies': { icon: 'laptop', colors: ['#4CC9FF', '#1663C7'] },
    'data-processing': { icon: 'server', colors: ['#4CC9FF', '#1663C7'] },
    'cultural-creative-arts': { icon: 'color-palette', colors: ['#E79BFF', '#B04CFF'] },
    'fine-arts': { icon: 'brush', colors: ['#E79BFF', '#B04CFF'] },
    'physical-health-education': { icon: 'fitness', colors: ['#FF7A93', '#FF9F43'] },
    history: { icon: 'hourglass', colors: ['#C79A4B', '#9C6B1E'] },
    crs: { icon: 'book', colors: ['#9B82FF', '#5B2BB8'] },
    irs: { icon: 'moon', colors: ['#2DD4BF', '#0F7C9C'] },
    french: { icon: 'chatbubbles', colors: ['#5B7CFF', '#3B2DBF'] },
    yoruba: { icon: 'language', colors: ['#3DDCB0', '#0F7C9C'] },
    igbo: { icon: 'language', colors: ['#FFB547', '#D9467A'] },
    hausa: { icon: 'language', colors: ['#7CE38B', '#1663C7'] },
    physics: { icon: 'magnet', colors: ['#FF9F43', '#E5486A'] },
    chemistry: { icon: 'flask', colors: ['#2DD4BF', '#14A88E'] },
    biology: { icon: 'leaf', colors: ['#7CE38B', '#0E8F6E'] },
    geography: { icon: 'earth', colors: ['#5AD1A0', '#0F7C9C'] },
    'technical-drawing': { icon: 'pencil', colors: ['#868BAE', '#4A5078'] },
    literature: { icon: 'library', colors: ['#E79BFF', '#9B6BFF'] },
    government: { icon: 'business', colors: ['#FF7A93', '#9C3B5E'] },
    economics: { icon: 'trending-up', colors: ['#FFC857', '#FF8A1F'] },
    commerce: { icon: 'cart', colors: ['#FF9F43', '#D99000'] },
    'financial-accounting': { icon: 'cash', colors: ['#3DDCB0', '#0E8F6E'] },
    'office-practice': { icon: 'document-text', colors: ['#4CC9FF', '#5B7CFF'] },
    marketing: { icon: 'megaphone', colors: ['#FF7A93', '#B04CFF'] },
  };
