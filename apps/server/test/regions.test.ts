import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { EXAM_SUBJECTS_OF, EXAMS, examsForRegion, paperFormat, REGION_EXAMS, syllabusOf } from '../src/data/exams.js';
import { prisma } from '../src/db.js';
import { useAppSettings } from '../src/services/app-settings.js';
import { citesLetter, wrongSpelling } from '../src/services/exam-spelling.js';
import { allPapers, canOpen, papersFor, usePapers, type Paper } from '../src/services/exams.js';
import { CONSENT, http, signIn } from './helpers.js';

/**
 * Study regions: the country an account studies in, the exams that go with it, and the practice papers
 * for students in the United States (SAT, ACT, AP), the United Kingdom (GCSE, A-level), Kenya (KCSE)
 * and South Africa (Matric).
 */
const PROFILE = {
  learnerType: 'exam',
  examGoals: ['sat'],
  subjects: ['Mathematics'],
  language: 'en',
  dailyMinutes: 20,
};

const question = (n: number, topic: string, answer: number) => ({
  n,
  topic,
  q: `Question ${n}?`,
  options: ['w', 'x', 'y', 'z'],
  answer,
  explanation: `Because ${n}.`,
});
const SAT: Paper[] = [1, 2].map((number) => ({
  id: `sat-math-p${number}`,
  exam: 'sat',
  subject: 'math',
  year: null,
  number,
  source: 'ai',
  minutes: 70,
  questions: [question(1, 'Percentages', 2)],
}));
const LICENSED: Paper = {
  id: 'jamb-physics-2019',
  exam: 'jamb',
  subject: 'physics',
  year: 2019,
  number: null,
  source: 'licensed',
  credit: 'Licensed',
  minutes: 27,
  questions: [question(1, 'Motion', 1)],
};

describe('study region on the account', () => {
  it('is Nigeria for an account that never chose one, on /me and in settings', async () => {
    const { as } = await signIn();
    expect((await as.get('/me').expect(200)).body.user.region).toBe('NG');
    expect((await as.get('/me/settings').expect(200)).body.settings.region).toBe('NG');
    // Onboarding answers from an app without the region step leave it alone.
    const saved = await as.post('/me/personalization', PROFILE).expect(200);
    expect(saved.body.user.region).toBe('NG');
    expect((await as.get('/me/personalization')).body.personalization.region).toBeNull();
  });

  it('stores the country chosen on the sign-up form with the new account', async () => {
    const { as, user } = await signIn({ email: 'maya@example.com', metadata: { name: 'Maya', consent: CONSENT, region: 'US' } });
    expect(user).toMatchObject({ region: 'US', regionChosen: true });
    expect((await as.get('/me/settings')).body.settings.region).toBe('US');
    // Onboarding answers without a region keep it, and the first app language still follows them.
    const saved = await as.post('/me/personalization', { ...PROFILE, language: 'fr' }).expect(200);
    expect(saved.body.user).toMatchObject({ region: 'US', regionChosen: true });
    expect((await as.get('/me/settings')).body.settings).toMatchObject({ region: 'US', appLanguage: 'fr' });
    // A sign-up without one (Google, Apple, older apps) is asked later; a made-up one is ignored.
    expect((await signIn({ email: 'tobi@example.com' })).user).toMatchObject({ region: 'NG', regionChosen: false });
    expect((await signIn({ email: 'x@example.com', metadata: { name: 'X', consent: CONSENT, region: 'Narnia' } })).user).toMatchObject({ region: 'NG', regionChosen: false });
  });

  it('follows the country chosen in onboarding, and Settings can change it', async () => {
    const { as } = await signIn();
    const saved = await as.post('/me/personalization', { ...PROFILE, region: 'US' }).expect(200);
    expect(saved.body.user).toMatchObject({ region: 'US', regionChosen: true });
    expect((await as.get('/me/personalization')).body.personalization.region).toBe('US');
    expect((await as.get('/me/settings')).body.settings.region).toBe('US');

    const changed = await as.post('/me/settings', { region: 'GB' }).expect(200);
    expect(changed.body.settings.region).toBe('GB');
    expect((await as.get('/me')).body.user.region).toBe('GB');
    // Other settings changes keep it.
    await as.post('/me/settings', { appLanguage: 'fr' }).expect(200);
    expect((await as.get('/me')).body.user.region).toBe('GB');
    // Saving goals again from a screen that doesn't ask the region keeps it too.
    await as.post('/me/personalization', { ...PROFILE, dailyMinutes: 45 }).expect(200);
    expect((await as.get('/me')).body.user.region).toBe('GB');
    // "Another country" is a region as well.
    await as.post('/me/settings', { region: 'ZZ' }).expect(200);
    expect((await as.get('/me')).body.user.region).toBe('ZZ');
  });

  it('keeps Nigeria for settings saved before regions existed', async () => {
    const { as, user } = await signIn();
    await as.post('/me/settings', { appLanguage: 'ha' }).expect(200);
    const stored = (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).settings as Record<string, unknown>;
    const { region: _region, ...before } = stored;
    await prisma.user.update({ where: { id: user.id }, data: { settings: before as never } });
    expect((await as.get('/me')).body.user.region).toBe('NG');
    expect((await as.get('/me/settings')).body.settings).toMatchObject({ region: 'NG', appLanguage: 'ha' });
  });

  it('rejects a region that is not a country code', async () => {
    const { as } = await signIn();
    for (const region of ['usa', 'us', 'Nigeria', '']) await as.post('/me/settings', { region }).expect(400);
    await as.post('/me/personalization', { ...PROFILE, region: 'United States' }).expect(400);
    expect((await as.get('/me')).body.user.region).toBe('NG');
  });
});

