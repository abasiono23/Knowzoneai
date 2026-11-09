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

/** "Kora" as browsers tend to hear it. */
const WAKE = /\b(?:hey|hi|okay|ok)?[\s,]*(?:kora|cora|korra|corra|kor a)\b[\s,.!?]*/i;

/** Splits a heard sentence at the wake word: what came after it, or null if Kora wasn't called. */
export function afterWake(text: string): string | null {
  const m = WAKE.exec(text);
  return m ? text.slice(m.index + m[0].length).trim() : null;
}

/** "Open a whiteboard" and the like, so the command itself isn't sent as a question. */
export const isOpenBoard = (text: string) => /^(?:please\s+)?(?:open|show|start|bring)\b.*\bboard\b/i.test(text.trim());

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
  const begin = () => {
    rec = new Ctor();
    rec.lang = speechLocale(language);
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
    rec.onerror = (e) => {
      // "no-speech" and "aborted" just mean a quiet moment; the restart below handles them.
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        stopped = true;
        onError?.('blocked');
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') onError?.(e.error);
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
