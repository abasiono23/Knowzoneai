export type SceneKind = 'title' | 'concept' | 'list' | 'formula' | 'example' | 'check' | 'recap';

/** One animated scene of an explainer. `caption` is the narration, spoken and shown as captions. */
export type Scene = {
  id: string;
  kind: SceneKind;
  heading: string;
  body?: string;
  bullets?: string[];
  emoji: string;
  caption: string;
  seconds: number;
  /** For "check" scenes: a quick comprehension question. */
  check?: { question: string; options: string[]; correctIndex: number };
  /** Server-made videos: the recorded narration and a picture for the scene (AI-made or a real photo). */
  audio?: string;
  image?: string;
  /** A real photo's author and licence (Wikimedia Commons), shown under it. */
  credit?: { author: string; license: string; url: string };
};

export type LengthId = '30s' | '1m' | '3m' | '5m';
export type CaptionStyle = 'classic' | 'karaoke' | 'bold';

export type VideoSettings = {
  length: LengthId;
  voiceId: string;
  styleId: string;
  captions: boolean;
  captionStyle: CaptionStyle;
  language: string;
};

export type VideoSource =
  | { kind: 'topic'; topic: string }
  | { kind: 'material'; materialId: string; label: string }
  | { kind: 'lesson'; lessonId: string; label: string }
  | { kind: 'text'; text: string; label: string };

export type Video = {
  id: string;
  title: string;
  subject: string;
  level: string;
  description: string;
  creator: string;
  scenes: Scene[];
  settings: VideoSettings;
  /** Catalogue videos are Knowzone Originals; generated ones belong to the student. */
  origin: 'catalog' | 'generated';
  lessonId?: string;
  source?: VideoSource;
  views: number;
  likes: number;
  createdAt: number;
};

export type GeneratedVideo = Video & {
  status: 'generating' | 'ready' | 'failed';
  stage: number;
  /** `code` picks the translated message; the English text is kept for older saved videos. */
  error?: { title?: string; message?: string; reasons?: string[]; code?: GenerationErrorCode; retryable?: boolean };
  revision: number;
};

export type GenerationErrorCode =
  'render-timeout' | 'lesson-missing' | 'material-missing' | 'not-configured' | 'no-credits' | 'upload-failed';

export const durationOf = (scenes: Scene[]) => scenes.reduce((n, s) => n + s.seconds, 0);

export function clock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Generation stage ids, in order. Labels: t(`stages.${id}`) in the `videos` namespace. */
export const GENERATION_STAGES = ['script', 'scenes', 'narration', 'captions', 'render'] as const;