describe('exams by study region', () => {
  beforeAll(() => {
    usePapers([LICENSED, ...SAT]);
    useAppSettings({ allFree: false });
  });
  afterAll(() => {
    usePapers(null);
    useAppSettings(null);
  });

  it('knows each region’s exams, and gives none where there are no papers', () => {
    expect(examsForRegion('NG')).toEqual(['jamb', 'waec', 'neco']);
    for (const waec of ['GH', 'SL', 'LR', 'GM']) expect(examsForRegion(waec)).toEqual(['waec']);
    expect(examsForRegion('US')).toEqual(['sat', 'act', 'ap']);
    expect(examsForRegion('GB')).toEqual(['gcse', 'alevel']);
    expect(examsForRegion('KE')).toEqual(['kcse']);
    expect(examsForRegion('ZA')).toEqual(['nsc']);
    // Everywhere else: no papers, so no exams, not Nigeria's.
    for (const none of ['CA', 'IN', 'ZZ']) expect(examsForRegion(none)).toEqual([]);
    // An account from before regions.
    expect(examsForRegion(null)).toEqual(['jamb', 'waec', 'neco']);
    for (const list of Object.values(REGION_EXAMS)) for (const exam of list) expect(EXAMS).toContain(exam);
  });

  it('gives every exam its own subjects, format and syllabus', () => {
    expect(EXAM_SUBJECTS_OF.sat).toEqual(['reading-writing', 'math']);
    expect(EXAM_SUBJECTS_OF.gcse).toEqual(['maths', 'english-language', 'biology', 'chemistry', 'physics']);
    expect(EXAM_SUBJECTS_OF.act).toEqual(['english', 'math', 'reading', 'science']);
    expect(EXAM_SUBJECTS_OF.ap).toEqual(['calculus-ab', 'biology', 'chemistry', 'physics-1', 'us-history', 'english-language']);
    expect(EXAM_SUBJECTS_OF.alevel).toEqual(['maths', 'biology', 'chemistry', 'physics', 'economics']);
    expect(EXAM_SUBJECTS_OF.kcse).toEqual(['mathematics', 'english', 'biology', 'chemistry', 'physics']);
    expect(EXAM_SUBJECTS_OF.nsc).toEqual(['mathematics', 'physical-sciences', 'life-sciences', 'accounting', 'geography']);
    expect(EXAM_SUBJECTS_OF.jamb).toHaveLength(10);
    // The enhanced ACT's sections, and each AP exam's multiple-choice section.
    expect(paperFormat('act', 'english')).toEqual({ questions: 50, minutes: 35 });
    expect(paperFormat('act', 'math')).toEqual({ questions: 45, minutes: 50 });
    expect(paperFormat('act', 'reading')).toEqual({ questions: 36, minutes: 40 });
    expect(paperFormat('act', 'science')).toEqual({ questions: 40, minutes: 40 });
    expect(paperFormat('ap', 'calculus-ab')).toEqual({ questions: 42, minutes: 100 });
    expect(paperFormat('ap', 'biology')).toEqual({ questions: 60, minutes: 90 });
    expect(paperFormat('ap', 'chemistry')).toEqual({ questions: 60, minutes: 90 });
    expect(paperFormat('ap', 'physics-1')).toEqual({ questions: 42, minutes: 85 });
    expect(paperFormat('ap', 'us-history')).toEqual({ questions: 55, minutes: 55 });
    expect(paperFormat('ap', 'english-language')).toEqual({ questions: 45, minutes: 60 });
    // Topic quizzes, not the exams' formats.
    expect(paperFormat('alevel', 'maths')).toEqual({ questions: 30, minutes: 40 });
    expect(paperFormat('kcse', 'mathematics')).toEqual({ questions: 30, minutes: 35 });
    expect(paperFormat('nsc', 'accounting')).toEqual({ questions: 30, minutes: 35 });
    expect(paperFormat('sat', 'reading-writing')).toEqual({ questions: 54, minutes: 64 });
    expect(paperFormat('sat', 'math')).toEqual({ questions: 44, minutes: 70 });
    expect(paperFormat('gcse', 'biology')).toEqual({ questions: 30, minutes: 35 });
    // The Nigerian formats are as they were.
    expect(paperFormat('jamb', 'english')).toEqual({ questions: 60, minutes: 40 });
    expect(paperFormat('jamb', 'physics')).toEqual({ questions: 40, minutes: 27 });
    expect(paperFormat('waec', 'physics')).toEqual({ questions: 50, minutes: 60 });
    expect(paperFormat('neco', 'physics')).toEqual({ questions: 60, minutes: 60 });
    for (const exam of EXAMS)
      for (const subject of EXAM_SUBJECTS_OF[exam]) expect(syllabusOf(exam, subject).length, `${exam} ${subject}`).toBeGreaterThan(5);
    // The same subject name is a different syllabus in a different exam.
    expect(syllabusOf('gcse', 'biology')).toContain('Homeostasis and response');
    expect(syllabusOf('waec', 'biology')).not.toContain('Homeostasis and response');
    expect(syllabusOf('jamb', 'math')).toEqual([]);
    expect(syllabusOf('ap', 'biology')).toContain('Cellular energetics');
    expect(syllabusOf('alevel', 'biology')).not.toContain('Cellular energetics');
    expect(syllabusOf('kcse', 'physics-1')).toEqual([]);
    // No two of a subject's topics may be the same (each is a page on the study site).
    for (const exam of EXAMS)
      for (const subject of EXAM_SUBJECTS_OF[exam])
        expect(new Set(syllabusOf(exam, subject)).size, `${exam} ${subject}`).toBe(syllabusOf(exam, subject).length);
  });

  it('lists the exams with the reader’s region: Nigeria signed out, their own signed in, any on request', async () => {
    const anon = (await http().get('/exams').expect(200)).body;
    expect(anon).toMatchObject({ region: 'NG', regionExams: ['jamb', 'waec', 'neco'] });
    expect(anon.exams.map((e: { id: string }) => e.id)).toEqual(['jamb', 'waec', 'neco', 'sat', 'act', 'ap', 'gcse', 'alevel', 'kcse', 'nsc']);
    const subjects = (id: string) =>
      anon.exams.find((e: { id: string }) => e.id === id).subjects.map((s: { id: string }) => s.id);
    expect(subjects('sat')).toEqual(['reading-writing', 'math']);
    expect(subjects('gcse')).toEqual(['maths', 'english-language', 'biology', 'chemistry', 'physics']);
    expect(subjects('waec')).toHaveLength(10);

    const { as } = await signIn();
    expect((await as.get('/exams')).body).toMatchObject({ region: 'NG', regionExams: ['jamb', 'waec', 'neco'] });
    await as.post('/me/settings', { region: 'US' }).expect(200);
    expect((await as.get('/exams')).body).toMatchObject({ region: 'US', regionExams: ['sat', 'act', 'ap'] });
    expect((await as.get('/exams?region=GH')).body).toMatchObject({ region: 'GH', regionExams: ['waec'] });
    expect((await as.get('/exams?region=GB')).body).toMatchObject({ region: 'GB', regionExams: ['gcse', 'alevel'] });
    expect((await as.get('/exams?region=KE')).body).toMatchObject({ region: 'KE', regionExams: ['kcse'] });
    expect((await as.get('/exams?region=ZA')).body).toMatchObject({ region: 'ZA', regionExams: ['nsc'] });
    expect((await as.get('/exams?region=CA')).body).toMatchObject({ region: 'CA', regionExams: [] });
  });

  it('opens SAT papers like any other: the first is the free sample, and only the exam’s own subjects exist', async () => {
    const list = (await http().get('/exams/sat/math').expect(200)).body;
    expect(list.topics).toContain('Percentages');
    expect(list.papers.map((p: { id: string; locked: boolean }) => [p.id, p.locked])).toEqual([
      ['sat-math-p1', false],
      ['sat-math-p2', true],
    ]);
    await http().get('/exams/sat/physics').expect(400);
    await http().get('/exams/jamb/math').expect(400);
    await http().get('/exams/gcse/mathematics').expect(400);

    const { as, user } = await signIn();
    // A student in another region can still open it: the region decides what shows first, not what opens.
    expect((await as.get('/exams/papers/sat-math-p1').expect(200)).body.paper).toMatchObject({
      exam: 'sat',
      subject: 'math',
      minutes: 70,
    });
    expect((await as.get('/exams/papers/sat-math-p2').expect(403)).body.reason).toBe('pro');
    const sat = await as.post('/exams/papers/sat-math-p1/attempts', { mode: 'practice', answers: [2], seconds: 30 }).expect(201);
    expect(sat.body.attempt).toMatchObject({ score: 1, total: 1 });
    await prisma.user.update({ where: { id: user.id }, data: { plan: 'PRO' } });
    await as.get('/exams/papers/sat-math-p2').expect(200);
  });

  it('decides who may open a paper by the same rule for every exam', () => {
    const [first, second] = SAT as [Paper, Paper];
    expect(canOpen('FREE', first)).toBe(true);
    expect(canOpen('PLUS', first)).toBe(true);
    expect(canOpen(undefined, first)).toBe(true);
    expect(canOpen('FREE', second)).toBe(false);
    expect(canOpen('PLUS', second)).toBe(false);
    expect(canOpen('PRO', second)).toBe(true);
    expect(canOpen('FREE', LICENSED)).toBe(false);
    expect(canOpen('PRO', LICENSED)).toBe(true);
    useAppSettings({ allFree: true });
    expect(canOpen('FREE', second)).toBe(true);
    useAppSettings({ allFree: false });
  });

  it('finds a student’s own exams by subject, and another region’s only by name', async () => {
    const found = async (query: string) =>
      (await http().get(`/search/all?${query}`).expect(200)).body.exams.map((e: { exam: string; subject: string }) => `${e.exam}/${e.subject}`);
    // No region (older apps): Nigeria's exams, never SAT or GCSE.
    expect(await found('q=biology')).toEqual(['jamb/biology', 'waec/biology', 'neco/biology']);
    expect(await found('q=sat+math')).toEqual([]);
    expect(await found('q=biology&region=NG')).toEqual(['jamb/biology', 'waec/biology', 'neco/biology']);
    expect(await found('q=biology&region=GB')).toEqual(['gcse/biology', 'alevel/biology']);
    expect(await found('q=biology&region=GH')).toEqual(['waec/biology']);
    expect(await found('q=math&region=US')).toEqual(['sat/math', 'act/math']);
    expect(await found('q=biology&region=KE')).toEqual(['kcse/biology']);
    expect(await found('q=accounting&region=ZA')).toEqual(['nsc/accounting']);
    expect(await found('q=biology&region=CA')).toEqual([]);
    // Asked for by name, another region's exam is found.
    expect(await found('q=gcse+biology&region=NG')).toEqual(['gcse/biology']);
    expect(await found('q=waec+biology&region=US')).toEqual(['waec/biology']);
    expect(await found('q=matric+accounting&region=NG')).toEqual(['nsc/accounting']);
    expect(await found('q=a-level+economics&region=NG')).toEqual(['alevel/economics']);
  });
});

