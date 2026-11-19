import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

/**
 * Checks on the word-game content that need no AI: used by scripts/word-games-content.ts while it writes
 * the content, and by the tests. The dictionary is the game's own list (data/english-words.txt, ENABLE
 * words of 2–8 letters with offensive words taken out) plus long-words.txt.gz beside this file: the
 * ENABLE words of 9 letters or more, with the same kind of words taken out.
 */

/** Words never used, whole or as the start of a word (with the exceptions below). */
const BLOCKED_STARTS = [
  'FUCK', 'SHIT', 'CUNT', 'NIGG', 'FAGGOT', 'WHORE', 'SLUT', 'PORN', 'MASTURBAT', 'RETARD', 'BITCH', 'BASTARD',
  'DILDO', 'ORGASM', 'EROTIC', 'NYMPHO', 'BLOWJOB', 'HOOKER', 'INCEST', 'RAPIST', 'PAEDO', 'PEDOPHIL', 'NAZI',
  'WANK', 'TWAT', 'BOLLOCK', 'BUGGER', 'SODOMI', 'GENITAL', 'PENIS', 'VAGIN', 'CLITOR', 'SCROT', 'TESTICL',
  'FELLATI', 'CUNNILING', 'PROSTITUT', 'STRIPPER', 'FETISH', 'HOMOSEX', 'TRANNY', 'NEGRO', 'MULATTO', 'GYPP',
];
/** Words blocked only as whole words (their longer forms are often innocent: RAPESEED, ASSET, SEXTANT). */
const BLOCKED_WORDS = new Set([
  'RAPE', 'RAPED', 'RAPES', 'RAPING', 'SEX', 'SEXY', 'SEXIER', 'SEXIEST', 'SEXUAL', 'ASS', 'ARSE', 'ARSES', 'ASSES',
  'CRAP', 'CRAPPY', 'PISS', 'PISSED', 'DICK', 'DICKS', 'COCK', 'COCKS', 'PUSSY', 'BOOB', 'BOOBS', 'BOOBIES', 'TIT',
  'TITS', 'TITTIES', 'NUDE', 'NUDES', 'NUDITY', 'HORNY', 'KINKY', 'DAMN', 'DAMNED', 'HELL', 'GAY', 'GAYS', 'HOMO',
  'HOMOS', 'DYKE', 'DYKES', 'KIKE', 'KIKES', 'SPIC', 'SPICS', 'CHINK', 'CHINKS', 'COON', 'COONS', 'JAP', 'JAPS',
  'GOOK', 'GOOKS', 'WOP', 'WOPS', 'DAGO', 'DAGOES', 'DAGOS', 'SPAZ', 'SPASTIC', 'MONGOL', 'MONGOLS', 'MIDGET',
  'MIDGETS', 'CRETIN', 'CRETINS', 'IMBECILE', 'MORON', 'MORONS', 'IDIOT', 'IDIOTS', 'HARLOT', 'HARLOTS', 'STRUMPET',
  'TROLLOP', 'FLOOZY', 'FLOOZIE', 'WENCH', 'SLATTERN', 'TRAMP', 'TRAMPS', 'HUSSY', 'BUTT', 'BUTTS', 'TURD', 'TURDS',
  'SEMEN', 'SPERM', 'NIPPLE', 'NIPPLES', 'BREASTS', 'BOSOM', 'HUMP', 'HUMPING', 'GROPE', 'GROPED', 'LECHER', 'LUST',
  'LUSTFUL', 'PERVERT', 'PERVERTS', 'BIMBO', 'BIMBOS', 'HEATHEN', 'INFIDEL', 'SAVAGE', 'SAVAGES', 'NATIVES',
]);

export function blocked(word: string) {
  const w = word.toUpperCase();
  return BLOCKED_WORDS.has(w) || BLOCKED_STARTS.some((s) => w.startsWith(s));
}

/** A blocked word anywhere in a text (a clue, a sentence). */
export const blockedIn = (text: string) => (text.toUpperCase().match(/[A-Z]+/g) ?? []).find(blocked) ?? null;

// ─── Dictionary ───────────────────────────────────────────────────────────────

let short: Set<string> | null = null;
let long: Set<string> | null = null;

function find(name: string, from: string) {
  let dir = from;
  for (let i = 0; i < 6; i++) {
    const file = join(dir, name);
    if (existsSync(file)) return file;
    dir = dirname(dir);
  }
  throw new Error(`${name} is missing`);
}

function load() {
  if (!short || !long) {
    const here = dirname(fileURLToPath(import.meta.url));
    const lines = (text: string) =>
      text
        .split('\n')
        .map((w) => w.trim().toUpperCase())
        .filter(Boolean);
    short = new Set(lines(readFileSync(find(join('data', 'english-words.txt'), here), 'utf8')));
    // Found from src/ and from dist/src/ (the .gz is not copied by tsc, so look up from there too).
    let gz: string;
    try {
      gz = find('long-words.txt.gz', here);
    } catch {
      gz = find(join('src', 'data', 'english', 'long-words.txt.gz'), here);
    }
    long = new Set(lines(gunzipSync(readFileSync(gz)).toString('utf8')));
  }
  return { short, long };
}

