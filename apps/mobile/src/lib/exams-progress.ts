import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ExamId, ExamSubjectId, Paper } from './exams';

/**
 * Where a student is in a paper, kept on the device so leaving it (for the tutor, a video, another
 * app) and coming back carries on from the same question. Cleared when the paper is handed in.
 */
export type Sitting = {
  i: number;
  answers: number[];
  checked: boolean[];
  /** Time spent so far; a timed paper's clock is paused while the student is away. */
  seconds: number;
};

/** A paper in progress, as listed under "Carry on where you stopped". */
export type OpenSitting = {
  id: string;
  mode: 'practice' | 'timed';
  exam: ExamId;
  subject: ExamSubjectId;
  year: number | null;
  number: number | null;
  /** The question they're on (from 0), and how many there are. */
  i: number;
  total: number;
  updatedAt: number;
};

const key = (id: string, mode: string) => `knowzone.sitting.${id}.${mode}`;
const INDEX = 'knowzone.sittings';

export const sitHref = (s: Pick<OpenSitting, 'id' | 'mode'>) => `/exams/paper/${s.id}/sit?mode=${s.mode}`;

async function readIndex(): Promise<Record<string, OpenSitting>> {
  try {
    return JSON.parse((await AsyncStorage.getItem(INDEX)) ?? '{}') as Record<string, OpenSitting>;
  } catch {
    return {};
  }
}
/** Index writes are queued, so quick saves never overwrite each other. */
let queue = Promise.resolve();
function updateIndex(change: (all: Record<string, OpenSitting>) => void) {
  queue = queue
    .then(async () => {
      const all = await readIndex();
      change(all);
      await AsyncStorage.setItem(INDEX, JSON.stringify(all));
    })
    .catch(() => {});
  return queue;
}

/** Papers in progress, the most recent first. */
export async function openSittings(): Promise<OpenSitting[]> {
  await queue;
  return Object.values(await readIndex()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function loadSitting(id: string, mode: string, questions: number): Promise<Sitting | null> {
  try {
    const raw = await AsyncStorage.getItem(key(id, mode));
    if (!raw) return null;
    const s = JSON.parse(raw) as Sitting;
    // A paper that changed since (a different number of questions) starts again.
    if (s.answers?.length !== questions || s.checked?.length !== questions) return null;
    return { ...s, i: Math.max(0, Math.min(questions - 1, s.i | 0)), seconds: Math.max(0, s.seconds | 0) };
  } catch {
    return null;
  }
}

export function saveSitting(paper: Paper, mode: 'practice' | 'timed', s: Sitting) {
  AsyncStorage.setItem(key(paper.id, mode), JSON.stringify(s)).catch(() => {});
  const { id, exam, subject, year, number } = paper;
  void updateIndex((all) => {
    all[`${id}.${mode}`] = { id, mode, exam, subject, year, number, i: s.i, total: s.answers.length, updatedAt: Date.now() };
  });
}

export function clearSitting(id: string, mode: string) {
  AsyncStorage.removeItem(key(id, mode)).catch(() => {});
  void updateIndex((all) => {
    delete all[`${id}.${mode}`];
  });
  if (current === sitHref({ id, mode: mode as OpenSitting['mode'] })) current = null;
}

/**
 * The paper the student is in the middle of in this visit, so "Past Questions" in the sidebar takes
 * them straight back to it. Forgotten when they hand it in or leave it with the close button.
 */
let current: string | null = null;
export const currentPaper = () => current;
export const setCurrentPaper = (href: string | null) => {
  current = href;
};
