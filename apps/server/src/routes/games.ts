import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../db.js';
import type { GameRun, User } from '../generated/prisma/client.js';
import { AppError, notFound } from '../lib/errors.js';
import { settingsOf } from '../services/account.js';
import {
  check,
  ENGLISH_GAMES,
  HEARTS,
  HL_HINT_COST,
  isOver,
  MAX_LEVEL,
  newProgress,
  publicState,
  buildPuzzle,
  botRounds,
  SM_HINT_COST,
  starsFor,
  stepCount,
  type EnglishGame,
  type Opponent,
  type Outcome,
  type Progress,
  type RunState,
} from '../services/games/english.js';
import {
  CHEMISTRY_GAMES,
  buildChemPuzzle,
  chemCheck,
  chemHelpContext,
  chemIsOver,
  chemPublicState,
  chemStars,
  chemStepCount,
  type ChemistryGame,
  type ChemState,
} from '../services/games/chemistry.js';
import { askKora, ASK_COST } from '../services/games/help-ai.js';
import {
  HISTORY_GAMES,
  buildHistoryPuzzle,
  historyCheck,
  historyHelpContext,
  historyIsOver,
  historyPublicState,
  historyStars,
  historyStepCount,
  type HistoryAnswer,
  type HistoryGame,
  type HistoryState,
} from '../services/games/history.js';
import {
  SPACE_GAMES,
  buildSpacePuzzle,
  spaceCheck,
  spaceHelpContext,
  spaceIsOver,
  spacePublicState,
  spaceStars,
  spaceStepCount,
  type SpaceAnswer,
  type SpaceGame,
  type SpaceState,
} from '../services/games/space.js';
import { restrictionOf } from '../services/help.js';
import { requestLanguage } from '../services/language.js';
import { recordActivity, requestTimeZone } from '../services/progress.js';
import {
  TECH_GAMES,
  buildTechPuzzle,
  techCheck,
  techHelpContext,
  techIsOver,
  techPublicState,
  techStars,
  techStepCount,
  type TechAnswer,
  type TechGame,
  type TechState,
} from '../services/games/tech.js';
import {
  BUSINESS_GAMES,
  buildBusinessPuzzle,
  businessCheck,
  businessHelpContext,
  businessIsOver,
  businessPublicState,
  businessStars,
  businessStepCount,
  type BusinessAnswer,
  type BusinessGame,
  type BusinessState,
} from '../services/games/business.js';
import { recordQuestEvent } from '../services/quests.js';
import { confirmReferralIfEligible } from '../services/referrals.js';
import { me, requireAuth } from '../services/sessions.js';
import { toPublicUser } from '../services/users.js';

export const gamesRouter = Router();
gamesRouter.use(['/me/games', '/me/games/*rest'], requireAuth);

/** Rewards from word games in any 24 hours, so games add to learning rather than replace it. */
export const DAILY_CAP = { xp: 400, coins: 150 };
const DAY = 86_400_000;

/** Games by subject. Game ids are unique across subjects. */
const SUBJECTS = { english: ENGLISH_GAMES, chemistry: CHEMISTRY_GAMES, space: SPACE_GAMES, history: HISTORY_GAMES, tech: TECH_GAMES, business: BUSINESS_GAMES } as const;
const Subject = z.enum(['english', 'chemistry', 'space', 'history', 'tech', 'business']);
const Level = z.coerce.number().int().min(1).max(MAX_LEVEL);

/** A lab state: the run's puzzle and progress (each lab has its own puzzle shape). */
type LabState = { puzzle: unknown; progress: Progress };
/**
 * The lab subjects (games played by walking around a 2.5D place, with Ask Kora instead of hints).
 * They share one way of running: build from a seed, check on the server, stars at the end.
 */
