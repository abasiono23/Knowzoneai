/**
 * Videos for the university, polytechnic and college courses' Videos tabs (data/videos/uni-<course>.json),
 * chosen with the YouTube Data API. Nothing is downloaded. The topics are the course summaries' own
 * (data/summaries/uni-<course>.json); videos go to intro and core topics only.
 *
 *  1. harvest   the uploads of trusted education channels (1 unit per 50 videos, plus 1 per 50 for details)
 *  2. search    one search per course whose channels leave it short of videos (100 units each)
 *  3. pick      scores every candidate against each topic's title and keywords and picks 8-15 per course:
 *               the best match per topic first, no repeats, a channel at most 4 times, at most 2 lectures
 *               over 25 minutes. Writes <work>/pick-<course>.json; <work>/overrides.json drops or adds videos
 *  4. build     writes data/videos/uni-<course>.json from the picks
 *
 * Quota: the units used each Pacific-time day (when YouTube's quota resets) go to <work>/ledger.json, and
 * the job stops at --budget (default 9000) for the day. Every step is saved as it goes, so a re-run only
 * does what's missing.
 *
 * Run from apps/server:
 *
 *   npx tsx scripts/videos-courses.ts harvest
 *   npx tsx scripts/videos-courses.ts search [--only law,llm] [--below 8] [--budget 9000]
 *   npx tsx scripts/videos-courses.ts pick [--only law]
 *   npx tsx scripts/videos-courses.ts build [--only law]
 *   npx tsx scripts/videos-courses.ts report
 */
import 'dotenv/config';

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { VideoLibrary } from '../src/services/subject-videos.js';
import { COURSES, courseLibrary, type SummaryLibrary } from '../src/services/summaries.js';

const args = process.argv.slice(2);
const step = args[0];
const flag = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const only = flag('only')?.split(',');
const BUDGET = Number(flag('budget') ?? 9000);

const SERVER = resolve(import.meta.dirname, '..');
const WORK = join(SERVER, '.uni-videos');
const OUT = join(SERVER, 'data', 'videos');
mkdirSync(WORK, { recursive: true });

const readJson = <T>(name: string, fallback: T): T =>
  existsSync(join(WORK, name)) ? (JSON.parse(readFileSync(join(WORK, name), 'utf8')) as T) : fallback;
const saveJson = (name: string, data: unknown) => writeFileSync(join(WORK, name), JSON.stringify(data, null, 1));

// ---------- quota ----------

const day = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
const ledger = readJson<Record<string, number>>('ledger.json', {});
const used = () => ledger[day()] ?? 0;
class OutOfQuota extends Error {}

