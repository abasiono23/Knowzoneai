import { Platform } from 'react-native';

import { currentLanguage } from '@/i18n';

import type { CatalogData } from './catalog';
import type { RewardRule } from './rewards/catalog';
import { API_URL, USE_MOCKS } from './config';
import { mockRequest } from './mock-api';
import { accessToken } from './supabase';
import type { Personalization } from './personalization';
import { storage } from './storage';

export const TOKEN_KEY = 'knowzone.token';

/** The device's time zone ("Africa/Lagos"), sent so the server counts days in local time. */
const TIME_ZONE = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
})();

export type AuthProvider = 'email' | 'google' | 'apple';

export type User = {
  id: string;
  name: string;
  email: string;
  authProvider: AuthProvider;
  emailVerified: boolean;
  termsAccepted: boolean;
  onboardingComplete: boolean;
  /** Set when onboarding completes; teachers get the teaching app. */
  role: 'learner' | 'teacher';
  xp: number;
  coins: number;
  level: number;
  levelProgress: number;
  streak: number;
  dailyGoalMinutes: number;
  todayMinutes: number;
  aiCredits: number;
  plan: 'FREE' | 'PLUS' | 'PRO';
  referralCode: string;
  // Optional profile details (screen 178)
  username?: string;
  school?: string;
  grade?: string;
  bio?: string;
  photo?: ProfilePhoto;
  /** Set by moderation (screen 232). Suspended accounts can only appeal, get help or download their data. */
  restriction?: Restriction;
};

export type Restriction = {
  kind: 'restricted' | 'suspended';
  reason: string;
  at: number;
  /** Lifted automatically after this time; missing means until an appeal or review. */
  until?: number;
  /** What a restricted account can't do. */
  limits?: string[];
  appeal?: { ticketId: string; at: number; status: 'pending' | 'rejected' };
};

// Help, safety and legal (screens 219–232)
export type HelpTopic = 'account' | 'learning' | 'ai' | 'payments' | 'technical' | 'safety' | 'other';
export type TicketKind = 'support' | 'bug' | 'feedback' | 'report' | 'copyright' | 'appeal';
/** `template: 'ack'` is the automatic first reply: show t(`ticket.acks.<kind>`) instead of `text`. */
export type TicketMessage = { id: string; at: number; from: 'me' | 'support'; text: string; template?: 'ack' };
export type HelpTicket = {
  id: string;
  kind: TicketKind;
  topic?: HelpTopic;
  subject: string;
  status: 'open' | 'waiting' | 'resolved';
  createdAt: number;
  updatedAt: number;
  messages: TicketMessage[];
  /** Extra details: device info for bugs, the reported item, a rating for feedback. */
  meta?: Record<string, string>;
};
export type ReportableType = 'video' | 'course' | 'lesson' | 'study-pack' | 'tutor-answer' | 'player' | 'other';
export type Safety = {
  blockedUsers: { id: string; name: string; at: number }[];
  hidden: { type: ReportableType; id: string; title: string; at: number }[];
};

