import { ExpoSpeechRecognitionModule as Speech } from 'expo-speech-recognition';
import { Platform } from 'react-native';

import { speechLocale } from './locale';

/**
 * Listening in the phone app: the phone's own speech recognition (Google's on Android, Apple's on iPhone),
 * through expo-speech-recognition. It behaves like the browser version (recognition.ts), so "Hey Kora",
 * follow-ups and "okay" work the same way everywhere.
 *
 * The phone has one recogniser for the whole app, so only one listener owns it at a time: starting a new
 * one (the board opening while "Hey Kora" was listening) takes it over, and events from a session that
 * was just stopped are ignored.
 */

export type Listener = { stop: () => void };
type Handlers = { onFinal: (text: string) => void; onPartial?: (text: string) => void; onError?: (code: string) => void };

let owner: object | null = null;
/** When the last session was stopped: the recogniser needs a moment before it can start again. */
let lastStop = 0;
const SETTLE_MS = 400;

export const canListen = () => {
  try {
    return Speech.isRecognitionAvailable();
  } catch {
    return false;
  }
};

/** iPhones only give a finished sentence when listening ends, so a pause this long counts as the end. */
const IOS_PAUSE_MS = 1200;
/** Restarts that fail in a row (the recogniser busy or gone) before giving up. */
const MAX_FAILS = 6;

export function listen(language: string, { onFinal, onPartial, onError }: Handlers): Listener | null {
  if (!canListen()) return null;
  const me = {};
  let stopped = false;
  let started = false;
  let fails = 0;
  // Phones that can't listen in a language (often Yoruba, Igbo or Hausa) fall back to Nigerian English.
  let locale = speechLocale(language);
  let partial = '';
  let pause: ReturnType<typeof setTimeout> | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  const mine = () => owner === me && !stopped;

  const finish = (text: string) => {
    clearTimeout(pause);
    partial = '';
    onPartial?.('');
    if (text) onFinal(text);
  };
  const giveUp = (code: string) => {
    stopped = true;
    onError?.(code);
  };
  const again = (ms: number) => {
    clearTimeout(retry);
    retry = setTimeout(() => mine() && begin(), ms);
  };

  const subs = [
    Speech.addListener('start', () => {
      if (!mine()) return;
      started = true;
      fails = 0;
    }),
    Speech.addListener('result', (e) => {
      if (!mine()) return;
      const text = e.results[0]?.transcript?.trim() ?? '';
      if (e.isFinal) return finish(text);
      partial = text;
      onPartial?.(text);
      if (Platform.OS === 'ios') {
        clearTimeout(pause);
        pause = setTimeout(() => {
          if (!mine() || !partial) return;
          finish(partial);
          // A fresh session, so the next sentence doesn't come with this one in front of it.
          Speech.abort();
        }, IOS_PAUSE_MS);
      }
    }),
    Speech.addListener('error', (e) => {
      if (!mine()) return;
      switch (e.error) {
        case 'not-allowed':
          return giveUp('blocked');
        case 'service-not-allowed':
          return giveUp('noService');
        case 'audio-capture':
          return giveUp('noMic');
        case 'language-not-supported':
          if (locale !== 'en-NG') locale = 'en-NG';
          else giveUp('language');
          return;
        case 'network':
          return onError?.('network');
        case 'busy':
        case 'client':
        case 'too-many-requests':
        case 'unknown':
          if (++fails >= MAX_FAILS) giveUp('noService');
          else if (!started) again(800);
          return;
        default:
        // "no-speech", "speech-timeout", "aborted", "interrupted": a quiet moment or a phone call.
        // Listening simply starts again below.
      }
    }),
    Speech.addListener('end', () => {
      if (!mine()) return;
      started = false;
      if (partial) finish(partial);
      again(250);
    }),
  ];

  const begin = () => {
    if (!mine()) return;
    try {
      Speech.start({
        lang: locale,
        interimResults: true,
        // Keeps listening between sentences, and on Android 13+ also stops the beep at every start.
        continuous: true,
        maxAlternatives: 1,
        contextualStrings: ['Kora', 'Hey Kora'],
        // iPhone: cancel Kora's own voice from the speaker, and keep her voice on the speaker.
        iosVoiceProcessingEnabled: true,
        iosCategory: { category: 'playAndRecord', categoryOptions: ['defaultToSpeaker', 'allowBluetooth'], mode: 'default' },
      });
    } catch {
      if (++fails >= MAX_FAILS) giveUp('noService');
      else again(800);
    }
  };

  // Ask for the microphone the first time (Android and iPhone show their own prompt), then start once the
  // recogniser has settled from any session that just ended.
  owner = me;
  void (async () => {
    try {
      const now = await Speech.getPermissionsAsync();
      const asked = now.granted ? now : await Speech.requestPermissionsAsync();
      if (!mine()) return;
      if (!asked.granted) return giveUp('blocked');
    } catch {
      return giveUp('blocked');
    }
    again(Math.max(0, lastStop + SETTLE_MS - Date.now()));
  })();

  return {
    stop: () => {
      if (stopped && owner !== me) return;
      stopped = true;
      clearTimeout(pause);
      clearTimeout(retry);
      subs.forEach((s) => s.remove());
      if (owner === me) {
        owner = null;
        lastStop = Date.now();
        try {
          Speech.abort();
        } catch {
          // Already stopped.
        }
      }
    },
  };
}
