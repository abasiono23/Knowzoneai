import type { ComponentType } from 'react';

import type { ChemGameId, SpaceGameId, HistoryGameId, TechGameId, BusinessGameId } from '@/lib/api';
import * as businessLib from '@/lib/games/business';
import * as historyLib from '@/lib/games/history';
import * as chemistryLib from '@/lib/games/lab';
import * as spaceLib from '@/lib/games/space';
import * as techLib from '@/lib/games/tech';

/**
 * The contract between the five subject worlds' FRAME (hub, game page, play screen, results, pause:
 * components/lab/frame.tsx and app/world/<world>/index.tsx) and the mini-game components inside them.
 *
 * 1. Props. Every game component is mounted full-size inside the play screen, under the frame's top bar
 *    (leave, name and level, "?", pause) and status row (hearts, Ask Kora). It receives exactly what it
 *    did before the redesign:
 *      { g, run }            g = useLabRun() of that world (start/answer/finish/quit/ask/buzz/busy/error)
 *      + paused              for games that take it: true while the pause menu, the rules, Ask Kora or a
 *                            confirm dialog is open. Stop clocks and animations while it's true.
 *      Chemistry also gets   map: CoverMap of the play area (and Mixture Lab / Element Quest their
 *                            carrying / poured / collected props, see app/world/chemistry/index.tsx).
 *    The game ends by calling g.finish(); the frame then shows the results screen. A game never draws its
 *    own top bar, pause button, hearts or Kora button: the frame does. The world setting "Question timer"
 *    (useRelaxed() in lib/games/english.ts) says whether to run clocks.
 *
 * 2. Optional extras, registered from the game's own module (no edit to frame files needed):
 *      defineGameFrame('mixture-lab', { HowTo, review, hearts: false, tagline })
 *    - HowTo: a drawn example shown in the how-to-play sheet (before the first play of each game, and from
 *      "?") and on the game page, under the rules. Use the word games' look (components/games/ui W).
 *    - review(run): what the player got right or wrong, listed on the results screen.
 *    - hearts: false hides the hearts in the status row (games without lives).
 *    Rules text comes from the game's world namespace: games.<id>.rules = { r1, r2, r3 (up to r5), example }
 *    like the word games (or an array of steps) if present, otherwise games.<id>.how. games.<id>.tagline (optional) is the one-line
 *    description on the hub; otherwise the hub shortens `how`.
 *
 * 3. Levels. The ladder size and the open levels come from each world's lib file (lib/games/<world>.ts,
 *    lab.ts for chemistry): `export const MAX_LEVEL` and `export const OPEN_LEVELS`. Until a world exports
 *    them the frame uses 10 and 4. Stars and unlocks come from the server's catalogue for that world; a
 *    level the catalogue doesn't list yet is shown with the same rule (open up to OPEN_LEVELS, then with a
 *    star on the level before).
 */

export type SubjectWorld = 'chemistry' | 'business' | 'history' | 'space' | 'tech';
export type SubjectGameId = ChemGameId | SpaceGameId | HistoryGameId | TechGameId | BusinessGameId;
/** The i18n namespace of each world's games (`games.<id>.name`, `.how`, ...). */
export type SubjectNs = 'lab' | 'business' | 'history' | 'space' | 'tech';
export const WORLD_NS: Record<SubjectWorld, SubjectNs> = {
  chemistry: 'lab',
  business: 'business',
  history: 'history',
  space: 'space',
  tech: 'tech',
};

/** One line on the results screen: the item, right or wrong, and an optional detail (the answer, the fact). */
export type ReviewItem = { key: string; correct: boolean; main: string; detail?: string };

export type GameFrameExtras = {
  /** A drawn example for the how-to-play sheet and the game page. */
  HowTo?: ComponentType;
  /**
   * What the player got right or wrong, for the results screen. `run` is the finished run of this game
   * (method syntax, so a function typed for your own run type fits).
   */
  review?(run: { id: string; game: string }): ReviewItem[];
  /** False for games without lives: the status row then shows no hearts. */
  hearts?: boolean;
};

const extras = new Map<string, GameFrameExtras>();

/** Register a game's optional extras (call at module level in the game's own file). */
export function defineGameFrame(game: SubjectGameId, more: GameFrameExtras) {
  extras.set(game, { ...extras.get(game), ...more });
}
export function frameOf(game: string): GameFrameExtras {
  return extras.get(game) ?? {};
}

const LIBS: Record<SubjectWorld, unknown> = {
  chemistry: chemistryLib,
  business: businessLib,
  history: historyLib,
  space: spaceLib,
  tech: techLib,
};

/** Levels per game and how many are open to everyone, from the world's own lib file (10 and 4 if missing). */
export function ladderOf(world: SubjectWorld): { max: number; open: number } {
  const lib = LIBS[world] as { MAX_LEVEL?: unknown; OPEN_LEVELS?: unknown };
  const max = typeof lib.MAX_LEVEL === 'number' && lib.MAX_LEVEL > 0 ? lib.MAX_LEVEL : 10;
  const open = typeof lib.OPEN_LEVELS === 'number' && lib.OPEN_LEVELS > 0 ? lib.OPEN_LEVELS : 4;
  return { max, open: Math.min(open, max) };
}

/**
 * How deep each level goes, on the shared ladder: 1–3 early secondary, 4–5 senior secondary (WAEC, GCSE,
 * SAT), 6–7 A-level / AP / first-year university, 8–9 upper university, 10 postgraduate or olympiad.
 * Text: t(`world:subjectHub.depth.<key>`).
 */
export type DepthKey = 'lowerSecondary' | 'seniorSecondary' | 'advanced' | 'university' | 'postgraduate';
export function depthOf(level: number): DepthKey {
  if (level <= 3) return 'lowerSecondary';
  if (level <= 5) return 'seniorSecondary';
  if (level <= 7) return 'advanced';
  if (level <= 9) return 'university';
  return 'postgraduate';
}