// Knowzone World word games (English)
export type EnglishGameId = 'hidden-letters' | 'word-clash' | 'word-hunter' | 'spellcaster' | 'sentence-master';
export type GameLevel = { level: number; unlocked: boolean; bestStars: number; bestScore: number; plays: number };
const CHEM_GAMES: ChemGameId[] = [
  'mixture-lab',
  'element-quest',
  'molecule-builder',
  'reaction-rush',
  'mystery-substance',
];
const SPACE_GAMES: SpaceGameId[] = [
  'galaxy-defender',
  'rocket-builder',
  'gravity-master',
  'solar-explorer',
  'asteroid-survival',
];
export type LabCatalogue = Omit<GamesCatalogue, 'games'> & { games: { id: ChemGameId; levels: GameLevel[] }[] };
export type SpaceCatalogue = Omit<GamesCatalogue, 'games'> & { games: { id: SpaceGameId; levels: GameLevel[] }[] };
const HISTORY_GAMES: HistoryGameId[] = ['time-machine', 'lost-civilization', 'africa-explorer'];
const TECH_GAMES: TechGameId[] = ['code-runner', 'cyber-defender', 'robot-rescue', 'binary-breaker', 'circuit-master'];
export type TechCatalogue = Omit<GamesCatalogue, 'games'> & { games: { id: TechGameId; levels: GameLevel[] }[] };
export type HistoryCatalogue = Omit<GamesCatalogue, 'games'> & { games: { id: HistoryGameId; levels: GameLevel[] }[] };
export type GamesCatalogue = {
  games: { id: EnglishGameId; levels: GameLevel[] }[];
  rewardsToday: { xp: number; coins: number };
  dailyCap: { xp: number; coins: number };
};
type RunBase = {
  id: string;
  level: number;
  status: 'playing' | 'finished' | 'abandoned';
  score: number;
  correct: number;
  total: number;
  hearts: number;
  /** The step being played. */
  at: number;
  streak: number;
  startedAt: number;
  stars?: number;
  xp?: number;
  coins?: number;
};
export type HiddenLettersRun = RunBase & {
  game: 'hidden-letters';
  hintCost: number;
  steps: {
    id: number;
    length: number;
    /** Letters shown; null where a letter is hidden. */
    tiles: (string | null)[];
    clue: string;
    choices: string[];
    seconds: number;
    result?: { correct: boolean; points: number; word: string };
  }[];
};
export type ClashTile = { letter: string; points: number; rare: boolean };
export type WordClashRun = RunBase & {
  game: 'word-clash';
  rounds: {
    id: number;
    rack: ClashTile[];
    seconds: number;
    result?: {
      correct: boolean;
      points: number;
      answer?: string;
      best: { word: string; points: number };
      opponent: number;
    };
  }[];
  /** `name` is null for the practice rival, or a learner who keeps their profile private. */
  opponent?: { kind: 'player' | 'bot'; name: string | null; photo?: string };
};
export type GridCell = [number, number];
export type WordHunterRun = RunBase & {
  game: 'word-hunter';
  theme: string;
  size: number;
  grid: string[][];
  seconds: number;
  words: string[];
  found: { word: string; cells: GridCell[] }[];
};
export type SpellcasterRun = RunBase & {
  game: 'spellcaster';
  monster: 'slime' | 'crystal' | 'ember' | 'frost' | 'shadow';
  maxHp: number;
  hp: number;
  spells: {
    id: number;
    prompt: string;
    length: number;
    stones: string[];
    seconds: number;
    result?: { correct: boolean; points: number; word: string };
  }[];
};
export type GrammarTopic = 'presentSimple' | 'pastTense' | 'questions' | 'prepositions' | 'passiveConditionals';
export type SentenceMasterRun = RunBase & {
  game: 'sentence-master';
  topic: GrammarTopic;
  hintCost: number;
  steps: {
    id: number;
    chips: string[];
    slots: number;
    end: '.' | '?';
    result?: { correct: boolean; points: number; sentence: string };
  }[];
};
// Chemistry lab
export type ChemGameId = 'mixture-lab' | 'element-quest' | 'molecule-builder' | 'reaction-rush' | 'mystery-substance';
export type LabReagent = {
  id: string;
  name: string;
  formula: string;
  colour: string;
  bottle: 'clear' | 'brown' | 'dropper' | 'solid';
};
export type Glassware = 'beaker' | 'tube' | 'flask';
export type MixtureLabRun = RunBase & {
  game: 'mixture-lab';
  shelf: LabReagent[];
  experiments: {
    id: number;
    title: string;
    glassware: Glassware;
    needs: [string, string];
    observation: { liquid: string; precipitate?: string; gas?: boolean; coating?: string; text: string };
    question: string;
    options: string[];
    result?: { correct: boolean; points: number; answer: string; equation: string };
  }[];
};
export type ElementCardField = 'category' | 'group' | 'period' | 'state' | 'shells' | 'number' | 'fact';
export type ElementCard = { symbol: string; name: string } & Partial<Record<ElementCardField, string | number>>;
export type ElementQuestRun = RunBase & {
  game: 'element-quest';
  missions: {
    id: number;
    text: string;
    show: ElementCardField[];
    cabinet: ElementCard[];
    result?: { correct: boolean; points: number; answer: string[] };
  }[];
};
export type MoleculeBuilderRun = RunBase & {
  game: 'molecule-builder';
  valency: Record<string, number>;
  molecules: {
    id: number;
    name: string;
    formula: string;
    atoms: Record<string, number>;
    palette: string[];
    result?: { correct: boolean; points: number };
  }[];
};
export type ReactionRushRun = RunBase & {
  game: 'reaction-rush';
  seconds: number;
  tasks: (
    | {
        id: number;
        type: 'balance';
        reactants: string[];
        products: string[];
        result?: { correct: boolean; points: number; answer: number[] };
      }
    | {
        id: number;
        type: 'complete';
        reactants: string;
        options: string[];
        result?: { correct: boolean; points: number; answer: string };
      }
  )[];
};
export type LabTest = 'litmus' | 'ph' | 'mg' | 'flame' | 'agno3' | 'naoh' | 'bacl2';
export type MysterySubstanceRun = RunBase & {
  game: 'mystery-substance';
  tests: LabTest[];
  cases: {
    id: number;
    appearance: string;
    suspects: string[];
    results: Partial<Record<LabTest, string>>;
    result?: { correct: boolean; points: number; answer: string };
  }[];
};
export type LabRun = MixtureLabRun | ElementQuestRun | MoleculeBuilderRun | ReactionRushRun | MysterySubstanceRun;

// Space Academy
export type SpaceGameId =
  'galaxy-defender' | 'rocket-builder' | 'gravity-master' | 'solar-explorer' | 'asteroid-survival';