type Lab = {
  subject: 'chemistry' | 'space' | 'history' | 'tech' | 'business';
  games: readonly string[];
  build: (game: string, level: number, seed: string) => unknown;
  steps: (state: LabState) => number;
  view: (state: LabState, level: number) => object;
  check: (state: LabState, a: z.infer<typeof AnswerBody>, level: number) => Outcome & { store?: Record<string, unknown> };
  isOver: (state: LabState, hearts: number) => boolean;
  stars: (state: LabState, hearts: number) => number;
  help: (state: LabState, level: number) => string;
};
const LABS: Lab[] = [
  {
    subject: 'chemistry',
    games: CHEMISTRY_GAMES,
    build: (game, level, seed) => buildChemPuzzle(game as ChemistryGame, level, seed),
    steps: (s) => chemStepCount((s as ChemState).puzzle),
    view: (s) => chemPublicState(s as ChemState),
    check: (s, a) => chemCheck(s as ChemState, a),
    isOver: (s, hearts) => chemIsOver(s as ChemState, hearts),
    stars: (s, hearts) => chemStars(s as ChemState, hearts),
    help: (s) => chemHelpContext(s as ChemState),
  },
  {
    subject: 'space',
    games: SPACE_GAMES,
    build: (game, level, seed) => buildSpacePuzzle(game as SpaceGame, level, seed),
    steps: (s) => spaceStepCount((s as SpaceState).puzzle),
    view: (s, level) => spacePublicState(s as SpaceState, level),
    check: (s, a, level) => spaceCheck(s as SpaceState, a as SpaceAnswer, level),
    isOver: (s, hearts) => spaceIsOver(s as SpaceState, hearts),
    stars: (s) => spaceStars(s as SpaceState),
    help: (s, level) => spaceHelpContext(s as SpaceState, level),
  },
  {
    subject: 'history',
    games: HISTORY_GAMES,
    build: (game, level, seed) => buildHistoryPuzzle(game as HistoryGame, level, seed),
    steps: (s) => historyStepCount((s as HistoryState).puzzle),
    view: (s, level) => historyPublicState(s as HistoryState, level),
    check: (s, a) => historyCheck(s as HistoryState, a as HistoryAnswer),
    isOver: (s, hearts) => historyIsOver(s as HistoryState, hearts),
    stars: (s) => historyStars(s as HistoryState),
    help: (s) => historyHelpContext(s as HistoryState),
  },
  {
    subject: 'tech',
    games: TECH_GAMES,
    build: (game, level, seed) => buildTechPuzzle(game as TechGame, level, seed),
    steps: (s) => techStepCount((s as TechState).puzzle),
    view: (s) => techPublicState(s as TechState),
    check: (s, a) => techCheck(s as TechState, a as TechAnswer),
    isOver: (s, hearts) => techIsOver(s as TechState, hearts),
    stars: (s) => techStars(s as TechState),
    help: (s) => techHelpContext(s as TechState),
  },
  {
    subject: 'business',
    games: BUSINESS_GAMES,
    build: (game, level, seed) => buildBusinessPuzzle(game as BusinessGame, level, seed),
    steps: (s) => businessStepCount((s as BusinessState).puzzle),
    view: (s) => businessPublicState(s as BusinessState),
    check: (s, a) => businessCheck(s as BusinessState, a as BusinessAnswer),
    isOver: (s, hearts) => businessIsOver(s as BusinessState, hearts),
    stars: (s) => businessStars(s as BusinessState),
    help: (s) => businessHelpContext(s as BusinessState),
  },
];
const labOf = (game: string) => LABS.find((l) => l.games.includes(game));
const subjectOf = (game: string) => labOf(game)?.subject ?? 'english';
const stateOf = (run: GameRun) => run.state as unknown as RunState;
const labStateOf = (run: GameRun) => run.state as unknown as LabState;

function toPublicRun(run: GameRun) {
  const state = stateOf(run);
  return {
    id: run.id,
    game: run.game,
    level: run.level,
    status: run.status,
    score: run.score,
    correct: run.correct,
    total: run.total,
    hearts: run.hearts,
    at: state.progress.at,
    streak: state.progress.streak,
    startedAt: run.startedAt.getTime(),
    ...(labOf(run.game)?.view(labStateOf(run), run.level) ?? publicState(state)),
    ...(run.status === 'finished' && { stars: run.stars, xp: run.xp, coins: run.coins }),
  };
}

