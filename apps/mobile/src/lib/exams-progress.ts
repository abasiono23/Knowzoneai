import AsyncStorage from '@react-native-async-storage/async-storage';

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

const key = (id: string, mode: string) => `knowzone.sitting.${id}.${mode}`;

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

export function saveSitting(id: string, mode: string, s: Sitting) {
  AsyncStorage.setItem(key(id, mode), JSON.stringify(s)).catch(() => {});
}

export function clearSitting(id: string, mode: string) {
  AsyncStorage.removeItem(key(id, mode)).catch(() => {});
}
