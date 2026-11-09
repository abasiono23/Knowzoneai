import { Platform } from 'react-native';

/**
 * Listening for "Hey Kora" and the question that follows, with the browser's own speech recognition
 * (Chrome and Edge; free, and no audio reaches Knowzone). Elsewhere, and in the phone app, the board
 * works by typing instead.
 */

type Result = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<Result> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function recognitionClass(): (new () => Recognition) | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return ((w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => Recognition) | undefined) ?? null;
}

export const canListen = () => !!recognitionClass();

/** The app's language as a speech-recognition locale. Nigerian Pidgin is heard as Nigerian English. */
const LOCALES: Record<string, string> = {
  en: 'en-NG',
  pcm: 'en-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
  ha: 'ha-NG',
  fr: 'fr-FR',
  ar: 'ar-SA',
  sw: 'sw-KE',
  pt: 'pt-PT',
  es: 'es-ES',
};
export const speechLocale = (language: string) => LOCALES[language.split('-')[0]!] ?? 'en-NG';

/**
 * "Kora" as speech recognition actually writes it, especially in Nigerian and other African accents:
 * the browser picks the nearest real word it knows.
 */
const KORA = new Set([
  'kora',
  'cora',
  'korra',
  'corra',
  'koura',
  'kura',
  'kola',
  'cola',
  'korea',
  'kara',
  'cara',
  'carra',
  'quora',
  'gora',
  'goura',
  'koora',
  'kohra',
  'coral',
  'kraa',
  'krah',
  'kore',
  'core',
  'corah',
  'korah',
  'kurra',
  'chora',
]);
/** Everyday words among those: they only count straight after a greeting ("hey cola", not "the core"). */
const EVERYDAY = new Set(['cola', 'korea', 'core', 'coral', 'quora', 'cara']);
const GREETING = new Set(['hey', 'hi', 'hay', 'hei', 'he', 'a', 'eh', 'okay', 'ok', 'o', 'yo', 'hello']);
/** The same word written together with the greeting: "heykora", "akora", "hakora". */
const JOINED = /^(?:hey|hi|hay|ha|a|eh|ok)(kora|cora|kola|cola|korra|kara|cara)$/;

const letters = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');

/** Edit distance, for spellings not in the list ("korra", "kooraa"). */
function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep;
    }
  }
  return row[b.length]!;
}
const soundsLikeKora = (w: string) => KORA.has(w) || (/^[kcgq]/.test(w) && w.length <= 6 && distance(w, 'kora') <= 1);

/**
 * Splits a heard sentence at "Kora": what came after it, or null if Kora wasn't called. "Kora" counts
 * after a greeting ("hey Kora"), or as one of the first two words, so a question that happens to
 * mention cola isn't taken as a call.
 */
export function afterWake(text: string): string | null {
  const words = text.trim().split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const w = letters(words[i]!);
    const greeted = i > 0 && GREETING.has(letters(words[i - 1]!));
    if (JOINED.test(w) || (soundsLikeKora(w) && (greeted || (i < 2 && !EVERYDAY.has(w)))))
      return words
        .slice(i + 1)
        .join(' ')
        .replace(/^[\s,.!?]+/, '')
        .trim();
  }
  return null;
}

/** "Open a whiteboard" and the like, so the command itself isn't sent as a question. */
export const isOpenBoard = (text: string) =>
  /^(?:please\s+)?(?:open|show|start|bring|give)\b.{0,20}\b(?:white\s?board|board)\b/i.test(text.trim());

export type Listener = { stop: () => void };

/**
 * Listens until stopped, restarting after the pauses browsers impose. Each finished sentence goes to
 * `onFinal`; words still being heard go to `onPartial`. Returns null where listening isn't available.
 */
export function listen(
  language: string,
  {
    onFinal,
    onPartial,
    onError,
  }: { onFinal: (text: string) => void; onPartial?: (text: string) => void; onError?: (code: string) => void },
): Listener | null {
  const Ctor = recognitionClass();
  if (!Ctor) return null;
  let stopped = false;
  let rec: Recognition | null = null;
  // Browsers that can't listen in a language (often Yoruba, Igbo or Hausa) fall back to Nigerian English.
  let locale = speechLocale(language);
  const begin = () => {
    rec = new Ctor();
    rec.lang = locale;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let partial = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]!;
        if (r.isFinal) onFinal(r[0].transcript.trim());
        else partial += r[0].transcript;
      }
      onPartial?.(partial.trim());
    };
    // Problems are reported as blocked, noMic, network or language. "no-speech" and "aborted" just
    // mean a quiet moment, and the restart below handles them.
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        stopped = true;
        onError?.('blocked');
      } else if (e.error === 'audio-capture') {
        stopped = true;
        onError?.('noMic');
      } else if (e.error === 'language-not-supported') {
        if (locale !== 'en-NG') locale = 'en-NG';
        else {
          stopped = true;
          onError?.('language');
        }
      } else if (e.error === 'network') onError?.('network');
    };
    rec.onend = () => {
      if (!stopped) setTimeout(() => !stopped && begin(), 250);
    };
    try {
      rec.start();
    } catch {
      onError?.('start');
    }
  };
  begin();
  return {
    stop: () => {
      stopped = true;
      rec?.stop();
    },
  };
}