async function api<T>(path: string, params: Record<string, string>, cost = 1): Promise<T> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY is not set');
  if (used() + cost > BUDGET) throw new OutOfQuota(`budget of ${BUDGET} units reached for ${day()}`);
  ledger[day()] = used() + cost;
  saveJson('ledger.json', ledger);
  const url = `https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, key })}`;
  let res: Response | undefined;
  // The network drops now and then: a few tries before giving up (YouTube counts only answered calls).
  for (let i = 0; i < 4 && !res; i++) {
    try {
      res = await fetch(url);
    } catch (e) {
      if (i === 3) throw e;
      await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
    }
  }
  if (!res) throw new Error(`YouTube ${path}: no answer`);
  if (res.status === 403) throw new OutOfQuota(`YouTube said 403 on ${path}`);
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}`);
  return (await res.json()) as T;
}

// ---------- courses ----------

const FACULTY: Record<string, string[]> = {
  agri: ['agriculture', 'agricultural-economics', 'agricultural-extension', 'agronomy', 'animal-science', 'crop-science', 'fisheries', 'forestry', 'food-science', 'soil-science'],
  arts: ['english', 'history', 'linguistics', 'philosophy', 'religious-studies', 'theatre-arts', 'music', 'fine-arts', 'french', 'arabic', 'yoruba', 'igbo', 'hausa'],
  edu: ['education-biology', 'education-chemistry', 'education-physics', 'education-mathematics', 'education-english', 'education-economics', 'guidance-counselling', 'educational-management', 'early-childhood', 'adult-education', 'physical-health-education', 'library-science'],
  eng: ['agricultural-engineering', 'biomedical-engineering', 'chemical-engineering', 'civil-engineering', 'computer-engineering', 'electrical-engineering', 'mechanical-engineering', 'mechatronics', 'metallurgical-engineering', 'petroleum-engineering', 'production-engineering', 'marine-engineering', 'aerospace-engineering', 'telecommunications-engineering'],
  env: ['architecture', 'building', 'estate-management', 'quantity-surveying', 'surveying', 'urban-planning', 'environmental-management'],
  law: ['law', 'islamic-law', 'llm'],
  mgmt: ['accounting', 'banking-finance', 'business-administration', 'entrepreneurship', 'insurance', 'marketing', 'public-administration', 'hospitality-tourism', 'human-resources', 'actuarial-science', 'taxation', 'mba', 'mpa'],
  health: ['medicine', 'dentistry', 'nursing', 'pharmacy', 'medical-laboratory-science', 'physiotherapy', 'radiography', 'optometry', 'public-health', 'nutrition', 'anatomy', 'physiology', 'health-information', 'veterinary-medicine', 'mph'],
  sci: ['biology', 'biochemistry', 'botany', 'zoology', 'microbiology', 'biotechnology', 'chemistry', 'industrial-chemistry', 'physics', 'geology', 'mathematics', 'statistics', 'science-laboratory-technology'],
  social: ['economics', 'political-science', 'international-relations', 'sociology', 'psychology', 'mass-communication', 'geography', 'criminology', 'social-work', 'demography', 'peace-conflict'],
  comp: ['computer-science', 'software-engineering', 'information-technology', 'information-systems', 'cyber-security', 'data-science', 'artificial-intelligence'],
};
const facultyOf = (course: string) => Object.keys(FACULTY).find((f) => FACULTY[f]!.includes(course))!;

/** Faculties whose channels a course also reads (an education course teaches its subject too). */
const ALSO: Record<string, string[]> = {
  'education-biology': ['sci'],
  'education-chemistry': ['sci'],
  'education-physics': ['sci'],
  'education-mathematics': ['sci'],
  'education-english': ['arts'],
  'education-economics': ['social'],
  'guidance-counselling': ['social'],
  'physical-health-education': ['health'],
  'early-childhood': ['social'],
  'agricultural-economics': ['social'],
  'agricultural-engineering': ['agri'],
  'biomedical-engineering': ['health'],
  'computer-engineering': ['comp'],
  'environmental-management': ['agri', 'sci'],
  'banking-finance': ['social'],
  'public-administration': ['social'],
  mpa: ['social'],
  'actuarial-science': ['sci'],
  'veterinary-medicine': ['agri'],
  'animal-science': ['health'],
  'food-science': ['health'],
  nutrition: ['agri'],
  biochemistry: ['health'],
  microbiology: ['health'],
  anatomy: ['sci'],
  physiology: ['sci'],
  'science-laboratory-technology': ['health'],
  geography: ['env', 'sci'],
  economics: ['mgmt'],
  'international-relations': ['law'],
  'peace-conflict': ['law'],
  criminology: ['law'],
  'data-science': ['sci'],
  'artificial-intelligence': ['sci'],
  'industrial-chemistry': ['eng'],
  statistics: ['social'],
};
const tagsOf = (course: string) => new Set([course, facultyOf(course), ...(ALSO[course] ?? [])]);

/** Trusted channels by the faculties (or single courses) they teach. A handle that doesn't resolve is skipped. */
const CHANNELS: Record<string, string[]> = {
  khanacademy: ['sci', 'health', 'social', 'comp', 'mgmt'],
  crashcourse: ['sci', 'health', 'social', 'arts', 'comp', 'mgmt', 'edu', 'law'],
  ProfessorDaveExplains: ['sci', 'health', 'eng', 'agri'],
  TheOrganicChemistryTutor: ['sci', 'eng', 'mgmt'],
  mitocw: ['sci', 'eng', 'comp', 'social', 'mgmt', 'env'],
  stanfordonline: ['comp', 'eng', 'mgmt', 'sci'],
  YaleCourses: ['arts', 'social', 'sci', 'health', 'law', 'mgmt'],
  GreshamCollege: ['arts', 'law', 'sci', 'social', 'mgmt', 'health'],
  TEDEd: ['arts', 'sci', 'social', 'health'],
  NatureVideoChannel: ['sci', 'health'],
  iBiology: ['sci', 'health'],
  NinjaNerdOfficial: ['health', 'sci'],
  osmosis: ['health'],
  ArmandoHasudungan: ['health', 'sci'],
  MedCram: ['health'],
  ZeroToFinals: ['health'],
  GeekyMedics: ['health'],
  Kenhub: ['health'],
  AnatomyZone: ['health'],
  physiotutors: ['physiotherapy'],
  RegisteredNurseRN: ['nursing'],
  SimpleNursing: ['nursing'],
  WHO: ['health'],
  AmoebaSisters: ['sci', 'edu'],
  Bozemanscience: ['sci'],
  AKLectures: ['sci', 'health'],
  '3blue1brown': ['sci', 'comp', 'eng'],
  DrTrefor: ['sci', 'eng'],
  statquest: ['sci', 'comp'],
  jbstatistics: ['sci', 'social'],
  zedstatistics: ['sci', 'social'],
  FlippingPhysics: ['sci'],
  PhysicswithElliot: ['sci'],
  NickZentner: ['sci', 'env'],
  nesoacademy: ['comp', 'eng'],
  ALLABOUTELECTRONICS: ['eng'],
  TheEfficientEngineer: ['eng', 'env'],
  LearnChemE: ['eng', 'sci'],
  PracticalEngineeringChannel: ['eng', 'env'],
  RealEngineering: ['eng'],
  BrianBDouglas: ['eng'],
  freecodecamp: ['comp'],
  cs50: ['comp'],
  Computerphile: ['comp'],
  IBMTechnology: ['comp', 'mgmt'],
  Fireship: ['comp'],
  abdul_bari: ['comp'],
  Deeplearningai: ['comp'],
  professormesser: ['comp'],
  PowerCertAnimatedVideos: ['comp', 'eng'],
  MarginalRevolutionUniversity: ['social', 'mgmt'],
  ACDCLeadership: ['social', 'mgmt'],
  EconplusDal: ['social', 'mgmt'],
  AccountingStuff: ['mgmt'],
  Edspira: ['mgmt'],
  CorporateFinanceInstitute: ['mgmt'],
  ThePlainBagel: ['mgmt', 'social'],
  AIHR: ['mgmt'],
  harvardbusinessreview: ['mgmt'],
  ycombinator: ['mgmt'],
  StanfordeCorner: ['mgmt'],
  smarthistory: ['arts'],
  theartassignment: ['arts'],
  TheLingSpace: ['arts'],
  WirelessPhilosophy: ['arts'],
  ReligionForBreakfast: ['arts'],
  LetsTalkReligion: ['arts'],
  edutopia: ['edu'],
  SproutsSchools: ['edu', 'social'],
  HarvardCenterontheDevelopingChild: ['edu', 'social'],
  TeachingsinEducation: ['edu'],
  FAO: ['agri', 'env'],
  PennStateExtension: ['agri'],
  stewarthicks: ['env'],
  '30X40DesignWorkshop': ['env'],
  TheB1M: ['env', 'eng'],
  CityBeautiful: ['env', 'social'],
  LegalEagle: ['law'],
  UnitedNations: ['social', 'law'],
  LearnFrenchWithAlexa: ['french'],
  ArabicPod101: ['arabic'],
  NationalTheatre: ['theatre-arts'],
  NativLang: ['arts'],
  // Found by id: their handles don't resolve.
  'UC3R-xanNgtoa8b7gpVexVlA': ['arts'], // Smarthistory
  'UCtu8MkufmVgxS8_Ocl7mMig': ['agri', 'env'], // FAO
  'UCM93UMoQKlj_8wTACRvl1iQ': ['agri'], // FAO Learning Hub
  'UCimxROEIlNsiRqT9X5tg2XQ': ['sci', 'health'], // iBiology Techniques
  'UC-RKpEc4eE9PwJaupN91xYQ': ['edu', 'social'], // Sprouts
  'UChBjCaJyswxsEqz26TZrWRw': ['edu', 'social'], // Center on the Developing Child at Harvard
};

// ---------- the candidate pool ----------

type Video = {
  id: string;
  title: string;
  channel: string;
  description: string;
  seconds: number;
  views: number;
  date: string;
  tags: string[];
};
type ChannelState = { id?: string; uploads?: string; title?: string; videos?: number; done?: boolean; missing?: boolean };

const channels = readJson<Record<string, ChannelState>>('channels.json', {});
const pool = new Map(readJson<Video[]>('pool.json', []).map((v) => [v.id, v]));
/** Ids seen and turned down (wrong length, not embeddable, ...), so their details aren't asked for again. */
const refused = new Set(readJson<string[]>('refused.json', []));
const savePool = () => {
  saveJson('pool.json', [...pool.values()]);
  saveJson('refused.json', [...refused]);
};

const isoSeconds = (iso: string | undefined) => {
  const m = iso?.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? Number(m[1] ?? 0) * 86400 + Number(m[2] ?? 0) * 3600 + Number(m[3] ?? 0) * 60 + Number(m[4] ?? 0) : 0;
};
const ENTITIES: Record<string, string> = { '&amp;': '&', '&#39;': '’', '&quot;': '"', '&lt;': '<', '&gt;': '>' };
const plain = (s: string) => s.replace(/&(amp|#39|quot|lt|gt);/g, (m) => ENTITIES[m] ?? m);
const englishLooking = (s: string) => (s.match(/[^\x00-\x7F‘-‟–— -ÿ]/g)?.length ?? 0) <= 2;

/** Details for new ids; keeps public, embeddable, not-for-kids, unblocked English videos of 3-60 minutes. */
async function addDetails(ids: string[], tags: string[]) {
  const todo: string[] = [];
  for (const id of new Set(ids)) {
    const known = pool.get(id);
    if (known) known.tags = [...new Set([...known.tags, ...tags])];
    else if (!refused.has(id)) todo.push(id);
  }
  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50);
    const r = await api<{
      items?: {
        id: string;
        snippet: { title: string; channelTitle: string; description: string; publishedAt: string; defaultAudioLanguage?: string; defaultLanguage?: string; liveBroadcastContent?: string };
        contentDetails: { duration: string; regionRestriction?: { blocked?: string[]; allowed?: string[] } };
        statistics: { viewCount?: string };
        status: { embeddable: boolean; privacyStatus: string; madeForKids?: boolean };
      }[];
    }>('videos', { part: 'snippet,contentDetails,statistics,status', id: batch.join(','), maxResults: '50' });
    const got = new Set<string>();
    for (const v of r.items ?? []) {
      got.add(v.id);
      const seconds = isoSeconds(v.contentDetails.duration);
      const lang = (v.snippet.defaultAudioLanguage ?? v.snippet.defaultLanguage ?? '').toLowerCase();
      const ok =
        v.status.embeddable &&
        v.status.privacyStatus === 'public' &&
        !v.status.madeForKids &&
        !v.contentDetails.regionRestriction &&
        v.snippet.liveBroadcastContent !== 'upcoming' &&
        seconds >= 180 &&
        seconds <= 3600 &&
        (lang ? lang.startsWith('en') : englishLooking(v.snippet.title));
      if (!ok) {
        refused.add(v.id);
        continue;
      }
      pool.set(v.id, {
        id: v.id,
        title: plain(v.snippet.title),
        channel: plain(v.snippet.channelTitle),
        description: v.snippet.description.slice(0, 400).replace(/\s+/g, ' '),
        seconds,
        views: Number(v.statistics.viewCount ?? 0),
        date: v.snippet.publishedAt.slice(0, 10),
        tags,
      });
    }
    for (const id of batch) if (!got.has(id)) refused.add(id);
  }
}

async function harvest() {
  for (const [handle, tags] of Object.entries(CHANNELS)) {
    const c = (channels[handle] ??= {});
    if (c.done || c.missing) continue;
    if (!c.uploads) {
      const r = await api<{ items?: { id: string; snippet: { title: string }; contentDetails: { relatedPlaylists: { uploads: string } } }[] }>(
        'channels',
        { part: 'snippet,contentDetails', ...(/^UC[\w-]{22}$/.test(handle) ? { id: handle } : { forHandle: `@${handle}` }) },
      );
      const item = r.items?.[0];
      if (!item) {
        c.missing = true;
        console.log(`  @${handle}: not found`);
        saveJson('channels.json', channels);
        continue;
      }
      Object.assign(c, { id: item.id, title: item.snippet.title, uploads: item.contentDetails.relatedPlaylists.uploads });
    }
    // Up to 4000 uploads a channel (newest first): plenty, and keeps the largest from using up the quota.
    const ids: string[] = [];
    let page: string | undefined;
    for (let i = 0; i < 80; i++) {
      const r = await api<{ items?: { contentDetails: { videoId: string } }[]; nextPageToken?: string }>('playlistItems', {
        part: 'contentDetails',
        playlistId: c.uploads!,
        maxResults: '50',
        ...(page ? { pageToken: page } : {}),
      }).catch((e: Error) => {
        // A channel whose uploads list is hidden answers 404: skip it.
        if (e.message.endsWith(' 404')) return { items: [], nextPageToken: undefined };
        throw e;
      });
      ids.push(...(r.items?.map((x) => x.contentDetails.videoId) ?? []));
      page = r.nextPageToken;
      if (!page) break;
    }
    await addDetails(ids, tags);
    c.videos = ids.length;
    c.done = true;
    saveJson('channels.json', channels);
    savePool();
    console.log(`  @${handle} (${c.title}): ${ids.length} uploads; pool ${pool.size}; ${used()} units today`);
  }
}

// ---------- topics and scoring ----------

type Topic = { id: string; stage: string; title: string; keywords: string[] };
function topicsOf(course: string): { name: string; topics: Topic[] } | null {
  const f = join(SERVER, 'data', 'summaries', `${courseLibrary(course)}.json`);
  if (!existsSync(f)) return null;
  const lib = JSON.parse(readFileSync(f, 'utf8')) as SummaryLibrary;
  return {
    name: lib.name.en ?? course,
    topics: lib.topics.map((t) => ({ id: t.id, stage: t.stage, title: t.text.en!.title, keywords: t.text.en!.keywords })),
  };
}

const STOP = new Set(
  'the and for with how what why from your their that this into are its all basic basics introduction intro introductory part lesson lessons level video videos explained explanation learn learning understanding use using of to in on a an as is it by or at be vs versus principles principle fundamentals overview foundations concepts theory theories methods method practice practices applications application systems system management analysis advanced general key topics topic course chapter lecture module unit week class study studies design new types type role roles skills skill issues approaches approach'.split(
    ' ',
  ),
);
const stem = (w: string) => w.replace(/(ies)$/, 'y').replace(/(?<=[a-z]{3})(es|s)$/, '');
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map(stem);

const wordCache = new Map<string, { title: Set<string>; desc: Set<string> }>();
const topicCache = new Map<Topic, { tw: string[]; kws: string[][] }>();
/** In how many pool titles each word appears: a rare word is a topic's real subject term, a common one isn't. */
let df: Map<string, number> | null = null;
const titleWords = (v: Video) => {
  let w = wordCache.get(v.id);
  if (!w) wordCache.set(v.id, (w = { title: new Set(words(v.title)), desc: new Set(words(v.description)) }));
  return w;
};
const frequency = (w: string) => {
  if (!df) {
    df = new Map();
    for (const v of pool.values()) for (const x of titleWords(v).title) df.set(x, (df.get(x) ?? 0) + 1);
  }
  return df.get(w) ?? 0;
};
/** A subject term: rare enough across ~58,000 lesson titles to say what a video is about. */
const SPECIFIC = 400;
const FAIRLY = 1500;

function score(t: Topic, v: Video) {
  const { title, desc } = titleWords(v);
  let tk = topicCache.get(t);
  if (!tk)
    topicCache.set(t, (tk = { tw: [...new Set(words(t.title))], kws: t.keywords.map((k) => [...new Set(words(k))]) }));
  const { tw, kws } = tk;
  // The topic's subject term must be in the video's title: a rare word from its name or keywords, not a
  // shared generic word like "chemistry" or "engineering".
  const terms = new Set([...tw, ...kws.flat()].filter((w) => title.has(w) && frequency(w) <= SPECIFIC));
  if (!terms.size) return 0;
  let s = terms.size * 2;
  let strong = 0;
  const hit = tw.filter((w) => title.has(w)).length;
  s += hit * 3;
  if (tw.length > 1 && hit === tw.length && tw.some((w) => frequency(w) <= FAIRLY)) (s += 3), strong++;
  for (const kw of kws) {
    if (!kw.length) continue;
    if (kw.every((w) => title.has(w))) {
      s += kw.length > 1 ? 6 : 3;
      if (kw.some((w) => frequency(w) <= (kw.length > 1 ? FAIRLY : SPECIFIC))) strong++;
    } else if (kw.every((w) => desc.has(w))) s += 1;
  }
  // And at least one strong sign: a whole keyword with a subject term, or every word of the topic's name.
  return strong ? s : 0;
}

/** Exam drills teach a test, not a topic. */
const EXAM = /\b(IIT|JEE|NEET|SAT|ACT|GRE|GMAT|MCAT|USMLE|NCLEX|GCSE|IGCSE|A[- ]?level|AP (Bio|Chem|Physics|Calc|Stat|Psych|Econ|Gov|World|US|Euro|Human|Environmental|Comp)\w*|past papers?|exam prep|practice #|practice problems? #|practice test|board exam)\b/i;
/** School-level maths, physics and chemistry channels: on an engineering course only on its foundation topics. */
const FUNDAMENTALS = new Set([
  'Khan Academy',
  'The Organic Chemistry Tutor',
  'Professor Dave Explains',
  '3Blue1Brown',
  'Dr. Trefor Bazett',
  'Flipping Physics',
  'Physics with Elliot',
  'CrashCourse',
]);
const FOUNDATION_TOPIC = /mathemat|calculus|algebra|physics|chemistry|foundation|statistic|differential|numerical|probability/i;

// ---------- search ----------

const searched = readJson<Record<string, string[]>>('searched.json', {});
/** Search words per course where the course's name alone would bring the wrong videos. */
const QUERY: Record<string, string> = {
  english: 'English literature university lecture',
  french: 'learn French grammar lesson in English',
  arabic: 'learn Arabic grammar lesson in English',
  yoruba: 'Yoruba language lesson',
  igbo: 'Igbo language lesson',
  hausa: 'Hausa language lesson',
  law: 'law lecture contract tort constitutional criminal law explained',
  llm: 'international law lecture human rights law explained',
  'islamic-law': 'Islamic law sharia fiqh usul al-fiqh lecture',
  mba: 'MBA strategy finance leadership lecture',
  mpa: 'public policy public administration lecture',
  mph: 'public health epidemiology lecture',
  'health-information': 'health information management electronic health records explained',
  'science-laboratory-technology': 'laboratory techniques explained instrumentation',
  'peace-conflict': 'conflict resolution peacebuilding explained',
};
async function search(course: string, extra = '') {
  const info = topicsOf(course);
  if (!info) return;
  const q = extra || QUERY[course] || `${info.name} university lecture explained`;
  if (searched[course]?.includes(q)) return;
  const r = await api<{ items?: { id: { videoId: string } }[] }>(
    'search',
    { part: 'id', q, type: 'video', videoEmbeddable: 'true', relevanceLanguage: 'en', safeSearch: 'strict', maxResults: '50' },
    100,
  );
  (searched[course] ??= []).push(q);
  saveJson('searched.json', searched);
  await addDetails(r.items?.map((x) => x.id.videoId) ?? [], [course]);
  savePool();
}

// ---------- picking ----------

type Override = { drop?: string[]; add?: { topic: string; id: string }[]; dropChannels?: string[] };
const overrides = () => readJson<Record<string, Override>>('overrides.json', {});
const LONG = 25 * 60;
/** Language courses, and the words a video about that language must contain. */
const LANGUAGE: Record<string, RegExp> = {
  french: /\bfrench\b|\bfrançais/i,
  arabic: /\barabic\b/i,
  yoruba: /\byoruba\b|\byorùbá/i,
  igbo: /\bigbo\b/i,
  hausa: /\bhausa\b/i,
};
const GENERAL_LINGUISTICS = new Set(['The Ling Space', 'NativLang']);
const MAX = 15;

function candidates(course: string) {
  const info = topicsOf(course)!;
  const tags = tagsOf(course);
  const o = overrides()[course] ?? {};
  const drop = new Set(o.drop ?? []);
  const dropChannels = new Set(o.dropChannels ?? []);
  const lang = LANGUAGE[course];
  const vids = [...pool.values()].filter(
    (v) =>
      v.tags.some((t) => tags.has(t)) &&
      !drop.has(v.id) &&
      !dropChannels.has(v.channel) &&
      // A language course gets videos about that language; general linguistics only from its own channels.
      (!lang || lang.test(`${v.title} ${v.description}`) || GENERAL_LINGUISTICS.has(v.channel)),
  );
  const engineering = ['eng', 'env'].includes(facultyOf(course));
  // Intro and core topics; a master's-only course (LLM, MBA, MPA, MPH) has only master's ones.
  const firstDegree = info.topics.filter((t) => t.stage !== 'masters');
  const topics = firstDegree.length ? firstDegree : info.topics;
  return {
    info,
    o,
    topics,
    per: topics.map((t) => ({
      t,
      list: vids
        .filter((v) => !EXAM.test(v.title) || EXAM.test(t.title))
        // Yale's medical research series belongs to health courses only.
        .filter((v) => facultyOf(course) === 'health' || !/Understanding Medical Research/.test(v.title))
        .filter((v) => !engineering || !FUNDAMENTALS.has(v.channel) || FOUNDATION_TOPIC.test(t.title))
        .map((v) => ({ v, s: score(t, v) - (v.seconds > LONG ? 2 : 0) + Math.min(2, Math.log10(v.views + 1) / 3) }))
        .filter((x) => x.s >= 12)
        .sort((a, b) => b.s - a.s),
    })),
  };
}

function pick(course: string) {
  const { info, o, per } = candidates(course);
  const chosen: { topic: string; v: Video; s: number }[] = [];
  const has = new Set<string>();
  const perChannel = new Map<string, number>();
  let long = 0;
  const lang = LANGUAGE[course];
  const can = (v: Video) =>
    !has.has(v.id) &&
    (perChannel.get(v.channel) ?? 0) < 4 &&
    (v.seconds <= LONG || long < 2) &&
    // At most 3 school-level fundamentals on an engineering course.
    (!['eng', 'env'].includes(facultyOf(course)) || !FUNDAMENTALS.has(v.channel) ||
      chosen.filter((c) => FUNDAMENTALS.has(c.v.channel)).length < 3) &&
    // At most 2 general linguistics videos in a language course.
    (!lang || !GENERAL_LINGUISTICS.has(v.channel) || chosen.filter((c) => GENERAL_LINGUISTICS.has(c.v.channel)).length < 2);
  const take = (topic: string, v: Video, s: number) => {
    chosen.push({ topic, v, s });
    has.add(v.id);
    perChannel.set(v.channel, (perChannel.get(v.channel) ?? 0) + 1);
    if (v.seconds > LONG) long++;
  };
  for (const a of o.add ?? []) {
    const v = pool.get(a.id);
    if (!v) throw new Error(`${course}: override video ${a.id} isn't in the pool`);
    if (!info.topics.some((t) => t.id === a.topic)) throw new Error(`${course}: no topic ${a.topic}`);
    take(a.topic, v, 99);
  }
  // Rounds: each topic's best unused match, strongest first, so videos spread across topics.
  // --reviewed: only the videos a person checked and pinned in overrides.json (the final build).
  for (let round = 0; round < 3 && chosen.length < MAX && !args.includes('--reviewed'); round++) {
    const bids = per
      .map(({ t, list }) => ({ t, best: list.find((x) => can(x.v)) }))
      .filter((x) => x.best && (round === 0 || x.best.s >= 16) && chosen.filter((c) => c.topic === x.t.id).length === round)
      .sort((a, b) => b.best!.s - a.best!.s);
    for (const { t, best } of bids) {
      if (chosen.length >= MAX) break;
      const again = per.find((p) => p.t.id === t.id)!.list.find((x) => can(x.v));
      if (again) take(t.id, again.v, again.s);
    }
  }
  const order = info.topics.map((t) => t.id);
  chosen.sort((a, b) => order.indexOf(a.topic) - order.indexOf(b.topic));
  saveJson(
    `pick-${course}.json`,
    chosen.map(({ topic, v, s }) => ({ topic, id: v.id, score: Math.round(s), minutes: Math.round(v.seconds / 60), channel: v.channel, title: v.title })),
  );
  return chosen.length;
}

