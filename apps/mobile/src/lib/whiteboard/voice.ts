/**
 * Understanding what students say to Kora: "Hey Kora" and the question after it, "okay" to stop her, and her
 * own voice coming back. The listening itself is in recognition.ts (the browser's speech recognition) and
 * recognition.native.ts (the phone's: Google's on Android, Apple's on iPhone). Both are free, and no audio
 * reaches Knowzone. Where neither works, the board works by typing.
 */

import { Platform } from 'react-native';

export { canListen, listen, type Listener } from './recognition';
export { speechLocale } from './locale';

/**
 * The message for a listening problem (blocked, noMic, noService, network or language), worded for the
 * browser on the web and for the phone in the app.
 */
export function problemKey(problem: string) {
  const app = Platform.OS !== 'web';
  if (problem === 'blocked') return app ? 'board.blockedApp' : 'board.blocked';
  if (problem === 'noMic') return 'board.noMic';
  if (problem === 'noService') return 'board.noService';
  if (problem === 'language') return app ? 'board.languageApp' : 'board.language';
  return 'board.network';
}

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

/** Lower case, without accents, tone marks or punctuation, so "Ó tó!" and "o to" compare equal. */
const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** What students say to make Kora stop talking, in each of the app's languages (all heard everywhere). */
const STOP = new Set(
  [
    // English and Pidgin
    'ok', 'okay', 'ok ok', 'okay okay', 'okay thanks', 'ok thanks', 'okay thank you', 'stop', 'stop it', 'please stop',
    'wait', 'hold on', 'enough', 'thats enough', 'thats fine', 'alright', 'all right', 'got it', 'i got it',
    'thanks', 'thank you', 'e don do', 'e do', 'abeg stop', 'no wahala',
    // French, Spanish, Portuguese
    'd accord', 'arrete', 'arrete toi', 'ca suffit', 'merci', 'vale', 'para', 'basta', 'gracias', 'de acuerdo',
    'pare', 'chega', 'obrigado', 'obrigada', 'ta bom', 'esta bem', 'certo',
    // Swahili, Arabic
    'sawa', 'acha', 'simama', 'asante', 'inatosha', 'حسنا', 'توقف', 'كفى', 'شكرا',
    // Yoruba, Hausa, Igbo
    'o da', 'o to', 'duro', 'e se', 'to', 'ya isa', 'tsaya', 'na gode', 'o di mma', 'kwusi', 'daalu',
  ].map(plain),
);

/** "Okay", "stop", "thank you" and the like, said on their own (with or without "Kora"). */
export function isStopPhrase(text: string) {
  const words = plain(text)
    .split(' ')
    .filter((w) => !soundsLikeKora(letters(w)) && w !== 'hey' && w !== 'hi');
  return words.length > 0 && words.length <= 4 && STOP.has(words.join(' '));
}

/**
 * Whether something heard is just Kora's own voice coming back through the microphone: most of its
 * words are in what she has just said. (Browsers cancel most echo themselves; this catches the rest.)
 */
export function isEcho(heard: string, said: string) {
  const all = plain(heard).split(' ').filter(Boolean);
  if (!all.length) return true;
  // Short everyday words ("what", "is", "the") are in everything she says, so only longer words count.
  const long = all.filter((w) => w.length >= 5);
  const words = long.length ? long : all;
  const hers = new Set(plain(said).split(' '));
  return words.filter((w) => hers.has(w)).length / words.length >= 0.6;
}