async function ownRun(userId: string, id: string) {
  const run = await prisma.gameRun.findFirst({ where: { id, userId } });
  if (!run) throw notFound('Game not found');
  return run;
}

/** Saves a change to a run, unless something else changed it first (then the app resyncs). */
async function save(
  run: GameRun,
  data: Partial<Pick<GameRun, 'score' | 'correct' | 'hearts' | 'status' | 'stars' | 'xp' | 'coins' | 'hintCoins' | 'finishedAt'>> & { state?: RunState },
) {
  const { state, ...rest } = data;
  const { count } = await prisma.gameRun.updateMany({
    where: { id: run.id, version: run.version },
    data: { ...rest, ...(state && { state: state as object }), version: { increment: 1 } },
  });
  if (!count) throw new AppError(409, 'This game changed on another screen. Please try again.', 'stale');
  return prisma.gameRun.findUniqueOrThrow({ where: { id: run.id } });
}

// ─── Catalogue and progress ───────────────────────────────────────────────────

async function rewardsToday(userId: string) {
  const sum = await prisma.gameRun.aggregate({
    where: { userId, status: 'finished', finishedAt: { gt: new Date(Date.now() - DAY) } },
    _sum: { xp: true, coins: true },
  });
  return { xp: sum._sum.xp ?? 0, coins: sum._sum.coins ?? 0 };
}

/** Each game's levels, best stars and what's unlocked (a level opens once the one before has a star). */
gamesRouter.get('/me/games/:subject', async (req, res) => {
  const user = me(req);
  const games = SUBJECTS[Subject.parse(req.params.subject)];
  const progress = await prisma.gameProgress.findMany({ where: { userId: user.id, game: { in: [...games] } } });
  const best = (game: string, level: number) => progress.find((p) => p.game === game && p.level === level);
  res.json({
    games: games.map((game) => ({
      id: game,
      levels: Array.from({ length: MAX_LEVEL }, (_, i) => {
        const p = best(game, i + 1);
        return {
          level: i + 1,
          unlocked: i === 0 || (best(game, i)?.bestStars ?? 0) > 0,
          bestStars: p?.bestStars ?? 0,
          bestScore: p?.bestScore ?? 0,
          plays: p?.plays ?? 0,
        };
      }),
    })),
    rewardsToday: await rewardsToday(user.id),
    dailyCap: DAILY_CAP,
  });
});

// ─── Starting a run ───────────────────────────────────────────────────────────

/** "Tobi A." when the learner shows their profile to everyone; otherwise no name. */
function displayName(u: Pick<User, 'name' | 'photo' | 'settings'>) {
  const visible = settingsOf(u as User).privacy.profileVisibility === 'everyone';
  if (!visible) return { name: null };
  const [first, last] = u.name.trim().split(/\s+/);
  const photo = u.photo as { kind?: string; uri?: string } | null;
  return { name: `${first}${last ? ` ${last[0]}.` : ''}`, ...(photo?.kind === 'photo' && photo.uri && { photo: photo.uri }) };
}

/**
 * Word Clash opponent: a recent finished match by another learner at this level, replayed with the
 * same racks (round by round, their score is revealed after yours). If there isn't one, or the
 * learner can't play other players right now, it's a practice rival, and the app says so.
 */