function build(course: string) {
  const info = topicsOf(course);
  const file = join(WORK, `pick-${course}.json`);
  if (!info || !existsSync(file)) return null;
  const picks = JSON.parse(readFileSync(file, 'utf8')) as { topic: string; id: string }[];
  if (!picks.length) return 0;
  const lib: VideoLibrary = {
    id: courseLibrary(course),
    topics: info.topics
      .filter((t) => picks.some((p) => p.topic === t.id))
      .map((t) => ({
        id: t.id,
        stage: t.stage,
        flashcards: [],
        videos: picks
          .filter((p) => p.topic === t.id)
          .map((p) => {
            const v = pool.get(p.id);
            if (!v) throw new Error(`${course}/${t.id}: no video ${p.id}`);
            return { youtubeId: v.id, title: v.title, channel: v.channel, seconds: v.seconds };
          }),
      })),
  };
  writeFileSync(join(OUT, `${lib.id}.json`), JSON.stringify(lib));
  return picks.length;
}

// ---------- steps ----------

const list = (only ?? [...COURSES]).filter((c) => (COURSES as readonly string[]).includes(c));
try {
  if (step === 'harvest') {
    await harvest();
  } else if (step === 'search') {
    const below = Number(flag('below') ?? 8);
    for (const course of list) {
      if (!topicsOf(course)) continue;
      const n = pick(course);
      if (n >= below && !flag('query')) continue;
      await search(course, flag('query') ?? '');
      console.log(`  ${course}: ${n} -> ${pick(course)} after search; ${used()} units today`);
    }
  } else if (step === 'pick') {
    for (const course of list) if (topicsOf(course)) console.log(`${course}: ${pick(course)}`);
  } else if (step === 'build') {
    let total = 0;
    for (const course of list) {
      const n = build(course);
      if (n === null) continue;
      total += n;
      console.log(`${course}: ${n}`);
    }
    console.log(`${total} videos`);
  } else if (step === 'report') {
    const counts = list.map((c) => [c, readJson<unknown[]>(`pick-${c}.json`, []).length] as const);
    for (const [c, n] of counts) console.log(`${c}: ${n}`);
  } else {
    throw new Error('Steps: harvest, search, pick, build, report');
  }
} catch (e) {
  if (!(e instanceof OutOfQuota)) throw e;
  savePool();
  console.log(`Stopped: ${e.message}. Re-run tomorrow to carry on.`);
}
console.log(`${used()} units used today (${day()}), pool ${pool.size}`);
