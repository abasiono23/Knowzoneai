/**
 * Lip sync for Lessons with Kora: turns the words of a narration, each with its start and end time,
 * into the mouth shape Kora holds at every thirtieth of a second.
 *
 * The mouth set (drawn in apps/mobile/src/lib/kora/mouth.ts), one digit each:
 *   0 rest · 1 M B P · 2 A I (open) · 3 E (wide) · 4 O · 5 U W · 6 F V · 7 L TH · 8 S T D N · 9 small (uh, k, g, h, r)
 *
 * English spelling is read with a small set of rules (digraphs first, silent letters dropped) and a
 * list of very common words that break them. It doesn't need to be a dictionary: what the eye checks
 * is that the lips close on M, B and P, round on O and W, show teeth on F, V and S, and rest in pauses.
 */
export const FPS = 30;

type V = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
const VOWELS = new Set<V>([2, 3, 4, 5, 9]);

/** Words whose spelling misleads the rules. */
const WORDS: Record<string, V[]> = {
  a: [9], an: [9, 8], the: [7, 9], of: [9, 6], to: [8, 5], too: [8, 5], two: [8, 5], do: [8, 5], you: [3, 5], your: [3, 4],
  one: [5, 9, 8], once: [5, 9, 8, 8], who: [5], what: [5, 9, 8], was: [5, 9, 8], were: [5, 9], where: [5, 3], why: [5, 2, 3],
  are: [2], is: [3, 8], i: [2, 3], my: [1, 2, 3], by: [1, 2, 3], we: [5, 3], be: [1, 3], he: [9, 3], she: [8, 3], me: [1, 3],
  have: [9, 2, 6], give: [9, 3, 6], live: [7, 3, 6], come: [9, 9, 1], some: [8, 9, 1], done: [8, 9, 8], does: [8, 9, 8],
  said: [8, 3, 8], says: [8, 3, 8], people: [1, 3, 1, 7], because: [1, 3, 9, 4, 8], know: [8, 4], knows: [8, 4, 8],
  eight: [3, 8], write: [9, 2, 3, 8], right: [9, 2, 3, 8], answer: [2, 8, 8, 9], could: [9, 5, 8], would: [5, 8], should: [8, 5, 8],
  move: [1, 5, 6], moves: [1, 5, 6, 8], water: [5, 4, 8, 9], equal: [3, 9, 5, 7], equals: [3, 9, 5, 7, 8], question: [9, 5, 3, 8, 8, 9, 8],
  hour: [2, 5, 9], our: [2, 5, 9], through: [7, 9, 5], though: [7, 4], enough: [3, 8, 9, 6], exam: [3, 9, 8, 2, 1], kora: [9, 4, 9, 2],
  knowzone: [8, 4, 8, 4, 8], password: [1, 2, 8, 5, 9, 8], passwords: [1, 2, 8, 5, 9, 8, 8], zero: [8, 3, 9, 4], minus: [1, 2, 3, 8, 9, 8],
};

/** Letter groups, longest first. An empty list is a silent group. */
const RULES: [string, V[]][] = [
  ['tion', [8, 9, 8]], ['sion', [8, 9, 8]], ['ture', [8, 9]], ['ough', [4]], ['augh', [4]], ['eigh', [3]], ['igh', [2, 3]],
  ['tch', [8]], ['dge', [8]], ['que', [9]], ['ous', [9, 8]], ['ear', [3, 9]], ['air', [3, 9]], ['oor', [4]], ['our', [4]],
  ['th', [7]], ['sh', [8]], ['ch', [8]], ['ph', [6]], ['wh', [5]], ['qu', [9, 5]], ['ck', [9]], ['ng', [9]], ['kn', [8]], ['wr', [9]],
  ['mb', [1]], ['gh', []], ['ee', [3]], ['ea', [3]], ['ie', [3]], ['ei', [3]], ['ey', [3]], ['ai', [3]], ['ay', [3]],
  ['oo', [5]], ['ou', [2, 5]], ['ow', [4, 5]], ['ew', [5]], ['ue', [5]], ['ui', [5]], ['oa', [4]], ['oe', [4]], ['aw', [4]], ['au', [4]],
  ['oi', [4, 3]], ['oy', [4, 3]], ['ar', [2]], ['er', [9]], ['ir', [9]], ['ur', [9]], ['or', [4]],
  ['a', [2]], ['e', [3]], ['i', [3]], ['o', [4]], ['u', [9]], ['y', [3]], ['w', [5]],
  ['m', [1]], ['b', [1]], ['p', [1]], ['f', [6]], ['v', [6]], ['l', [7]],
  ['s', [8]], ['z', [8]], ['t', [8]], ['d', [8]], ['n', [8]], ['j', [8]], ['x', [9, 8]],
  ['c', [9]], ['k', [9]], ['g', [9]], ['q', [9]], ['h', [9]], ['r', [9]],
];

