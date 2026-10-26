import type { Ionicons } from '@expo/vector-icons';

import i18n from '../../i18n';

export type WorldId = 'space' | 'math' | 'nature' | 'language' | 'history' | 'code' | 'art';
export type LevelKind = 'mission' | 'sprint' | 'puzzle' | 'battle' | 'boss';

/** Multiple-choice question with a nudge for the AI helper. */
export type GameQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  hard?: boolean;
};
export type TrueFalse = { id: string; statement: string; answer: boolean; explanation: string };
export type Scramble = { id: string; word: string; clue: string };

export type Collectible = { id: string; name: string; emoji: string; description: string; atStars: number };

export type World = {
  id: WorldId;
  name: string;
  tagline: string;
  story: string;
  emoji: string;
  icon: keyof typeof Ionicons.glyphMap;
  subjects: string[];
  /** Total stars across all worlds needed to unlock. 0 = open from the start. */
  unlockStars: number;
  boss: { name: string; emoji: string; taunt: string };
  rival: { name: string; emoji: string };
  questions: GameQuestion[];
  truths: TrueFalse[];
  words: Scramble[];
  collectibles: Collectible[];
};

export type Level = {
  id: string;
  worldId: WorldId;
  number: number;
  kind: LevelKind;
  title: string;
  blurb: string;
  xp: number;
  coins: number;
};

type KindInfo = {
  /** "Mission", "Puzzle"… in the current language. */
  readonly label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  /** How to play, in the current language. */
  readonly how: string;
};

const kind = (id: LevelKind, icon: KindInfo['icon'], color: string): KindInfo => ({
  icon,
  color,
  get label() {
    return i18n.t(`world:kinds.${id}.label`);
  },
  get how() {
    return i18n.t(`world:kinds.${id}.how`);
  },
});

export const KIND_INFO: Record<LevelKind, KindInfo> = {
  mission: kind('mission', 'flag', '#7C5CFF'),
  sprint: kind('sprint', 'flash', '#FFC857'),
  puzzle: kind('puzzle', 'extension-puzzle', '#2DD4BF'),
  battle: kind('battle', 'flash-outline', '#FF7A93'),
  boss: kind('boss', 'skull', '#FF5A7A'),
};

/** One finished play of a level (or the daily challenge). */
export type Run = {
  id: string;
  levelId: string;
  at: number;
  stars: 0 | 1 | 2 | 3;
  score: number;
  correct: number;
  total: number;
  seconds: number;
  hintsUsed: number;
  /** Question / statement / word ids answered wrong, for “revisit your mistakes”. */
  mistakes: string[];
  xp: number;
  coins: number;
  firstClear: boolean;
  /** Battle only. */
  rivalScore?: number;
};

export type AvatarConfig = {
  skin: string;
  hair: 'short' | 'afro' | 'puffs' | 'braids' | 'bun' | 'fade' | 'locs';
  hairColor: string;
  eyes: 'round' | 'happy' | 'wink';
  mouth: 'smile' | 'grin' | 'open';
  outfit: string;
  hat?: string;
  glasses?: string;
  background: string;
  name: string;
};

export type ShopItem = {
  id: string;
  slot: 'hat' | 'glasses' | 'outfit' | 'background' | 'boost';
  name: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic';
  /** Earned, never bought. */
  earnedBy?: string;
};

export type GameSettings = {
  haptics: boolean;
  timer: boolean;
  reduceMotion: boolean;
  leaderboard: boolean;
  anonymous: boolean;
};

export const DEFAULT_SETTINGS: GameSettings = {
  haptics: true,
  timer: true,
  reduceMotion: false,
  leaderboard: true,
  anonymous: false,
};
