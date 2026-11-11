/** A topic the AI found in the book. Pages are the PDF's, 1-based and inclusive, in book order. */
export type Topic = { id: string; title: string; chapter?: string; startPage: number; endPage: number };

/** Server codes, plus the app's own for an upload that never reached it. */
export type TextbookErrorCode =
  | 'scanned-book'
  | 'unreadable-file'
  | 'unsupported-file'
  | 'file-too-large'
  | 'ai-failed'
  | 'not-configured'
  | 'upload-failed'
  | 'no-credits';

/**
 * A textbook (or course notes) uploaded as a PDF. The server reads it and lists its topics; the
 * student then turns any topic into flashcards or a video summary. `uploading` only exists on the
 * device that is sending the file.
 */
export type Textbook = {
  id: string;
  title: string;
  fileName: string;
  pageCount: number;
  status: 'uploading' | 'reading' | 'ready' | 'failed';
  error?: { code?: TextbookErrorCode | string; retryable: boolean };
  topics: Topic[];
  createdAt: number;
  /** Upload progress, 0–1 (this device only). */
  progress?: number;
  /** File size in bytes, for the upload view (this device only). */
  size?: number;
};

/** Where a typed topic sits in the book. `listed` is true when it's one of the listed topics. */
export type FoundTopic = { title: string; startPage: number; endPage: number; listed: boolean };

export const MAX_TEXTBOOK_BYTES = 60 * 1024 * 1024;
