import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';

import i18n from '@/i18n';

import type { User } from './api';
import type { Country } from './books';
import { isPracticeOnly, type ExamId } from './exams';

/**
 * The study region: the country whose exams a student prepares for. It decides which exam practice
 * the app shows first (the home card, Past Questions, onboarding's exam choices, the tutor's exam
 * style); everything else stays open to everyone. Stored with the account as an ISO 3166-1 alpha-2
 * code; accounts made before regions existed have none and are Nigeria, which is what they saw.
 */
export const DEFAULT_REGION = 'NG';
/** "Other country": general learning, no country's exams. */
export const OTHER_REGION = 'ZZ';

/** The countries on the list, grouped. Anyone else picks "Other country". */
export const REGION_GROUPS: { id: 'westAfrica' | 'africa' | 'world'; codes: string[] }[] = [
  { id: 'westAfrica', codes: ['NG', 'GH', 'SL', 'LR', 'GM'] },
  { id: 'africa', codes: ['CM', 'KE', 'RW', 'ZA', 'TZ', 'UG', 'ZM', 'ZW'] },
  { id: 'world', codes: ['US', 'GB', 'CA', 'IN', 'AU', 'IE'] },
];
export const REGIONS = [...REGION_GROUPS.flatMap((g) => g.codes), OTHER_REGION];

/**
 * The exams with papers in the app that each region sits. JAMB and NECO are Nigeria-only; the other
 * WAEC member countries sit the WASSCE. A region that isn't here has no papers yet.
 * The server has the same table (apps/server/src/data/exams.ts): keep them in step.
 */
const REGION_EXAMS: Record<string, ExamId[]> = {
  NG: ['jamb', 'waec', 'neco'],
  GH: ['waec'],
  SL: ['waec'],
  LR: ['waec'],
  GM: ['waec'],
  US: ['sat', 'act', 'ap'],
  GB: ['gcse', 'alevel'],
  KE: ['kcse'],
  ZA: ['nsc'],
};
export const examsForRegion = (region: string): ExamId[] => REGION_EXAMS[region] ?? [];

/** Exam names as students write them (never translated). */
export const EXAM_NAMES: Record<ExamId, string> = {
  jamb: 'JAMB',
  waec: 'WAEC',
  neco: 'NECO',
  sat: 'SAT',
  act: 'ACT',
  ap: 'AP',
  gcse: 'GCSE',
  alevel: 'A-level',
  kcse: 'KCSE',
  nsc: 'Matric (NSC)',
};
/** How courses and lessons tag an exam, where that isn't its name ("NSC", not "Matric (NSC)"). */
const EXAM_TAGS: Partial<Record<ExamId, string>> = { nsc: 'NSC' };
const examTags = (region: string) => examsForRegion(region).map((e) => EXAM_TAGS[e] ?? EXAM_NAMES[e]);
export const examNames = (region: string) => examsForRegion(region).map((e) => EXAM_NAMES[e]);

/**
 * One exam to name in an example ("e.g. for WAEC, focus on calculations"): the region's own, or a
 * widely sat international one where we don't know it.
 */
export const exampleExam = (region: string) =>
  region === DEFAULT_REGION ? 'WAEC' : (examTags(region)[0] ?? 'IGCSE');

/** The study region of an account (Nigeria for accounts from before regions, and signed out). */
export const regionOf = (user: Pick<User, 'region'> | null | undefined) => user?.region ?? DEFAULT_REGION;
/** The region this account chose itself (sign-up form, onboarding or Settings), or null if it never did. */
export const chosenRegion = (user: Pick<User, 'region' | 'regionChosen'> | null | undefined) =>
  user?.regionChosen && user.region ? user.region : null;

const known = (code: string | null | undefined): code is string =>
  !!code && REGIONS.includes(code) && code !== OTHER_REGION;

/** Time zones of the countries on the list, for devices whose locale has no region. */
const ZONES: Record<string, string> = {
  'Africa/Lagos': 'NG',
  'Africa/Accra': 'GH',
  'Africa/Freetown': 'SL',
  'Africa/Monrovia': 'LR',
  'Africa/Banjul': 'GM',
  'Africa/Douala': 'CM',
  'Africa/Nairobi': 'KE',
  'Africa/Kigali': 'RW',
  'Africa/Johannesburg': 'ZA',
  'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Kampala': 'UG',
  'Africa/Lusaka': 'ZM',
  'Africa/Harare': 'ZW',
  'Europe/London': 'GB',
  'Europe/Belfast': 'GB',
  'Europe/Dublin': 'IE',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Los_Angeles': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Detroit': 'US',
  'America/Boise': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU',
};

/** Which listed countries each time-zone area can hold. */
const AREAS: Record<string, string[]> = {
  America: ['US', 'CA'],
  Pacific: ['US'],
  Europe: ['GB', 'IE'],
  Australia: ['AU'],
  Asia: ['IN'],
};

