import type { Block } from '../tutor/types';

export type SourceType = 'pdf' | 'doc' | 'text' | 'topic' | 'video' | 'image';
export type Depth = 'Quick' | 'Standard' | 'Deep';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Output = 'summary' | 'notes' | 'concepts' | 'points' | 'flashcards' | 'quiz' | 'mindmap';

export type GenerateOptions = { depth: Depth; difficulty: Difficulty; outputs: Output[] };

export type Concept = { term: string; definition: string; example?: string };
export type KeyPoint = { text: string; importance: 'high' | 'medium' };
export type Card = { id: string; front: string; back: string };
export type Question = {
  id: string;
  type: 'mcq' | 'tf';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
};
export type MindMapNode = { label: string; color: string; children: string[] };

/**
 * Everything generated from one source. Mirrors the JSON the backend will request
 * from OpenAI with structured outputs.
 */
export type StudyContent = {
  summary: { tldr: string; overview: string[] };
  notes: { heading: string; blocks: Block[] }[];
  concepts: Concept[];
  keyPoints: KeyPoint[];
  flashcards: Card[];
  quiz: Question[];
  mindMap: { center: string; branches: MindMapNode[] };
  readingMinutes: number;
};

export type QuizSettings = {
  count: number;
  difficulty: 'mixed' | 'easy' | 'hard';
  types: ('mcq' | 'tf')[];
  timed: boolean;
};

export type Attempt = {
  id: string;
  createdAt: number;
  questionIds: string[];
  answers: (number | null)[];
  score: number;
  total: number;
  seconds: number;
  settings: QuizSettings;
};

export type CardProgress = { box: number; dueAt: number; reviews: number };

export type StageId = 'read' | 'ideas' | 'notes' | 'practice' | 'map';
/** Display names live in the `study` namespace: use stageLabel(id, t) from './labels'. */
export type Stage = { id: StageId };

export type Material = {
  id: string;
  title: string;
  subject: string;
  folder: string;
  tags: string[];
  source: { type: SourceType; label: string; text?: string; url?: string; fileName?: string; size?: number };
  options: GenerateOptions;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  /** 0–1 for uploads; stage index while processing. */
  progress: number;
  stage: number;
  /** Real mode sends a `code` the app shows translated text for (materialError in ./labels). */
  error?: { code?: string; title?: string; message?: string; retryable: boolean };
  content?: StudyContent;
  attempts: Attempt[];
  cards: Record<string, CardProgress>;
  saved: boolean;
  offline: boolean;
  /** A diagram drawn by AI for this pack. */
  image?: string;
  createdAt: number;
  updatedAt: number;
};

export const STAGES: Stage[] = [{ id: 'read' }, { id: 'ideas' }, { id: 'notes' }, { id: 'practice' }, { id: 'map' }];

/** Display names live in the `study` namespace: use outputLabel(id, t) from './labels'. */
export const OUTPUTS: { id: Output; icon: string }[] = [
  { id: 'summary', icon: 'sparkles' },
  { id: 'notes', icon: 'document-text' },
  { id: 'concepts', icon: 'book' },
  { id: 'points', icon: 'star' },
  { id: 'flashcards', icon: 'albums' },
  { id: 'quiz', icon: 'help-circle' },
  { id: 'mindmap', icon: 'git-network' },
];

export const DEFAULT_OPTIONS: GenerateOptions = {
  depth: 'Standard',
  difficulty: 'Intermediate',
  outputs: OUTPUTS.map((o) => o.id),
};

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
