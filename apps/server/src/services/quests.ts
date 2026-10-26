import { prisma } from '../db.js';
import { ALL_PLACES, JOURNEY_STEPS, PLACES, REWARDS, TEMPLATES, WEEKLY_TIMES, type Place, type QuestEvent, type QuestTemplate } from '../data/quests.js';
import { AppError } from '../lib/errors.js';
import { localDayKey, weekKey } from '../lib/time.js';
import { random } from './games/english.js';
import { recordActivity } from './progress.js';
import { earnItems, nextQuestItem } from './world.js';

/**
 * World Quests. Each learner has a daily board (4 quests, one per place, and 3 chests) and a weekly
 * board (4 bigger quests and a 6-step journey through every place ending in a chest). Boards are
 * picked from a seed (learner + period), moved on by finished game runs, and paid out on claim.
 */
type QuestState = { id: string; target: number; progress: number; claimed?: number; places?: Place[] };
type DailyState = { quests: QuestState[]; chests: number[] };
type WeeklyState = { quests: QuestState[]; journey: { steps: QuestState[]; at: number; chest?: number } };
type Kind = 'daily' | 'weekly';

const template = (id: string) => TEMPLATES.find((t) => t.id === id);
const placed = (place: Place) => TEMPLATES.filter((t) => t.place === place);

function shuffle<T>(r: () => number, list: readonly T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
const pick = <T>(r: () => number, list: readonly T[]) => list[Math.floor(r() * list.length)]!;
const fresh = (t: QuestTemplate, times = 1): QuestState => ({ id: t.id, target: t.target * times, progress: 0 });

export { weekKey };

// ─── Periods ──────────────────────────────────────────────────────────────────

/** Milliseconds until local midnight, and until the local week ends (Sunday midnight). */
function resetsIn(tz: string | undefined, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz ?? 'Africa/Lagos',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const day = 86_400_000 - (Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second)) * 1000;
  const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday!);
  return { day, week: day + (6 - weekday) * 86_400_000 };
}

// ─── Making boards ────────────────────────────────────────────────────────────

/** One quest from each place, in a random order. */
function newDaily(seed: string): DailyState {
  const r = random(seed);
  return { quests: shuffle(r, PLACES).map((p) => fresh(pick(r, placed(p)))), chests: [] };
}

/** Play in every place, one "anywhere" quest and two place quests (three times the daily size); and a journey. */
function newWeekly(seed: string): WeeklyState {
  const r = random(seed);
  const anywhere = pick(
    r,
    TEMPLATES.filter((t) => t.place === 'any'),
  );
  const [a, b] = shuffle(r, PLACES);
  const quests = [
    { id: ALL_PLACES, target: PLACES.length, progress: 0, places: [] },
    fresh(anywhere, WEEKLY_TIMES),
    fresh(pick(r, placed(a!)), WEEKLY_TIMES),
    fresh(pick(r, placed(b!)), WEEKLY_TIMES),
  ];
  // The journey visits every place, then two more stops anywhere.
  const first = shuffle(r, PLACES).map((p) => pick(r, placed(p)));
  const more = shuffle(
    r,
    TEMPLATES.filter((t) => t.place !== 'any' && !first.includes(t)),
  ).slice(0, JOURNEY_STEPS - first.length);
  return { quests, journey: { steps: [...first, ...more].map((t) => fresh(t)), at: 0 } };
}

async function boards(userId: string, tz?: string) {
  const day = localDayKey(new Date(), tz);
  const week = weekKey(day);
  const get = async (kind: Kind, key: string, make: () => DailyState | WeeklyState) =>
    prisma.questBoard.upsert({
      where: { userId_kind_key: { userId, kind, key } },
      create: { userId, kind, key, state: make() as object },
      update: {},
    });
  const [daily, weekly] = await Promise.all([
    get('daily', day, () => newDaily(`${userId}:daily:${day}`)),
    get('weekly', week, () => newWeekly(`${userId}:weekly:${week}`)),
  ]);
  return { daily, weekly };
}

type Board = Awaited<ReturnType<typeof boards>>['daily'];

/** Saves a board unless something changed it first (then the caller tries again). */
async function saveBoard(board: Board, state: DailyState | WeeklyState) {
  const { count } = await prisma.questBoard.updateMany({
    where: { id: board.id, version: board.version },
    data: { state: state as object, version: { increment: 1 } },
  });
  return count > 0;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

function advance(quest: QuestState, e: QuestEvent) {
  if (quest.claimed || quest.progress >= quest.target) return;
  if (quest.id === ALL_PLACES) {
    if (!PLACES.includes(e.subject as Place)) return;
    quest.places = [...new Set([...(quest.places ?? []), e.subject as Place])];
    quest.progress = Math.min(quest.target, quest.places.length);
    return;
  }
  const t = template(quest.id);
  if (t) quest.progress = Math.min(quest.target, quest.progress + t.count(e));
}

/** Moves every quest on after a finished game. Never throws (quests must not break finishing a game). */
export async function recordQuestEvent(userId: string, e: QuestEvent, tz?: string) {
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { daily, weekly } = await boards(userId, tz);
      const d = structuredClone(daily.state) as unknown as DailyState;
      d.quests.forEach((q) => advance(q, e));
      const w = structuredClone(weekly.state) as unknown as WeeklyState;
      w.quests.forEach((q) => advance(q, e));
      // Only the current journey step moves; finishing it opens the next.
      const step = w.journey.steps[w.journey.at];
      if (step) {
        advance(step, e);
        if (step.progress >= step.target) w.journey.at += 1;
      }
      if ((await saveBoard(daily, d)) && (await saveBoard(weekly, w))) return;
    }
  } catch (err) {
    console.error('quests: could not record a game', err);
  }
}

