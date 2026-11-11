import { Platform } from 'react-native';

import { ApiError, post, request, uploadForm } from '../api';
import type { FoundTopic, Textbook } from './types';

/** The textbook API (real mode). The server reads the PDF, lists its topics and keeps the books. */

export type UploadFile = { uri: string; name: string; mimeType?: string };

/** Uploads a PDF (with progress, 0–1). Answers straight away with the book in its `reading` state. */
export async function create(id: string, file: UploadFile, title: string | undefined, onProgress: (p: number) => void) {
  const form = new FormData();
  if (title) form.append('title', title);
  // A Blob on the web; a { uri, name, type } descriptor on phones.
  const part =
    Platform.OS === 'web'
      ? await (await fetch(file.uri)).blob()
      : ({ uri: file.uri, name: file.name, type: file.mimeType || 'application/pdf' } as unknown as Blob);
  form.append('file', part, file.name);
  return (await uploadForm<{ textbook: Textbook }>(`/textbooks/${id}`, form, onProgress)).textbook;
}

/** The student's books, newest first. */
export const list = async () => (await request<{ textbooks: Textbook[] }>('/textbooks')).textbooks;
export const get = async (id: string) => (await request<{ textbook: Textbook }>(`/textbooks/${id}`)).textbook;
export const retry = async (id: string) => (await post<{ textbook: Textbook }>(`/textbooks/${id}/retry`)).textbook;
export const remove = (id: string) => request(`/textbooks/${id}`, { method: 'DELETE' });

/** Where a typed topic is in the book, or null when the book doesn't cover it. */
export async function find(id: string, topic: string): Promise<FoundTopic | null> {
  try {
    const r = await request<{ topic: FoundTopic }>(`/textbooks/${id}/find?topic=${encodeURIComponent(topic)}`);
    return r.topic;
  } catch (e) {
    if ((e as ApiError).reason === 'topic-not-found') return null;
    throw e;
  }
}