async function clashOpponent(user: User, level: number): Promise<{ seed: string; opponent: Opponent | null }> {
  const restricted = restrictionOf(user)?.limits?.includes('battles');
  if (!restricted) {
    const played = (await prisma.gameRun.findMany({ where: { userId: user.id, game: 'word-clash' }, select: { seed: true } })).map((r) => r.seed);
    const candidates = await prisma.gameRun.findMany({
      where: {
        game: 'word-clash',
        level,
        status: 'finished',
        score: { gt: 0 },
        userId: { not: user.id },
        finishedAt: { gt: new Date(Date.now() - 14 * DAY) },
        seed: { notIn: played },
      },
      orderBy: { finishedAt: 'desc' },
      take: 20,
      include: { user: { select: { name: true, photo: true, settings: true } } },
    });
    if (candidates.length) {
      const c = candidates[Math.floor(Math.random() * candidates.length)]!;
      const results = stateOf(c).progress.results;
      const rounds = Array.from({ length: 5 }, (_, i) => results[i]?.points ?? 0);
      return { seed: c.seed, opponent: { kind: 'player', runId: c.id, ...displayName(c.user), rounds } };
    }
  }
  return { seed: randomBytes(8).toString('hex'), opponent: null };
}

gamesRouter.post('/me/games/:subject/:game/runs', async (req, res) => {
  const user = me(req);
  const subject = Subject.parse(req.params.subject);
  const game = z.enum(SUBJECTS[subject] as unknown as [string, ...string[]]).parse(req.params.game);
  const { level } = z.object({ level: Level }).parse(req.body);
  if (level > 1) {
    const prev = await prisma.gameProgress.findUnique({ where: { userId_game_level: { userId: user.id, game, level: level - 1 } } });
    if (!prev?.bestStars) throw new AppError(403, 'Win at least one star on the level before to unlock this one.', 'locked');
  }
  // One game at a time: an unfinished earlier run of this game is dropped.
  await prisma.gameRun.updateMany({ where: { userId: user.id, game, status: 'playing' }, data: { status: 'abandoned' } });

  const lab = labOf(game);
  if (lab) {
    const seed = randomBytes(8).toString('hex');
    const state: LabState = { puzzle: lab.build(game, level, seed), progress: { at: 0, results: {}, streak: 0, found: [] } };
    const run = await prisma.gameRun.create({
      data: { userId: user.id, game, level, seed, state: state as object, total: lab.steps(state), hearts: HEARTS },
    });
    res.status(201).json({ run: toPublicRun(run) });
    return;
  }

  let seed = randomBytes(8).toString('hex');
  let opponent: Opponent | undefined;
  if (game === 'word-clash') {
    const picked = await clashOpponent(user, level);
    seed = picked.seed;
    opponent = picked.opponent ?? undefined;
  }
  const puzzle = buildPuzzle(game as EnglishGame, level, seed);
  if (puzzle.kind === 'word-clash' && !opponent)
    opponent = {
      kind: 'bot',
      name: null,
      rounds: botRounds(
        level,
        seed,
        puzzle.rounds.map((r) => r.best.points),
      ),
    };

  const state: RunState = { puzzle, progress: newProgress(puzzle), ...(opponent && { opponent }) };
  const run = await prisma.gameRun.create({
    data: { userId: user.id, game, level, seed, state: state as object, total: stepCount(puzzle), hearts: HEARTS },
  });
  res.status(201).json({ run: toPublicRun(run) });
});

// ─── Playing ──────────────────────────────────────────────────────────────────