// ─── What the app sees ────────────────────────────────────────────────────────

function questView(q: QuestState, reward: { xp: number; coins: number }) {
  const t = template(q.id);
  return {
    id: q.id,
    place: t?.place ?? 'any',
    ...(t?.game && { game: t.game }),
    target: q.target,
    progress: q.progress,
    done: q.progress >= q.target,
    claimed: !!q.claimed,
    xp: reward.xp,
    coins: reward.coins,
  };
}

export async function questBoards(userId: string, tz?: string) {
  const { daily, weekly } = await boards(userId, tz);
  const d = daily.state as unknown as DailyState;
  const w = weekly.state as unknown as WeeklyState;
  const left = resetsIn(tz);
  const claimed = d.quests.filter((q) => q.claimed).length;
  const journeyDone = w.journey.at >= w.journey.steps.length;
  return {
    daily: {
      key: daily.key,
      resetsIn: left.day,
      quests: d.quests.map((q) => questView(q, REWARDS.daily)),
      chests: REWARDS.dailyChests.map((c, i) => ({ ...c, ready: claimed >= c.after, claimed: d.chests.includes(i) })),
    },
    weekly: {
      key: weekly.key,
      resetsIn: left.week,
      quests: w.quests.map((q) => questView(q, REWARDS.weekly)),
    },
    journey: {
      at: w.journey.at,
      steps: w.journey.steps.map((q, i) => ({ ...questView(q, { xp: 0, coins: 0 }), current: i === w.journey.at })),
      chest: { ...REWARDS.journeyChest, ready: journeyDone, claimed: !!w.journey.chest },
    },
  };
}

// ─── Claiming ─────────────────────────────────────────────────────────────────

/** Pays out a finished quest (once). */
export async function claimQuest(userId: string, kind: Kind, id: string, tz?: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const all = await boards(userId, tz);
    const board = all[kind];
    const state = structuredClone(board.state) as unknown as DailyState | WeeklyState;
    const quest = state.quests.find((q) => q.id === id);
    if (!quest) throw new AppError(404, 'That quest isn’t on your board', 'not-found');
    if (quest.claimed) throw new AppError(409, 'You already claimed this quest', 'claimed');
    if (quest.progress < quest.target) throw new AppError(409, 'Finish the quest first', 'not-done');
    quest.claimed = Date.now();
    if (!(await saveBoard(board, state))) continue;
    const reward = REWARDS[kind];
    const user = await recordActivity(userId, { ...reward, minutes: 0 }, { reason: `quest:${id}`, tz });
    return { reward, user };
  }
  throw new AppError(409, 'Your quests changed. Please try again.', 'stale');
}

/** Opens a daily chest (once enough quests are claimed) or the journey's chest (once every step is done). */
export async function openChest(userId: string, chest: 'daily' | 'journey', index: number, tz?: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const all = await boards(userId, tz);
    let reward: { xp: number; coins: number };
    let board: Board;
    let state: DailyState | WeeklyState;
    if (chest === 'daily') {
      board = all.daily;
      const d = structuredClone(board.state) as unknown as DailyState;
      const c = REWARDS.dailyChests[index];
      if (!c) throw new AppError(404, 'There’s no such chest', 'not-found');
      if (d.chests.includes(index)) throw new AppError(409, 'You already opened this chest', 'claimed');
      if (d.quests.filter((q) => q.claimed).length < c.after) throw new AppError(409, `Claim ${c.after} quests to open this chest`, 'not-done');
      d.chests.push(index);
      reward = c;
      state = d;
    } else {
      board = all.weekly;
      const w = structuredClone(board.state) as unknown as WeeklyState;
      if (w.journey.chest) throw new AppError(409, 'You already opened this chest', 'claimed');
      if (w.journey.at < w.journey.steps.length) throw new AppError(409, 'Finish the journey first', 'not-done');
      w.journey.chest = Date.now();
      reward = REWARDS.journeyChest;
      state = w;
    }
    if (!(await saveBoard(board, state))) continue;
    const user = await recordActivity(userId, { xp: reward.xp, coins: reward.coins, minutes: 0 }, { reason: `quest-chest:${chest}`, tz });
    // The journey chest also holds an avatar item you can't get anywhere else (while any are left).
    const item = chest === 'journey' ? await nextQuestItem(userId) : null;
    if (item) await earnItems(userId, [item]);
    return { reward: { xp: reward.xp, coins: reward.coins, ...(item && { item }) }, user };
  }
  throw new AppError(409, 'Your quests changed. Please try again.', 'stale');
}
