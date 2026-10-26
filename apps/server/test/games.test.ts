import { describe, expect, it } from 'vitest';

import { HUNT_THEMES } from '../src/data/english/hunts.js';
import { SENTENCES } from '../src/data/english/sentences.js';
import { VOCAB } from '../src/data/english/vocab.js';
import { prisma } from '../src/db.js';
import { isWord } from '../src/services/games/dictionary.js';
import { buildPuzzle, clashPoints, lineBetween, publicState, newProgress, RARE_SEEDS, type RunState } from '../src/services/games/english.js';
import { http, signIn } from './helpers.js';

type As = Awaited<ReturnType<typeof signIn>>['as'];
const start = (as: As, game: string, level = 1) => as.post(`/me/games/english/${game}/runs`, { level });
const secret = async (id: string) => ((await prisma.gameRun.findUniqueOrThrow({ where: { id } })).state as unknown as RunState).puzzle;

describe('word game content', () => {
  it('is clean: clues never give the word away, traps are wrong, rare seeds are real words', () => {
    for (const words of Object.values(VOCAB)) {
      expect(words.length).toBeGreaterThanOrEqual(10);
      for (const { word, clue } of words) {
        expect(word).toMatch(/^[A-Z]+$/);
        expect(clue.toUpperCase()).not.toContain(word);
      }
    }
    for (const { sentences } of Object.values(SENTENCES))
      for (const s of sentences) {
        expect(s.words).not.toContain(s.trap);
        expect(s.words.length).toBeGreaterThanOrEqual(3);
      }
    for (const w of RARE_SEEDS) expect(isWord(w)).toBe(true);
    for (const t of HUNT_THEMES) for (const w of t.words) expect(w.length).toBeLessThanOrEqual(10);
    expect(isWord('quiz')).toBe(true);
    expect(isWord('qzx')).toBe(false);
    expect(clashPoints('QUIZ').total).toBe(42);
  });

  it('builds the same puzzle from the same seed, and never shows answers to the app', () => {
    const a = buildPuzzle('hidden-letters', 3, 'seed-1');
    expect(buildPuzzle('hidden-letters', 3, 'seed-1')).toEqual(a);
    const shown = JSON.stringify(publicState({ puzzle: a, progress: newProgress(a) }));
    if (a.kind !== 'hidden-letters') throw new Error('kind');
    for (const s of a.steps) expect(shown).not.toContain(`"${s.word}"`);

    const spells = buildPuzzle('spellcaster', 2, 'x');
    const shownSpells = JSON.stringify(publicState({ puzzle: spells, progress: newProgress(spells) }));
    if (spells.kind !== 'spellcaster') throw new Error('kind');
    for (const s of spells.spells) expect(shownSpells).not.toContain(`"${s.word}"`);

    for (let level = 1; level <= 5; level++) {
      const hunt = buildPuzzle('word-hunter', level, `h${level}`);
      if (hunt.kind !== 'word-hunter') throw new Error('kind');
      // Every hidden word really is in the grid where the server says.
      for (const w of hunt.words) expect(w.cells.map(([r, c]) => hunt.grid[r]![c]).join('')).toBe(w.word);
    }
    expect(lineBetween([0, 0], [2, 1])).toBeNull();
  });
});