/** Capitals that are read as a word, not letter by letter. */
const SAID_AS_WORDS = new Set(['JAMB', 'WAEC', 'NECO', 'PIN', 'SIM', 'NATO', 'ASAP', 'RAM', 'LAN', 'WAN']);
const LETTER_NAMES: Record<string, V[]> = {
  a: [3], b: [1, 3], c: [8, 3], d: [8, 3], e: [3], f: [3, 6], g: [8, 3], h: [3, 8], i: [2, 3], j: [8, 3], k: [9, 3], l: [3, 7], m: [3, 1],
  n: [3, 8], o: [4], p: [1, 3], q: [9, 5], r: [2], s: [3, 8], t: [8, 3], u: [3, 5], v: [6, 3], w: [8, 9, 1, 7, 5], x: [3, 9, 8], y: [5, 2, 3], z: [8, 3, 8],
};

const NUMBERS: Record<string, string> = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
};

/** The mouth shapes of one written word, in order. */
export function wordVisemes(written: string): V[] {
  // "I'm", "I'll", "I've": the long I, then the ending.
  const contraction = /^i['’](m|ll|ve|d)/i.exec(written.replace(/^[^A-Za-z]+/, ''));
  if (contraction) return [2, 3, ...({ m: [1], ll: [7], ve: [6], d: [8] } as Record<string, V[]>)[contraction[1].toLowerCase()]];
  let word = written.toLowerCase().replace(/[0-9]/g, (d) => NUMBERS[d] ?? '').replace(/[^a-z]/g, '');
  if (!word) return [];
  if (WORDS[word]) return WORDS[word];
  // Capitals said letter by letter (SAT, HTTPS): each letter's name.
  const letters = written.replace(/[^A-Za-z]/g, '');
  if (/^[A-Z]{2,5}$/.test(letters) && !SAID_AS_WORDS.has(letters)) return [...word].flatMap((c) => LETTER_NAMES[c] ?? []);
  // A soft c ("slice", "cell") is an s.
  word = word.replace(/c(?=[eiy])/g, 's');
  let plural: V[] = [];
  if (word.length > 3 && word.endsWith('es') && !/[sxz]es$|[cs]hes$/.test(word)) {
    word = word.slice(0, -1);
    plural = [8];
  }
  // A final "e" is silent after a consonant ("make", "table"); after a single consonant it makes the vowel long.
  let magic = false;
  if (word.length > 2 && /[^aeiou]e$/.test(word)) {
    magic = /[aeiou][^aeiou]e$/.test(word);
    word = word.slice(0, -1);
  }
  if (word.length > 3 && /[^aeiou]ed$/.test(word) && !/[td]ed$/.test(word)) word = word.slice(0, -2) + 'd';
  const out: V[] = [];
  let i = 0;
  let lastVowelAt = -1;
  while (i < word.length) {
    // A doubled consonant is said once.
    if (i > 0 && word[i] === word[i - 1] && !'aeiou'.includes(word[i])) {
      i++;
      continue;
    }
    const rule = RULES.find(([g]) => word.startsWith(g, i));
    if (!rule) {
      i++;
      continue;
    }
    const [group, shapes] = rule;
    for (const s of shapes) {
      // The same shape twice in a row is one longer shape.
      if (out[out.length - 1] !== s || VOWELS.has(s)) out.push(s);
      if (VOWELS.has(s) && group.length === 1 && 'aeiou'.includes(group)) lastVowelAt = out.length - 1;
    }
    i += group.length;
  }
  // "time", "make", "note": the long vowel opens wide and glides.
  if (magic && lastVowelAt >= 0) {
    const v = out[lastVowelAt];
    if (v === 3) out.splice(lastVowelAt, 1, 2, 3);
    else if (v === 9) out.splice(lastVowelAt, 1, 5);
  }
  return [...out, ...plural];
}

export type TimedWord = { text: string; start: number; end: number };

/**
 * The mouth at every frame of the narration, as a string of digits (frame f covers f/30 to (f+1)/30 s).
 * `level` is the loudness of each frame, 0 to 1: the mouth rests where the voice is silent whatever the
 * word times say, and speaks through a loud stretch that no word claims.
 */
export function mouthTimeline(words: TimedWord[], level: Float32Array | number[]): string {
  const frames = level.length;
  const raw = new Uint8Array(frames);
  const claimed = new Uint8Array(frames);
  for (const w of words) {
    const shapes = wordVisemes(w.text);
    if (!shapes.length) continue;
    const start = w.start - 0.03; // lips lead the sound slightly
    const length = Math.max(0.07 * Math.min(shapes.length, 2), w.end - w.start + 0.02);
    // Vowels are held longer than consonants; closures need long enough to be seen.
    const weights = shapes.map((s) => (VOWELS.has(s) ? 1.7 : s === 1 ? 1.15 : 1));
    const sum = weights.reduce((a, b) => a + b, 0);
    let t = start;
    shapes.forEach((s, k) => {
      const d = (weights[k] / sum) * length;
      const a = Math.max(0, Math.round(t * FPS));
      const b = Math.max(a + 1, Math.round((t + d) * FPS));
      for (let f = a; f < Math.min(frames, b); f++) {
        raw[f] = s;
        claimed[f] = 1;
      }
      t += d;
    });
  }
  const quiet = 0.045;
  for (let f = 0; f < frames; f++) {
    const v = level[f] ?? 0;
    if (!claimed[f]) raw[f] = v > 0.22 ? 9 : 0;
    // Silence inside a word's time (the aligner ran long): the mouth closes. M, B and P are silent by nature.
    else if (v < quiet && raw[f] !== 1 && (level[f - 1] ?? 0) < quiet && (level[f + 1] ?? 0) < quiet) raw[f] = 0;
  }
  // A shape that lasts a single frame reads as a flicker: give it to its neighbour (closures are kept).
  for (let f = 1; f < frames - 1; f++)
    if (raw[f] !== raw[f - 1] && raw[f] !== raw[f + 1] && raw[f] !== 1) raw[f] = raw[f - 1];
  return Array.from(raw).join('');
}

/** Loudness of each frame, 0 to 1 against the narration's loud syllables. */
export function loudness(samples: Float32Array, rate: number): Float32Array {
  const frames = Math.ceil((samples.length / rate) * FPS);
  const env = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    const a = Math.floor((f / FPS) * rate);
    const b = Math.min(samples.length, Math.floor(((f + 1) / FPS) * rate));
    let s = 0;
    for (let i = a; i < b; i++) s += samples[i] * samples[i];
    env[f] = Math.sqrt(s / Math.max(1, b - a));
  }
  const sorted = Array.from(env).filter((v) => v > 0.004).sort((x, y) => x - y);
  const top = sorted[Math.floor(sorted.length * 0.92)] ?? 1;
  for (let f = 0; f < frames; f++) env[f] = Math.min(1, env[f] / top);
  return env;
}
