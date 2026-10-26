import { Platform } from 'react-native';

import { post, request } from '../api';
import { API_URL } from '../config';
import type {
  AssistantMessage,
  Attachment,
  Conversation,
  Deck,
  Flashcard,
  Note,
  QuizQuestion,
  UserMessage,
} from './types';

/** The AI tutor API (real mode). The server owns conversations, usage, notes and decks. */

export type Usage = { limit: number; used: number; remaining: number; resetAt: number };

type ServerConversation = Omit<Conversation, 'messages'> & { messages?: (UserMessage | AssistantMessage)[] };

/** Files (photos, diagrams) come back as server paths; images need a full address. */
export const fileUri = (path: string) => (path.startsWith('/') ? `${API_URL}${path}` : path);

function withFileUris<T extends UserMessage | AssistantMessage>(m: T): T {
  if (m.role === 'user' && m.attachment?.uri) return { ...m, attachment: { ...m.attachment, uri: fileUri(m.attachment.uri) } };
  if (m.role === 'assistant' && m.image) return { ...m, image: fileUri(m.image) };
  return m;
}

export const toConversation = (c: ServerConversation, loaded: boolean): Conversation => ({
  ...c,
  messages: (c.messages ?? []).map(withFileUris),
  loaded,
});

const MIME: Record<string, string> = { png: 'image/png', webp: 'image/webp', gif: 'image/gif', pdf: 'application/pdf' };
const mimeOf = (a: Attachment) =>
  a.kind === 'pdf' ? 'application/pdf' : (MIME[a.name.split('.').pop()?.toLowerCase() ?? ''] ?? 'image/jpeg');

/** A picked file as a form part: a Blob on the web, a { uri, name, type } descriptor on phones. */
async function filePart(a: Attachment): Promise<Blob> {
  if (Platform.OS === 'web') return (await fetch(a.uri)).blob();
  return { uri: a.uri, name: a.name, type: mimeOf(a) } as unknown as Blob;
}

export type NewConversation = Pick<Conversation, 'mode' | 'level' | 'subject' | 'context'>;
type AskResponse = { conversation: ServerConversation; question: UserMessage; reply: AssistantMessage; usage: Usage };

export async function ask(conversationId: string, text: string, attachment: Attachment | undefined, meta: NewConversation) {
  const conversation = {
    mode: meta.mode,
    level: meta.level,
    ...(meta.subject !== 'General' && { subject: meta.subject }),
    ...(meta.context && { context: meta.context }),
  };
  const path = `/tutor/conversations/${conversationId}/messages`;
  let r: AskResponse;
  if (attachment) {
    const form = new FormData();
    form.append('text', text);
    form.append('conversation', JSON.stringify(conversation));
    if (attachment.page) form.append('page', String(attachment.page));
    form.append('file', await filePart(attachment), attachment.name);
    r = await request<AskResponse>(path, { method: 'POST', body: form });
  } else {
    r = await post<AskResponse>(path, { text, conversation });
  }
  return { ...r, question: withFileUris(r.question), reply: withFileUris(r.reply) };
}

export async function retry(conversationId: string, messageId: string) {
  const r = await post<{ reply: AssistantMessage; usage: Usage }>(
    `/tutor/conversations/${conversationId}/messages/${messageId}/retry`,
  );
  return { ...r, reply: withFileUris(r.reply) };
}

export const listConversations = async () =>
  (await request<{ conversations: ServerConversation[] }>('/tutor/conversations')).conversations.map((c) =>
    toConversation(c, false),
  );

export const getConversation = async (id: string) =>
  toConversation((await request<{ conversation: ServerConversation }>(`/tutor/conversations/${id}`)).conversation, true);

export const setPinned = (id: string, pinned: boolean) =>
  request(`/tutor/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ pinned }) });
export const deleteConversation = (id: string) => request(`/tutor/conversations/${id}`, { method: 'DELETE' });
export const getUsage = async () => (await request<{ usage: Usage }>('/tutor/usage')).usage;

export const makeFlashcards = async (messageId: string) =>
  (await post<{ flashcards: Flashcard[] }>(`/tutor/messages/${messageId}/flashcards`)).flashcards;
export const makeQuiz = async (messageId: string) =>
  (await post<{ quiz: QuizQuestion[] }>(`/tutor/messages/${messageId}/quiz`)).quiz;
export async function drawDiagram(messageId: string) {
  const r = await post<{ image: string; credits: number }>(`/tutor/messages/${messageId}/diagram`);
  return { image: fileUri(r.image), credits: r.credits };
}

export const getNotes = () => request<{ notes: Note[]; decks: Deck[] }>('/tutor/notes');
export const createNote = async (n: Omit<Note, 'id' | 'createdAt'>) => (await post<{ note: Note }>('/tutor/notes', n)).note;
export const deleteNote = (id: string) => request(`/tutor/notes/${id}`, { method: 'DELETE' });
export const createDeck = async (d: Omit<Deck, 'id' | 'createdAt'>) => (await post<{ deck: Deck }>('/tutor/decks', d)).deck;
