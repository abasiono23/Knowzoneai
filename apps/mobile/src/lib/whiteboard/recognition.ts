import { Platform } from 'react-native';

import { speechLocale } from './locale';

/** Listening in the web version: the browser's own speech recognition (Chrome, Edge, Safari). */

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