export type ChoiceQuestion = {
  id: number;
  q: string;
  options: string[];
  result?: { correct: boolean; points: number; answer: string };
};
export type GalaxyDefenderRun = RunBase & { game: 'galaxy-defender'; seconds: number; questions: ChoiceQuestion[] };
export type AsteroidSurvivalRun = RunBase & {
  game: 'asteroid-survival';
  seconds: number;
  challenges: ChoiceQuestion[];
};
export type EngineId = 'spark' | 'nova' | 'titan' | 'ion';
export type TankId = 'small' | 'medium' | 'large';
export type RocketDesign = { engine: EngineId; tanks: TankId[] };
export type RocketStats = {
  mass: number;
  dry: number;
  fuel: number;
  weight: number;
  thrust: number;
  dv: number;
  cost: number;
};
export type RocketProblem = 'no-fuel' | 'budget' | 'no-liftoff' | 'not-enough' | 'invalid';
export type RocketBuilderRun = RunBase & {
  game: 'rocket-builder';
  parts: {
    engines: Record<EngineId, { name: string; mass: number; thrust: number; isp: number; cost: number }>;
    tanks: Record<TankId, { name: string; dry: number; fuel: number; cost: number }>;
    fins: { mass: number; cost: number };
    maxTanks: number;
    g: number;
  };
  missions: {
    id: number;
    title: string;
    target: string;
    payload: { name: string; kind: 'nose' | 'capsule'; mass: number };
    dv: number;
    budget: number;
    tries: number;
    design?: RocketDesign;
    stats?: RocketStats;
    question?: { q: string; options: string[] };
    result?: { correct: boolean; points: number; answer?: string };
  }[];
};
export type Body = { x: number; y: number; mass: number };
export type GravityRun = RunBase & {
  game: 'gravity-master';
  preview: number;
  puzzles: {
    id: number;
    launch: { x: number; y: number; vx: number; vy: number };
    fixed: Body[];
    goal: { x: number; y: number };
    movable: number[][];
    tries: number;
    result?: { correct: boolean; points: number; solution: Body[] };
  }[];
};
export type SolarExplorerRun = RunBase & {
  game: 'solar-explorer';
  visits: {
    id: string;
    name: string;
    planet: string;
    mission: string;
    facts: string[];
    questions: ChoiceQuestion[];
  }[];
};
export type SpaceRun = GalaxyDefenderRun | AsteroidSurvivalRun | RocketBuilderRun | GravityRun | SolarExplorerRun;

// Museum of Time (History & Geography)
export type HistoryGameId = 'time-machine' | 'lost-civilization' | 'africa-explorer';
export type TimeChallenge =
  | ({ type: 'choice' } & ChoiceQuestion)
  | {
      id: number;
      type: 'order';
      q: string;
      items: string[];
      result?: { correct: boolean; points: number; answer: string[] };
    };
export type TimeMachineRun = RunBase & {
  game: 'time-machine';
  eras: {
    id: string;
    title: string;
    when: string;
    year: number;
    place: string;
    intro: string;
    spots: [string, string];
    challenges: TimeChallenge[];
  }[];
};
export type DigSite = 'savanna' | 'desert' | 'stone';
export type LostCivilizationRun = RunBase & {
  game: 'lost-civilization';
  digs: {
    id: number;
    dig: DigSite;
    art: string;
    finds: { name: string; clue: string; art: 'hero' | 'pottery' | 'beads' | 'tool' }[];
    mystery: {
      id: number;
      q: string;
      options: string[];
      result?: { correct: boolean; points: number; answer: string; about: string };
    };
    followUp?: ChoiceQuestion;
  }[];
};
export type AfricaExplorerRun = RunBase & {
  game: 'africa-explorer';
  stops: {
    id: number;
    name: string;
    region?: string;
    find?: { correct: boolean; points: number; at: [number, number] };
    landmark?: string;
    art?: string;
    facts?: string[];
    question?: ChoiceQuestion;
  }[];
};
export type HistoryRun = TimeMachineRun | LostCivilizationRun | AfricaExplorerRun;

// Tech Hub (Technology & Computer Science)
export type TechGameId = 'code-runner' | 'cyber-defender' | 'robot-rescue' | 'binary-breaker' | 'circuit-master';
export type CodeOp = { op: 'move' | 'jump' | 'left' | 'right' } | { op: 'repeat'; times: number; body: CodeOp[] };
export type RobotCard = { dir: 'up' | 'right' | 'down' | 'left'; n: number } | { op: 'pick' | 'drop' };
export type LogicGate = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'WIRE';
type PuzzleResult = { correct: boolean; points: number };
export type CodeRunnerRun = RunBase & {
  game: 'code-runner';
  puzzles: {
    id: number;
    tiles: GridCell[];
    gems: GridCell[];
    start: { x: number; y: number; dir: number };
    goal: GridCell;
    maxBlocks: number;
    ops: CodeOp['op'][];
    tries: number;
    result?: PuzzleResult & { solution: CodeOp[] };
  }[];
};
export type RobotRescueRun = RunBase & {
  game: 'robot-rescue';
  puzzles: {
    id: number;
    w: number;
    h: number;
    blocked: GridCell[];
    kinds: ('crate' | 'water')[];
    robot: GridCell;
    kitten: GridCell;
    home?: GridCell;
    best: number;
    maxCards: number;
    tries: number;
    result?: PuzzleResult;
  }[];
};
export type BinaryBreakerRun = RunBase & {
  game: 'binary-breaker';
  vaults: {
    id: number;
    type: 'set' | 'read' | 'ascii' | 'add';
    bits: number;
    target?: number;
    shown?: number[];
    options?: string[];
    a?: number[];
    b?: number[];
    result?: PuzzleResult & { answer: string };
  }[];
};
export type CircuitSlot = { id: string; kind: 'binary' | 'unary'; from: string[] };
export type CircuitMasterRun = RunBase & {
  game: 'circuit-master';
  puzzles: {
    id: number;
    inputs: string[];
    slots: CircuitSlot[];
    out: string;
    gates: LogicGate[];
    target: number[];
    tries: number;
    result?: PuzzleResult & { solution: Record<string, LogicGate> };
  }[];
};
export type CyberDefenderRun = RunBase & {
  game: 'cyber-defender';
  seconds: number;
  items: {
    id: number;
    kind: 'email' | 'sms' | 'password' | 'situation';
    from?: string;
    subject?: string;
    body: string;
    link?: string;
    options: string[];
    result?: PuzzleResult & { answer: string; why: string };
  }[];
};
export type TechRun = CodeRunnerRun | RobotRescueRun | BinaryBreakerRun | CircuitMasterRun | CyberDefenderRun;