describe('the practice papers on disk', () => {
  beforeAll(() => usePapers(null));
  /** Practice papers per subject: six for the first five exams, two for the ones added after them. */
  const count = (exam: (typeof EXAMS)[number]) => (['act', 'ap', 'alevel', 'kcse', 'nsc'].includes(exam) ? 2 : 6);

  it('are full papers for every exam and subject, numbered in order, in the exam’s format and on its syllabus', () => {
    for (const exam of EXAMS)
      for (const subject of EXAM_SUBJECTS_OF[exam]) {
        const own = papersFor(exam, subject).filter((p) => p.source === 'ai');
        expect(own.map((p) => p.id), `${exam} ${subject}`).toEqual(Array.from({ length: count(exam) }, (_, i) => `${exam}-${subject}-p${i + 1}`));
        const format = paperFormat(exam, subject);
        const topics = syllabusOf(exam, subject);
        // The same question may not come back in another of the subject's papers.
        const seen = new Set<string>();
        for (const p of own) {
          // Never a "past paper": written by AI, with no year.
          expect(p).toMatchObject({ source: 'ai', year: null, minutes: format.minutes });
          expect(p.questions, p.id).toHaveLength(format.questions);
          for (const q of p.questions) {
            const at = `${p.id} q${q.n}`;
            expect(q.options, at).toHaveLength(4);
            expect(new Set(q.options.map((o) => o.trim().toLowerCase())).size, at).toBe(4);
            expect(q.answer, at).toBeLessThan(4);
            expect(topics, at).toContain(q.topic);
            // American English for the SAT, ACT and AP; British English for GCSE, A-level, KCSE and Matric.
            expect(wrongSpelling(exam, [q.passage ?? '', q.q, ...q.options, q.explanation].join(' ')), at).toBeNull();
            // Options are shuffled after writing, so an explanation can't name one by its letter.
            expect(citesLetter(exam, q.explanation), at).toBe(false);
            const key = `${q.passage ?? ''}|${q.q}|${[...q.options].sort().join('|')}`;
            expect(seen.has(key), `${at} is a repeat`).toBe(false);
            seen.add(key);
          }
        }
      }
  });

  it('keeps the first paper of every subject as the free sample, however many there are', () => {
    useAppSettings({ allFree: false });
    for (const exam of EXAMS)
      for (const subject of EXAM_SUBJECTS_OF[exam])
        expect(papersFor(exam, subject).map((p) => canOpen('FREE', p)), `${exam} ${subject}`).toEqual(
          papersFor(exam, subject).map((p) => p.number === 1),
        );
    useAppSettings(null);
  });
});