const Cell = z.tuple([z.number().int().min(0).max(20), z.number().int().min(0).max(20)]);
/** A Code Runner block (repeats hold more blocks). */
const TechOp: z.ZodType = z.union([
  z.object({ op: z.enum(['move', 'jump', 'left', 'right']) }),
  z.object({ op: z.literal('repeat'), times: z.number().int().min(2).max(9), body: z.array(z.lazy(() => TechOp)).max(12) }),
]);
const AnswerBody = z.object({
  step: z.number().int().min(0).max(50).optional(),
  letters: z.array(z.string().max(1)).max(12).optional(),
  word: z.string().max(20).optional(),
  words: z.array(z.string().max(30)).max(20).optional(),
  from: Cell.optional(),
  to: Cell.optional(),
  ms: z.number().min(0).max(600_000).optional(),
  timeout: z.boolean().optional(),
  // Chemistry lab
  reagents: z.array(z.string().max(20)).max(4).optional(),
  choice: z.string().max(120).optional(),
  symbols: z.array(z.string().max(3)).max(12).optional(),
  atoms: z.array(z.string().max(3)).max(16).optional(),
  bonds: z
    .array(z.tuple([z.number().int().min(0).max(30), z.number().int().min(0).max(30), z.number().int().min(1).max(3)]))
    .max(40)
    .optional(),
  coefficients: z.array(z.number().int().min(1).max(30)).max(8).optional(),
  test: z.string().max(20).optional(),
  // Space Academy
  engine: z.string().max(20).optional(),
  tanks: z.array(z.string().max(20)).max(8).optional(),
  placements: z
    .array(z.object({ x: z.number().min(-1).max(3), y: z.number().min(-1).max(3), mass: z.number().int().min(1).max(3) }))
    .max(4)
    .optional(),
  hits: z.number().int().min(0).max(100).optional(),
  // Museum of Time
  order: z.array(z.string().max(120)).max(6).optional(),
  point: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]).optional(),
  // Tech Hub
  program: z.array(z.lazy((): z.ZodType => TechOp)).max(30).optional(),
  cards: z
    .array(z.union([z.object({ dir: z.enum(['up', 'right', 'down', 'left']), n: z.number().int().min(1).max(9) }), z.object({ op: z.enum(['pick', 'drop']) })]))
    .max(30)
    .optional(),
  bits: z.array(z.number().int().min(0).max(1)).max(16).optional(),
  gates: z.record(z.string().max(8), z.enum(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'WIRE'])).optional(),
  // Business District: a turn's decisions (staff, budget, price and stock, portfolio).
  plan: z.record(z.string().max(24), z.number().min(0).max(1_000_000)).optional(),
});

/** Lab games: check an answer, update the run's progress, and answer the app. */
async function answerLab(lab: Lab, run: GameRun, a: z.infer<typeof AnswerBody>) {
  const state = labStateOf(run);
  if (a.step !== state.progress.at) throw new AppError(409, 'That question was already answered', 'stale');
  if (lab.isOver(state, run.hearts)) throw new AppError(409, 'This game has finished', 'finished');
  const outcome = lab.check(state, a, run.level);
  const next: LabState = structuredClone(state);
  const p = next.progress;
  const test = outcome.reveal?.test;
  if (typeof test === 'string') p.tests = { ...p.tests, [p.at]: [...new Set([...(p.tests?.[p.at] ?? []), test])] };
  // Things a step remembers (failed tries, the rocket that flew).
  if (outcome.store?.tries !== undefined) p.tries = { ...p.tries, [p.at]: outcome.store.tries as number };
  if (outcome.store?.designs !== undefined) p.designs = { ...p.designs, [p.at]: outcome.store.designs };
  if (outcome.advance) {
    p.results[p.at] = { correct: outcome.correct, points: outcome.points };
    p.streak = outcome.correct ? p.streak + 1 : 0;
    p.at += 1;
  }
  const hearts = Math.max(0, run.hearts - (outcome.heartLost ? 1 : 0));
  const updated = await save(run, {
    state: next as unknown as RunState,
    score: run.score + outcome.points,
    correct: run.correct + (outcome.correct ? 1 : 0),
    hearts,
  });
  return {
    outcome: {
      correct: outcome.correct,
      points: outcome.points,
      heartLost: outcome.heartLost,
      ...(outcome.retry && { retry: true }),
      ...outcome.reveal,
    },
    done: lab.isOver(next, hearts),
    run: toPublicRun(updated),
  };
}