/**
 * A first guess at the region for the sign-up question, which the student can always change. The
 * time zone says where the device is, so it comes first; a device set to "English (United States)"
 * in Lagos is still in Nigeria. Then the locale's region, where it fits the zone; then "Other country".
 */
export function guessRegion(): string {
  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    // No Intl time zone on this device.
  }
  if (ZONES[zone]) return ZONES[zone];
  let locale = '';
  try {
    locale = getLocales()[0]?.regionCode?.toUpperCase() ?? '';
  } catch {
    // No locale available.
  }
  if (!known(locale)) return OTHER_REGION;
  // A zone we don't list: believe the locale only when the device is on that country's side of the
  // world (a phone set to "English (United Kingdom)" in Abidjan isn't in the UK).
  const area = zone.split('/')[0];
  const fits =
    !zone ||
    (AREAS[area ?? ''] ?? []).includes(locale) ||
    (area === 'Africa' && !['US', 'GB', 'CA', 'IN', 'AU', 'IE'].includes(locale));
  return fits ? locale : OTHER_REGION;
}

/** A country's name in the app's language. */
export const regionName = (code: string): string =>
  (i18n.t as unknown as (k: string, o?: object) => string)(
    `common:regions.names.${REGIONS.includes(code) ? code : OTHER_REGION}`,
  );

const FLAG_BASE = 0x1f1e6 - 65;
/** 🇳🇬 for NG; a globe for "Other country". */
export const regionFlag = (code: string) =>
  code === OTHER_REGION || !/^[A-Z]{2}$/.test(code)
    ? '🌍'
    : String.fromCodePoint(FLAG_BASE + code.charCodeAt(0), FLAG_BASE + code.charCodeAt(1));

/**
 * A country in a line of text: "🇳🇬 Nigeria" on phones; the name alone on the web, where Windows
 * shows two letters for a flag emoji (components/flag.tsx draws the flags there).
 */
export const regionLabel = (code: string) =>
  Platform.OS === 'web' ? regionName(code) : `${regionFlag(code)} ${regionName(code)}`;

/** The country to start the sign-up form on: the device's, when it is one on the list. */
export const guessedCountry = () => {
  const guess = guessRegion();
  return guess === OTHER_REGION ? null : guess;
};

/** The books feature has its own short country list: the region's, or the free books from everywhere. */
export function booksCountry(region: string): Country {
  const own: Record<string, Country> = { NG: 'ng', GH: 'gh', KE: 'ke', ZA: 'za', GB: 'uk' };
  return own[region] ?? 'other';
}

/** One line on what a region gets: its exam practice, or general learning where we have no papers. */
export function regionSummary(code: string): string {
  const t = i18n.t as unknown as (k: string, o?: object) => string;
  const names = examNames(code);
  return names.length ? t('common:regions.has', { exams: names.join(', ') }) : t('common:regions.none');
}

// ─── The signed-in student's region, for code outside React ──────────────────────

let current = DEFAULT_REGION;
/** Kept in step with the session (lib/session.tsx), so plan features and invite messages can read it. */
export const setCurrentRegion = (region: string | null | undefined) => {
  current = region ?? DEFAULT_REGION;
};
export const currentRegion = () => current;

/** "JAMB, WAEC, NECO" in the app's language's list style (Arabic uses its own comma). */
export const listOf = (names: string[]) => names.join(i18n.language === 'ar' ? '، ' : ', ');

/** "e.g. Finish JAMB Physics paper 1": the exam to name in the study-room goal example. */
export const goalExampleExam = (region = currentRegion()) => (region === DEFAULT_REGION ? 'JAMB' : exampleExam(region));

/**
 * Whether the exam page is "Past Questions" for this region (the West African exams, where licensed
 * past papers sit beside practice ones) or plain "Exam practice" (every other exam, and regions with
 * no papers of their own, which only ever see practice papers).
 */
export const pastQuestions = (region: string) => examsForRegion(region).some((e) => !isPracticeOnly(e));

// ─── Courses and lessons made for one country's exams ────────────────────────────

/** Exam names that belong to particular countries (the SAT, IGCSE and IELTS are sat everywhere). */
const REGIONAL_EXAMS = ['JAMB', 'WAEC', 'NECO', 'GCSE', 'KCSE', 'NSC'];
const ownExams = (region: string) => examTags(region);

/** A course's exam tags without the ones this student's country doesn't sit ("WAEC" means nothing in the US). */
export const ownExamTags = (tags: string[] | undefined, region = currentRegion()) =>
  (tags ?? []).filter((tag) => !REGIONAL_EXAMS.includes(tag) || ownExams(region).includes(tag));

/** Whether a title or blurb names another country's exam ("WAEC Maths: Algebra…" for a student in the UK). */
export const namesForeignExam = (text: string, region = currentRegion()) =>
  REGIONAL_EXAMS.some((exam) => !ownExams(region).includes(exam) && new RegExp(`\\b${exam}\\b`).test(text));