describe('house style by exam', () => {
  it('catches British spelling in SAT text and American spelling in GCSE text', () => {
    expect(wrongSpelling('sat', 'The colour of the centre')).toBe('colour');
    expect(wrongSpelling('sat', 'She organised 5 metres of fibre')).toBeTruthy();
    expect(wrongSpelling('sat', 'The color of the center was analyzed in math class')).toBeNull();
    expect(wrongSpelling('gcse', 'The color of the center')).toBe('color');
    expect(wrongSpelling('gcse', 'a rod 3 meters long')).toBeTruthy();
    expect(
      wrongSpelling('gcse', 'The colour of the centre was analysed; sulfur dioxide; a thermometer and the perimeter; a prize of that size'),
    ).toBeNull();
    // The ACT and AP are American like the SAT; A-level, KCSE and Matric British like GCSE.
    for (const exam of ['act', 'ap'] as const) expect(wrongSpelling(exam, 'The colour of the centre')).toBe('colour');
    for (const exam of ['alevel', 'kcse', 'nsc'] as const) {
      expect(wrongSpelling(exam, 'The color of the center')).toBe('color');
      expect(wrongSpelling(exam, 'Sulphur burns with a blue flame; the colour was analysed')).toBeNull();
    }
    // The Nigerian exams have no such rule.
    expect(wrongSpelling('waec', 'color and colour')).toBeNull();
  });

  it('catches explanations that name an option by letter, except in the Nigerian papers', () => {
    expect(citesLetter('sat', 'Option B is wrong because it adds instead of subtracting.')).toBe(true);
    expect(citesLetter('gcse', 'The others overstate (A), ignore the data (C) or reverse it.')).toBe(true);
    expect(citesLetter('sat', 'P(A) = 0.4, so the chance of both is 0.4 × 0.5.')).toBe(false);
    expect(citesLetter('gcse', '“An apple” is right because the next word starts with a vowel sound.')).toBe(false);
    for (const exam of ['act', 'ap', 'alevel', 'kcse', 'nsc'] as const) expect(citesLetter(exam, 'Option B is wrong.')).toBe(true);
    expect(citesLetter('jamb', 'The rhyme scheme is day (A), sharp (B).')).toBe(false);
  });
});