// Knowzone World on the server: avatar and items, leagues, friends
export type WorldAvatar = {
  skin: string;
  hair: string;
  hairColor: string;
  eyes: string;
  mouth: string;
  outfit: string;
  background: string;
  hat?: string;
  glasses?: string;
  name: string;
};
export type WorldProfile = { avatar: WorldAvatar | null; owned: string[]; onLeaderboards: boolean; anonymous: boolean };
/** Another learner as you may see them: no name or avatar when their privacy keeps them hidden. */
export type BoardPlayer = {
  id: string;
  me: boolean;
  name: string | null;
  avatar: WorldAvatar | null;
  streak: number;
  xp?: number;
  rank?: number;
};
export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type LeagueBoard = {
  week: string;
  endsIn: number;
  promote: number;
  demote: number;
  groupSize: number;
  joined: boolean;
  tier: LeagueTier;
  restricted: boolean;
  rows: BoardPlayer[];
};
export type SchoolBoard = { week: string; school: string | null; rows: BoardPlayer[] };
export type FriendsView = {
  code: string;
  friends: BoardPlayer[];
  incoming: (BoardPlayer & { requestId: string })[];
  outgoing: (BoardPlayer & { requestId: string })[];
};

// World Quests (server-kept boards; progress comes from finished games)
export type QuestPlace = 'english' | 'chemistry' | 'space' | 'history' | 'any';
export type QuestItem = {
  id: string;
  place: QuestPlace;
  game?: string;
  target: number;
  progress: number;
  done: boolean;
  claimed: boolean;
  xp: number;
  coins: number;
};
export type QuestChest = { after?: number; xp: number; coins: number; ready: boolean; claimed: boolean };
export type QuestBoards = {
  daily: { key: string; resetsIn: number; quests: QuestItem[]; chests: QuestChest[] };
  weekly: { key: string; resetsIn: number; quests: QuestItem[] };
  journey: { at: number; steps: (QuestItem & { current: boolean })[]; chest: QuestChest };
};

export type GameRunPublic =
  | HiddenLettersRun
  | WordClashRun
  | WordHunterRun
  | SpellcasterRun
  | SentenceMasterRun
  | LabRun
  | SpaceRun
  | HistoryRun
  | TechRun;
export type GameAnswer = {
  step?: number;
  letters?: string[];
  word?: string;
  words?: string[];
  from?: GridCell;
  to?: GridCell;
  ms?: number;
  timeout?: boolean;
  reagents?: string[];
  choice?: string;
  symbols?: string[];
  atoms?: string[];
  bonds?: [number, number, number][];
  coefficients?: number[];
  test?: LabTest;
  engine?: EngineId;
  tanks?: TankId[];
  placements?: Body[];
  hits?: number;
  order?: string[];
  point?: [number, number];
  program?: CodeOp[];
  cards?: RobotCard[];
  bits?: number[];
  gates?: Record<string, LogicGate>;
};
export type GameOutcome = {
  correct: boolean;
  points: number;
  heartLost: boolean;
  /** Word Clash: the word wasn't accepted, but the round goes on. */
  retry?: boolean;
  reason?: 'not-a-word' | 'letters' | 'too-short';
  word?: string;
  streak?: number;
  letters?: { ch: string; points: number }[];
  bonus?: number;
  best?: { word: string; points: number };
  opponentPoints?: number;
  cells?: GridCell[];
  damage?: number;
  fast?: boolean;
  sentence?: string;
  // Lab games
  answer?: string | string[] | number[];
  /** Rocket Builder: why the rocket failed, and its numbers. */
  stats?: RocketStats;
  /** Gravity Master: how the comet's flight ended. */
  end?:
    | 'goal'
    | 'crash'
    | 'lost'
    | 'time'
    | 'invalid'
    | 'blocks'
    | 'fell'
    | 'short'
    | 'long'
    | 'saved'
    | 'bump'
    | 'missed'
    | 'cards'
    | 'wrong'
    | 'lit';
  solution?: Body[];
  /** Lost Civilization: where and when, once it's named. */
  about?: string;
  /** Africa Explorer: where the country is. */
  at?: [number, number];
  /** Tech Hub: why an answer is right, gems collected, the circuit's outputs. */
  why?: string;
  gems?: number;
  table?: number[];
  wrongRows?: number[];
  equation?: string;
  problem?: 'count' | 'valency' | 'disconnected' | RocketProblem;
  combo?: number;
  test?: LabTest;
  result?: string;
};
export type GameSummary = {
  stars: number;
  score: number;
  xp: number;
  coins: number;
  best: { stars: number; score: number };
  newBest: boolean;
  nextLevelUnlocked: boolean;
  opponent?: { kind: 'player' | 'bot'; name: string | null; photo?: string; total: number };
};

/** Profile picture: the Knowzone World avatar, coloured initials, or an uploaded photo. */
export type ProfilePhoto = { kind: 'avatar' } | { kind: 'initials'; color: string } | { kind: 'photo'; uri: string };