/** Checks one answer on the server and returns what happened (and the answer once a step is over). */
gamesRouter.post('/me/games/runs/:id/answer', async (req, res) => {
  const user = me(req);
  const a = AnswerBody.parse(req.body);
  const run = await ownRun(user.id, String(req.params.id));
  if (run.status !== 'playing') throw new AppError(409, 'This game has finished', 'finished');
  const lab = labOf(run.game);
  if (lab) {
    res.json(await answerLab(lab, run, a));
    return;
  }
  const state = stateOf(run);
  const { progress, puzzle } = state;
  if (puzzle.kind !== 'word-hunter' && a.step !== progress.at)
    // A repeated or late tap: the app catches up from the run.
    throw new AppError(409, 'That question was already answered', 'stale');
  if (isOver(state, run.hearts)) throw new AppError(409, 'This game has finished', 'finished');

  const outcome = check(state, a);
  const next: RunState = structuredClone(state);
  const p = next.progress;
  if (puzzle.kind === 'word-hunter') {
    if (outcome.correct) {
      const word = outcome.reveal!.word as string;
      p.found.push(word);
      p.results[puzzle.words.findIndex((w) => w.word === word)] = { correct: true, points: outcome.points };
    }
  } else if (outcome.advance) {
    p.results[p.at] = {
      correct: outcome.correct,
      points: outcome.points,
      ...(a.word && { answer: a.word.toUpperCase() }),
      hints: p.hintsAt?.[p.at]?.length ?? 0,
    };
    p.streak = outcome.correct ? p.streak + 1 : 0;
    p.at += 1;
    if (puzzle.kind === 'spellcaster') p.hp = Math.max(0, (p.hp ?? puzzle.hp) - outcome.points);
  }
  const hearts = Math.max(0, run.hearts - (outcome.heartLost ? 1 : 0));
  const updated = await save(run, {
    state: next,
    score: run.score + outcome.points,
    correct: run.correct + (outcome.correct ? 1 : 0),
    hearts,
  });
  const opponentPoints = puzzle.kind === 'word-clash' && outcome.advance ? (state.opponent?.rounds[state.progress.at] ?? 0) : undefined;
  res.json({
    outcome: {
      correct: outcome.correct,
      points: outcome.points,
      heartLost: outcome.heartLost,
      ...(outcome.retry && { retry: true }),
      ...(outcome.reason && { reason: outcome.reason }),
      ...outcome.reveal,
      ...(opponentPoints !== undefined && { opponentPoints }),
    },
    done: isOver(next, hearts),
    run: toPublicRun(updated),
  });
});

/**
 * Hints, paid with coins: Hidden Letters reveals a missing letter (15 coins), Sentence Master the
 * next word (10 coins). The coins are only taken if the learner has them.
 */
gamesRouter.post('/me/games/runs/:id/hint', async (req, res) => {
  const user = me(req);
  const { step } = z.object({ step: z.number().int().min(0) }).parse(req.body);
  const run = await ownRun(user.id, String(req.params.id));
  if (run.status !== 'playing') throw new AppError(409, 'This game has finished', 'finished');
  if (labOf(run.game)) throw new AppError(400, 'Ask Kora for help in the lab', 'no-hints');
  const state = stateOf(run);
  const { puzzle, progress } = state;
  if (step !== progress.at) throw new AppError(409, 'That question was already answered', 'stale');
  const used = progress.hintsAt?.[step] ?? [];

  let hint: { index: number; letter?: string; word?: string };
  let cost: number;
  if (puzzle.kind === 'hidden-letters') {
    const s = puzzle.steps[step]!;
    const k = s.blanks.find((b) => !used.includes(b));
    if (k === undefined) throw new AppError(409, 'There are no letters left to reveal', 'no-hints');
    hint = { index: k, letter: s.word[k]! };
    cost = HL_HINT_COST;
  } else if (puzzle.kind === 'sentence-master') {
    const words = puzzle.steps[step]!.sentence.words;
    if (used.length >= words.length - 1) throw new AppError(409, 'You already have most of the sentence', 'no-hints');
    hint = { index: used.length, word: words[used.length]! };
    cost = SM_HINT_COST;
  } else throw new AppError(400, 'This game has no hints', 'no-hints');

  const next: RunState = structuredClone(state);
  next.progress.hintsAt = { ...next.progress.hintsAt, [step]: [...used, hint.index] };
  const updated = await prisma.$transaction(async (tx) => {
    const paid = await tx.user.updateMany({ where: { id: user.id, coins: { gte: cost } }, data: { coins: { decrement: cost } } });
    if (!paid.count) throw new AppError(402, `A hint costs ${cost} coins`, 'no-coins');
    await tx.coinTransaction.create({ data: { userId: user.id, xp: 0, coins: -cost, reason: 'game-hint' } });
    const { count } = await tx.gameRun.updateMany({
      where: { id: run.id, version: run.version },
      data: { state: next as object, hintCoins: { increment: cost }, version: { increment: 1 } },
    });
    if (!count) throw new AppError(409, 'This game changed on another screen. Please try again.', 'stale');
    return tx.gameRun.findUniqueOrThrow({ where: { id: run.id } });
  });
  res.json({ hint, cost, run: toPublicRun(updated), user: toPublicUser(await prisma.user.findUniqueOrThrow({ where: { id: user.id } })) });
});

