/**
 * Kora's mouth, drawn as vectors so it can follow her voice exactly. Every mouth shape (viseme) is a
 * handful of numbers; the lesson player glides between them, so the lips move rather than jump.
 * Units are pixels of the 864 × 1152 character pictures, measured from the middle of the lip line.
 */
export type MouthShape = {
  /** Half the width, corner to centre. */
  w: number;
  /** How far the corners sit above the centre: a smile. */
  lift: number;
  /** Top and bottom of the opening at the centre (equal when the lips are together). */
  top: number;
  bot: number;
  /** Lip thickness at the centre. */
  ul: number;
  ll: number;
  /** Height of the upper and lower teeth that show, and of the tongue. */
  ut: number;
  lt: number;
  tg: number;
};

/**
 * The mouth set. A lesson's timeline stores one digit per moment:
 * 0 rest · 1 M B P · 2 A I (open) · 3 E (wide) · 4 O · 5 U W · 6 F V · 7 L TH · 8 S T D N · 9 small (uh, k, g, h, r)
 */
export const VISEMES: MouthShape[] = [
  { w: 64, lift: 7, top: 0, bot: 0, ul: 9, ll: 30, ut: 0, lt: 0, tg: 0 },
  { w: 58, lift: 2, top: 1, bot: 1, ul: 6, ll: 21, ut: 0, lt: 0, tg: 0 },
  { w: 55, lift: 1, top: -5, bot: 31, ul: 8, ll: 21, ut: 9, lt: 0, tg: 12 },
  { w: 65, lift: 5, top: -3, bot: 15, ul: 8, ll: 23, ut: 8, lt: 0, tg: 4 },
  { w: 36, lift: 0, top: -9, bot: 23, ul: 9, ll: 23, ut: 0, lt: 0, tg: 7 },
  { w: 26, lift: 0, top: -5, bot: 9, ul: 10, ll: 24, ut: 0, lt: 0, tg: 0 },
  { w: 54, lift: 2, top: -3, bot: 5, ul: 8, ll: 17, ut: 8, lt: 0, tg: 0 },
  { w: 54, lift: 3, top: -4, bot: 20, ul: 8, ll: 22, ut: 7, lt: 0, tg: 17 },
  { w: 60, lift: 4, top: -3, bot: 11, ul: 8, ll: 23, ut: 7, lt: 7, tg: 0 },
  { w: 54, lift: 3, top: -3, bot: 12, ul: 8, ll: 23, ut: 6, lt: 0, tg: 5 },
];
export const REST = 0;

const KEYS = ['w', 'lift', 'top', 'bot', 'ul', 'll', 'ut', 'lt', 'tg'] as const;

/** A shape part of the way from `a` to `b`. */
export function mixShapes(a: MouthShape, b: MouthShape, t: number): MouthShape {
  const out = { ...a };
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/** The same shape opened more or less (loud syllables open wider); closed shapes stay closed. */
export function openBy(s: MouthShape, factor: number): MouthShape {
  if (s.bot - s.top < 3) return s;
  return { ...s, bot: s.top + (s.bot - s.top) * factor, tg: s.tg * Math.min(1, factor) };
}

const n = (v: number) => Math.round(v * 10) / 10;

/** A curve from the left corner to the right one passing through `y` at the centre. */
function arc(w: number, cy: number, y: number, spread = 0.55) {
  const c = (8 * y - 2 * cy) / 6;
  return { c, d: `C${n(-w * spread)} ${n(c)} ${n(w * spread)} ${n(c)} ${n(w)} ${n(cy)}` };
}
/** The same curve drawn back from the right corner to the left. */
const back = (w: number, cy: number, y: number, spread = 0.55) => {
  const c = (8 * y - 2 * cy) / 6;
  return `C${n(w * spread)} ${n(c)} ${n(-w * spread)} ${n(c)} ${n(-w)} ${n(cy)}`;
};
/** The closed shape between two such curves. */
const lens = (w: number, cy: number, y1: number, y2: number, s1 = 0.55, s2 = 0.55) =>
  `M${n(-w)} ${n(cy)}${arc(w, cy, y1, s1).d}${back(w, cy, y2, s2)}Z`;

export type MouthPaths = {
  inside: string | null;
  tongue: string | null;
  upperTeeth: string | null;
  lowerTeeth: string | null;
  upperLip: string;
  lowerLip: string;
  /** The dark line where the lips meet (or the edge of the upper lip when open). */
  line: string;
  /** Two small highlights on the lower lip. */
  shine: { x: number; y: number; rx: number; ry: number }[];
};

export function mouthPaths(s: MouthShape): MouthPaths {
  const cy = -s.lift;
  const open = s.bot - s.top;
  const isOpen = open > 1.5;
  const { w } = s;
  const topO = s.top - s.ul;
  // The upper lip's outer edge, with a soft dip in the middle.
  const upperOuter =
    `M${n(-w)} ${n(cy)}` +
    `C${n(-w * 0.7)} ${n(cy + (topO - cy) * 0.8)} ${n(-w * 0.42)} ${n(topO - 1)} ${n(-w * 0.2)} ${n(topO - 1)}` +
    `Q${n(-w * 0.07)} ${n(topO - 1)} 0 ${n(topO + s.ul * 0.28)}` +
    `Q${n(w * 0.07)} ${n(topO - 1)} ${n(w * 0.2)} ${n(topO - 1)}` +
    `C${n(w * 0.42)} ${n(topO - 1)} ${n(w * 0.7)} ${n(cy + (topO - cy) * 0.8)} ${n(w)} ${n(cy)}`;
  const upperLip = `${upperOuter}${back(w, cy, s.top)}Z`;
  const lowerLip = lens(w, cy, s.bot, s.bot + s.ll, 0.55, 0.6);
  const teethTo = Math.min(s.top + s.ut, s.bot);
  const lowerFrom = Math.max(s.bot - s.lt, teethTo);
  const mid = s.bot + s.ll * 0.52;
  return {
    inside: isOpen ? lens(w, cy, s.top, s.bot) : null,
    tongue: isOpen && s.tg > 1 ? lens(w * 0.92, cy + (s.bot - cy) * 0.35, Math.max(s.top + 1, s.bot - s.tg), s.bot, 0.5, 0.55) : null,
    upperTeeth: isOpen && s.ut > 1 ? lens(w, cy, s.top, teethTo) : null,
    lowerTeeth: isOpen && s.lt > 1 ? lens(w, cy, lowerFrom, s.bot) : null,
    upperLip,
    lowerLip,
    line: `M${n(-w - 3)} ${n(cy - 2)}L${n(-w)} ${n(cy)}${arc(w, cy, s.top).d}L${n(w + 3)} ${n(cy - 2)}`,
    shine: [
      { x: -w * 0.2, y: mid, rx: w * 0.13, ry: Math.max(1.6, s.ll * 0.09) },
      { x: w * 0.08, y: mid + 0.5, rx: w * 0.08, ry: Math.max(1.4, s.ll * 0.075) },
    ],
  };
}

export const MOUTH_COLORS = {
  inside: '#2A0D0C',
  tongue: '#C9584F',
  teeth: '#FBF7F1',
  upperLip: '#6B301C',
  lowerLip: '#A9553A',
  line: '#1C0E0A',
  shine: '#E0957B',
};