export type NotificationCategory = 'reminders' | 'streak' | 'quests' | 'classes' | 'referrals' | 'news';
export type Reminder = { id: string; label: string; time: string; days: number[]; enabled: boolean };
export type AppSettings = {
  notifications: {
    push: boolean;
    email: boolean;
    categories: Record<NotificationCategory, boolean>;
    quietHours: { enabled: boolean; from: string; to: string };
  };
  reminders: Reminder[];
  appLanguage: string;
  privacy: {
    profileVisibility: 'everyone' | 'school' | 'private';
    personalisedRecommendations: boolean;
    usageAnalytics: boolean;
    /** Off by default: we never train AI models on a student's work without opt-in. */
    improveAi: boolean;
  };
};

export type Connections = {
  email: { address: string; verified: boolean; hasPassword: boolean };
  google: { email: string } | null;
  apple: { email: string } | null;
};

export type DeviceSession = {
  id: string;
  device: string;
  platform: 'ios' | 'android' | 'web';
  location: string;
  lastActive: number;
  current: boolean;
};

export type Consent = { terms: boolean; privacy: boolean; age: boolean; marketing: boolean };

export type KeyConcept = { term: string; explanation: string };
export type Flashcard = { id: string; front: string; back: string; dueAt: string };
export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  concept: string;
};

export type MaterialSummary = {
  id: string;
  title: string;
  subject: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  createdAt: string;
  mastery: number;
};

export type Material = MaterialSummary & {
  summary: {
    tldr: string;
    keyConcepts: KeyConcept[];
    sections: { heading: string; bullets: string[] }[];
    uncertainNotes: string[];
  } | null;
  flashcards: Flashcard[];
  questions: QuizQuestion[];
};

export type QuizResult = {
  score: number;
  total: number;
  xpEarned: number;
  coinsEarned: number;
  weakConcepts: string[];
  user: User;
};

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

type AuthResponse = { token: string; user: User };

/** One coin/XP movement. Positive coins are earned, negative are spent. */
export type Transaction = { id: string; at: number; coins: number; xp: number; reason: string };
export type Redemption = { id: string; rewardId: string; at: number; cost: number; code: string };
export type ReferralInvalidReason =
  'not-found' | 'expired' | 'own-code' | 'already-referred' | 'not-new' | 'cap-reached';

export type ReferralStatus = 'pending' | 'confirmed' | 'rejected';
export type Referral = {
  id: string;
  /** First name and initial only. */
  friendName: string;
  joinedAt: number;
  emailVerified: boolean;
  qualifiedAt?: number;
  status: ReferralStatus;
  rejectReason?: string;
  credits: number;
};
export type PaymentMethodType = 'card' | 'transfer' | 'ussd' | 'store';
export type PaymentMethodInfo = { type: PaymentMethodType; label: string };
export type Subscription = {
  plan: 'PLUS' | 'PRO';
  period: 'month' | 'term' | 'year';
  status: 'active' | 'cancelled' | 'expired';
  startedAt: number;
  currentPeriodEnd: number;
  autoRenew: boolean;
  method: PaymentMethodInfo;
  cancelReason?: string;
};
export type Payment = {
  id: string;
  at: number;
  plan: 'PLUS' | 'PRO';
  period: 'month' | 'term' | 'year';
  amount: number;
  discount: number;
  currency: 'NGN' | 'USD';
  status: 'paid' | 'failed' | 'pending' | 'refunded';
  method: PaymentMethodInfo;
  reference: string;
  promo?: string;
  failureReason?: string;
  /** Real mode: Flutterwave's secure payment page (cards, or transfer/USSD on the page), while pending. */
  checkoutUrl?: string;
  /** Bank-transfer instructions for pending payments. */
  transfer?: { bank: string; accountNumber: string; accountName: string; expiresAt: number };
  ussd?: { bank: string; code: string; expiresAt: number };
  refundedAt?: number;
  renewal?: boolean;
};
export type SupportTicket = {
  id: string;
  at: number;
  topic: 'refund' | 'double-charge' | 'not-activated' | 'other';
  paymentId?: string;
  message: string;
  status: 'open' | 'resolved';
  resolution?: string;
};
export type ServerCatalog = CatalogData & { version: string; language: string };
export type ServerLibrary = {
  saved: string[];
  recent: { id: string; at: number }[];
  progress: Record<string, number>;
  searches: string[];
};
/** An inbox message. The app renders `template` + `params` in the reader's language. */
export type ServerNotification = {
  id: string;
  type: 'streak' | 'reminder' | 'achievement' | 'class' | 'content' | 'referral' | 'system';
  template: string;
  params: Record<string, string | number>;
  href: string | null;
  read: boolean;
  createdAt: number;
};

export type Billing = { subscription: Subscription | null; payments: Payment[]; tickets: SupportTicket[] };

export type CreditEntry = {
  id: string;
  at: number;
  credits: number;
  reason: 'welcome' | 'referral-inviter' | 'referral-invitee' | 'spend' | 'plan';
  friendName?: string;
};
export type ReferralOverview = {
  code: string;
  link: string;
  rewardCredits: number;
  monthlyCap: number;
  confirmedThisMonth: number;
  referrals: Referral[];
  credits: CreditEntry[];
  /** Set when this account was invited by someone. */
  invitedBy: {
    inviterName: string;
    status: ReferralStatus;
    appliedAt: number;
    emailVerified: boolean;
    qualifiedAt?: number;
  } | null;
};