// ─── Finishing ────────────────────────────────────────────────────────────────

/**
 * Ends a run (all steps played, out of hearts, or time up) and gives the rewards: stars, XP and
 * coins. Beating your best pays in full; replays pay 30%. Safe to call twice.
 */
gamesRouter.post('/me/games/runs/:id/finish', async (req, res) => {
  const user = me(req);
  const { secondsLeft } = z.object({ secondsLeft: z.number().min(0).max(600).optional() }).parse(req.body ?? {});
  let run = await ownRun(user.id, String(req.params.id));
  if (run.status === 'abandoned') throw new AppError(409, 'This game was left unfinished', 'abandoned');

  if (run.status === 'playing') {
    let score = run.score;
    let stars: number;
    const lab = labOf(run.game);
    if (lab) stars = lab.stars(labStateOf(run), run.hearts);
    else {
      const state = stateOf(run);
      const { puzzle, progress } = state;
      // Bonuses: time left after finding every word; hearts left after defeating the guardian.
      if (puzzle.kind === 'word-hunter' && progress.found.length === puzzle.words.length) score += Math.round(Math.min(secondsLeft ?? 0, puzzle.seconds) * 2);
      if (puzzle.kind === 'spellcaster' && (progress.hp ?? 1) <= 0) score += 200 + run.hearts * 50;
      stars = starsFor(state, run.hearts, score);
    }

    const prev = await prisma.gameProgress.findUnique({ where: { userId_game_level: { userId: user.id, game: run.game, level: run.level } } });
    let xp = 0;
    let coins = 0;
    if (stars > 0) {
      xp = 15 + 5 * run.level + 10 * stars;
      coins = 3 + run.level + 2 * stars;
      if (stars <= (prev?.bestStars ?? 0)) {
        xp = Math.ceil(xp * 0.3);
        coins = Math.ceil(coins * 0.3);
      }
      const today = await rewardsToday(user.id);
      xp = Math.max(0, Math.min(xp, DAILY_CAP.xp - today.xp));
      coins = Math.max(0, Math.min(coins, DAILY_CAP.coins - today.coins));
    }
    run = await save(run, { status: 'finished', score, stars, xp, coins, finishedAt: new Date() });
    await prisma.gameProgress.upsert({
      where: { userId_game_level: { userId: user.id, game: run.game, level: run.level } },
      create: { userId: user.id, game: run.game, level: run.level, bestStars: stars, bestScore: score, plays: 1 },
      update: { bestStars: Math.max(stars, prev?.bestStars ?? 0), bestScore: Math.max(score, prev?.bestScore ?? 0), plays: { increment: 1 } },
    });
    const minutes = Math.min(15, (Date.now() - run.startedAt.getTime()) / 60_000);
    if (xp || coins) await recordActivity(user.id, { xp, coins, minutes }, { reason: `game:${subjectOf(run.game)}:${run.game}`, tz: requestTimeZone(req) });
    if (stars > 0) await confirmReferralIfEligible(user.id);
    await recordQuestEvent(
      user.id,
      {
        subject: subjectOf(run.game),
        game: run.game,
        level: run.level,
        stars,
        results: (run.state as unknown as { progress: Progress }).progress.results,
      },
      requestTimeZone(req),
    );
  }

  const state = stateOf(run);
  const best = await prisma.gameProgress.findUnique({ where: { userId_game_level: { userId: user.id, game: run.game, level: run.level } } });
  const opponent = state.opponent;
  res.json({
    run: toPublicRun(run),
    summary: {
      stars: run.stars,
      score: run.score,
      xp: run.xp,
      coins: run.coins,
      best: { stars: best?.bestStars ?? run.stars, score: best?.bestScore ?? run.score },
      newBest: run.score >= (best?.bestScore ?? 0),
      nextLevelUnlocked: run.stars > 0 && run.level < MAX_LEVEL,
      ...(opponent && {
        opponent: {
          kind: opponent.kind,
          name: opponent.name,
          ...(opponent.photo && { photo: opponent.photo }),
          total: opponent.rounds.reduce((s, n) => s + n, 0),
        },
      }),
    },
    user: toPublicUser(await prisma.user.findUniqueOrThrow({ where: { id: user.id } })),
  });
});

