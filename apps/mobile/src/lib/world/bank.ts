import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { request } from '../api';
import { getWorld } from './content';
import type { WorldId } from './types';

/**
 * The adventure's question banks: for each world and each of the ten levels, checked multiple-choice
 * questions, true-or-false statements and key terms (written by the server's scripts/world-content.ts,
 * served by GET /world/bank/:world/:level). A level is fetched once and kept on the device; with no
 * connection and nothing kept, the starter questions built into the app are used instead.
 */
export type BankQuestion = { id: string; q: string; options: string[]; answer: number; why: string; hint: string };
export type BankTruth = { id: string; s: string; answer: boolean; why: string };
export type BankTerm = { id: string; word: string; clue: string };
export type BankLevel = { questions: BankQuestion[]; truths: BankTruth[]; terms: BankTerm[]; offline?: boolean };

const KEY = 'knowzone.world.bank.v1:';
const mem = new Map<string, BankLevel>();
const pending = new Map<string, Promise<BankLevel>>();
const id = (world: WorldId, level: number) => `${world}-${level}`;

/** The starter questions built into the app, split over the ladder (used offline). */
export function builtInBank(world: WorldId, level: number): BankLevel {
  const w = getWorld(world)!;
  const easy = w.questions.filter((q) => !q.hard);
  const hard = w.questions.filter((q) => q.hard);
  const pool = level <= 3 ? easy : level <= 6 ? [...easy.slice(4), ...hard] : [...hard, ...easy.slice(6)];
  return {
    offline: true,
    questions: pool.map((q) => ({ id: q.id, q: q.question, options: q.options, answer: q.correctIndex, why: q.explanation, hint: q.hint })),
    truths: w.truths.map((t) => ({ id: t.id, s: t.statement, answer: t.answer, why: t.explanation })),
    terms: w.words.map((x) => ({ id: x.id, word: x.word, clue: x.clue })),
  };
}

const usable = (b: BankLevel | null | undefined): b is BankLevel =>
  !!b && Array.isArray(b.questions) && b.questions.length >= 4 && Array.isArray(b.truths) && Array.isArray(b.terms);

/** A level's bank: from memory, the device, the server, or (offline) the built-in starter questions. */
export function loadBank(world: WorldId, level: number): Promise<BankLevel> {
  const k = id(world, level);
  const have = mem.get(k);
  if (have && !have.offline) return Promise.resolve(have);
  if (pending.has(k)) return pending.get(k)!;
  const job = (async () => {
    try {
      const kept = await AsyncStorage.getItem(KEY + k);
      const parsed = kept ? (JSON.parse(kept) as BankLevel) : null;
      if (usable(parsed)) {
        mem.set(k, parsed);
        // Refresh quietly in the background, so corrected questions reach the device.
        request<BankLevel>(`/world/bank/${world}/${level}`)
          .then((fresh) => {
            if (!usable(fresh)) return;
            mem.set(k, fresh);
            AsyncStorage.setItem(KEY + k, JSON.stringify(fresh)).catch(() => {});
          })
          .catch(() => {});
        return parsed;
      }
    } catch {
      // Nothing kept on the device.
    }
    try {
      const fresh = await request<BankLevel>(`/world/bank/${world}/${level}`);
      if (usable(fresh)) {
        mem.set(k, fresh);
        AsyncStorage.setItem(KEY + k, JSON.stringify(fresh)).catch(() => {});
        return fresh;
      }
    } catch {
      // Offline or the server is older than the banks: fall back below.
    }
    const offline = builtInBank(world, level);
    mem.set(k, offline);
    return offline;
  })().finally(() => pending.delete(k));
  pending.set(k, job);
  return job;
}

/** Loads a level's bank for a screen. */
export function useBank(world: WorldId | undefined, level: number) {
  const k = world ? id(world, level) : '';
  const [state, setState] = useState<{ k: string; bank: BankLevel | null }>(() => ({ k, bank: (k && mem.get(k)) || null }));
  useEffect(() => {
    if (!world) return;
    let live = true;
    void loadBank(world, level).then((bank) => {
      if (live) setState({ k: id(world, level), bank });
    });
    return () => {
      live = false;
    };
  }, [world, level]);
  return state.k === k ? state.bank : null;
}

/** Finds a question, statement or term already loaded on this device by its id (for reviewing mistakes). */
export function findBankItem(itemId: string): BankQuestion | BankTruth | BankTerm | undefined {
  for (const b of mem.values()) {
    const hit = b.questions.find((x) => x.id === itemId) ?? b.truths.find((x) => x.id === itemId) ?? b.terms.find((x) => x.id === itemId);
    if (hit) return hit;
  }
  return undefined;
}