export type Wallet = {
  transactions: Transaction[];
  redemptions: Redemption[];
  /** Daily-reward cycle: index of the next day to claim (0–6) and whether today is claimed. */
  daily: { next: number; claimedToday: boolean; lastClaim: string | null };
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Machine-readable cause, e.g. a ReferralInvalidReason. */
    public reason?: string,
  ) {
    super(message);
  }
}

let onSuspended: (() => void) | null = null;
/** The session registers this so a suspension mid-session moves the app to the account status screen. */
export const setSuspendedHandler = (fn: (() => void) | null) => {
  onSuspended = fn;
};

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await send<T>(path, init);
  } catch (e) {
    if ((e as { reason?: string }).reason === 'suspended') onSuspended?.();
    throw e;
  }
}

async function send<T>(path: string, init: RequestInit): Promise<T> {
  if (USE_MOCKS) return mockRequest<T>(path, init, await storage.get(TOKEN_KEY));
  // Real mode: the Supabase session's access token (refreshed by the client when needed).
  const token = await accessToken();

  const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Lets the server label this device in Settings → Devices.
        'X-Platform': Platform.OS,
        // Lesson content and other server text come back in the app's language.
        'X-Language': currentLanguage(),
        // Streaks and daily rewards roll over at the learner's own midnight.
        'X-Timezone': TIME_ZONE,
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'Can’t reach Knowzone. Check your internet connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? 'Something went wrong', body.reason);
  return body as T;
}

export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

/**
 * POSTs a form with a file and reports upload progress (0–1). `fetch` can't report progress, so
 * this uses XMLHttpRequest, which works the same on phones and the web. Real mode only.
 */
export async function uploadForm<T>(path: string, form: FormData, onProgress: (sent: number) => void): Promise<T> {
  const token = await accessToken();
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}${path}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('X-Platform', Platform.OS);
    xhr.setRequestHeader('X-Language', currentLanguage());
    xhr.setRequestHeader('X-Timezone', TIME_ZONE);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total) onProgress(e.loaded / e.total);
    };
    xhr.onerror = () => reject(new ApiError(0, 'Can’t reach Knowzone. Check your internet connection and try again.'));
    xhr.onload = () => {
      let body: { error?: string; reason?: string } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // Not JSON (e.g. a proxy error page).
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body as T);
      else {
        const err = new ApiError(xhr.status, body.error ?? 'Something went wrong', body.reason);
        if (err.reason === 'suspended') onSuspended?.();
        reject(err);
      }
    };
    xhr.send(form);
  });
}