/**
 * Ask Kora, the AI helper, about the current step, for 10 coins. Kora knows the answer but guides the
 * learner towards it instead of saying it, in the learner's language. Up to 5 questions a run.
 */
gamesRouter.post('/me/games/runs/:id/ask', async (req, res) => {
  const user = me(req);
  const { question } = z.object({ question: z.string().trim().max(300).default('') }).parse(req.body ?? {});
  const run = await ownRun(user.id, String(req.params.id));
  if (run.status !== 'playing') throw new AppError(409, 'This game has finished', 'finished');
  const lab = labOf(run.game);
  if (!lab) throw new AppError(400, 'Use hints in this game', 'no-hints');
  const state = labStateOf(run);
  const asked = state.progress.asked ?? 0;
  if (asked >= 5) throw new AppError(429, 'You’ve asked Kora 5 times in this game. Try on your own now!', 'rate-limited');
  // Take the coins first (only if the learner has them); give them back if the AI fails.
  const paid = await prisma.user.updateMany({ where: { id: user.id, coins: { gte: ASK_COST } }, data: { coins: { decrement: ASK_COST } } });
  if (!paid.count) throw new AppError(402, `Asking Kora costs ${ASK_COST} coins`, 'no-coins');
  let reply: string;
  try {
    reply = await askKora(user.id, { subject: lab.subject, context: lab.help(state, run.level), question, language: requestLanguage(req) });
  } catch (e) {
    await prisma.user.update({ where: { id: user.id }, data: { coins: { increment: ASK_COST } } });
    throw e;
  }
  const next: LabState = structuredClone(state);
  next.progress.asked = asked + 1;
  await prisma.$transaction([
    prisma.coinTransaction.create({ data: { userId: user.id, xp: 0, coins: -ASK_COST, reason: 'game-ask' } }),
    prisma.gameRun.update({ where: { id: run.id }, data: { state: next as object, hintCoins: { increment: ASK_COST }, version: { increment: 1 } } }),
  ]);
  res.json({ reply, cost: ASK_COST, user: toPublicUser(await prisma.user.findUniqueOrThrow({ where: { id: user.id } })) });
});

/** Leave without finishing: no rewards, nothing saved to progress. */
gamesRouter.post('/me/games/runs/:id/quit', async (req, res) => {
  const user = me(req);
  const run = await ownRun(user.id, String(req.params.id));
  if (run.status === 'playing') await prisma.gameRun.update({ where: { id: run.id }, data: { status: 'abandoned' } });
  res.json({ ok: true });
});

/** Hourly: unfinished runs older than three hours are dropped, and dropped ones are deleted after a week. */
export async function gamesUpkeep(now = Date.now()) {
  await prisma.gameRun.updateMany({ where: { status: 'playing', startedAt: { lt: new Date(now - 3 * 3_600_000) } }, data: { status: 'abandoned' } });
  await prisma.gameRun.deleteMany({ where: { status: 'abandoned', startedAt: { lt: new Date(now - 7 * DAY) } } });
}
