import { Platform } from 'react-native';

import { post, request, uploadForm, type User } from '../api';
import { API_URL } from '../config';
import type { Attempt, CardProgress, GenerateOptions, Material, SourceType } from './types';

/** The study-pack API (real mode). The server makes packs with OpenAI and keeps the library. */

/** Files (the diagram, card pictures) come back as server paths; images need a full address. */
const absolute = (link: string) => (link.startsWith('/') ? `${API_URL}${link}` : link);
function withFileUris(m: Material): Material {
  const content = m.content?.flashcards.some((c) => c.image?.startsWith('/'))
    ? { ...m.content, flashcards: m.content.flashcards.map((c) => (c.image ? { ...c, image: absolute(c.image) } : c)) }
    : m.content;
  return { ...m, ...(m.image && { image: absolute(m.image) }), ...(content && { content }) };
}

export type Upload = {
  type: SourceType;
  title?: string;
  text?: string;
  topic?: string;
  url?: string;
  /** With type `textbook`: the uploaded book the topic comes from. */
  textbookId?: string;
  file?: { uri: string; name: string; mimeType?: string };
  options: GenerateOptions;
};

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
};
const mimeOf = (f: NonNullable<Upload['file']>) =>
  f.mimeType || MIME[f.name.split('.').pop()?.toLowerCase() ?? ''] || 'image/jpeg';

/** Starts a pack on the server. Files are uploaded with progress (0–1). */
export async function create(id: string, input: Upload, onProgress: (p: number) => void) {
  const fields = {
    type: input.type,
    ...(input.title && { title: input.title }),
    ...(input.text && { text: input.text }),
    ...(input.topic && { topic: input.topic }),
    ...(input.url && { url: input.url }),
    ...(input.textbookId && { textbookId: input.textbookId }),
  };
  if (!input.file) {
    const r = await post<{ material: Material }>(`/materials/${id}`, { ...fields, options: input.options });
    return withFileUris(r.material);
  }
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  form.append('options', JSON.stringify(input.options));
  const type = mimeOf(input.file);
  // A Blob on the web; a { uri, name, type } descriptor on phones.
  const part =
    Platform.OS === 'web'
      ? await (await fetch(input.file.uri)).blob()
      : ({ uri: input.file.uri, name: input.file.name, type } as unknown as Blob);
  form.append('file', part, input.file.name);
  const r = await uploadForm<{ material: Material }>(`/materials/${id}`, form, onProgress);
  return withFileUris(r.material);
}

export const retry = async (id: string) =>
  withFileUris((await post<{ material: Material }>(`/materials/${id}/retry`)).material);

export const get = async (id: string) =>
  withFileUris((await request<{ material: Material }>(`/materials/${id}`)).material);

/** Packs changed since the last sync, and the ids of every pack (to drop deleted ones). */
export async function sync(since?: number) {
  const r = await request<{ materials: Material[]; ids: string[]; serverTime: number }>(
    `/materials${since ? `?since=${since}` : ''}`,
  );
  return { ...r, materials: r.materials.map(withFileUris) };
}

export const update = (id: string, patch: Partial<Material>) =>
  request(`/materials/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const remove = (id: string) => request(`/materials/${id}`, { method: 'DELETE' });

/** A view-only link to the pack's notes on the website, made the first time it's shared. */
export const shareLink = async (id: string) => (await post<{ token: string; url: string }>(`/materials/${id}/share`)).url;

export const recordAttempt = (id: string, a: Omit<Attempt, 'id' | 'createdAt' | 'score' | 'total'>) =>
  post<{ attempt: Attempt; user: User; xpEarned: number; coinsEarned: number }>(`/materials/${id}/attempts`, a);

export const reviewCard = (id: string, cardId: string, knewIt: boolean) =>
  post<{ card: CardProgress }>(`/materials/${id}/cards/${cardId}/review`, { knewIt });

export async function drawDiagram(id: string) {
  const r = await post<{ image: string; credits: number }>(`/materials/${id}/diagram`);
  return { image: `${API_URL}${r.image}`, credits: r.credits };
}