export const api = {
  // Auth & onboarding
  register: (input: { name: string; email: string; password: string; consent: Consent }) =>
    post<AuthResponse>('/auth/register', input),
  login: (input: { email: string; password: string }) => post<AuthResponse>('/auth/login', input),
  socialSignIn: (input: { provider: 'google' | 'apple'; idToken: string }) =>
    post<AuthResponse & { isNewUser: boolean }>('/auth/social', input),
  verifyEmail: (code: string) => post<{ user: User }>('/auth/verify-email', { code }),
  resendVerification: () => post<{ ok: true }>('/auth/resend-verification'),
  forgotPassword: (email: string) => post<{ ok: true }>('/auth/forgot-password', { email }),
  verifyResetCode: (email: string, code: string) =>
    post<{ resetToken: string }>('/auth/verify-reset-code', { email, code }),
  resetPassword: (resetToken: string, password: string) =>
    post<{ ok: true }>('/auth/reset-password', { resetToken, password }),
  acceptConsent: (consent: Consent) => post<{ user: User }>('/me/consent', consent),
  validateReferral: (code: string) =>
    post<{ valid: boolean; inviterName?: string; reason?: ReferralInvalidReason }>('/referrals/validate', { code }),
  /** Errors carry `reason` (see ReferralInvalidReason) as a 4xx. */
  applyReferral: (code: string) => post<{ user: User }>('/me/referral', { code }),
  getReferrals: () => request<ReferralOverview & { user: User }>('/me/referrals'),

  // Profile and settings
  updateProfile: (patch: Partial<Pick<User, 'name' | 'username' | 'school' | 'grade' | 'bio' | 'photo'>>) =>
    post<{ user: User }>('/me/profile', patch),
  changePassword: (current: string, next: string) => post<{ ok: true }>('/me/password', { current, next }),
  getConnections: () => request<{ connections: Connections }>('/me/connections'),
  setConnection: (provider: 'google' | 'apple', action: 'link' | 'unlink') =>
    post<{ connections: Connections }>('/me/connections', { provider, action }),
  getSessions: () => request<{ sessions: DeviceSession[] }>('/me/sessions'),
  revokeSession: (id: string | 'others') => post<{ sessions: DeviceSession[] }>('/me/sessions/revoke', { id }),
  getSettings: () => request<{ settings: AppSettings }>('/me/settings'),
  saveSettings: (patch: Partial<AppSettings>) => post<{ settings: AppSettings }>('/me/settings', patch),
  /** Everything the server holds about the account, as JSON. */
  exportData: () => request<{ export: Record<string, unknown> }>('/me/export'),
  emailDataExport: () => post<{ requestedAt: number }>('/me/export/email'),
  // Subscriptions and payments (Flutterwave on the web, in naira or dollars; App Store / Google Play in the apps)
  getBilling: () => request<{ billing: Billing; user: User }>('/me/billing'),
  checkPromo: (code: string, plan: 'PLUS' | 'PRO', period: 'month' | 'term' | 'year') =>
    post<{ promo: { code: string; percent: number; label: string } }>('/me/billing/promo', { code, plan, period }),
  /** `outcome` only exists in the mock, to demo declined and pending payments. */
  checkout: (input: {
    /** Where Flutterwave's payment page returns to ({id} becomes the payment id). */
    redirectUrl?: string;
    plan: 'PLUS' | 'PRO';
    period: 'month' | 'term' | 'year';
    /** Dollars are card only. */
    currency: 'NGN' | 'USD';
    method: PaymentMethodInfo;
    promo?: string;
    outcome?: 'success' | 'declined';
  }) => post<{ payment: Payment; user: User }>('/me/billing/checkout', input),
  confirmPayment: (id: string) => post<{ payment: Payment; user: User }>('/me/billing/confirm', { id }),
  cancelSubscription: (reason: string) => post<{ billing: Billing }>('/me/billing/cancel', { reason }),
  resumeSubscription: () => post<{ billing: Billing }>('/me/billing/resume'),
  restorePurchases: () => post<{ restored: boolean; billing: Billing; user: User }>('/me/billing/restore'),
  contactBillingSupport: (input: { topic: SupportTicket['topic']; paymentId?: string; message: string }) =>
    post<{ ticket: SupportTicket; billing: Billing; user: User }>('/me/billing/support', input),
  spendCredits: (credits: number, reason: string) => post<{ user: User }>('/me/credits/spend', { credits, reason }),

  // Help and safety
  getTickets: () => request<{ tickets: HelpTicket[] }>('/me/help/tickets'),
  createTicket: (input: {
    kind: TicketKind;
    topic?: HelpTopic;
    subject: string;
    message: string;
    meta?: Record<string, string>;
  }) => post<{ ticket: HelpTicket }>('/me/help/tickets', input),
  replyToTicket: (id: string, text: string) => post<{ ticket: HelpTicket }>('/me/help/tickets/reply', { id, text }),
  closeTicket: (id: string) => post<{ ticket: HelpTicket }>('/me/help/tickets/close', { id }),
  getSafety: () => request<{ safety: Safety }>('/me/safety'),
  /** Reports go to moderation; `hide` also removes the item from your feeds, `block` blocks the person. */
  reportContent: (input: {
    type: ReportableType;
    id: string;
    title: string;
    reason: string;
    details: string;
    hide?: boolean;
    block?: boolean;
  }) => post<{ ticket: HelpTicket; safety: Safety }>('/me/report', input),
  blockUser: (id: string, name: string) => post<{ safety: Safety }>('/me/safety/block', { id, name }),
  unblockUser: (id: string) => post<{ safety: Safety }>('/me/safety/unblock', { id }),
  unhideContent: (type: ReportableType, id: string) => post<{ safety: Safety }>('/me/safety/unhide', { type, id }),
  /** Copyright notices can come from anyone, signed in or not. */
  copyrightNotice: (input: Record<string, string>) => post<{ reference: string }>('/legal/copyright', input),
  appealRestriction: (message: string) => post<{ user: User; ticket: HelpTicket }>('/me/appeal', { message }),

  // Knowzone World word games (English): puzzles come from the server, which checks every answer.
  getEnglishGames: () => request<GamesCatalogue>('/me/games/english'),
  getLabGames: () => request<LabCatalogue>('/me/games/chemistry'),
  getSpaceGames: () => request<SpaceCatalogue>('/me/games/space'),
  getHistoryGames: () => request<HistoryCatalogue>('/me/games/history'),
  getTechGames: () => request<TechCatalogue>('/me/games/tech'),

  // World Quests
  getQuests: () => request<QuestBoards>('/me/quests'),
  claimQuest: (board: 'daily' | 'weekly', id: string) =>
    post<{ reward: { xp: number; coins: number }; user: User; quests: QuestBoards }>('/me/quests/claim', { board, id }),
  openQuestChest: (chest: 'daily' | 'journey', index = 0) =>
    post<{ reward: { xp: number; coins: number; item?: string }; user: User; quests: QuestBoards }>(
      '/me/quests/chest',
      {
        chest,
        index,
      },
    ),

  // Knowzone World: avatar and items, leagues, friends
  getWorldProfile: () => request<WorldProfile>('/me/world'),
  saveWorldAvatar: (avatar: WorldAvatar) =>
    request<WorldProfile>('/me/world/avatar', { method: 'PUT', body: JSON.stringify({ avatar }) }),
  reportWorldItems: (items: string[]) => post<WorldProfile>('/me/world/earned', { items }),
  setWorldSettings: (patch: { onLeaderboards?: boolean; anonymous?: boolean }) =>
    request<WorldProfile>('/me/world/settings', { method: 'PATCH', body: JSON.stringify(patch) }),
  getLeague: () => request<LeagueBoard>('/me/leagues'),
  getSchoolBoard: () => request<SchoolBoard>('/me/leagues/school'),
  getFriends: () => request<FriendsView>('/me/friends'),
  addFriend: (code: string) => post<FriendsView>('/me/friends', { code }),
  acceptFriend: (requestId: string) => post<FriendsView>(`/me/friends/${requestId}/accept`, {}),
  removeFriend: (id: string) => request<FriendsView>(`/me/friends/${id}`, { method: 'DELETE' }),
  startGame: (game: EnglishGameId | ChemGameId | SpaceGameId | HistoryGameId | TechGameId, level: number) =>
    post<{ run: GameRunPublic }>(
      `/me/games/${
        CHEM_GAMES.includes(game as ChemGameId)
          ? 'chemistry'
          : SPACE_GAMES.includes(game as SpaceGameId)
            ? 'space'
            : HISTORY_GAMES.includes(game as HistoryGameId)
              ? 'history'
              : TECH_GAMES.includes(game as TechGameId)
                ? 'tech'
                : 'english'
      }/${game}/runs`,
      { level },
    ),
  /** Ask Kora about the current lab task (costs coins; Kora guides, never gives the answer). */
  askKora: (runId: string, question: string) =>
    post<{ reply: string; cost: number; user: User }>(`/me/games/runs/${runId}/ask`, { question }),
  answerGame: (runId: string, answer: GameAnswer) =>
    post<{ outcome: GameOutcome; done: boolean; run: GameRunPublic }>(`/me/games/runs/${runId}/answer`, answer),
  gameHint: (runId: string, step: number) =>
    post<{ hint: { index: number; letter?: string; word?: string }; cost: number; run: GameRunPublic; user: User }>(
      `/me/games/runs/${runId}/hint`,
      { step },
    ),
  finishGame: (runId: string, secondsLeft?: number) =>
    post<{ run: GameRunPublic; summary: GameSummary; user: User }>(`/me/games/runs/${runId}/finish`, { secondsLeft }),
  quitGame: (runId: string) => post<{ ok: true }>(`/me/games/runs/${runId}/quit`),

  /** Schedules deletion after a 14-day grace period; signing in again cancels it. */
  deleteAccount: (input: { password?: string; reason: string }) => post<{ deleteAt: number }>('/me/delete', input),
  getPersonalization: () => request<{ personalization: Personalization | null }>('/me/personalization'),
  savePersonalization: (profile: Personalization) => post<{ user: User }>('/me/personalization', profile),
  completeOnboarding: () => post<{ user: User }>('/me/onboarding/complete'),
  me: () => request<{ user: User }>('/me'),

  // Home and navigation (screens 33–46)
  getCatalog: (lang: string, since?: string) =>
    request<ServerCatalog | { version: string; unchanged: true }>(
      `/catalog?lang=${lang}${since ? `&since=${encodeURIComponent(since)}` : ''}`,
    ),
  getLibrary: () => request<ServerLibrary>('/me/library'),
  viewLesson: (id: string) => post<{ ok: true }>(`/me/lessons/${id}/view`),
  setLessonProgress: (id: string, progress: number) =>
    request<{ progress: number; completed: boolean }>(`/me/lessons/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    }),
  saveLesson: (id: string) => request<{ saved: true }>(`/me/saved/${id}`, { method: 'PUT' }),
  unsaveLesson: (id: string) => request<{ saved: false }>(`/me/saved/${id}`, { method: 'DELETE' }),
  addSearch: (query: string) => post<{ searches: string[] }>('/me/searches', { query }),
  clearSearches: () => request<{ searches: [] }>('/me/searches', { method: 'DELETE' }),
  getNotifications: () =>
    request<{ items: ServerNotification[]; unread: number; hasMore: boolean }>('/me/notifications?limit=50'),
  markNotificationRead: (id: string) => post<{ ok: true }>(`/me/notifications/${id}/read`),
  markAllNotificationsRead: () => post<{ ok: true }>('/me/notifications/read-all'),
  /** Ends this device's session on the server. */
  logout: () => post<{ ok: true }>('/me/logout'),
  /** Game and learning rewards. Negative coins spend them on cosmetics; the server rejects overspending. */
  grantRewards: (input: { xp: number; coins: number; reason: string }) => post<{ user: User }>('/me/rewards', input),
  getWallet: () => request<{ wallet: Wallet }>('/me/wallet'),
  getRewardRules: () => request<{ rules: RewardRule[]; daily: { coins: number; xp: number }[] }>('/rewards/rules'),
  /** Redeem a catalogue reward. Errors: 402 not enough coins, 403 level too low, 409 already owned, 410 unavailable. */
  redeem: (rewardId: string) => post<{ user: User; redemption: Redemption }>('/me/redeem', { rewardId }),
  claimDailyReward: () => post<{ user: User; reward: { coins: number; xp: number; day: number } }>('/me/daily-reward'),

  // Learning
  listMaterials: () => request<{ materials: MaterialSummary[] }>('/materials'),
  getMaterial: (id: string) => request<{ material: Material }>(`/materials/${id}`),
  createFromText: (input: { title?: string; text: string; depth: string; difficulty: string }) =>
    post<{ material: Material }>('/materials', input),
  createFromFile: (form: FormData) => request<{ material: Material }>('/materials', { method: 'POST', body: form }),
  submitQuiz: (id: string, answers: number[]) => post<QuizResult>(`/materials/${id}/quiz-attempts`, { answers }),
  reviewFlashcard: (cardId: string, remembered: boolean) =>
    post<{ dueAt: string }>(`/flashcards/${cardId}/review`, { remembered }),
  askTutor: (id: string, messages: ChatMessage[], level: 'beginner' | 'advanced') =>
    post<{ reply: string }>(`/materials/${id}/tutor`, { messages, level }),
};