describe('playing the games (server-checked)', () => {
  it('Hidden Letters: answers are checked on the server, hints cost coins, rewards come at the end', async () => {
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { coins: 20 } });
    const res = await start(as, 'hidden-letters').expect(201);
    const run = res.body.run;
    expect(run.steps).toHaveLength(8);
    expect(run.steps[0].tiles).toContain(null);
    const p = await secret(run.id);
    if (p.kind !== 'hidden-letters') throw new Error('kind');

    // A hint reveals a letter for 15 coins; a second one can't be afforded.
    const hint = await as.post(`/me/games/runs/${run.id}/hint`, { step: 0 }).expect(200);
    expect(hint.body.hint.letter).toBe(p.steps[0]!.word[hint.body.hint.index]);
    expect(hint.body.user.coins).toBe(5);
    expect((await as.post(`/me/games/runs/${run.id}/hint`, { step: 0 }).expect(p.steps[0]!.blanks.length > 1 ? 402 : 409)).body.reason).toMatch(
      /no-coins|no-hints/,
    );

    for (let i = 0; i < 8; i++) {
      const s = p.steps[i]!;
      const open = s.blanks.filter((b) => !(i === 0 && b === hint.body.hint.index));
      const r = await as.post(`/me/games/runs/${run.id}/answer`, { step: i, letters: open.map((b) => s.word[b]), ms: 4000 }).expect(200);
      expect(r.body.outcome).toMatchObject({ correct: true, word: s.word });
    }
    // Answering the same step twice is refused.
    expect((await as.post(`/me/games/runs/${run.id}/answer`, { step: 7, letters: ['A'] }).expect(409)).body.reason).toMatch(/stale|finished/);

    const before = (await prisma.user.findUniqueOrThrow({ where: { id: sub } })).xp;
    const done = await as.post(`/me/games/runs/${run.id}/finish`, {}).expect(200);
    expect(done.body.summary).toMatchObject({ stars: 3, nextLevelUnlocked: true });
    expect(done.body.summary.xp).toBeGreaterThan(0);
    expect(done.body.user.xp).toBe(before + done.body.summary.xp);
    // Finishing again changes nothing.
    await as.post(`/me/games/runs/${run.id}/finish`, {}).expect(200);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).xp).toBe(before + done.body.summary.xp);

    const cat = (await as.get('/me/games/english').expect(200)).body;
    const hl = cat.games.find((g: { id: string }) => g.id === 'hidden-letters');
    expect(hl.levels[0]).toMatchObject({ bestStars: 3, plays: 1 });
    expect(hl.levels[1].unlocked).toBe(true);
    expect(hl.levels[2].unlocked).toBe(false);
  });

  it('locks levels until the one before has a star, and pays less for replays', async () => {
    const { as } = await signIn();
    expect((await start(as, 'sentence-master', 2).expect(403)).body.reason).toBe('locked');
    const play = async () => {
      const run = (await start(as, 'sentence-master').expect(201)).body.run;
      const p = await secret(run.id);
      if (p.kind !== 'sentence-master') throw new Error('kind');
      for (let i = 0; i < 8; i++) await as.post(`/me/games/runs/${run.id}/answer`, { step: i, words: p.steps[i]!.sentence.words }).expect(200);
      return (await as.post(`/me/games/runs/${run.id}/finish`).expect(200)).body.summary;
    };
    const first = await play();
    const again = await play();
    expect(first.stars).toBe(3);
    expect(again.xp).toBe(Math.ceil(first.xp * 0.3));
    await start(as, 'sentence-master', 2).expect(201);
  });

  it('Sentence Master: the trap word makes it wrong, and the right sentence is shown', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'sentence-master').expect(201)).body.run;
    const p = await secret(run.id);
    if (p.kind !== 'sentence-master') throw new Error('kind');
    const s = p.steps[0]!.sentence;
    const wrong = [...s.words];
    wrong[wrong.length - 1] = s.trap;
    const r = await as.post(`/me/games/runs/${run.id}/answer`, { step: 0, words: wrong }).expect(200);
    expect(r.body.outcome).toMatchObject({ correct: false, points: 0 });
    expect(r.body.outcome.sentence).toContain(s.words[0]);
    expect(run.steps[0].chips).toContain(s.trap);
  });

  it('Word Clash: real dictionary words from the rack score; bad words cost a heart; a practice rival is labelled', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'word-clash').expect(201)).body.run;
    expect(run.opponent).toMatchObject({ kind: 'bot', name: null });
    const p = await secret(run.id);
    if (p.kind !== 'word-clash') throw new Error('kind');
    const bad = await as.post(`/me/games/runs/${run.id}/answer`, { step: 0, word: 'ZZZQX' }).expect(200);
    expect(bad.body.outcome).toMatchObject({ correct: false, retry: true, heartLost: true });
    expect(bad.body.run.hearts).toBe(2);
    for (let i = 0; i < 5; i++) {
      const r = await as.post(`/me/games/runs/${run.id}/answer`, { step: i, word: p.rounds[i]!.best.word }).expect(200);
      expect(r.body.outcome).toMatchObject({ correct: true, points: p.rounds[i]!.best.points });
      expect(r.body.outcome.opponentPoints).toBeGreaterThanOrEqual(0);
    }
    const done = await as.post(`/me/games/runs/${run.id}/finish`).expect(200);
    expect(done.body.summary.opponent).toMatchObject({ kind: 'bot' });
    expect(done.body.summary.stars).toBe(3);

    // Another learner now plays the same racks against this match.
    const other = await signIn({ email: 'tunde@example.com' });
    const vs = (await start(other.as, 'word-clash').expect(201)).body.run;
    expect(vs.opponent.kind).toBe('player');
    expect(vs.rounds.map((r: { rack: { letter: string }[] }) => r.rack.map((t) => t.letter).join(''))).toEqual(p.rounds.map((r) => r.rack.join('')));
  });

  it('Word Hunter: words are found by dragging across the grid, either way round', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'word-hunter').expect(201)).body.run;
    const p = await secret(run.id);
    if (p.kind !== 'word-hunter') throw new Error('kind');
    const miss = await as.post(`/me/games/runs/${run.id}/answer`, { from: [0, 0], to: [0, 1] }).expect(200);
    expect(miss.body.outcome.correct).toBe(false);
    for (const [k, w] of p.words.entries()) {
      const [from, to] = k % 2 ? [w.cells.at(-1)!, w.cells[0]!] : [w.cells[0]!, w.cells.at(-1)!];
      const r = await as.post(`/me/games/runs/${run.id}/answer`, { from, to }).expect(200);
      expect(r.body.outcome).toMatchObject({ correct: true, word: w.word });
    }
    const done = await as.post(`/me/games/runs/${run.id}/finish`, { secondsLeft: 30 }).expect(200);
    expect(done.body.summary.stars).toBe(3);
    expect(done.body.run.found).toHaveLength(p.words.length);
  });

  it('Spellcaster: right spells damage the guardian, wrong ones cost hearts', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'spellcaster').expect(201)).body.run;
    expect(run.hp).toBe(run.maxHp);
    const p = await secret(run.id);
    if (p.kind !== 'spellcaster') throw new Error('kind');
    const miss = await as.post(`/me/games/runs/${run.id}/answer`, { step: 0, word: 'WRONG', ms: 3000 }).expect(200);
    expect(miss.body.outcome).toMatchObject({ correct: false, heartLost: true, word: p.spells[0]!.word });
    let done = false;
    for (let i = 1; !done; i++) {
      const r = await as.post(`/me/games/runs/${run.id}/answer`, { step: i, word: p.spells[i]!.word, ms: 3000 }).expect(200);
      expect(r.body.outcome.damage).toBeGreaterThan(0);
      done = r.body.done;
    }
    const fin = await as.post(`/me/games/runs/${run.id}/finish`).expect(200);
    expect(fin.body.run.hp).toBe(0);
    expect(fin.body.summary.stars).toBe(3);
  });

  it('keeps runs private and needs sign-in', async () => {
    const { as } = await signIn();
    const run = (await start(as, 'hidden-letters').expect(201)).body.run;
    const other = await signIn({ email: 'kemi@example.com' });
    await other.as.post(`/me/games/runs/${run.id}/answer`, { step: 0, letters: ['A'] }).expect(404);
    await http().get('/me/games/english').expect(401);
    await start(as, 'chess').expect(400);
  });
});
