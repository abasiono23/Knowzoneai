export type TutorMode = 'explain' | 'steps' | 'exam' | 'teach-back';
export type TutorLevel = 'beginner' | 'advanced';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'formula'; text: string }
  | { type: 'tip'; text: string }
  | { type: 'warning'; text: string }
  // Course readings (from textbooks): a titled box, a code listing, a figure.
  | { type: 'note'; title?: string; text: string }
  | { type: 'code'; text: string }
  | { type: 'image'; src: string; caption?: string; alt?: string };

/** A block as plain text (copying, sharing, saving to notes). */
export const blockText = (b: Block) =>
  b.type === 'list'
    ? b.items.join('\n')
    : b.type === 'image'
      ? (b.caption ?? '')
      : b.type === 'note' && b.title
        ? `${b.title}: ${b.text}`
        : b.text;

export type Step = { title: string; detail: string; why?: string; formula?: string };
export type Example = {
  title: string;
  scenario: string;
  explanation: string;
  level: 'Easy' | 'Medium' | 'Hard' | 'Real life';
};
export type Flashcard = { front: string; back: string };
export type QuizQuestion = { question: string; options: string[]; correctIndex: number; explanation: string };

/**
 * The tutor answers in structure, not just prose, so the app can show a detailed view,
 * step-by-step walkthroughs and convert answers to notes, flashcards and quizzes.
 * Mirrors the JSON schema the backend will request from OpenAI (structured outputs).
 */
export type TutorAnswer = {
  summary: string;
  body: Block[];
  keyTerms: { term: string; meaning: string }[];
  steps: Step[];
  finalAnswer?: string;
  examples: Example[];
  commonMistakes: string[];
  followUps: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  subject: string;
  /** Where the answer is grounded, e.g. "Your notes: Cell Biology". */
  sources: string[];
};

export type Attachment = { kind: 'image' | 'pdf'; uri: string; name: string; page?: number };

export type UserMessage = { id: string; role: 'user'; text: string; attachment?: Attachment; createdAt: number };
export type AssistantMessage = {
  id: string;
  role: 'assistant';
  createdAt: number;
  status: 'ok' | 'error';
  answer?: TutorAnswer;
  error?: { kind: 'network' | 'server' | 'limit'; message: string };
  /** The user message this replies to, so errors can be retried. */
  replyTo: string;
  /** A diagram the tutor drew for this answer. */
  image?: string;
};
export type Message = UserMessage | AssistantMessage;

export type Conversation = {
  id: string;
  title: string;
  subject: string;
  mode: TutorMode;
  level: TutorLevel;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  /** `refId` is the lesson or study pack id, so the server can ground answers in it. */
  context?: { kind: 'lesson' | 'pack' | 'upload' | 'image'; label: string; refId?: string };
  /** Real mode: false until the messages are fetched (the history list comes without them). */
  loaded?: boolean;
};

export type Note = {
  id: string;
  title: string;
  notebook: string;
  tags: string[];
  summary: string;
  body: Block[];
  source: string;
  createdAt: number;
};

export type Deck = { id: string; name: string; subject: string; cards: Flashcard[]; createdAt: number };

/** Tutor styles. Labels live in the `tutor` namespace: t(`modes.${id}.label`) and t(`modes.${id}.description`). */
export const MODES: { id: TutorMode; icon: string }[] = [
  { id: 'explain', icon: 'bulb' },
  { id: 'steps', icon: 'footsteps' },
  { id: 'exam', icon: 'ribbon' },
  { id: 'teach-back', icon: 'school' },
];

export const DAILY_LIMITS = { FREE: 10, PLUS: 100, PRO: 300 } as const;
