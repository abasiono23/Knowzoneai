import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * "Check out your books": the learner says what they're studying (secondary class and stream, or
 * university level and course) so their books can be picked for them. Answers are kept on the phone.
 */
export type Stage = 'secondary' | 'undergraduate' | 'masters';
export type SchoolClass = 'jss1' | 'jss2' | 'jss3' | 'ss1' | 'ss2' | 'ss3';
export type Stream = 'science' | 'arts' | 'commercial';
export type Level = '100' | '200' | '300' | '400' | '500' | '600';

export type BooksProfile =
  | { stage: 'secondary'; schoolClass: SchoolClass; stream?: Stream }
  | { stage: 'undergraduate'; level: Level; course: string; otherCourse?: string }
  | { stage: 'masters'; course: string; otherCourse?: string };

export const CLASSES: SchoolClass[] = ['jss1', 'jss2', 'jss3', 'ss1', 'ss2', 'ss3'];
/** Science, art or commercial is chosen from SS 1 (JSS classes all study the same subjects). */
export const hasStream = (c: SchoolClass) => c.startsWith('ss');
export const STREAMS: Stream[] = ['science', 'arts', 'commercial'];
export const LEVELS: Level[] = ['100', '200', '300', '400', '500', '600'];
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

/** The courses offered at a stage, by faculty (master's adds MBA, MPA, MPH and LL.M). */
export const coursesFor = (stage: 'undergraduate' | 'masters') =>
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
        .then((raw) => setProfile(raw ? (JSON.parse(raw) as BooksProfile) : null))
        .catch(() => setProfile(null));
    }, []),
  );
  const save = useCallback((p: BooksProfile | null) => {
    setProfile(p);
    void (p ? AsyncStorage.setItem(KEY, JSON.stringify(p)) : AsyncStorage.removeItem(KEY)).catch(() => {});
  }, []);
  return { profile, save };
}

type T = (key: string, options?: Record<string, unknown>) => string;

/** A course's name: from the list, or what the learner typed. */
export const courseName = (p: { course: string; otherCourse?: string }, t: T) =>
  p.course === OTHER_COURSE ? (p.otherCourse ?? '') : t(`courses.${p.course}`);

/** "SS 2 · Science", "300 Level · Computer Science", "Master’s · Public Health". */
export function booksSummary(p: BooksProfile, t: T) {
  if (p.stage === 'secondary')
    return [t(`schoolClass.${p.schoolClass}`), p.stream && t(`stream.${p.stream}.title`)].filter(Boolean).join(' · ');
  if (p.stage === 'undergraduate') return `${t('level.option', { level: p.level })} · ${courseName(p, t)}`;
  return `${t('masters')} · ${courseName(p, t)}`;
}