const listed = (w: string) => {
  const { short, long } = load();
  return w.length <= 8 ? short.has(w) : long.has(w);
};

/**
 * The American spellings of a British word, for checking British forms against an American-leaning list:
 * COLOUR → COLOR, ORGANISE → ORGANIZE, CENTRE → CENTER, ANALYSE → ANALYZE, DEFENCE → DEFENSE,
 * CATALOGUE → CATALOG, TRAVELLED → TRAVELED.
 */
export function americanForms(word: string) {
  const w = word.toUpperCase();
  const out = new Set<string>();
  const swaps: [RegExp, string][] = [
    [/OUR(?=[A-Z]*$)/, 'OR'],
    [/IS(E|ED|ES|ING|ATION|ATIONS|ER|ERS)$/, 'IZ$1'],
    [/YS(E|ED|ES|ING|ER|ERS)$/, 'YZ$1'],
    [/([^AEIOU])RE(S?)$/, '$1ER$2'],
    [/([^AEIOU])RED$/, '$1ERED'],
    [/ENCE(S?)$/, 'ENSE$1'],
    [/OGUE(S?)$/, 'OG$1'],
    [/LL(ED|ING|ER|ERS)$/, 'L$1'],
  ];
  for (const [re, to] of swaps) if (re.test(w)) out.add(w.replace(re, to));
  out.delete(w);
  return [...out];
}

/** Whether a word is in the dictionary, taking British forms whose American spelling is listed. */
export function inDictionary(word: string) {
  const w = word.toUpperCase();
  if (!/^[A-Z]+$/.test(w)) return false;
  return listed(w) || americanForms(w).some(listed);
}

/** An American spelling where British English spells the word differently: COLOR, CENTER, REALIZE, ANALYZE. */
export function americanSpelling(word: string) {
  const w = word.toUpperCase();
  const KNOWN =
    /^(COLOR|FAVOR|HONOR|LABOR|NEIGHBOR|BEHAVIOR|FLAVOR|HARBOR|RUMOR|VAPOR|HUMOR|VIGOR|ARMOR|VALOR|CANDOR|RANCOR|CLAMOR|SPLENDOR|FERVOR|ODOR|PARLOR|SAVOR|CENTER|THEATER|FIBER|LITER|SOMBER|SPECTER|LUSTER|MEAGER|SABER|DEFENSE|OFFENSE|PRETENSE|CATALOG|DIALOG|ANALOG|GRAY|PLOW|MOLD|SKEPTIC|ESOPHAG|ANEMI|ESTROGEN|PEDIATRIC|MANEUVER|JEWELRY|PAJAMA|ALUMINUM|SULFUR|FETUS|EDEMA|LEUKEMIA|ENCYCLOPEDIA|MEDIEVAL|AGING|ARCHEOLOG|CHECKERED|CHILE|COZY|DONUT|DRAFTY|ENROLLMENT|FULFILLMENT|INSTALLMENT|JUDGMENT|KIDNAPED|MUSTACHE|SKILLFUL|WILLFUL)(S|ED|ING|ER|ERS|ABLE|FUL|LESS|Y|E|ES)?$/;
  if (KNOWN.test(w)) return true;
  const NOT_IZE = /^(SIZE|PRIZE|SEIZE|CAPSIZE|MAIZE|BAIZE|ASSIZE|OUTSIZE|OVERSIZE|DOWNSIZE|RESIZE|UPSIZE|BRONZE|GAZE|GLAZE|CITIZEN|HORIZON|FRIEZE|WIZEN|DENIZEN|COGNIZE|OUTSIZED|OVERSIZED|DOWNSIZED|RESIZED|SIZED|PRIZED|SEIZED|CAPSIZED)/;
  return (/[A-Z]{2}IZ(E|ED|ES|ING|ER|ERS|ATION|ATIONS)$/.test(w) && !NOT_IZE.test(w)) || /YZ(E|ED|ES|ING|ER|ERS)$/.test(w);
}

// ─── Clues ────────────────────────────────────────────────────────────────────

/** The part of a word a related form keeps: RESILIENT → RESILI, HOUSE → HOUS, RAIN → RAIN. */
export function stemOf(word: string) {
  const w = word.toUpperCase();
  if (w.length <= 4) return w;
  return w.slice(0, Math.max(4, w.length - 3));
}

const shared = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return i;
};

/**
 * Whether a clue gives its word away: the word itself, a form of it (HOUSES, HOUSING for HOUSE) or a
 * clear part of it (ANNOY in a clue for ANNOYANCE). Errs on the strict side.
 */
export function clueGivesAway(word: string, clue: string) {
  const w = word.toUpperCase();
  const stem = stemOf(w);
  const forms = [w, ...americanForms(w)];
  const tokens = clue.toUpperCase().match(/[A-Z]+/g) ?? [];
  return tokens.some(
    (t) =>
      forms.some((f) => t.includes(f)) ||
      t.startsWith(stem) ||
      (t.length >= 5 && w.startsWith(t) && t.length >= w.length - 4) ||
      (t.length >= 4 && w.length >= 4 && stemOf(t) === stem) ||
      shared(t, w) >= Math.max(5, Math.min(t.length, w.length) - 2),
  );
}
